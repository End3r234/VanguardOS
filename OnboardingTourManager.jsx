import React, { useState, useEffect } from 'react';
import OnboardingTour from './OnboardingTour';
import { ONBOARDING_TUTORIALS } from '@/lib/onboardingTutorials';

export default function OnboardingTourManager() {
  const [activeTutorial, setActiveTutorial] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const tutorial = ONBOARDING_TUTORIALS.find(t => t.id === e.detail);
      if (tutorial) setActiveTutorial(tutorial);
    };
    window.addEventListener('vos-start-tutorial', handler);
    return () => window.removeEventListener('vos-start-tutorial', handler);
  }, []);

  if (!activeTutorial) return null;
  return <OnboardingTour tutorial={activeTutorial} onComplete={() => setActiveTutorial(null)} />;
}