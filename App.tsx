
import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ConceptSelector from './components/ConceptSelector';
import DreamHousePanel from './components/DreamHousePanel';
import CustomPromptInput from './components/CustomPromptInput';
import ResultGrid from './components/ResultGrid';
import LoadingModal from './components/LoadingModal';
import ChatAssistant from './components/ChatAssistant';
import FallingLeaves from './components/FallingLeaves';
import ErrorBoundary from './components/ErrorBoundary';
import { CONCEPTS, DREAM_HOUSE_CONCEPTS, LOADING_QUOTES } from './constants';
import { generatePortraits } from './services/geminiService';
import type { GeneratedImage } from './types';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<{ file: File, preview: string } | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(CONCEPTS[0].key);
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [houseRefImage, setHouseRefImage] = useState<{ file: File, preview: string } | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isFaceLockEnabled, setIsFaceLockEnabled] = useState<boolean>(true);
  const [withFlowers, setWithFlowers] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string>('');

  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedImage({ file, preview: previewUrl });
    setError(null);
  };

  const handleHouseImageUpload = (file: File | null, preview: string | null) => {
    if (file && preview) {
      setHouseRefImage({ file, preview });
    } else {
      setHouseRefImage(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      setError('Vui lòng tải ảnh rõ mặt nhất của nàng lên.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      let baseConceptPrompt = '';
      if (selectedHouse) {
        const houseData = DREAM_HOUSE_CONCEPTS.find(h => h.key === selectedHouse);
        baseConceptPrompt = houseData?.prompt || '';
      } else if (selectedConcept) {
        const conceptData = CONCEPTS.find(c => c.key === selectedConcept);
        baseConceptPrompt = conceptData?.prompt || '';
      }
      
      const fullPrompt = `${baseConceptPrompt}${customPrompt ? `, ${customPrompt}` : ''}.`;
      setFinalPrompt(fullPrompt);

      const imageBase64 = await fileToBase64(uploadedImage.file);

      let houseRefBase64 = undefined;
      if (houseRefImage) {
        houseRefBase64 = await fileToBase64(houseRefImage.file);
      }
      
      const params = {
        prompt: fullPrompt,
        negativePrompt: 'blurry, grainy, deformed, distorted, ugly, disfigured, poorly drawn, extra limbs, bad anatomy, mutated, watermark, signature, text, multiple people, low quality, cartoon, anime, plastic, fake, airbrushed',
        aspectRatio: '3:4' as const,
        imageBase64,
        mimeType: uploadedImage.file.type,
        numberOfImages: 2 as const,
        isFaceLockEnabled: isFaceLockEnabled,
        withFlowers: withFlowers,
        houseRefBase64: houseRefBase64
      };

      const results = await generatePortraits(params);
      setGeneratedImages(results);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi kiến tạo vẻ đẹp.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, selectedConcept, selectedHouse, houseRefImage, customPrompt, isFaceLockEnabled, withFlowers]);

  const isGenerateDisabled = isLoading || !uploadedImage;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#f4f7fa] text-slate-900 pb-12 relative overflow-x-hidden">
      <FallingLeaves />
      <LoadingModal isOpen={isLoading} quotes={LOADING_QUOTES} />

      <header className="text-center pt-8 pb-4 px-4 relative z-10">
        <h1 className="text-4xl sm:text-6xl font-playfair font-bold bg-gradient-to-r from-[#0f1f38] via-[#1e3a8a] to-amber-600 bg-clip-text text-transparent tracking-tighter drop-shadow-sm px-2">
          Nhật Ký Thanh Xuân
        </h1>
        <p className="text-amber-700 mt-2 font-semibold tracking-widest uppercase text-[10px] sm:text-xs">Vẻ đẹp rạng ngời - Thuần khiết tự nhiên</p>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ImageUploader 
            onImageUpload={handleImageUpload} 
            preview={uploadedImage?.preview || null} 
            isFaceLockEnabled={isFaceLockEnabled}
            onToggleFaceLock={setIsFaceLockEnabled}
            withFlowers={withFlowers}
            onToggleWithFlowers={setWithFlowers}
          />
          <ConceptSelector 
            selectedConcept={selectedConcept} 
            onSelectConcept={(key) => { setSelectedConcept(key); setSelectedHouse(null); }} 
          />
          <CustomPromptInput customPrompt={customPrompt} onCustomPromptChange={setCustomPrompt} />
          
          <DreamHousePanel 
            selectedHouse={selectedHouse}
            onSelectHouse={(key) => { setSelectedHouse(key); if (key) setSelectedConcept(null); }}
            onHouseImageUpload={handleHouseImageUpload}
            housePreview={houseRefImage?.preview || null}
          />

          <div className="mt-2">
            {error && <p className="text-red-500 text-sm text-center mb-4 font-medium">{error}</p>}
            
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={`w-full font-bold py-5 px-4 rounded-2xl transition-all duration-500 text-xl tracking-wide shadow-xl
                ${isGenerateDisabled 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                  : 'bg-gradient-to-r from-[#0f1f38] to-[#1e3a8a] text-amber-300 border border-amber-400/40 hover:shadow-amber-500/20 active:scale-95'
                }`}
            >
              {isLoading ? 'Đang họa nét kiệt tác...' : 'Kiến tạo chân dung ngay'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <ResultGrid 
            isLoading={isLoading} 
            images={generatedImages} 
            prompt={finalPrompt}
            numberOfImages={2}
          />
        </div>
      </main>

      <footer className="text-center p-8 text-slate-700 text-sm">
        <p className="font-playfair italic text-[#0f1f38]/80">"Vẻ đẹp thanh xuân là món quà tuyệt diệu nhất của tự nhiên."</p>
        <p className="mt-2 text-slate-700">© {new Date().getFullYear()} Nhật Ký Thanh Xuân - Created by Khánh Hiển</p>
      </footer>

      <ChatAssistant />
      </div>
    </ErrorBoundary>
  );
};

export default App;
