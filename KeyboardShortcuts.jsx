import React, { useState, useEffect } from 'react';
import { Keyboard, Check, RotateCcw, X } from 'lucide-react';
import { loadShortcuts, saveShortcuts, resetShortcuts, formatShortcut } from '@/lib/keyboardShortcuts';

export default function KeyboardShortcuts() {
  const [shortcuts, setShortcuts] = useState([]);
  const [recordingId, setRecordingId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    setShortcuts(loadShortcuts());
  }, []);

  useEffect(() => {
    if (!recordingId) return;
    const handleKey = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') {
        setRecordingId(null);
        return;
      }
      const current = shortcuts.find(s => s.id === recordingId);
      const newShortcut = {
        ...current,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        key: e.key.toLowerCase(),
      };
      const isConflict = shortcuts.some(s =>
        s.id !== recordingId &&
        !!s.ctrl === !!newShortcut.ctrl &&
        !!s.alt === !!newShortcut.alt &&
        !!s.shift === !!newShortcut.shift &&
        s.key.toLowerCase() === newShortcut.key.toLowerCase()
      );
      if (isConflict) {
        setConflict(true);
        setTimeout(() => setConflict(false), 2000);
        setRecordingId(null);
        return;
      }
      const updated = shortcuts.map(s => (s.id === recordingId ? newShortcut : s));
      setShortcuts(updated);
      setRecordingId(null);
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [recordingId, shortcuts]);

  const handleSave = () => {
    saveShortcuts(shortcuts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults = resetShortcuts();
    setShortcuts(defaults);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard size={18} className="text-crimson" />
          <h3 className="text-white font-semibold text-sm font-rajdhani">Keyboard Shortcuts</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-white/40 hover:text-white text-xs flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all font-inter"
          >
            <RotateCcw size={12} /> Restore Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-crimson text-white text-xs font-semibold hover:bg-crimson-dark transition-all flex items-center gap-1 font-inter"
          >
            {saved ? <><Check size={12} /> Saved</> : 'Save'}
          </button>
        </div>
      </div>

      {conflict && (
        <div className="px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-inter">
          That key combination is already in use. Please choose a different one.
        </div>
      )}

      <p className="text-white/40 text-xs font-inter">
        Click any shortcut to record a new key combination. Press Escape to cancel. Shortcuts are ignored while typing in input fields.
      </p>

      <div className="space-y-1.5">
        {shortcuts.map(s => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <span className="text-white/70 text-sm font-inter">{s.label}</span>
            {recordingId === s.id ? (
              <div className="flex items-center gap-2">
                <span className="text-crimson text-xs animate-pulse font-inter">Press keys...</span>
                <button onClick={() => setRecordingId(null)} className="text-white/30 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRecordingId(s.id)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/60 text-xs font-mono hover:bg-white/[0.08] hover:text-white transition-all min-w-[110px] text-center"
              >
                {formatShortcut(s)}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}