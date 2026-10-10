import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { playTone, getDefaultTones } from '@/lib/toneEngine';

const TONE_STYLES = {
  standard:  { color: '#9CA3AF', activeBg: 'rgba(156,163,175,0.1)', activeBorder: 'rgba(156,163,175,0.4)' },
  priority:  { color: '#D97706', activeBg: 'rgba(217,119,6,0.1)',   activeBorder: 'rgba(217,119,6,0.45)'   },
  emergency: { color: '#DC2626', activeBg: 'rgba(220,38,38,0.1)',   activeBorder: 'rgba(220,38,38,0.45)'   },
};

export default function TonePanel({ serverTones }) {
  const tones = serverTones || getDefaultTones();
  const [active, setActive] = useState(null);

  const handlePlay = (key) => {
    const sound = tones[key]?.sound || key;
    playTone(sound);
    setActive(key);
    setTimeout(() => setActive(null), 900);
  };

  return (
    <div className="flex gap-1.5 flex-wrap">
      {Object.entries(tones).map(([key, tone]) => {
        const style = TONE_STYLES[key] || { color: '#6B7280', activeBg: 'rgba(107,114,128,0.1)', activeBorder: 'rgba(107,114,128,0.4)' };
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => handlePlay(key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border transition-all active:scale-95 font-inter font-semibold text-[11px] tracking-widest uppercase"
            style={{
              background: isActive ? style.activeBg : 'rgba(255,255,255,0.03)',
              borderColor: isActive ? style.activeBorder : 'rgba(255,255,255,0.07)',
              color: isActive ? style.color : 'rgba(255,255,255,0.4)',
            }}
          >
            <Volume2 size={10} style={{ color: isActive ? style.color : 'rgba(255,255,255,0.3)' }} className={isActive ? 'animate-pulse' : ''} />
            {tone.name || key}
            <span
              className="w-1 h-1 rounded-full transition-all"
              style={{ background: isActive ? style.color : 'rgba(255,255,255,0.15)' }}
            />
          </button>
        );
      })}
    </div>
  );
}