import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/c571c88a6_Screenshot2026-04-03102750.png',
    label: 'Live Dispatch Board',
  },
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/d2a156968_Screenshot2026-04-03102842.png',
    label: 'Law Enforcement Panel',
  },
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/a7d792d30_Screenshot2026-04-03102857.png',
    label: 'Fire & EMS Operations',
  },
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/8977c472b_Screenshot2026-04-03103011.png',
    label: 'Civilian Characters',
  },
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/cdc3097f4_Screenshot2026-04-03103227.png',
    label: 'Full Server Customization',
  },
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/c5e9742a3_Screenshot2026-04-03103129.png',
    label: 'Supervisor Panel',
  },
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/88fb04f09_Screenshot2026-04-03103148.png',
    label: 'Interactive Maps',
  },
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/f7d5a267a_Screenshot2026-04-03103205.png',
    label: 'Incident Reports',
  },
  {
    url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/8d904d02d_Screenshot2026-04-03103249.png',
    label: 'Server Discovery',
  },
];

export default function HomeSlideshow() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive(i => (i + 1) % SLIDES.length);
        setFading(false);
      }, 400);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-8 mb-2 select-none">
      {/* Main featured slide */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60" style={{ aspectRatio: '16/7' }}>
        <img
          src={SLIDES[active].url}
          alt={SLIDES[active].label}
          className="w-full h-full object-cover object-top transition-all duration-500"
          style={{
            opacity: fading ? 0 : 1,
            transform: fading ? 'scale(1.02)' : 'scale(1)',
            filter: 'brightness(0.9) saturate(1.1)',
          }}
        />
        {/* Vignette overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(11,11,11,0.2) 0%, transparent 30%, transparent 60%, rgba(11,11,11,0.85) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(11,11,11,0.3) 0%, transparent 20%, transparent 80%, rgba(11,11,11,0.3) 100%)' }} />
        {/* Red tint accent */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(206,0,0,0.12), transparent 70%)' }} />

        {/* Label */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
          <span className="text-white/80 text-xs font-semibold tracking-wide bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
            {SLIDES[active].label}
          </span>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 400); }}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === active ? '20px' : '6px',
              height: '6px',
              background: i === active ? '#CE0000' : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide justify-center flex-wrap">
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 400); }}
            className="flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300"
            style={{ borderColor: i === active ? '#CE0000' : 'rgba(255,255,255,0.06)', opacity: i === active ? 1 : 0.5 }}
          >
            <img src={slide.url} alt={slide.label} className="w-full h-full object-cover object-top" />
          </button>
        ))}
      </div>
    </div>
  );
}