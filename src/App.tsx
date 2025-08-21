import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './contexts/AppContext';
import { StoryProvider } from './contexts/StoryContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { useAnalytics } from './hooks/useAnalytics';
import Header from './components/Header';
import WeatherBar from './components/WeatherBar';
import StoryViewer from './components/StoryViewer';
import EnvironmentBadge from './components/EnvironmentBadge';
import EnvironmentInfo from './components/EnvironmentInfo';
import BarracaDetail from './components/BarracaDetail';
import FirestoreStatusIndicator from './components/FirestoreStatusIndicator';
import LoadingPage from './components/LoadingPage';
import Home from './pages/Home';
import Discover from './pages/Discover';
import About from './pages/About';
import Admin from './pages/Admin';
import BarracaDetailPage from './pages/BarracaDetail';
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

function AppContent() {
  // Initialize analytics
  useAnalytics();
  const { selectedBarraca, closeBarracaModal, weatherOverride, isInitialLoading } = useApp();

  // Show loading page during initial load
  if (isInitialLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/register" element={<BarracaRegister />} />
          <Route path="/barraca/:id" element={<BarracaDetailPage />} />
          {/* <Route path="/translation-demo" element={<TranslationDemo />} /> */}
        </Routes>
      </main>
      <StoryViewer />
      
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
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            zIndex: 9999,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            padding: '2rem',
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
    <AppProvider>
      <StoryProvider>
        <WeatherProvider>
          <Router>
            <AppContent />
          </Router>
        </WeatherProvider>
      </StoryProvider>
    </AppProvider>
  );
}

export default App;