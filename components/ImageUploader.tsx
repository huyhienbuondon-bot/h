
import React, { useCallback, useState } from 'react';
import ImageCropperModal from './ImageCropperModal';
import CameraCapture from './CameraCapture';

interface ImageUploaderProps {
  onImageUpload: (file: File, previewUrl: string) => void;
  preview: string | null;
  isFaceLockEnabled: boolean;
  onToggleFaceLock: (enabled: boolean) => void;
  withFlowers: boolean;
  onToggleWithFlowers: (enabled: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  preview, 
  isFaceLockEnabled, 
  onToggleFaceLock,
  withFlowers,
  onToggleWithFlowers
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<{file: File, url: string} | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop({ file, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    onImageUpload(croppedFile, previewUrl);
    setImageToCrop(null);
  };

  const handleUseOriginal = () => {
      if (imageToCrop) {
        onImageUpload(imageToCrop.file, imageToCrop.url);
        setImageToCrop(null);
      }
  };

  const handleCameraCapture = (file: File, url: string) => {
    setImageToCrop({ file, url });
    setIsCameraOpen(false);
  };

  const triggerFileInput = () => document.getElementById('file-input')?.click();

  return (
    <div className="glass-card p-6 rounded-3xl shadow-xl text-slate-900 border-amber-200/60">
      {imageToCrop && (
        <ImageCropperModal
          isOpen={!!imageToCrop}
          onClose={() => setImageToCrop(null)}
          imgSrc={imageToCrop.url}
          onConfirm={handleCropComplete}
          onUseOriginal={handleUseOriginal}
        />
      )}

      {isCameraOpen && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
      
      <h2 className="text-xl font-playfair font-bold mb-4 text-[#0f1f38]">1. Chân dung gốc của nàng</h2>
      
      <div 
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-500 ${isDragging ? 'border-amber-500 bg-amber-50/50 scale-[0.98]' : 'border-slate-300 bg-white/70 hover:border-amber-400'} ${!preview ? 'cursor-pointer' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); }}
        onClick={!preview ? triggerFileInput : undefined}
      >
        <input 
          type="file" 
          id="file-input" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => { handleFileChange(e.target.files); e.target.value = ''; }}
        />
        {preview ? (
          <div className="flex flex-col items-center text-center">
            <img src={preview} alt="Nàng" className="max-h-60 w-auto rounded-xl object-contain shadow-2xl mb-4 border-4 border-white" />
            <div className="flex gap-2">
              <button onClick={triggerFileInput} className="text-[10px] font-bold text-[#0f1f38] hover:text-amber-700 bg-white px-3 py-1.5 rounded-full shadow-md transition-all border border-slate-200">
                  Đổi ảnh
              </button>
              <button onClick={() => setIsCameraOpen(true)} className="text-[10px] font-bold text-amber-300 bg-[#0f1f38] hover:bg-[#1a2f4d] border border-amber-400/40 px-3 py-1.5 rounded-full shadow-md transition-all">
                  Chụp lại
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200/50">
              <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">Tải ảnh rõ mặt nhất</p>
            <p className="mt-1 text-xs text-amber-700">Gương mặt của nàng sẽ được giữ nguyên 100%</p>
            
            <div className="mt-6 flex gap-3 justify-center">
               <button 
                 onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                 className="flex items-center gap-2 bg-white border border-slate-200 text-[#0f1f38] px-4 py-2 rounded-full text-xs font-bold hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-sm"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                 </svg>
                 Tải ảnh lên
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); setIsCameraOpen(true); }}
                 className="flex items-center gap-2 bg-[#0f1f38] text-amber-300 border border-amber-400/40 px-4 py-2 rounded-full text-xs font-bold hover:bg-[#1a2f4d] transition-colors shadow-md"
               >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 Chụp ảnh
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {/* Face Lock Status */}
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex flex-col">
             <span className="text-xs font-bold text-[#0f1f38] uppercase tracking-tighter">BẢO VỆ GƯƠNG MẶT</span>
             <span className="text-[10px] text-amber-600 font-medium italic">Identity Locked 100%</span>
           </div>
           <div className="w-5 h-5 rounded-full bg-amber-500 shadow-lg shadow-amber-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#0f1f38]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
           </div>
        </div>

        {/* Check-in Info */}
        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70">
          <p className="text-[10px] font-medium text-slate-700 leading-tight">
             ✨ <span className="font-bold text-amber-800">Check-in Tự Nhiên:</span> Cơ thể sẽ được AI tạo dáng linh hoạt, thu hút và đầy cảm xúc để phù hợp với từng bối cảnh địa danh.
          </p>
        </div>

        {/* Flower Toggle */}
        <button 
          onClick={() => onToggleWithFlowers(!withFlowers)}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${withFlowers ? 'bg-[#0f1f38] border-amber-400 text-amber-300 shadow-lg' : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'}`}
        >
          <span className="text-sm font-bold uppercase tracking-tight">Thêm hoa check-in</span>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${withFlowers ? 'rotate-12 scale-110 text-amber-300' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
