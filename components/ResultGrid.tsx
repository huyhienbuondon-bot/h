
import React, { useState } from 'react';
import type { GeneratedImage } from '../types';
import Modal from './Modal';

interface ResultGridProps {
  isLoading: boolean;
  images: GeneratedImage[];
  prompt: string;
  numberOfImages: number;
}

const Skeleton: React.FC = () => (
  <div className="relative aspect-[9/16] bg-amber-50/40 rounded-2xl overflow-hidden animate-pulse border border-amber-200/50">
     <div className="w-full h-full bg-gradient-to-br from-amber-50/60 via-slate-100 to-amber-100/50"></div>
  </div>
);

const ResultGrid: React.FC<ResultGridProps> = ({ isLoading, images, prompt, numberOfImages }) => {
  const [modalState, setModalState] = useState<{ images: GeneratedImage[], index: number } | null>(null);

  const handleImageClick = (index: number) => setModalState({ images, index });
  const handleCloseModal = () => setModalState(null);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: numberOfImages }).map((_, index) => <Skeleton key={index} />)}
        </div>
      );
    }

    if (images.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-xl border-4 border-white"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image.url}
                alt={`Generated art ${image.id}`}
                className="w-full h-auto object-cover aspect-[9/16] transition-transform duration-700 group-hover:scale-110 allow-context-menu"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-4">
                 <span className="text-amber-300 text-xs font-bold bg-[#0f1f38]/90 px-4 py-2 rounded-full backdrop-blur-sm border border-amber-400/40">Xem cận cảnh</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-12 glass-card rounded-3xl min-h-[500px] border-amber-200/60">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 border border-amber-200/50">
          <svg className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-playfair font-bold text-[#0f1f38]">Chờ nàng tỏa sáng!</h3>
        <p className="mt-4 text-slate-600 max-w-sm font-medium">
          Hãy tải ảnh của nàng lên, chọn concept yêu thích và nhấn nút họa nét.
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-playfair font-bold text-[#0f1f38] mb-6 px-2 flex items-center gap-3">
        <span className="w-8 h-[2px] bg-amber-400"></span>
        Nét họa dành cho nàng
      </h2>
      <div className="flex-grow">
        {renderContent()}
      </div>
      {modalState && (
        <Modal
          isOpen={!!modalState}
          onClose={handleCloseModal}
          images={modalState.images}
          initialIndex={modalState.index}
          prompt={prompt}
        />
      )}
    </div>
  );
};

export default ResultGrid;
