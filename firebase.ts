import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_AUTH_SETTINGS_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save or update user profile in Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          phoneNumber: user.phoneNumber || '',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          role: 'user'
        });
      } else {
        await setDoc(userRef, {
          lastLogin: serverTimestamp(),
        }, { merge: true });
      }
    } catch (fsErr) {
      console.warn("Could not save user profile to Firestore (may need rules deployment or offline):", fsErr);
    }
    
    return user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error?.code || error);
    throw error;
  }
};

export const signInAsGuest = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (err: any) {
    console.warn("Firebase Anonymous Auth not available, activating local guest session:", err?.message || err);
    const guestUser: Partial<User> = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 10),
      displayName: 'Khách Quý Thanh Xuân',
      email: 'khach@thanhxuan.ai',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isAnonymous: true,
      phoneNumber: ''
    };
    return guestUser as User;
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  if (uid.startsWith('guest_')) {
    // Local guest profile, skip Firestore mutation
    return;
  }
  const userRef = doc(db, 'users', uid);
  try {
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn("Error updating user profile in Firestore:", error);
    try {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    } catch {
      // Ignored for smoother UI UX
    }
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Error during sign out:", e);
  }
};

export { onAuthStateChanged };
export type { User };
