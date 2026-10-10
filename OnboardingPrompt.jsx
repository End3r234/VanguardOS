import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronRight, BookOpen } from 'lucide-react';
import { startTutorial, hasSeenOnboardingPrompt, markOnboardingPrompted } from '@/lib/onboardingTutorials';
import { Link } from 'react-router-dom';

export default function OnboardingPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasSeenOnboardingPrompt() && localStorage.getItem('vos-onboarding-disabled') !== '1') {
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    markOnboardingPrompted();
    setShow(false);
  };

  const handleStart = () => {
    markOnboardingPrompted();
    setShow(false);
    startTutorial('basic-cad-nav');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0E0E0E] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative p-8 text-center">
              <button onClick={handleDismiss} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
                <X size={16} />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-crimson/10 border border-crimson/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-crimson" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2 font-rajdhani">Welcome to VanguardOS</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6 font-inter">
                New here? Take a quick guided tour to learn the basics of dispatch, law enforcement, and reporting. You can revisit tutorials anytime from the Learning Center.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleStart}
                  className="px-4 py-2.5 rounded-xl bg-crimson text-white text-sm font-semibold hover:bg-crimson-dark transition-colors flex items-center justify-center gap-1.5 font-inter"
                >
                  Start Guided Tour <ChevronRight size={16} />
                </button>
                <Link
                  to="/learning-center"
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm transition-colors flex items-center justify-center gap-1.5 font-inter"
                >
                  <BookOpen size={14} /> Browse all tutorials
                </Link>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-xl text-white/40 hover:text-white text-xs transition-colors font-inter"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}