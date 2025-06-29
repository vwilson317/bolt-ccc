import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { StoryProvider } from './contexts/StoryContext';
import Header from './components/Header';
import WeatherBar from './components/WeatherBar';
import StoryViewer from './components/StoryViewer';
import Home from './pages/Home';
import Discover from './pages/Discover';
import About from './pages/About';
import Admin from './pages/Admin';
import './i18n';

function App() {
  return (
    <AppProvider>
      <StoryProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <WeatherBar />
            <main className="pt-24">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/about" element={<About />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <StoryViewer />
          </div>
        </Router>
      </StoryProvider>
    </AppProvider>
  );
}

export default App;