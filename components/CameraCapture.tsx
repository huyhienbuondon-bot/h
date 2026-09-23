
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraReady(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip horizontally for natural mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            const url = URL.createObjectURL(blob);
            onCapture(file, url);
            onClose();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-[#0f1f38] rounded-3xl overflow-hidden shadow-2xl border border-amber-400/30">
        <div className="p-4 flex justify-between items-center border-b border-white/10">
          <h3 className="text-amber-300 font-bold font-playfair text-lg">Chụp ảnh chân dung</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-[3/4] bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-8">
              <p className="text-rose-400 mb-4">{error}</p>
              <button 
                onClick={startCamera}
                className="bg-amber-500 text-[#0f1f38] px-6 py-2 rounded-full font-bold shadow-lg"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                <div className="w-full h-full border-2 border-dashed border-amber-300/40 rounded-[10%]"></div>
              </div>
            </>
          )}
        </div>

        <div className="p-8 flex justify-center items-center gap-6 bg-[#0f1f38]">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-full font-bold text-slate-300 hover:text-white transition-colors"
          >
            Hủy
          </button>
          
          <button 
            onClick={capturePhoto}
            disabled={!isCameraReady}
            className={`w-20 h-20 rounded-full border-4 border-amber-200 flex items-center justify-center transition-all active:scale-90 ${isCameraReady ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
          >
            <div className="w-14 h-14 rounded-full border-2 border-[#0f1f38]/30"></div>
          </button>

          <div className="w-20"></div> {/* Spacer for symmetry */}
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture;
