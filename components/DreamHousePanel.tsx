
import React, { useState } from 'react';
import { DREAM_HOUSE_CONCEPTS } from '../constants';

interface DreamHousePanelProps {
  selectedHouse: string | null;
  onSelectHouse: (key: string | null) => void;
  onHouseImageUpload: (file: File | null, preview: string | null) => void;
  housePreview: string | null;
}

const DreamHousePanel: React.FC<DreamHousePanelProps> = ({ 
  selectedHouse, 
  onSelectHouse, 
  onHouseImageUpload,
  housePreview 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onHouseImageUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => document.getElementById('house-file-input')?.click();

  return (
    <div className="glass-card rounded-3xl shadow-xl border-amber-200/60 overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0f1f38] to-[#1e3a8a] rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/10 border border-amber-400/30">
            <svg className="w-6 h-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-playfair font-bold text-[#0f1f38]">4. Ngôi nhà ước mơ</h2>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Không gian sống đẳng cấp</p>
          </div>
        </div>
        <svg 
          className={`w-6 h-6 text-amber-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-6 pt-0 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Chọn kiến trúc nàng yêu</p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <button
                onClick={() => onSelectHouse(null)}
                className={`px-4 py-2 text-[10px] font-bold rounded-full border-2 transition-all
                  ${selectedHouse === null 
                    ? 'bg-[#0f1f38] border-amber-400 text-amber-300 shadow-lg' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:text-amber-800'
                  }`}
              >
                KHÔNG CHỌN
              </button>
              {DREAM_HOUSE_CONCEPTS.map((house) => (
                <button
                  key={house.key}
                  onClick={() => onSelectHouse(house.key)}
                  className={`px-4 py-2 text-[10px] font-bold rounded-full border-2 transition-all
                    ${selectedHouse === house.key 
                      ? 'bg-[#0f1f38] border-amber-400 text-amber-300 shadow-lg scale-105' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:text-amber-800'
                    }`}
                >
                  {house.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">Gửi mẫu nhà tham chiếu (Tùy chọn)</p>
              {housePreview && (
                <button onClick={() => onHouseImageUpload(null, null)} className="text-[10px] text-amber-700 hover:text-amber-900 font-bold underline">XÓA ẢNH</button>
              )}
            </div>
            
            <div 
              onClick={triggerFileInput}
              className={`relative border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[120px]
                ${housePreview ? 'border-amber-300 bg-white' : 'border-amber-200/70 bg-amber-50/30 hover:bg-amber-50/60'}
              `}
            >
              <input type="file" id="house-file-input" className="hidden" accept="image/*" onChange={handleFileChange} />
              
              {housePreview ? (
                <div className="flex items-center gap-4 w-full">
                  <img src={housePreview} alt="Mẫu nhà" className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white" />
                  <div className="flex-grow">
                    <p className="text-[10px] font-bold text-[#0f1f38]">ĐÃ NHẬN MẪU NHÀ</p>
                    <p className="text-[9px] text-amber-700 italic">AI sẽ kiến tạo bối cảnh dựa trên kiến trúc này</p>
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-8 h-8 text-amber-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] text-slate-600 font-medium">Bấm để tải mẫu nhà nàng thích</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamHousePanel;
