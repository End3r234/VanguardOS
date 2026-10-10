import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VanguardLogo from '@/components/VanguardLogo';

const PHASE = { BLACKOUT: 0, LIGHTS: 1, LOGO: 2, SHOWCASE: 3 };

const SLIDES = [
  { url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/62157b427_Screenshot2026-04-03171205.png', feature: 'Real-Time Dispatch Board', desc: 'Manage active calls with priority-based visual alerts and instant unit assignment' },
  { url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/139ebdef1_Screenshot2026-04-03171701.png', feature: 'Live Unit Tracking', desc: 'Monitor on-duty units with real-time status, location, and department filtering' },
  { url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/f91c6c1ed_Screenshot2026-04-11194100.png', feature: 'Incident Management', desc: 'Link calls, units, and reports with unique auto-generated Incident IDs' },
  { url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/c13fc4656_Screenshot2026-05-02115500.png', feature: 'Officer Safety Alerts', desc: 'Automatic warnings when searching flagged persons, vehicles, or addresses' },
  { url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/ad6ba401f_Screenshot2025-09-07094300.png', feature: 'Crash Reconstruction', desc: 'Interactive collision documentation with drag-and-drop vehicles and export tools' },
  { url: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/30e4567be_Screenshot2025-11-14183653.png', feature: 'Smart Report Builder', desc: 'Dynamic report forms that adapt to each incident type — traffic stops, arrests, fire, EMS' },
];

export default function CinematicWelcome({ onComplete }) {
  const [phase, setPhase] = useState(PHASE.BLACKOUT);
  const [exiting, setExiting] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const audioCtxRef = useRef(null);

  // Phase timing
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(PHASE.LIGHTS), 1000),
      setTimeout(() => setPhase(PHASE.LOGO), 3000),
      setTimeout(() => setPhase(PHASE.SHOWCASE), 5500),
      setTimeout(() => { setExiting(true); onComplete?.(); }, 23000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Slide cycling during showcase
  useEffect(() => {
    if (phase < PHASE.SHOWCASE || exiting) return;
    const interval = setInterval(() => {
      setSlideIdx(i => (i + 1) % SLIDES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [phase, exiting]);

  const handleSkip = () => {
    setExiting(true);
    onComplete?.();
  };

  // Ambient cinematic audio via Web Audio API
  useEffect(() => {
    let ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // Deep drone
      const drone1 = ctx.createOscillator();
      drone1.type = 'sine';
      drone1.frequency.value = 55;
      const drone2 = ctx.createOscillator();
      drone2.type = 'sine';
      drone2.frequency.value = 82.4;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.28;
      drone1.connect(droneGain);
      drone2.connect(droneGain);
      droneGain.connect(master);

      // Ambient pad with slow LFO
      const pad = ctx.createOscillator();
      pad.type = 'triangle';
      pad.frequency.value = 220;
      const padGain = ctx.createGain();
      padGain.gain.value = 0.06;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.25;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.025;
      lfo.connect(lfoGain);
      lfoGain.connect(padGain.gain);
      pad.connect(padGain);
      padGain.connect(master);

      // Subtle high shimmer
      const shimmer = ctx.createOscillator();
      shimmer.type = 'sine';
      shimmer.frequency.value = 880;
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0.015;
      const shimmerLfo = ctx.createOscillator();
      shimmerLfo.frequency.value = 0.15;
      const shimmerLfoGain = ctx.createGain();
      shimmerLfoGain.gain.value = 0.008;
      shimmerLfo.connect(shimmerLfoGain);
      shimmerLfoGain.connect(shimmerGain.gain);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(master);

      drone1.start();
      drone2.start();
      pad.start();
      lfo.start();
      shimmer.start();
      shimmerLfo.start();

      // Fade in — louder mix
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 2.5);

      const resume = () => { if (ctx.state === 'suspended') ctx.resume(); };
      window.addEventListener('click', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
      document.addEventListener('touchstart', resume, { once: true });

      return () => {
        window.removeEventListener('click', resume);
        window.removeEventListener('keydown', resume);
        document.removeEventListener('touchstart', resume);
        try {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
          master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
          setTimeout(() => {
            try { drone1.stop(); drone2.stop(); pad.stop(); lfo.stop(); shimmer.stop(); shimmerLfo.stop(); } catch(e) {}
            try { ctx.close(); } catch(e) {}
          }, 1600);
        } catch(e) {}
      };
    } catch(e) {
      return () => {};
    }
  }, []);

  // Converging particles for logo assembly
  const particles = Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * Math.PI * 2;
    const dist = 180 + Math.random() * 120;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, delay: Math.random() * 0.6, size: 1 + Math.random() * 2 };
  });

  // Floating ambient particles for showcase
  const floatParticles = Array.from({ length: 15 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100, duration: 3 + Math.random() * 4, delay: Math.random() * 3,
  }));

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black overflow-hidden"
          exit={{ opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          {/* ── SKIP BUTTON ── */}
          <button
            onClick={handleSkip}
            className="fixed bottom-6 right-6 z-[10000] text-white/40 hover:text-white text-xs px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition-all hover:bg-white/10 font-inter tracking-wider"
          >
            Skip Intro →
          </button>

          {/* ── PHASE 0: Blackout with faint glow ── */}
          {phase === PHASE.BLACKOUT && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="w-96 h-96 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(25,25,45,0.2) 0%, transparent 70%)' }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}

          {/* ── PHASE 1: Emergency lighting sweeps ── */}
          {phase >= PHASE.LIGHTS && phase < PHASE.LOGO && (
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,40,40,0.28) 50%, transparent 70%)' }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, repeat: 1, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(75deg, transparent 30%, rgba(40,100,255,0.22) 50%, transparent 70%)' }}
                initial={{ x: '100%' }}
                animate={{ x: '-100%' }}
                transition={{ duration: 1.2, repeat: 1, ease: 'easeInOut', delay: 0.3 }}
              />
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,20,20,0.18) 50%, transparent 65%)' }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: 1, ease: 'easeInOut', delay: 0.7 }}
              />
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(75deg, transparent 35%, rgba(30,80,255,0.15) 50%, transparent 65%)' }}
                initial={{ x: '100%' }}
                animate={{ x: '-100%' }}
                transition={{ duration: 1, repeat: 1, ease: 'easeInOut', delay: 1 }}
              />
            </div>
          )}

          {/* ── PHASE 2: Logo assembly ── */}
          {phase >= PHASE.LOGO && phase < PHASE.SHOWCASE && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {particles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{ width: p.size, height: p.size, background: 'rgba(255,255,255,0.7)' }}
                  initial={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                  animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: [0, 1.8, 0] }}
                  transition={{ duration: 1.3, delay: p.delay, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                initial={{ scale: 0.3, opacity: 0, filter: 'blur(20px) brightness(2)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px) brightness(1.2)' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{ filter: 'drop-shadow(0 0 40px rgba(206,0,0,0.35))' }}
              >
                <VanguardLogo size="xl" />
              </motion.div>
              <motion.div
                className="text-center mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <h1 className="text-white text-3xl md:text-4xl font-black tracking-[0.2em] font-rajdhani">VanguardOS</h1>
                <p className="text-white/40 text-sm md:text-base mt-2 tracking-[0.35em] uppercase font-rajdhani">Public Safety Command Platform</p>
              </motion.div>
            </div>
          )}

          {/* ── PHASE 3: Interface showcase with real UI screenshots ── */}
          {phase >= PHASE.SHOWCASE && (
            <div className="absolute inset-0">
              {/* Header bar assembling */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-14 border-b border-white/[0.08] bg-[#0B0B0B]/95 backdrop-blur-xl z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />

              {/* Logo moving to header position */}
              <motion.div
                className="absolute z-30"
                initial={{ left: '50%', top: '50%', x: '-50%', y: '-50%', scale: 1, opacity: 1 }}
                animate={{ left: '20px', top: '8px', x: '0%', y: '0%', scale: 0.3, opacity: 0.7 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              >
                <VanguardLogo size="xl" />
              </motion.div>

              {/* Nav tabs assembling */}
              <motion.div
                className="absolute top-0 right-6 h-14 flex items-center gap-1 z-30"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {['Dispatch', 'Police', 'Fire', 'EMS'].map((label, i) => (
                  <motion.div
                    key={label}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white/50 bg-white/[0.04] font-inter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    {label}
                  </motion.div>
                ))}
              </motion.div>

              {/* Slideshow display — real UI screenshots */}
              <div className="absolute inset-0 pt-20 pb-20 px-8 flex items-center justify-center">
                <motion.div
                  className="relative w-full max-w-5xl"
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                >
                  <div className="relative rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl bg-[#0C0C0C]">
                    {/* Slide images crossfading */}
                    <div className="relative aspect-video">
                      <AnimatePresence mode="popLayout">
                        <motion.img
                          key={slideIdx}
                          src={SLIDES[slideIdx].url}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                      </AnimatePresence>
                      {/* Subtle dark vignette at bottom for text legibility */}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 to-transparent" />
                    </div>

                    {/* Feature text overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={slideIdx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4 }}
                        >
                          <h3 className="text-white text-lg md:text-xl font-bold font-rajdhani tracking-wide">{SLIDES[slideIdx].feature}</h3>
                          <p className="text-white/55 text-xs md:text-sm mt-1 font-inter">{SLIDES[slideIdx].desc}</p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Slide progress indicators */}
                    <div className="absolute top-3 right-4 flex gap-1.5 z-10">
                      {SLIDES.map((_, i) => (
                        <div
                          key={i}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: i === slideIdx ? '20px' : '5px',
                            height: '5px',
                            background: i === slideIdx ? '#CE0000' : 'rgba(255,255,255,0.25)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Radar sweep effect */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-50"
                style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,255,200,0.03) 30deg, transparent 60deg)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />

              {/* Floating ambient particles */}
              {floatParticles.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white/20 pointer-events-none"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  animate={{ y: [0, -30, 0], opacity: [0, 0.4, 0] }}
                  transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
                />
              ))}

              {/* Blue/red ambient lighting */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 25% 60%, rgba(255,0,0,0.05) 0%, transparent 45%), radial-gradient(ellipse at 75% 60%, rgba(0,50,255,0.05) 0%, transparent 45%)',
                }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}