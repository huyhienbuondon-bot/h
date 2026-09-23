
export type AspectRatio = '1:1' | '3:4' | '9:16';
export type Quality = 'standard' | 'high' | 'very_high';
export type NumberOfImages = 1 | 2 | 4;

export interface Concept {
  key: string;
  label: string;
  prompt: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  seed: string;
}

export interface GeneratedVideo {
  id: string;
  url: string;
}

export interface GenerateVideoParams {
  prompt: string;
  imageBase64: string;
  mimeType: string;
}

export interface GeneratePortraitsParams {
  prompt: string;
  negativePrompt: string;
  aspectRatio: AspectRatio;
  imageBase64: string;
  mimeType: string;
  numberOfImages: number;
  isFaceLockEnabled: boolean;
  withFlowers: boolean;
  houseRefBase64?: string;
}
