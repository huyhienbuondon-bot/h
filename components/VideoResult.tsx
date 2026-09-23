
import React from 'react';

interface VideoResultProps {
  videoUrl: string | null;
  isLoading: boolean;
}

const VideoResult: React.FC<VideoResultProps> = ({ videoUrl, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full aspect-[9/16] bg-amber-50/20 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-amber-200 animate-pulse">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
        <p className="text-amber-700 font-medium font-playfair italic">Đang kiến tạo chuyển động rạng ngời...</p>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="w-full aspect-[9/16] bg-amber-50/20 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-amber-200">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-200/50">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-slate-500 text-sm font-medium">Video của nàng sẽ xuất hiện tại đây</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
      <video 
        src={videoUrl} 
        controls 
        autoPlay 
        loop 
        className="w-full h-full object-cover allow-context-menu"
      />
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <a 
          href={videoUrl} 
          download="nhat-ky-thanh-xuan.mp4"
          className="bg-[#0f1f38] border border-amber-400/40 backdrop-blur-sm text-amber-300 p-3 rounded-full shadow-lg hover:bg-[#1a2f4d] transition-all block"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default VideoResult;
