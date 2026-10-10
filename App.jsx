import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import ServerCAD from './pages/ServerCAD';
import Profile from './pages/Profile';
import ProfileDirectory from './pages/ProfileDirectory';
import LMS from './pages/LMS';
import TrainingModule from './pages/TrainingModule';
import BadgeAdmin from './pages/BadgeAdmin';
import Blog from './pages/Blog';
import BugReports from './pages/BugReports';
import FAQ from './pages/FAQ';
import FloatingAI from './components/FloatingAI';
import GodPanel from './pages/GodPanel';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Documentation from './pages/Documentation';
import About from './pages/About';
import Apply from './pages/Apply';
import ApplicationsAdmin from './pages/ApplicationsAdmin';
import Updates from './pages/Updates';
import LearningCenter from './pages/LearningCenter';
import OnboardingTourManager from '@/components/onboarding/OnboardingTourManager';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  useEffect(() => { trackPageView(location.pathname); }, [location.pathname]);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0B0B0B]">
        <div className="w-8 h-8 border-4 border-crimson/20 border-t-crimson rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/server/:serverId" element={<ServerCAD />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/directory" element={<ProfileDirectory />} />
      <Route path="/lms" element={<LMS />} />
      <Route path="/training/:dept/:tier" element={<TrainingModule />} />
      <Route path="/badge-admin" element={<BadgeAdmin />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/bug-reports" element={<BugReports />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/god" element={<GodPanel />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/about" element={<About />} />
      <Route path="/apply" element={<Apply />} />
      <Route path="/applications-admin" element={<ApplicationsAdmin />} />
      <Route path="/updates" element={<Updates />} />
      <Route path="/learning-center" element={<LearningCenter />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
          <OnboardingTourManager />
        </Router>
        <FloatingAI />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App