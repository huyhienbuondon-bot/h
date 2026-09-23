import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Mic, MicOff, User, Bot, Sparkles, Phone, PhoneOff } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { 
      role: 'bot', 
      text: 'Chào nàng! Mình là KOL -NKTX, người bạn đồng hành trong hành trình lưu giữ vẻ đẹp và kiến tạo phong cách của nàng. Nàng muốn biến bức ảnh của mình thành một kiệt tác như thế nào hôm nay? Hãy nói cho mình biết nhé! ✨' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Live API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // --- TTS Logic for Text Chat ---
  const playTTS = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Soft female voice
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        
        // Play audio (24kHz for TTS)
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await ctx.decodeAudioData(bytes.buffer);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  // --- Real-time Voice Call Logic ---
  const startCall = async () => {
    if (isCalling) return;
    setIsCalling(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }
      
      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } }, // Soft female voice
          },
          systemInstruction: `
            Bạn là KOL -NKTX, một trợ lý ảo KOL phong cách, xinh đẹp, thân thiện, hiện đại và thông minh.
            Bạn đang trò chuyện TRỰC TIẾP qua điện thoại với người dùng.
            QUY TẮC QUAN TRỌNG:
            1. Nói tiếng Việt thật TỰ NHIÊN, như người bản xứ.
            2. Trả lời CỰC KỲ NGẮN GỌN, súc tích (thường chỉ 1-2 câu).
            3. Phản hồi NGAY LẬP TỨC khi người dùng dứt lời.
            4. Giọng nói luôn ngọt ngào, dễ thương, trong trẻo, mang âm hưởng của một cô gái Việt Nam trẻ trung, năng động.
            5. Xưng hô: "KOL -NKTX" (hoặc "mình") và "nàng".
            6. Tuyệt đối không dùng giọng nam, giọng trầm (ồm) hay giọng lơ lớ người nước ngoài.
          `,
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            const session = await sessionPromise;
            session.sendRealtimeInput({ text: "Chào nàng! KOL -NKTX đang nghe đây, nàng cần mình giúp gì không?" });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            
            const processor = audioContextRef.current!.createScriptProcessor(2048, 1, 1);
            source.connect(processor);
            processor.connect(audioContextRef.current!.destination);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
              }
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              session.sendRealtimeInput({
                audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const binary = atob(audioData);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
              const pcmData = new Int16Array(bytes.buffer);
              const floatData = new Float32Array(pcmData.length);
              for (let i = 0; i < pcmData.length; i++) floatData[i] = pcmData[i] / 0x7FFF;
              
              const buffer = audioContextRef.current!.createBuffer(1, floatData.length, 16000);
              buffer.getChannelData(0).set(floatData);
              const source = audioContextRef.current!.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current!.destination);
              source.start();
            }

            const transcription = message.serverContent?.modelTurn?.parts.find(p => p.text)?.text;
            if (transcription) {
              setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === 'bot' && transcription.startsWith(lastMsg.text)) {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { role: 'bot', text: transcription };
                  return newMessages;
                }
                return [...prev, { role: 'bot', text: transcription }];
              });
            }
          },
          onclose: () => stopCall(),
          onerror: (err) => {
            console.error("Live API Error:", err);
            stopCall();
          }
        }
      });
      
      liveSessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("Failed to start call:", error);
      setIsCalling(false);
    }
  };

  const stopCall = () => {
    setIsCalling(false);
    liveSessionRef.current?.close();
    liveSessionRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `
            Bạn là KOL -NKTX, một trợ lý ảo KOL phong cách, xinh đẹp, hiện đại, thân thiện và thông minh.
            Bạn luôn xưng hô là "KOL -NKTX" (hoặc "mình") và gọi người dùng là "nàng" một cách ngọt ngào, tinh tế.
            Hãy trả lời ngắn gọn, súc tích (1-2 câu).
            Bạn là một cô gái trẻ trung, giọng nói trong trẻo, dễ thương, đúng ngữ điệu người Việt.
            Tuyệt đối không dùng giọng nam, giọng trầm (ồm) hay giọng lơ lớ người nước ngoài.
          `
        }
      });

      const botResponse = response.text || "Xin lỗi, KOL -NKTX đang gặp chút trục trặc.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
      
      // Play voice response for text chat
      playTTS(botResponse);
      
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "KOL -NKTX không thể kết nối lúc này." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 sm:w-96 h-[500px] glass-card rounded-3xl shadow-2xl flex flex-col overflow-hidden border-amber-200/60"
          >
            {/* Header */}
            <div className="p-4 bg-[#0f1f38] text-white flex items-center justify-between border-b border-amber-400/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-amber-400/60 shadow-inner">
                  <img 
                    src="/kol_avatar.svg" 
                    alt="KOL -NKTX" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-lg leading-tight text-amber-300">KOL -NKTX</h3>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isCalling ? 'bg-rose-400' : 'bg-amber-400'}`}></span>
                    {isCalling ? 'Đang trong cuộc gọi' : 'Đang trực tuyến'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={isCalling ? stopCall : startCall}
                  className={`p-2 rounded-full transition-colors ${isCalling ? 'bg-rose-500 hover:bg-rose-600' : 'hover:bg-white/20 text-amber-300'}`}
                  title={isCalling ? "Kết thúc cuộc gọi" : "Gọi cho KOL -NKTX"}
                >
                  {isCalling ? <PhoneOff size={18} /> : <Phone size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors text-slate-300 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f4f7fa]/70">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start gap-2'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400/50 shadow-xs flex-shrink-0 mt-0.5">
                      <img 
                        src="/kol_avatar.svg" 
                        alt="KOL -NKTX" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer" 
                      />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#0f1f38] text-amber-300 border border-amber-400/30 rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400/50 shadow-xs flex-shrink-0 mt-0.5">
                    <img 
                      src="/kol_avatar.svg" 
                      alt="KOL -NKTX" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-200/50 p-2 rounded-2xl">
                <button 
                  onClick={toggleListening}
                  className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-[#0f1f38] hover:bg-amber-100'}`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Hỏi KOL -NKTX nhé..."
                  className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                  className="p-2 bg-[#0f1f38] text-amber-300 border border-amber-400/40 rounded-xl hover:bg-[#1a2f4d] disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#0f1f38] rounded-full shadow-2xl flex items-center justify-center text-white border-4 border-amber-400 overflow-hidden group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0f1f38] to-[#1e3a8a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <img 
          src="/kol_avatar.svg" 
          alt="KOL -NKTX" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-[#0f1f38] flex items-center justify-center">
          <Sparkles size={10} className="text-[#0f1f38]" />
        </div>
      </motion.button>
    </div>
  );
};

export default ChatAssistant;
