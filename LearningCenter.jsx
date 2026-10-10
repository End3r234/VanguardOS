import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, PlayCircle, RotateCcw, GraduationCap } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import { ONBOARDING_TUTORIALS, TUTORIAL_CATEGORIES, startTutorial, getCompletedTutorials } from '@/lib/onboardingTutorials';

function OnboardingToggle() {
  const [disabled, setDisabled] = useState(() => typeof window !== 'undefined' && localStorage.getItem('vos-onboarding-disabled') === '1');
  const toggle = () => {
    const next = !disabled;
    setDisabled(next);
    if (next) {
      localStorage.setItem('vos-onboarding-disabled', '1');
      localStorage.setItem('vos-onboarding-prompted', '1');
    } else {
      localStorage.removeItem('vos-onboarding-disabled');
      localStorage.removeItem('vos-onboarding-prompted');
    }
  };
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div>
        <p className="text-white/70 text-sm font-inter font-medium">Onboarding Prompts</p>
        <p className="text-white/30 text-xs font-inter mt-0.5">Show the welcome walkthrough on login</p>
      </div>
      <button
        onClick={toggle}
        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${disabled ? 'bg-white/20' : 'bg-emerald-500'}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${disabled ? 'left-1' : 'left-6'}`} />
      </button>
    </div>
  );
}

export default function LearningCenter() {
  const completed = getCompletedTutorials();
  const progress = Math.round((completed.length / ONBOARDING_TUTORIALS.length) * 100);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <header className="border-b border-white/[0.06] bg-[#111]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
            <VanguardLogo size="sm" />
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/docs" className="text-white/40 hover:text-white transition-colors">Documentation</Link>
            <Link to="/updates" className="text-white/40 hover:text-white transition-colors">Updates</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={20} className="text-crimson" />
            <p className="text-crimson text-xs uppercase tracking-widest font-semibold">Learn</p>
          </div>
          <h1 className="text-3xl font-black mb-2 font-rajdhani">Learning Center</h1>
          <p className="text-white/40 text-sm font-inter">Interactive tutorials to help you master VanguardOS at your own pace.</p>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-crimson to-crimson-dark rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white/40 text-xs font-inter font-medium">{completed.length}/{ONBOARDING_TUTORIALS.length} completed</span>
          </div>

          <OnboardingToggle />
        </div>

        {TUTORIAL_CATEGORIES.map(cat => {
          const tutorials = ONBOARDING_TUTORIALS.filter(t => t.category === cat.id);
          return (
            <div key={cat.id} className="mb-10">
              <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 font-rajdhani ${cat.color}`}>{cat.name}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {tutorials.map(t => {
                  const isDone = completed.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/15 transition-all cursor-pointer group"
                      onClick={() => startTutorial(t.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-crimson/10 group-hover:border-crimson/20 transition-all">
                          {t.icon && React.createElement(t.icon, { size: 18, className: 'text-white/60 group-hover:text-crimson transition-colors' })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-white text-sm font-semibold font-inter">{t.title}</h3>
                            {isDone && <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />}
                          </div>
                          <p className="text-white/40 text-xs mt-0.5 font-inter">{t.description}</p>
                          <div className="flex items-center gap-1 mt-2.5 text-crimson text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity font-inter">
                            {isDone ? <><RotateCcw size={12} /> Replay tutorial</> : <><PlayCircle size={12} /> Start tutorial</>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}