import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackBarracaView,
  trackBarracaFilter,
  trackBarracaSearch,
  trackWeatherView,
  trackWeatherRefresh,
  trackStoryView,
  trackStoryShare,
  trackEmailSubscription,
  trackLanguageChange,
  trackAdminLogin,
  trackAdminAction,
  trackPerformance,
  trackError,
  trackUserJourney,
  trackDeviceType,
  trackScreenSize,
  trackTimeOnPage,
  trackScrollDepth,
  trackCTAClick,
  trackExternalLink,
  trackSocialShare,
  trackFormSubmission,
  trackPWAInstall,
  getAnalyticsStatus
} from '../services/analyticsService';

export const useAnalytics = () => {
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
    trackDeviceType();
    trackScreenSize();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const currentTime = Date.now();
    const timeSpent = currentTime - pageStartTime.current;
    
    // Track time spent on previous page
    if (pageStartTime.current > 0) {
      trackTimeOnPage(location.pathname, timeSpent);
    }
    
    // Track new page view
    trackPageView(location.pathname);
    
    // Reset for new page
    pageStartTime.current = Date.now();
    scrollDepth.current = 0;
  }, [location]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      // Track scroll depth at 25%, 50%, 75%, and 100%
      if (scrollPercent >= 25 && scrollDepth.current < 25) {
        trackScrollDepth(location.pathname, 25);
        scrollDepth.current = 25;
      } else if (scrollPercent >= 50 && scrollDepth.current < 50) {
        trackScrollDepth(location.pathname, 50);
        scrollDepth.current = 50;
      } else if (scrollPercent >= 75 && scrollDepth.current < 75) {
        trackScrollDepth(location.pathname, 75);
        scrollDepth.current = 75;
      } else if (scrollPercent >= 100 && scrollDepth.current < 100) {
        trackScrollDepth(location.pathname, 100);
        scrollDepth.current = 100;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  // Track performance metrics
  useEffect(() => {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            trackPerformance('Page Load Time', navEntry.loadEventEnd - navEntry.loadEventStart);
            trackPerformance('DOM Content Loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      return () => observer.disconnect();
    }
  }, []);

  // Track errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(event.message, event.filename);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(event.reason, 'Unhandled Promise Rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Return tracking functions
  return {
    // Basic tracking
    trackEvent: useCallback(trackEvent, []),
    trackPageView: useCallback(trackPageView, []),
    
    // Barraca tracking
    trackBarracaView: useCallback(trackBarracaView, []),
    trackBarracaFilter: useCallback(trackBarracaFilter, []),
    trackBarracaSearch: useCallback(trackBarracaSearch, []),
    
    // Weather tracking
    trackWeatherView: useCallback(trackWeatherView, []),
    trackWeatherRefresh: useCallback(trackWeatherRefresh, []),
    
    // Story tracking
    trackStoryView: useCallback(trackStoryView, []),
    trackStoryShare: useCallback(trackStoryShare, []),
    
    // User tracking
    trackEmailSubscription: useCallback(trackEmailSubscription, []),
    trackLanguageChange: useCallback(trackLanguageChange, []),
    trackUserJourney: useCallback(trackUserJourney, []),
    
    // Admin tracking
    trackAdminLogin: useCallback(trackAdminLogin, []),
    trackAdminAction: useCallback(trackAdminAction, []),
    
    // Performance tracking
    trackPerformance: useCallback(trackPerformance, []),
    trackError: useCallback(trackError, []),
    
    // Device tracking
    trackDeviceType: useCallback(trackDeviceType, []),
    trackScreenSize: useCallback(trackScreenSize, []),
    
    // Engagement tracking
    trackTimeOnPage: useCallback(trackTimeOnPage, []),
    trackScrollDepth: useCallback(trackScrollDepth, []),
    trackCTAClick: useCallback(trackCTAClick, []),
    
    // Link tracking
    trackExternalLink: useCallback(trackExternalLink, []),
    trackSocialShare: useCallback(trackSocialShare, []),
    
    // Form tracking
    trackFormSubmission: useCallback(trackFormSubmission, []),
    
    // PWA tracking
    trackPWAInstall: useCallback(trackPWAInstall, []),
    
    // Status
    getStatus: useCallback(getAnalyticsStatus, [])
  };
}; 