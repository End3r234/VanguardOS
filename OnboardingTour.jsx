import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { markTutorialComplete } from '@/lib/onboardingTutorials';

export default function OnboardingTour({ tutorial, onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const step = tutorial.steps[stepIdx];
  const StepIcon = step.icon || tutorial.icon;
  const isLast = stepIdx === tutorial.steps.length - 1;
  const progress = ((stepIdx + 1) / tutorial.steps.length) * 100;

  const handleNext = () => {
    if (isLast) {
      markTutorialComplete(tutorial.id);
      setCompleted(true);
      setTimeout(() => onComplete(), 1800);
    } else {
      setStepIdx(i => i + 1);
    }
  };

  if (completed) {
    return (
      <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <CheckCircle2 size={64} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold">Tutorial Complete!</h2>
          <p className="text-white/40 text-sm mt-2">You can revisit this anytime from the Learning Center</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0E0E0E] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            {tutorial.icon && React.createElement(tutorial.icon, { size: 16, className: 'text-crimson' })}
            <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{tutorial.title}</span>
          </div>
          <button onClick={onComplete} className="text-white/30 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-crimson"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="w-16 h-16 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center mb-4">
            <StepIcon size={28} className="text-crimson" />
          </div>
          <p className="text-white/30 text-xs mb-1">Step {stepIdx + 1} of {tutorial.steps.length}</p>
          <h3 className="text-white text-lg font-bold mb-2 font-rajdhani">{step.title}</h3>
          <p className="text-white/60 text-sm leading-relaxed font-inter">{step.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {tutorial.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === stepIdx ? 'bg-crimson w-4' : 'bg-white/20 w-1.5'}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStepIdx(i => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="text-white/40 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1 text-xs font-inter"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setStepIdx(0)}
              className="text-white/40 hover:text-white transition-colors"
              title="Restart"
            >
              <RotateCcw size={14} />
            </button>
          </div>
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-lg bg-crimson text-white text-xs font-semibold hover:bg-crimson-dark transition-colors flex items-center gap-1 font-inter"
          >
            {isLast ? 'Finish' : 'Next'} <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}