import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider, useApp } from './contexts/AppContext';
// import { StoryProvider } from './contexts/StoryContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { usePostHogAnalytics } from './hooks/usePostHogAnalytics';
import Header from './components/Header';
import WeatherBar from './components/WeatherBar';
// import StoryViewer from './components/StoryViewer';
import EnvironmentBadge from './components/EnvironmentBadge';
import EnvironmentInfo from './components/EnvironmentInfo';
import BarracaDetail from './components/BarracaDetail';
import LoadingPage from './components/LoadingPage';
import Home from './pages/Home';
import CommunityHome from './pages/CommunityHome';
import Discover from './pages/Discover';
import About from './pages/About';
import BarracaDetailPage from './pages/BarracaDetail';
import Photos from './pages/Photos';
import PhotoGallery from './pages/PhotoGallery';
import BarracaRegister from './pages/BarracaRegister';

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
  
  // Initialize PostHog analytics
  usePostHogAnalytics();

  // Show loading page during initial load
  if (isInitialLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={isBarracaSubdomain ? <Home /> : <CommunityHome />} />
          <Route path="/projects/carioca-coastal-club" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/about" element={<About />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/photos/:dateId" element={<PhotoGallery />} />
          <Route path="/barraca/:id" element={<BarracaDetailPage />} />
          <Route path="/register" element={<BarracaRegister />} />
          {/* <Route path="/translation-demo" element={<TranslationDemo />} /> */}
        </Routes>
      </main>
      {/* Stories feature disabled for now */}
      {/* <StoryViewer /> */}
      
      {/* Global Barraca Detail Modal */}
      {selectedBarraca && (
        <BarracaDetail
          barraca={selectedBarraca}
          onClose={closeBarracaModal}
          weatherOverride={weatherOverride}
        />
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
    <HelmetProvider>
      <AppProvider>
        {/* Stories provider disabled for now */}
        {/* <StoryProvider> */}
        <WeatherProvider>
          <Router>
            <AppContent />
          </Router>
        </WeatherProvider>
        {/* </StoryProvider> */}
      </AppProvider>
    </HelmetProvider>
  );
}

export default App;
