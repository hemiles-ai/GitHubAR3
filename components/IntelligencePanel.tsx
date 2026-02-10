
import React, { useState } from 'react';
import { RecognitionResult } from '../types';

interface IntelligencePanelProps {
  result: RecognitionResult;
  aiImage: string | null;
  onClose: () => void;
  isGeneratingImage: boolean;
}

const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ result, aiImage, onClose, isGeneratingImage }) => {
  const [activeTab, setActiveTab] = useState<'INTEL' | 'TECH'>('INTEL');
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const displayImage = aiImage || result.referenceImage;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-0 md:p-12">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <div className="relative w-full h-full md:h-auto md:max-w-7xl md:aspect-[16/10] bg-[#030303] md:border md:border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">
        
        {/* Visual Link Feed */}
        <div className="w-full md:w-1/2 bg-[#000] flex items-center justify-center relative h-[40vh] md:h-auto overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
          {/* Mobile Back Button */}
          <button 
            onClick={onClose}
            className="md:hidden absolute top-6 right-6 z-50 p-3 bg-black/60 border border-white/20 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Overlay HUD */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-6 left-6 text-[8px] mono text-white/40 uppercase tracking-[0.4em]">Visual_Buffer_01 // Reconstruction_Active</div>
            <div className="absolute bottom-6 right-6 text-[8px] mono text-white/40 uppercase tracking-[0.4em]">Res: 1024x1024 // Neural_Render</div>
          </div>

          {/* Loading States */}
          {(isGeneratingImage) || (displayImage && !imageLoaded) ? (
            <div className="flex flex-col items-center gap-6 z-20">
              <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
              <p className="text-[9px] text-white/60 mono uppercase tracking-[0.5em] animate-pulse text-center px-12">Synthesizing Visual Intelligence...</p>
            </div>
          ) : null}

          {/* Feed Content */}
          {displayImage && (
            <img 
              src={displayImage} 
              alt={result.name} 
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {!displayImage && !isGeneratingImage && (
            <div className="flex flex-col items-center gap-4 text-center px-10">
              <p className="text-white/20 mono text-[9px] uppercase tracking-[0.5em]">BUFFER_EMPTY: RETRY_UPLINK</p>
            </div>
          )}
        </div>

        {/* Intelligence Data Panel */}
        <div className="flex-1 p-8 md:p-16 flex flex-col gap-10 overflow-y-auto bg-[#050505]">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('INTEL')}
                className={`text-[10px] mono font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'INTEL' ? 'border-white text-white' : 'border-transparent text-white/20'}`}
              >
                Intelligence
              </button>
              <button 
                onClick={() => setActiveTab('TECH')}
                className={`text-[10px] mono font-bold uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'TECH' ? 'border-white text-white' : 'border-transparent text-white/20'}`}
              >
                Technical
              </button>
            </div>
            <button 
              onClick={onClose}
              className="hidden md:block p-2 hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-10">
            <header>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-[1px] w-8 bg-white/20"></span>
                <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.5em] mono">
                  {result.category} // CONF: {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">{result.name}</h2>
            </header>

            {activeTab === 'INTEL' ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                <section className="space-y-4">
                  <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.4em] mono border-b border-white/5 pb-2">Analysis_Log</h3>
                  <p className="text-white text-xl md:text-2xl font-light tracking-tight leading-tight">
                    {result.description}
                  </p>
                </section>

                <section className="bg-white/[0.03] border border-white/10 p-8 rounded-sm">
                  <h3 className="text-white/40 text-[9px] font-bold uppercase tracking-[0.4em] mono mb-6">Neural_Memory_Bank</h3>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base italic mono">
                    "{result.funFact}"
                  </p>
                </section>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <section className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 border border-white/5">
                      <div className="text-[8px] mono text-white/30 uppercase mb-2">Primary_Material</div>
                      <div className="text-xs text-white mono font-bold uppercase">{result.materialComposition}</div>
                    </div>
                    <div className="bg-white/5 p-4 border border-white/5">
                      <div className="text-[8px] mono text-white/30 uppercase mb-2">Tactical_Class</div>
                      <div className="text-xs text-white mono font-bold uppercase">{result.category}</div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-white/20 text-[9px] font-bold uppercase tracking-[0.4em] mono border-b border-white/5 pb-2">Technical_Assessment</h3>
                  <p className="text-white/80 mono text-sm leading-relaxed uppercase tracking-wider">
                    {result.tacticalAnalysis}
                  </p>
                </section>
              </div>
            )}
          </div>

          <div className="mt-auto pt-8">
            <button 
              onClick={onClose}
              className="w-full py-6 bg-white text-black font-black hover:bg-neutral-300 transition-all uppercase tracking-[0.8em] text-[10px] mono active:scale-95 flex items-center justify-center gap-4"
            >
              <div className="w-1.5 h-1.5 bg-black animate-ping"></div>
              CLOSE_UPLINK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligencePanel;
