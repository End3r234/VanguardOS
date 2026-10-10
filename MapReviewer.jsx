import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Check, Move, ZoomIn, ZoomOut, MapPin } from 'lucide-react';

const CONFIDENCE_HIGH = 0.85;
const CONFIDENCE_LOW = 0.5;

function confidenceColor(conf, verified) {
  if (verified) return '#22c55e';
  if (conf >= CONFIDENCE_HIGH) return '#22c55e';
  if (conf >= CONFIDENCE_LOW) return '#eab308';
  return '#ef4444';
}

function confidenceLabel(conf) {
  if (conf >= CONFIDENCE_HIGH) return 'High Confidence';
  if (conf >= CONFIDENCE_LOW) return 'Low Confidence';
  return 'Manual Review Required';
}

export default function MapReviewer({ mapUrl, detections, selectedItem, onPositionChange, onVerify, verifiedIds }) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const [editName, setEditName] = useState('');
  const [editPostal, setEditPostal] = useState('');

  const focusItem = useCallback((item) => {
    if (!item || !containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const z = 2.5;
    const ix = (item.x_pct / 100) * cw;
    const iy = (item.y_pct / 100) * ch;
    setZoom(z);
    setPan({ x: cw / 2 - ix * z, y: ch / 2 - iy * z });
  }, []);

  useEffect(() => {
    if (selectedItem) {
      focusItem(selectedItem);
      setEditName(selectedItem.name || '');
      setEditPostal(selectedItem.postal || '');
    }
  }, [selectedItem, focusItem]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedItem) return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX, y: e.clientY,
      origX: selectedItem.x_pct, origY: selectedItem.y_pct,
    };
  }, [selectedItem]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      if (!dragStart.current || !containerRef.current || !selectedItem) return;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newX = Math.max(0, Math.min(100, dragStart.current.origX + (dx / zoom / cw) * 100));
      const newY = Math.max(0, Math.min(100, dragStart.current.origY + (dy / zoom / ch) * 100));
      onPositionChange(selectedItem.id, newX, newY);
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, zoom, selectedItem, onPositionChange]);

  const handleVerify = () => {
    onVerify(selectedItem, { name: editName, postal: editPostal });
  };

  if (!selectedItem) return null;

  const isVerified = verifiedIds.has(selectedItem.id);
  const color = confidenceColor(selectedItem.confidence, isVerified);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-white/60 text-xs flex items-center gap-1.5">
          <Move size={12} className="text-crimson" />
          Drag the marker to reposition · edit fields · then verify
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 transition-colors">
            <ZoomOut size={12} />
          </button>
          <span className="text-white/30 text-[10px] w-8 text-center">{zoom.toFixed(1)}x</span>
          <button onClick={() => setZoom(z => Math.min(5, z + 0.5))} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 transition-colors">
            <ZoomIn size={12} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] select-none" style={{ height: 340 }}>
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: dragging ? 'none' : 'transform 0.4s ease-out',
          }}
        >
          <img src={mapUrl} alt="Map" className="w-full h-full object-contain pointer-events-none" draggable={false} />

          {/* Highlight ring on selected item */}
          <div
            className="absolute pointer-events-none rounded-full border-2 border-crimson/50"
            style={{
              left: `${selectedItem.x_pct}%`, top: `${selectedItem.y_pct}%`,
              width: 48, height: 48,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 16px rgba(206,0,0,0.25)',
            }}
          />

          {/* All detection markers */}
          {detections.map((d) => {
            const isSelected = d.id === selectedItem.id;
            const isV = verifiedIds.has(d.id);
            const c = confidenceColor(d.confidence, isV);
            return (
              <div
                key={d.id}
                className="absolute"
                style={{ left: `${d.x_pct}%`, top: `${d.y_pct}%`, transform: 'translate(-50%, -50%)', zIndex: isSelected ? 20 : 10 }}
              >
                {isSelected ? (
                  <div
                    onMouseDown={handleMouseDown}
                    className="cursor-move"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-white shadow-lg relative" style={{ backgroundColor: c }}>
                      <div className="absolute inset-0 rounded-full border-2 border-crimson animate-ping" />
                    </div>
                  </div>
                ) : (
                  <div className="w-2 h-2 rounded-full border border-white/40" style={{ backgroundColor: c, opacity: 0.6 }} />
                )}
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-[10px] bg-black/60 px-3 py-1 rounded-full pointer-events-none">
          {dragging ? 'Dragging marker...' : 'Click zoom controls or drag the highlighted marker'}
        </div>
      </div>

      {/* Correction form */}
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
            {isVerified ? 'Verified' : confidenceLabel(selectedItem.confidence)}
          </span>
          <span className="text-white/30">{(selectedItem.confidence * 100).toFixed(1)}%</span>
          <span className="text-white/20">·</span>
          <span className="text-white/40 capitalize">{selectedItem.type}</span>
          {selectedItem.original_name && selectedItem.original_name !== selectedItem.name && (
            <span className="text-white/30 text-[10px]">was: "{selectedItem.original_name}"</span>
          )}
          {selectedItem.learned && (
            <span className="text-emerald-400/70 text-[10px] flex items-center gap-1">
              <Check size={9} /> Auto-applied from prior correction
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-white/40 text-[10px] mb-1 block">{selectedItem.type === 'postal' ? 'Postal Code' : 'Street / Location Name'}</label>
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full h-8 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm px-2 focus:border-crimson/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-white/40 text-[10px] mb-1 block">Postal Code {selectedItem.type !== 'postal' ? '(optional)' : ''}</label>
            <input
              value={editPostal}
              onChange={e => setEditPostal(e.target.value)}
              className="w-full h-8 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm px-2 focus:border-crimson/40 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleVerify}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-all"
          >
            <Check size={12} /> {isVerified ? 'Update & Re-verify' : 'Mark as Verified'}
          </button>
        </div>
      </div>
    </div>
  );
}