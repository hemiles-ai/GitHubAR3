
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppStatus, RecognitionResult, ClickPosition, PersistentTag } from './types';
import { recognizeObject, generateAIVisual, speakMessage } from './services/geminiService';
import HUDOverlay from './components/HUDOverlay';
import IntelligencePanel from './components/IntelligencePanel';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.INITIAL);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedObject, setSelectedObject] = useState<RecognitionResult | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clickPos, setClickPos] = useState<ClickPosition | null>(null);
  
  // Persistent world labels
  const [tags, setTags] = useState<PersistentTag[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("SECURE_CONTEXT_REQUIRED: Access denied.");
      }

      setStatus(AppStatus.CAMERA_REQUEST);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setStatus(AppStatus.SCANNING);
        };
      }
    } catch (err: any) {
      console.error("Camera failure:", err);
      let msg = "Neural hardware authorization failed.";
      if (err.name === 'NotAllowedError') msg = "Access Denied: Grant camera permissions.";
      else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        msg = "SECURE_CONTEXT_REQUIRED: AR requires HTTPS protocol.";
      }
      
      setErrorMessage(msg);
      setStatus(AppStatus.ERROR);
    }
  };

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }, []);

  const handleScanClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAnalyzing || status !== AppStatus.SCANNING) return;

    if ('vibrate' in navigator) navigator.vibrate(30);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickPos({ x, y });
    const base64Image = captureFrame();
    if (!base64Image) {
      setClickPos(null);
      return;
    }

    setIsAnalyzing(true);
    setAiImage(null);

    try {
      const result = await recognizeObject(base64Image, x, y);
      
      if (result) {
        if ('vibrate' in navigator) navigator.vibrate([20, 100, 20]);
        
        // Save as persistent tag
        const newTag: PersistentTag = {
          id: Math.random().toString(36).substr(2, 9),
          x,
          y,
          name: result.name,
          category: result.category,
          timestamp: Date.now()
        };
        setTags(prev => [newTag, ...prev].slice(0, 10)); // Keep last 10 tags

        setSelectedObject(result);
        setStatus(AppStatus.VIEWING_RESULT);
        
        // Voice briefing
        speakMessage(`Neural lock established. Target identified as ${result.name}. Categorized as ${result.category}. Ready for intelligence download.`);

        // Visual reconstruction
        setIsGeneratingImage(true);
        const imageUrl = await generateAIVisual(result.visualPrompt);
        setAiImage(imageUrl);
        setIsGeneratingImage(false);
      } else {
        setClickPos(null);
      }
    } catch (err) {
      console.error("Link failure:", err);
      setClickPos(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTagClick = async (id: string) => {
    const tag = tags.find(t => t.id === id);
    if (!tag) return;
    
    // For now, we just re-run the analysis at those coords or show placeholder
    // In a full app, we'd store the result object with the tag.
    // For this demo, let's just use the current selected state logic.
  };

  const closePanel = () => {
    setSelectedObject(null);
    setAiImage(null);
    setClickPos(null);
    setStatus(AppStatus.SCANNING);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col select-none touch-none">
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative flex-1 bg-black overflow-hidden">
        {status === AppStatus.INITIAL ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-12 text-center bg-[#000]">
            <div className="mb-20 relative">
              <div className="w-32 h-32 border border-white/5 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white]"></div>
              </div>
              <div className="absolute inset-0 border-t border-b border-white/40 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-2 border-l border-r border-white/10 rounded-full animate-spin-reverse-slow"></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-[0.6em] mb-4 text-white uppercase italic">VISION_AR</h1>
            <p className="text-white/20 max-w-sm text-[10px] leading-relaxed mb-16 uppercase tracking-[0.4em] mono">
              Distributed Intelligence Hub<br/>
              Neural_Net Protocol v.2.0.1<br/>
              Awaiting Secure Node Uplink
            </p>
            
            <button 
              onClick={startCamera}
              className="group relative px-20 py-6 overflow-hidden border border-white/20 transition-all hover:border-white active:scale-95"
            >
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 text-white group-hover:text-black text-[11px] font-bold uppercase tracking-[0.5em] mono">Initialize_Node</span>
            </button>
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.7] contrast-[1.2]"
          />
        )}

        {(status === AppStatus.SCANNING || status === AppStatus.VIEWING_RESULT || status === AppStatus.CAMERA_REQUEST) && (
          <HUDOverlay 
            status={status} 
            onClick={handleScanClick} 
            isAnalyzing={isAnalyzing}
            clickPos={clickPos}
            tags={tags}
            onTagClick={handleTagClick}
          />
        )}

        {status === AppStatus.VIEWING_RESULT && selectedObject && (
          <IntelligencePanel 
            result={selectedObject}
            aiImage={aiImage}
            onClose={closePanel}
            isGeneratingImage={isGeneratingImage}
          />
        )}

        {status === AppStatus.ERROR && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-12 bg-black text-center">
            <div className="w-16 h-16 border border-red-500/20 flex items-center justify-center mb-10">
              <span className="text-red-500 font-black text-2xl mono animate-pulse">!</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-6 mono tracking-[0.3em] uppercase">SYSTEM_FAULT</h2>
            <p className="text-white/40 mb-16 mono text-[10px] uppercase tracking-[0.2em] leading-loose max-w-sm">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-5 border border-white/20 text-white/50 font-bold mono uppercase text-[10px] tracking-[0.4em] hover:text-white transition-all active:scale-95"
            >
              Reboot_System
            </button>
          </div>
        )}
      </div>

      <footer className="h-10 bg-[#050505] border-t border-white/5 flex items-center justify-between px-8 z-20">
        <div className="flex items-center gap-6">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-0.5 h-2 bg-white/20 ${isAnalyzing ? 'animate-pulse' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
          <span className="text-[8px] font-bold uppercase tracking-[0.5em] text-white/30 mono">Uplink: STABLE // Encrypted_Feed</span>
        </div>
        <div className="text-[8px] font-bold uppercase tracking-[0.4em] text-white/20 mono hidden sm:block">No unauthorized access detected</div>
      </footer>
      
      <style>{`
        .animate-scan {
          animation: scan 4s linear infinite;
        }
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
