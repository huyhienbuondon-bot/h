
import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imgSrc: string;
  onConfirm: (file: File, url: string) => void;
  onUseOriginal: () => void;
}

const aspectRatios = [
    { value: 0.75, label: '3:4 Dọc' },
    { value: 9 / 16, label: '9:16 Story' },
    { value: 1 / 1, label: 'Vuông' },
    { value: undefined, label: 'Tự do' },
];

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<{file: File, url: string}> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject(new Error('Could not get canvas context'));
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        resolve({ file, url });
      },
      'image/jpeg',
      0.95
    );
  });
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, imgSrc, onConfirm, onUseOriginal }) => {
  const [aspect, setAspect] = useState<number | undefined>(0.75);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialAspect = 0.75;
    const newCrop = centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            initialAspect,
            width,
            height
        ),
        width,
        height
    );
    setCrop(newCrop);
    // Convert percent crop to pixel crop for completedCrop
    const pixelCrop: PixelCrop = {
      unit: 'px',
      x: (newCrop.x * width) / 100,
      y: (newCrop.y * height) / 100,
      width: (newCrop.width * width) / 100,
      height: (newCrop.height * height) / 100,
    };
    setCompletedCrop(pixelCrop);
  }

  const handleConfirmCrop = async () => {
    if (completedCrop && imgRef.current) {
        try {
            const {file, url} = await getCroppedImg(imgRef.current, completedCrop, 'cropped-beauty.jpg');
            onConfirm(file, url);
        } catch (e) {
            console.error(e);
            alert("Lỗi cắt ảnh.");
        }
    } else {
        alert("Vui lòng chọn vùng ảnh.");
    }
  }
  
  const handleSetAspect = (newAspect: number | undefined) => {
      setAspect(newAspect);
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                newAspect || width / height,
                width,
                height
            ),
            width,
            height
        );
        setCrop(newCrop);
        const pixelCrop: PixelCrop = {
          unit: 'px',
          x: (newCrop.x * width) / 100,
          y: (newCrop.y * height) / 100,
          width: (newCrop.width * width) / 100,
          height: (newCrop.height * height) / 100,
        };
        setCompletedCrop(pixelCrop);
      }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl flex items-center justify-center z-[110] p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden border border-amber-200/40">
        
        {/* Top Navigation / Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-playfair font-bold text-[#0f1f38]">Chỉnh khung hình</h3>
            <button 
                onClick={handleConfirmCrop}
                className="bg-[#0f1f38] text-amber-300 border border-amber-400/40 px-5 py-2 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-all"
            >
                XÁC NHẬN
            </button>
        </div>

        {/* Cropping Area */}
        <div className="flex-grow min-h-0 bg-[#f4f7fa] flex items-center justify-center p-2 sm:p-6 overflow-hidden">
           {imgSrc && (
             <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden border-2 border-white"
            >
                <img ref={imgRef} alt="Crop" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '60vh', objectFit: 'contain' }} className="allow-context-menu"/>
            </ReactCrop>
           )}
        </div>

        {/* Bottom Controls */}
        <div className="p-6 bg-white space-y-6 pb-10 sm:pb-6">
            <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Chọn tỷ lệ ảnh</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {aspectRatios.map(ar => (
                        <button
                            key={ar.label}
                            onClick={() => handleSetAspect(ar.value)}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full border-2 transition-all duration-300
                                ${aspect === ar.value ? 'bg-[#0f1f38] border-amber-400 text-amber-300 shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'}
                            `}
                        >
                            {ar.label}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={onUseOriginal} 
                className="w-full text-amber-700 hover:text-amber-900 font-bold py-3 text-xs uppercase tracking-widest transition-colors"
            >
                Hoặc: Dùng nguyên ảnh gốc (không cắt)
            </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
