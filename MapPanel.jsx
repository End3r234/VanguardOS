import React, { useState } from 'react';
import { Map, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

export default function MapPanel({ server }) {
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  const mapUrl = server?.map_url;

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - drag.x, y: e.clientY - drag.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    setDrag({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => { setDragging(false); setDragStart(null); };

  const resetView = () => { setZoom(1); setDrag({ x: 0, y: 0 }); };

  if (!mapUrl) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Map size={20} className="text-white/60" />
          <h2 className="text-white font-bold text-lg">Map</h2>
        </div>
        <GlassCard className="text-center py-20">
          <Map size={40} className="mx-auto mb-3 text-white/20" />
          <p className="text-white/40 mb-1">No map configured</p>
          <p className="text-white/25 text-sm">Server owners can upload a custom map in Server Settings → Map</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-black flex flex-col' : 'flex flex-col h-[calc(100vh-3rem)]'}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/60 border-b border-white/[0.06] backdrop-blur flex-shrink-0">
        <Map size={15} className="text-white/50" />
        <span className="text-white/60 text-sm font-medium">{server?.name} — Map</span>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-white/30 text-xs mr-2">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))} className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white transition-all">
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))} className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white transition-all">
            <ZoomOut size={14} />
          </button>
          <button onClick={resetView} className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/40 hover:text-white text-xs transition-all ml-1">
            Reset
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white transition-all ml-1">
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Map canvas */}
      <div
        className="flex-1 overflow-hidden bg-[#0a0a0a] relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <div
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: dragging ? 'none' : 'transform 0.1s ease',
          }}
        >
          <img
            src={mapUrl}
            alt="Server Map"
            draggable={false}
            className="max-w-full max-h-full object-contain select-none"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          />
        </div>
        <div className="absolute bottom-3 left-3 text-white/20 text-xs pointer-events-none">
          Drag to pan • Scroll toolbar to zoom
        </div>
      </div>
    </div>
  );
}