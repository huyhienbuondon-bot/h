
import React, { useState, useEffect, useRef } from 'react';
import { rewritePrompt } from '../services/geminiService';

interface CustomPromptInputProps {
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

const CustomPromptInput: React.FC<CustomPromptInputProps> = ({ customPrompt, onCustomPromptChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);
  const customPromptRef = useRef(customPrompt);

  // Keep ref in sync with prop for use in callbacks
  useEffect(() => {
    customPromptRef.current = customPrompt;
  }, [customPrompt]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setInterimText(interimTranscript);

        if (finalTranscript) {
          const currentText = customPromptRef.current;
          onCustomPromptChange(currentText ? `${currentText.trim()} ${finalTranscript.trim()}` : finalTranscript.trim());
          setInterimText('');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert("Lỗi: Không thể truy cập Microphone. \n\n1. Hãy nhấn vào biểu tượng ổ khóa ở thanh địa chỉ Chrome.\n2. Chọn 'Cho phép' (Allow) cho Microphone.\n3. Tải lại trang nếu cần.");
        } else if (event.error === 'network') {
          alert("Lỗi kết nối mạng. Vui lòng kiểm tra lại internet.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleRewrite = async () => {
    if (!customPrompt.trim() || isRewriting) return;
    
    setIsRewriting(true);
    try {
      const newPrompt = await rewritePrompt(customPrompt);
      onCustomPromptChange(newPrompt);
    } catch (error) {
      console.error("Failed to rewrite prompt:", error);
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl shadow-xl border-amber-200/60">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-playfair font-bold text-[#0f1f38]">3. Mong muốn riêng của nàng</h2>
        <div className="flex gap-2">
          {/* Microphone Button */}
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all duration-300 shadow-md ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300/50'
            }`}
            title={isListening ? "Đang nghe..." : "Nhấn để nói"}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Magic Pen Button */}
          <button
            onClick={handleRewrite}
            disabled={isRewriting || !customPrompt.trim()}
            className={`p-2 rounded-full transition-all duration-300 shadow-md ${
              isRewriting 
                ? 'bg-[#0f1f38] text-amber-300 animate-spin border border-amber-400' 
                : 'bg-[#0f1f38] text-amber-300 hover:bg-[#1a2f4d] border border-amber-400/40 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            title="Cây bút thần kỳ - Viết lại prompt"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Nàng muốn mặc váy màu gì? Tóc uốn hay thẳng? Đeo trang sức nào?..."
          className="w-full h-24 p-4 bg-white/70 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all text-sm text-slate-800 resize-none placeholder-slate-400 outline-none pr-10"
          aria-label="Custom prompt details"
        />
        {interimText && (
          <div className="absolute bottom-2 left-4 text-xs text-amber-600 italic animate-pulse pointer-events-none">
            {interimText}...
          </div>
        )}
        {isRewriting && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
               <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
               </svg>
               Đang viết lại...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPromptInput;
