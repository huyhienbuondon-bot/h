import React, { useState, useEffect } from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  quotes: string[];
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen, quotes }) => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    if (isOpen && quotes.length > 0) {
      const interval = setInterval(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
      }, 7000); // Change quote every 7 seconds

      return () => clearInterval(interval);
    }
  }, [isOpen, quotes.length]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <div className="text-center text-slate-900 bg-white/90 p-8 rounded-3xl shadow-2xl border border-amber-200/60 max-w-sm w-full mx-4">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-amber-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-[#0f1f38] border border-amber-400"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-playfair font-bold text-[#0f1f38]">Đang kiến tạo kiệt tác...</h2>
        <p className="text-amber-700 font-medium text-sm mt-2">Vui lòng đợi trong giây lát.</p>

        <div className="mt-6 min-h-[60px] flex items-center justify-center bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
            <p className="text-sm italic text-slate-700 transition-opacity duration-500">
                "{quotes[currentQuoteIndex]}"
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;