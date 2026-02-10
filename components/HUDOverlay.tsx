
import React from 'react';
import { AppStatus, ClickPosition, PersistentTag } from '../types';

interface HUDOverlayProps {
  status: AppStatus;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  isAnalyzing: boolean;
  clickPos: ClickPosition | null;
  tags: PersistentTag[];
  onTagClick: (id: string) => void;
}

const HUDOverlay: React.FC<HUDOverlayProps> = ({ status, onClick, isAnalyzing, clickPos, tags, onTagClick }) => {
  return (
    <div 
      className="absolute inset-0 z-10 cursor-crosshair overflow-hidden pointer-events-auto"
      onClick={(e) => {
        // Only trigger background click if we aren't clicking a tag
        if ((e.target as HTMLElement).closest('.spatial-tag')) return;
        onClick(e);
      }}
    >
      {/* Corner Brackets */}
      <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-white/20"></div>
      <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-white/20"></div>
      <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-white/20"></div>
      <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-white/20"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Scanning Line */}
      {status === AppStatus.SCANNING && (
        <div className="w-full h-[1px] bg-white/40 absolute top-0 left-0 z-20 animate-scan shadow-[0_0_20px_white]" />
      )}

      {/* Spatial Tags */}
      {tags.map(tag => (
        <div 
          key={tag.id}
          className="spatial-tag absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer"
          style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
          onClick={(e) => {
            e.stopPropagation();
            onTagClick(tag.id);
          }}
        >
          <div className="relative">
            {/* Tag Marker */}
            <div className="w-3 h-3 bg-white/80 rounded-full border border-black shadow-[0_0_10px_white] animate-pulse"></div>
            
            {/* Connector Line */}
            <div className="absolute top-1.5 left-1.5 w-8 h-[1px] bg-white/40 rotate-[45deg] origin-left"></div>
            
            {/* Tag Content */}
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-2 min-w-[120px] transition-all group-hover:bg-white group-hover:text-black">
              <div className="text-[7px] mono uppercase tracking-widest opacity-60 mb-1">{tag.category}</div>
              <div className="text-[10px] mono font-bold uppercase tracking-wider truncate">{tag.name}</div>
              <div className="text-[6px] mono opacity-40 mt-1 uppercase">LOC_ID: {tag.id.substring(0,6)}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Target Marker at Click Position (Current analysis) */}
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
              <span className="text-[9px] font-bold text-white tracking-[0.4em] mono uppercase animate-pulse">DECRYPTING_REALITY</span>
            </div>
          </div>
        </div>
      )}

      {/* Telemetry Readouts */}
      <div className="absolute top-8 left-8 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-white animate-ping' : 'bg-white/30'}`}></div>
          <span className="text-[10px] font-bold tracking-[0.4em] text-white uppercase mono">
            {isAnalyzing ? 'UPLINK_ENGAGED' : 'SYSTEM_READY'}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-[8px] text-white/30 mono tracking-widest uppercase">Signal: 99.4% (Quantum_Encrypted)</div>
          <div className="text-[8px] text-white/30 mono tracking-widest uppercase">Buffer: {tags.length}/10 Nodes Active</div>
        </div>
      </div>

      <div className="absolute bottom-24 right-8 text-right pointer-events-none opacity-40">
        <div className="text-[14px] font-bold text-white mono tracking-tighter uppercase mb-1">
          {new Date().toLocaleTimeString([], { hour12: false })}
        </div>
        <div className="text-[8px] text-white/60 mono tracking-[0.2em] uppercase italic">
          v.2.0.1 Vision_Core
        </div>
      </div>

      {/* Instructions */}
      {status === AppStatus.SCANNING && !isAnalyzing && tags.length === 0 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="bg-white/10 backdrop-blur-xl px-8 py-5 border border-white/20 rounded-sm">
            <p className="text-[10px] font-bold text-white tracking-[0.6em] uppercase mono animate-pulse">Select Object to begin Neural Analysis</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HUDOverlay;
