import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { StoryProvider } from './contexts/StoryContext';
import { WeatherProvider } from './contexts/WeatherContext';
import { useAnalytics } from './hooks/useAnalytics';
import Header from './components/Header';
import WeatherBar from './components/WeatherBar';
import StoryViewer from './components/StoryViewer';
import EnvironmentBadge from './components/EnvironmentBadge';
import EnvironmentInfo from './components/EnvironmentInfo';
import Home from './pages/Home';
import Discover from './pages/Discover';
import About from './pages/About';
import Admin from './pages/Admin';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <WeatherBar />
      <main className="pt-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          {/* <Route path="/translation-demo" element={<TranslationDemo />} /> */}
        </Routes>
      </main>
      <StoryViewer />
      <EnvironmentBadge />
      <EnvironmentInfo />
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