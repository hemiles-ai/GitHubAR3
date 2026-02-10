
import React from 'react';
import { AppStatus, ClickPosition, PersistentTag } from '../types';

interface HUDOverlayProps {
  status: AppStatus;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isAnalyzing: boolean;
  clickPos: ClickPosition | null;
  tags: PersistentTag[];
  activeTagId: string | null;
  onTagClick: (id: string) => void;
  onCloseTag: () => void;
}

const HUDOverlay: React.FC<HUDOverlayProps> = ({ 
  status, onClick, isAnalyzing, clickPos, tags, activeTagId, onTagClick, onCloseTag 
}) => {
  const activeTag = tags.find(t => t.id === activeTagId);

  return (
    <div 
      className="absolute inset-0 z-10 cursor-crosshair overflow-hidden pointer-events-auto"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.ar-pin') || (e.target as HTMLElement).closest('.floating-card')) return;
        onClick(e);
      }}
    >
      {/* Topographic Contour Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="animate-pulse">
          <path d="M0,200 Q250,150 500,200 T1000,200" fill="none" stroke="white" strokeWidth="0.5" />
          <path d="M0,400 Q250,350 500,400 T1000,400" fill="none" stroke="white" strokeWidth="0.5" />
          <path d="M0,600 Q250,550 500,600 T1000,600" fill="none" stroke="white" strokeWidth="0.5" />
          <path d="M0,800 Q250,750 500,800 T1000,800" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="500" cy="500" r="100" fill="none" stroke="white" strokeWidth="0.2" />
          <circle cx="500" cy="500" r="300" fill="none" stroke="white" strokeWidth="0.2" />
          <circle cx="200" cy="300" r="50" fill="none" stroke="white" strokeWidth="0.1" />
          <circle cx="800" cy="700" r="80" fill="none" stroke="white" strokeWidth="0.1" />
        </svg>
      </div>

      {/* Crosshair HUD */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-white/40"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-white/40"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-4 bg-white/40"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-4 bg-white/40"></div>
      </div>

      {/* AR Pins */}
      {tags.map(tag => (
        <div 
          key={tag.id}
          className={`ar-pin absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-500 cursor-pointer ${activeTagId === tag.id ? 'scale-125 z-30' : 'z-20'}`}
          style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
          onClick={(e) => {
            e.stopPropagation();
            onTagClick(tag.id);
          }}
        >
          <div className="relative group">
            {/* Animated Pin Marker */}
            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-[0_0_15px_white] transition-colors ${activeTagId === tag.id ? 'bg-white' : 'bg-transparent'}`}></div>
            <div className="absolute inset-0 w-4 h-4 border border-white rounded-full animate-ping opacity-50"></div>
            
            {/* Pip Label */}
            {!activeTagId || activeTagId !== tag.id ? (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-0.5 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[7px] text-white mono uppercase tracking-widest">{tag.name}</span>
              </div>
            ) : null}
          </div>
        </div>
      ))}

      {/* Floating Holographic Info Card */}
      {activeTag && (
        <div 
          className="floating-card absolute -translate-x-1/2 pointer-events-auto z-40 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300"
          style={{ 
            left: `${activeTag.x}%`, 
            top: `${activeTag.y - 5}%`, // Float above the pin
            transform: `translate(-50%, -100%)` 
          }}
        >
          <div className="relative w-64 md:w-80 bg-black/60 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden rounded-sm">
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white/10 border-b border-white/10">
              <span className="text-[8px] mono text-white/40 uppercase tracking-[0.3em]">Neural_Link_Active</span>
              <button onClick={onCloseTag} className="text-white/40 hover:text-white transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* AI Reconstructed Visual (Small Thumb) */}
            {activeTag.aiVisual && (
              <div className="w-full h-32 bg-black border-b border-white/10 overflow-hidden">
                <img src={activeTag.aiVisual} className="w-full h-full object-cover opacity-80" alt="Reconstruction" />
                <div className="absolute top-10 left-4 text-[6px] mono text-white/60 uppercase">VISUAL_RECON_V1.0</div>
              </div>
            )}

            {/* Data Content */}
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[7px] mono text-white/40 uppercase tracking-widest mb-0.5">{activeTag.category} // {(activeTag.confidence * 100).toFixed(0)}%</div>
                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">{activeTag.name}</h3>
              </div>
              
              <p className="text-[10px] text-white/80 leading-snug mono uppercase tracking-tight">
                {activeTag.description}
              </p>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 border border-white/5">
                  <div className="text-[6px] mono text-white/30 uppercase mb-0.5">COMPOSITION</div>
                  <div className="text-[8px] text-white mono uppercase font-bold truncate">{activeTag.materialComposition}</div>
                </div>
                <div className="bg-white/5 p-2 border border-white/5">
                  <div className="text-[6px] mono text-white/30 uppercase mb-0.5">LOC_COORD</div>
                  <div className="text-[8px] text-white mono uppercase font-bold truncate">{activeTag.x.toFixed(1)}, {activeTag.y.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Card Footer Decoration */}
            <div className="h-1 bg-white animate-pulse"></div>
          </div>
          
          {/* Connector Line to Pin */}
          <div className="w-[1px] h-8 bg-gradient-to-t from-white to-transparent mx-auto"></div>
        </div>
      )}

      {/* Scanning Target (Current analysis) */}
      {clickPos && isAnalyzing && (
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${clickPos.x}%`, top: `${clickPos.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border border-white/40 rounded-full animate-ping opacity-30"></div>
            <div className="absolute w-12 h-12 border border-white/60 rounded-full animate-spin"></div>
            <div className="absolute w-20 h-[1px] bg-white/40 rotate-45"></div>
            <div className="absolute w-20 h-[1px] bg-white/40 -rotate-45"></div>
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[9px] font-bold text-white tracking-[0.4em] mono uppercase animate-pulse">DECRYPTING_SIGNAL...</span>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry HUD */}
      <div className="absolute top-8 left-8 flex flex-col gap-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-white animate-ping' : 'bg-white/30'}`}></div>
          <span className="text-[10px] font-bold tracking-[0.4em] text-white uppercase mono">
            {isAnalyzing ? 'UPLINK_ENGAGED' : 'SYSTEM_READY'}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-[8px] text-white/40 mono tracking-widest uppercase">Grid: Topo_Mapping_Enabled</div>
          <div className="text-[8px] text-white/40 mono tracking-widest uppercase">Nodes: {tags.length}/10 ACTIVE</div>
          <div className="text-[8px] text-white/40 mono tracking-widest uppercase">Lat: 0.0000 // Lng: 0.0000</div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-right pointer-events-none opacity-40">
        <div className="text-[14px] font-bold text-white mono tracking-tighter uppercase mb-1">
          {new Date().toLocaleTimeString([], { hour12: false })}
        </div>
        <div className="text-[8px] text-white/60 mono tracking-[0.2em] uppercase italic">
          v.3.0.0 Topo_AR_Core
        </div>
      </div>
    </div>
  );
};

export default HUDOverlay;
