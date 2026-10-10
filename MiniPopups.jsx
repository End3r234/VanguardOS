import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Info, AlertTriangle, BellRing, X } from 'lucide-react';
import { miniPopupManager } from '@/lib/miniPopups';

const TYPE_CONFIG = {
  affirmation: { icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/20' },
  info: { icon: Info, color: 'text-blue-400', border: 'border-blue-500/20' },
  alert: { icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/20' },
  call: { icon: BellRing, color: 'text-crimson', border: 'border-crimson/20' },
};

export default function MiniPopups() {
  const [popups, setPopups] = useState([]);

  useEffect(() => miniPopupManager.subscribe(setPopups), []);

  return (
    <div className="fixed bottom-20 right-4 z-[9998] flex flex-col gap-2 max-w-[280px] pointer-events-none">
      <AnimatePresence>
        {popups.map(p => {
          const config = TYPE_CONFIG[p.type] || TYPE_CONFIG.info;
          const Icon = config.icon;
          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-xl border ${config.border} bg-[#1a1a1a]/95 backdrop-blur-xl shadow-xl`}
            >
              <Icon size={16} className={`${config.color} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                {p.title && <p className="text-white text-xs font-bold font-inter leading-tight">{p.title}</p>}
                {p.message && <p className="text-white/50 text-xs mt-0.5 font-inter leading-tight">{p.message}</p>}
              </div>
              <button
                onClick={() => miniPopupManager.dismiss(p.id)}
                className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0"
              >
                <X size={12} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}