
import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedImage } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GeneratedImage[];
  initialIndex: number;
  prompt: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, images, initialIndex, prompt }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const image = images[currentIndex];

    const handlePrev = useCallback(() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1)), [images.length]);
    const handleNext = useCallback(() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1)), [images.length]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
            if (images.length > 1) {
                if (event.key === 'ArrowLeft') handlePrev();
                else if (event.key === 'ArrowRight') handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, handlePrev, handleNext, images.length]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `nhat-ky-thanh-xuan-${image.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                const response = await fetch(image.url);
                const blob = await response.blob();
                const file = new File([blob], `thanh-xuan-${image.id}.jpg`, { type: 'image/jpeg' });
                await navigator.share({
                    files: [file],
                    title: 'Nhật Ký Thanh Xuân',
                    text: `Kiệt tác của mình được tạo bởi AI: "${prompt}"`,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: Copy URL to clipboard
            try {
                await navigator.clipboard.writeText(image.url);
                alert('Đã sao chép liên kết ảnh vào bộ nhớ tạm!');
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden border border-amber-200/40">
                <div className="flex-shrink-0 md:w-3/5 bg-[#f4f7fa] flex items-center justify-center p-2 relative">
                    {images.length > 1 && (
                        <>
                            <button onClick={handlePrev} className="absolute left-4 z-10 p-4 bg-white/90 hover:bg-white rounded-full text-[#0f1f38] hover:text-amber-600 shadow-xl transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button onClick={handleNext} className="absolute right-4 z-10 p-4 bg-white/90 hover:bg-white rounded-full text-[#0f1f38] hover:text-amber-600 shadow-xl transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </>
                    )}
                    <img src={image.url} alt="Nhật ký thanh xuân" className="object-contain w-full h-full max-h-[85vh] rounded-2xl allow-context-menu" draggable={false} />
                    {images.length > 1 && (
                        <div className="absolute bottom-6 bg-[#0f1f38]/90 text-amber-300 border border-amber-400/40 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                            Nét vẽ {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col p-8 w-full md:w-2/5 text-slate-900 bg-white">
                    <div className="flex justify-between items-start">
                        <h3 className="text-3xl font-playfair font-bold text-[#0f1f38]">Kiệt tác nàng</h3>
                        <button onClick={onClose} className="p-2 hover:bg-amber-50 rounded-full transition-colors text-slate-400 hover:text-slate-700">
                           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="mt-8 space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Thần thái họa nét</h4>
                            <p className="text-sm text-slate-700 bg-amber-50/40 p-4 rounded-2xl border border-amber-200/60 italic leading-relaxed">"{prompt}"</p>
                        </div>
                        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/70 flex items-center gap-3">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span className="text-xs font-bold text-[#0f1f38]">DỮ LIỆU NHÂN VẬT ĐÃ ĐƯỢC KHÓA (100%)</span>
                        </div>
                    </div>

                    <div className="mt-10 space-y-4">
                        <div className="flex gap-3">
                            <button onClick={handleDownload} className="flex-1 bg-[#0f1f38] text-amber-300 border border-amber-400/40 font-bold py-4 px-4 rounded-2xl hover:bg-[#1a2f4d] transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Lưu ảnh
                            </button>
                            <button onClick={handleShare} className="flex-1 bg-white border-2 border-[#0f1f38] text-[#0f1f38] hover:bg-amber-50/50 font-bold py-4 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                Chia sẻ
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-slate-500 font-medium">Nhấn giữ ảnh để lưu trực tiếp trên di động</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
