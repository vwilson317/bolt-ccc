import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import Home from './pages/Home';
import Discover from './pages/Discover';
import About from './pages/About';
import Admin from './pages/Admin';
import BarracaDetailPage from './pages/BarracaDetail';

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
  const { selectedBarraca, closeBarracaModal, weatherOverride } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
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
      
      {/* Firestore Status Indicator */}
      <FirestoreStatusIndicator />
      
      {/* <EnvironmentBadge />
      <EnvironmentInfo /> */}
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