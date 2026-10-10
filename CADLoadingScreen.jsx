import React, { useState, useEffect } from 'react';
import VanguardLogo from '@/components/VanguardLogo';

const SLIDES = [
  'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/62157b427_Screenshot2026-04-03171205.png',
  'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/139ebdef1_Screenshot2026-04-03171701.png',
  'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/f91c6c1ed_Screenshot2026-04-11194100.png',
  'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/c13fc4656_Screenshot2026-05-02115500.png',
  'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/ad6ba401f_Screenshot2025-09-07094300.png',
  'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/30e4567be_Screenshot2025-11-14183653.png',
];

const TIPS = [
  { label: 'Pro Tip', text: 'Use tones to alert units of a new dispatch before assigning them.' },
  { label: 'Did You Know?', text: 'P1 calls pulse red on the dispatch board to grab your attention instantly.' },
  { label: 'Pro Tip', text: 'Signal 100 stops all non-emergency radio traffic with one click.' },
  { label: 'Pro Tip', text: 'Upload a custom map so your team can reference it during live sessions.' },
  { label: 'Did You Know?', text: 'The Dispatch AI assistant can suggest unit assignments based on live call priority.' },
];

export default function CADLoadingScreen({ serverName }) {
  const [slide, setSlide] = useState(() => Math.floor(Math.random() * SLIDES.length));
  const [fading, setFading] = useState(false);
  const [tipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length);
        setFading(false);
      }, 300);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tip = TIPS[tipIndex];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center overflow-hidden">

      {/* Background slideshow */}
      <div
        className="absolute inset-0 transition-opacity duration-400"
        style={{
          backgroundImage: `url(${SLIDES[slide]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: fading ? 0 : 0.18,
          transition: 'opacity 0.4s ease-in-out',
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-[#080808]/60 to-[#080808]/90" />

      {/* Red glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(206,0,0,0.07) 0%, transparent 70%)' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">

        {/* Logo */}
        <div className="mb-8">
          <VanguardLogo size="xl" />
        </div>

        {/* Server name */}
        {serverName && (
          <p className="text-white/35 text-xs tracking-[0.2em] uppercase mb-8 text-center">
            Entering <span className="text-white/70">{serverName}</span>
          </p>
        )}

        {/* Slide dots */}
        <div className="flex items-center gap-1.5 mb-8">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === slide ? '16px' : '4px',
                height: '4px',
                background: i === slide ? '#CE0000' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        {/* Animated bar */}
        <div className="w-full h-px bg-white/[0.06] mb-8 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full"
            style={{
              width: `${((slide + 1) / SLIDES.length) * 100}%`,
              background: 'linear-gradient(90deg, #8B0000, #CE0000, #FF4444)',
              boxShadow: '0 0 8px rgba(206,0,0,0.6)',
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>

        {/* Tip card */}
        <div className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
          <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-crimson">{tip.label}</span>
          <p className="text-white/50 text-xs mt-1.5 leading-relaxed">{tip.text}</p>
        </div>
      </div>
    </div>
  );
}