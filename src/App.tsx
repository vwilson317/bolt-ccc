import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingPage from './components/LoadingPage';
import { usePostHogAnalytics } from './hooks/usePostHogAnalytics';
import './i18n/landing';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

// FLOW. community project — self-contained mini-app, ships its own header/footer/favicons.
// Hidden from all navigation on the main site; only reachable by direct URL.
const FlowHome = lazy(() => import('./pages/flow/FlowHome'));
const FlowCitySelection = lazy(() => import('./pages/flow/FlowCitySelection'));
const FlowEventsCalendar = lazy(() => import('./pages/flow/FlowEventsCalendar'));

function AppContent() {
  const location = useLocation();
  const isFlowRoute = location.pathname.startsWith('/projects/flow');

  usePostHogAnalytics();

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Favicon/manifest swap — the FLOW. community project ships its own icon set. */}
      <Helmet>
        {isFlowRoute ? (
          <>
            <link rel="icon" type="image/x-icon" href="/flow/favicon.ico" />
            <link rel="icon" type="image/png" sizes="32x32" href="/flow/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/flow/favicon-16x16.png" />
            <link rel="apple-touch-icon" href="/flow/apple-touch-icon.png" />
            <link rel="manifest" href="/flow/site.webmanifest" />
            {/* FLOW.'s own web fonts, loaded as a <link> (not a CSS @import —
                see flow.css for why that hung the whole app on slow networks) */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,700;0,800;1,700&family=Hanken+Grotesk:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
            />
          </>
        ) : (
          <>
            <link rel="icon" type="image/png" href="/logo-icon-color.png" />
            <link rel="apple-touch-icon" href="/logo_320x320.png" />
            <link rel="manifest" href="/manifest.json" />
          </>
        )}
      </Helmet>
      <main>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* FLOW. community project — self-contained mini-app, ships its own header/footer */}
            <Route path="/projects/flow" element={<FlowHome />} />
            <Route path="/projects/flow/cities" element={<FlowCitySelection />} />
            <Route path="/projects/flow/events" element={<FlowEventsCalendar />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary context="app-root">
      <HelmetProvider>
        <Router>
          <AppContent />
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
