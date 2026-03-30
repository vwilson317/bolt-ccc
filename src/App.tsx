import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider, useApp } from './contexts/AppContext';
// import { StoryProvider } from './contexts/StoryContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { BadgeProvider } from './contexts/BadgeContext';
import { usePostHogAnalytics } from './hooks/usePostHogAnalytics';
import Header from './components/Header';
import LoadingPage from './components/LoadingPage';
import ErrorBoundary from './components/ErrorBoundary';
import UnlockedBadgesFab from './components/UnlockedBadgesFab';

// Lazy-load page components so only the current route's code is fetched on initial load
const Home = lazy(() => import('./pages/Home'));
const CommunityHome = lazy(() => import('./pages/CommunityHome'));
const Discover = lazy(() => import('./pages/Discover'));
const About = lazy(() => import('./pages/About'));
const Jobs = lazy(() => import('./pages/Jobs'));
const InterviewProcess = lazy(() => import('./pages/InterviewProcess'));
const BarracaDetailPage = lazy(() => import('./pages/BarracaDetail'));
const Photos = lazy(() => import('./pages/Photos'));
const PhotoGallery = lazy(() => import('./pages/PhotoGallery'));
const BarracaRegister = lazy(() => import('./pages/BarracaRegister'));
const LanguageExchangeFunnel = lazy(() => import('./pages/LanguageExchangeFunnel'));
const BarracaPromoPage = lazy(() => import('./pages/BarracaPromoPage'));
const CoastalClubPassPage = lazy(() => import('./pages/CoastalClubPassPage'));
const ActivePromosPage = lazy(() => import('./pages/ActivePromosPage'));
const PhotographerShowcase = lazy(() => import('./pages/PhotographerShowcase'));
const RyanFarewellParty = lazy(() => import('./pages/RyanFarewellParty'));

// Lazy-load heavy overlay components that are not needed at initial paint
// StoryViewer removed: StoryProvider is disabled and StoryViewer would throw without it
const BarracaDetail = lazy(() => import('./components/BarracaDetail'));

import { logEnvironmentInfo, checkSupabaseConnection } from './lib/supabase';
import './i18n';


// Log environment info on app start
logEnvironmentInfo();

// Check Supabase connection
checkSupabaseConnection().then(connected => {
  if (!connected) {
    console.warn('⚠️ Supabase connection check failed - app may not function properly');
  }
});

const isBarracaSubdomain =
  typeof window !== 'undefined' && window.location.hostname === 'barraca.cariocacoastalclub.com';

function AppContent() {
  const { selectedBarraca, closeBarracaModal, weatherOverride, isInitialLoading } = useApp();
  const location = useLocation();
  const isMinimalRoute = location.pathname === '/language-exchange' || location.pathname === '/ryans-farewell-party' || (location.pathname === '/' && !isBarracaSubdomain);
  
  // Initialize PostHog analytics
  usePostHogAnalytics();

  // Show loading page during initial load
  if (isInitialLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isMinimalRoute && <Header />}
      <main>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={isBarracaSubdomain ? <Home /> : <RyanFarewellParty />} />
            <Route path="/projects/carioca-coastal-club" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/about" element={<About />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/interview-process" element={<InterviewProcess />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/photos/:dateId" element={<PhotoGallery />} />
            <Route path="/barraca/:id" element={<BarracaDetailPage />} />
            <Route path="/register" element={<BarracaRegister />} />
            <Route path="/language-exchange" element={<LanguageExchangeFunnel />} />
            {/* CCC All-Access Pass — must be listed before the generic :slug route */}
            <Route path="/loyalty/coastal-club-pass" element={<CoastalClubPassPage />} />
            {/* Active promo badges listing — must be before generic :slug route */}
            <Route path="/loyalty/promos" element={<ActivePromosPage />} />
            {/* Loyalty promo pages at /loyalty/:slug for SEO-friendly URLs */}
            <Route path="/loyalty/:slug" element={<BarracaPromoPage />} />
            <Route path="/videography" element={<PhotographerShowcase />} />
            <Route path="/ryans-farewell-party" element={<RyanFarewellParty />} />
            {/* <Route path="/translation-demo" element={<TranslationDemo />} /> */}
          </Routes>
        </Suspense>
      </main>
      {/* Global Barraca Detail Modal */}
      {selectedBarraca && (
        <Suspense fallback={null}>
          <BarracaDetail
            barraca={selectedBarraca}
            onClose={closeBarracaModal}
            weatherOverride={weatherOverride}
          />
        </Suspense>
      )}
      
      {/* Firestore Status Indicator - Temporarily disabled */}
      {/* <FirestoreStatusIndicator /> */}
      
      {/* <EnvironmentBadge />
      <EnvironmentInfo /> */}
      
      {/* Global Toaster */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            zIndex: 9999,
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            duration: 5000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 6000,
            iconTheme: {
              primary: '#f87171',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary context="app-root">
      <HelmetProvider>
        <AppProvider>
          {/* Stories provider disabled for now */}
          {/* <StoryProvider> */}
          <WeatherProvider>
            <BadgeProvider>
              <Router>
                <AppContent />
                {/* Global multi-badge FAB — shown whenever any badge is unlocked */}
                <UnlockedBadgesFab />
              </Router>
            </BadgeProvider>
          </WeatherProvider>
          {/* </StoryProvider> */}
        </AppProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
