import React, { useState, useRef, useEffect } from 'react';

const FEATURES = [
  'Real-time Computer-Aided Dispatch',
  'Multi-department coordination',
  'Live unit tracking & status',
  'Penal code & civilian database',
  'Incident reports & supervisor review',
  'Radio channel management',
  'Custom department logos',
  'AI-powered dispatch assistant',
];

export default function CADPromoVideo() {
  const [featureIdx, setFeatureIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFeatureIdx(i => (i + 1) % FEATURES.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
      {/* Video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="https://media.base44.com/videos/public/69c6a8c8b372cbc680406011/c84b71f53_7714437-uhd_3840_2160_30fps.mp4"
        autoPlay muted loop playsInline
        style={{ pointerEvents: 'none' }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />

      {/* Scanline effect */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
        backgroundSize: '100% 4px'
      }} />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4">
        {/* Main headline */}
        <div className="space-y-2">
          <p className="text-white/50 text-sm uppercase tracking-[0.3em] font-medium">VanguardOS</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            The only CAD<br />
            <span style={{ color: '#CE0000' }}>you'll ever need.</span>
          </h2>
        </div>

        {/* Feature subtitle — animated */}
        <div className="h-8 flex items-center justify-center">
          <p
            className="text-white/70 text-base md:text-lg font-medium transition-all duration-400"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            ✦ {FEATURES[featureIdx]}
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {['Real-time', 'Multi-dept', 'Reports', 'AI Dispatch', 'Radio'].map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/60 backdrop-blur-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade into page */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0B0B0B] to-transparent" />
    </div>
  );
}