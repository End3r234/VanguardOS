import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, X } from 'lucide-react';
import { undoManager } from '@/lib/undoManager';

export default function UndoToast() {
  const [undo, setUndo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => undoManager.subscribe(setUndo), []);

  useEffect(() => {
    if (undo) {
      setTimeLeft(10);
      const interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 0.1) {
            clearInterval(interval);
            return 0;
          }
          return Math.round((t - 0.1) * 10) / 10;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [undo]);

  return (
    <AnimatePresence>
      {undo && timeLeft > 0 && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000]"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="relative flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 bg-[#1a1a1a] backdrop-blur-xl shadow-2xl overflow-hidden">
            <span className="text-white/80 text-sm font-inter">{undo.label}</span>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={() => undoManager.undo()}
              className="text-crimson text-sm font-semibold hover:text-crimson-light transition-colors flex items-center gap-1 font-inter"
            >
              <Undo2 size={14} /> Undo ({Math.ceil(timeLeft)}s)
            </button>
            <button
              onClick={() => undoManager.dismiss()}
              className="text-white/30 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
              <motion.div
                className="h-full bg-crimson"
                animate={{ width: `${(timeLeft / 10) * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}