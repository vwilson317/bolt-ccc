import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initAnalytics,
  trackPageView,
  trackEvent,
  trackBarracaView,
  trackBarracaFilter,
  trackBarracaSearch,
  trackBarracaStatusChange,
  trackBarracaManualStatus,
  trackBarracaSpecialOverride,
  trackWeatherView,
  trackWeatherRefresh,
  trackWeatherOverride,
  trackWeatherDependentBarracas,
  trackStoryView,
  trackStoryShare,
  trackEmailSubscription,
  trackLanguageChange,
  trackVisitorSession,
  trackUniqueVisitor,
  trackAdminLogin,
  trackAdminAction,
  trackAdminBarracaManagement,
  trackAdminWeatherOverride,
  trackAdminManualStatus,
  trackAdminSpecialOverride,
  trackNotificationPermission,
  trackNotificationTokenSaved,
  trackNotificationReceived,
  trackNotificationClicked,
  trackWeekendHoursView,
  trackWeekendHoursEnabled,
  trackPartneredBarracaInteraction,
  trackNonPartneredBarracaInteraction,
  trackExternalApiCall,
  trackExternalStatusUpdate,
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
  trackFirestoreConnection,
  trackFirestoreSync,
  trackSupabaseQuery,
  trackRealtimeSubscription,
  trackFeatureUsage,
  trackBusinessMetric,
  // New photo gallery tracking functions
  trackPhotoGalleryView,
  trackPhotoView,
  trackPhotoLightboxOpen,
  trackPhotoLightboxClose,
  trackPhotoNavigation,
  trackPhotoDownload,
  trackPhotoShare,
  trackPhotoArchiveClick,
  trackPhotoLoadError,
  trackPhotoLoadSuccess,
  // New barraca registration tracking functions
  trackBarracaRegistrationView,
  trackBarracaRegistrationStart,
  trackBarracaRegistrationFieldInteraction,
  trackBarracaRegistrationValidationError,
  trackBarracaRegistrationPartnershipSelection,
  trackBarracaRegistrationContactPreference,
  trackBarracaRegistrationPhotoUpload,
  trackBarracaRegistrationSubmit,
  trackBarracaRegistrationAbandonment,
  // New registration marquee tracking functions
  trackRegistrationMarqueeView,
  trackRegistrationMarqueeInstagramClick,
  trackRegistrationMarqueeBarracaClick,
  // New Cloudflare tracking functions
  trackCloudflareImageLoad,
  trackCloudflareImageError,
  trackCloudflareServiceStatus,
  // New language and feature tracking functions
  trackLanguageSpecificInteraction,
  trackTranslationUsage,
  trackFeatureAdoption,
  trackNewFeatureDiscovery,
  getAnalyticsStatus
} from '../services/analyticsService';

export const useAnalytics = () => {
  const location = useLocation();
  const pageStartTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);

  // Initialize analytics on mount
  useEffect(() => {
    try {
      initAnalytics();
      trackDeviceType();
      trackScreenSize();
    } catch (error) {
      console.warn('⚠️ Analytics initialization failed:', error);
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    try {
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
    } catch (error) {
      console.warn('⚠️ Page tracking failed:', error);
    }
  }, [location]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      try {
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
      } catch (error) {
        console.warn('⚠️ Scroll tracking failed:', error);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  // Track performance metrics
  useEffect(() => {
    try {
      if ('performance' in window) {
        const observer = new PerformanceObserver((list) => {
          try {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'navigation') {
                const navEntry = entry as PerformanceNavigationTiming;
                if (trackPerformance && typeof trackPerformance === 'function') {
                  trackPerformance('Page Load Time', navEntry.loadEventEnd - navEntry.loadEventStart);
                  trackPerformance('DOM Content Loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
                }
              }
            }
          } catch (error) {
            console.warn('⚠️ Performance observer callback failed:', error);
          }
        });
        
        observer.observe({ entryTypes: ['navigation'] });
        
        return () => observer.disconnect();
      }
    } catch (error) {
      console.warn('⚠️ Performance tracking failed:', error);
    }
  }, []);

  // Track errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      try {
        trackError(event.message, event.filename);
      } catch (error) {
        console.warn('⚠️ Error tracking failed:', error);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        trackError(event.reason, 'Unhandled Promise Rejection');
      } catch (error) {
        console.warn('⚠️ Error tracking failed:', error);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Return tracking functions with error handling
  const createSafeTrackingFunction = (trackingFunction: Function) => {
    return useCallback((...args: any[]) => {
      try {
        return trackingFunction(...args);
      } catch (error) {
        console.warn('⚠️ Analytics tracking failed:', error);
      }
    }, [trackingFunction]);
  };

  return {
    // Basic tracking
    trackEvent: createSafeTrackingFunction(trackEvent),
    trackPageView: createSafeTrackingFunction(trackPageView),
    
    // Barraca tracking
    trackBarracaView: createSafeTrackingFunction(trackBarracaView),
    trackBarracaFilter: createSafeTrackingFunction(trackBarracaFilter),
    trackBarracaSearch: createSafeTrackingFunction(trackBarracaSearch),
    trackBarracaStatusChange: createSafeTrackingFunction(trackBarracaStatusChange),
    trackBarracaManualStatus: createSafeTrackingFunction(trackBarracaManualStatus),
    trackBarracaSpecialOverride: createSafeTrackingFunction(trackBarracaSpecialOverride),
    
    // Weather tracking
    trackWeatherView: createSafeTrackingFunction(trackWeatherView),
    trackWeatherRefresh: createSafeTrackingFunction(trackWeatherRefresh),
    trackWeatherOverride: createSafeTrackingFunction(trackWeatherOverride),
    trackWeatherDependentBarracas: createSafeTrackingFunction(trackWeatherDependentBarracas),
    
    // Story tracking
    trackStoryView: createSafeTrackingFunction(trackStoryView),
    trackStoryShare: createSafeTrackingFunction(trackStoryShare),
    
    // User tracking
    trackEmailSubscription: createSafeTrackingFunction(trackEmailSubscription),
    trackLanguageChange: createSafeTrackingFunction(trackLanguageChange),
    trackVisitorSession: createSafeTrackingFunction(trackVisitorSession),
    trackUniqueVisitor: createSafeTrackingFunction(trackUniqueVisitor),
    trackUserJourney: createSafeTrackingFunction(trackUserJourney),
    
    // Admin tracking
    trackAdminLogin: createSafeTrackingFunction(trackAdminLogin),
    trackAdminAction: createSafeTrackingFunction(trackAdminAction),
    trackAdminBarracaManagement: createSafeTrackingFunction(trackAdminBarracaManagement),
    trackAdminWeatherOverride: createSafeTrackingFunction(trackAdminWeatherOverride),
    trackAdminManualStatus: createSafeTrackingFunction(trackAdminManualStatus),
    trackAdminSpecialOverride: createSafeTrackingFunction(trackAdminSpecialOverride),
    
    // Notification tracking
    trackNotificationPermission: createSafeTrackingFunction(trackNotificationPermission),
    trackNotificationTokenSaved: createSafeTrackingFunction(trackNotificationTokenSaved),
    trackNotificationReceived: createSafeTrackingFunction(trackNotificationReceived),
    trackNotificationClicked: createSafeTrackingFunction(trackNotificationClicked),
    
    // Weekend hours tracking
    trackWeekendHoursView: createSafeTrackingFunction(trackWeekendHoursView),
    trackWeekendHoursEnabled: createSafeTrackingFunction(trackWeekendHoursEnabled),
    
    // Partnered vs non-partnered tracking
    trackPartneredBarracaInteraction: createSafeTrackingFunction(trackPartneredBarracaInteraction),
    trackNonPartneredBarracaInteraction: createSafeTrackingFunction(trackNonPartneredBarracaInteraction),
    
    // External API tracking
    trackExternalApiCall: createSafeTrackingFunction(trackExternalApiCall),
    trackExternalStatusUpdate: createSafeTrackingFunction(trackExternalStatusUpdate),
    
    // Performance tracking
    trackPerformance: createSafeTrackingFunction(trackPerformance),
    trackError: createSafeTrackingFunction(trackError),
    
    // Device tracking
    trackDeviceType: createSafeTrackingFunction(trackDeviceType),
    trackScreenSize: createSafeTrackingFunction(trackScreenSize),
    
    // Engagement tracking
    trackTimeOnPage: createSafeTrackingFunction(trackTimeOnPage),
    trackScrollDepth: createSafeTrackingFunction(trackScrollDepth),
    trackCTAClick: createSafeTrackingFunction(trackCTAClick),
    
    // Link tracking
    trackExternalLink: createSafeTrackingFunction(trackExternalLink),
    trackSocialShare: createSafeTrackingFunction(trackSocialShare),
    
    // Form tracking
    trackFormSubmission: createSafeTrackingFunction(trackFormSubmission),
    
    // PWA tracking
    trackPWAInstall: createSafeTrackingFunction(trackPWAInstall),
    
    // Database tracking
    trackFirestoreConnection: createSafeTrackingFunction(trackFirestoreConnection),
    trackFirestoreSync: createSafeTrackingFunction(trackFirestoreSync),
    trackSupabaseQuery: createSafeTrackingFunction(trackSupabaseQuery),
    trackRealtimeSubscription: createSafeTrackingFunction(trackRealtimeSubscription),
    
    // Feature and business tracking
    trackFeatureUsage: createSafeTrackingFunction(trackFeatureUsage),
    trackBusinessMetric: createSafeTrackingFunction(trackBusinessMetric),
    
    // Photo gallery tracking
    trackPhotoGalleryView: createSafeTrackingFunction(trackPhotoGalleryView),
    trackPhotoView: createSafeTrackingFunction(trackPhotoView),
    trackPhotoLightboxOpen: createSafeTrackingFunction(trackPhotoLightboxOpen),
    trackPhotoLightboxClose: createSafeTrackingFunction(trackPhotoLightboxClose),
    trackPhotoNavigation: createSafeTrackingFunction(trackPhotoNavigation),
    trackPhotoDownload: createSafeTrackingFunction(trackPhotoDownload),
    trackPhotoShare: createSafeTrackingFunction(trackPhotoShare),
    trackPhotoArchiveClick: createSafeTrackingFunction(trackPhotoArchiveClick),
    trackPhotoLoadError: createSafeTrackingFunction(trackPhotoLoadError),
    trackPhotoLoadSuccess: createSafeTrackingFunction(trackPhotoLoadSuccess),
    
    // Barraca registration tracking
    trackBarracaRegistrationView: createSafeTrackingFunction(trackBarracaRegistrationView),
    trackBarracaRegistrationStart: createSafeTrackingFunction(trackBarracaRegistrationStart),
    trackBarracaRegistrationFieldInteraction: createSafeTrackingFunction(trackBarracaRegistrationFieldInteraction),
    trackBarracaRegistrationValidationError: createSafeTrackingFunction(trackBarracaRegistrationValidationError),
    trackBarracaRegistrationPartnershipSelection: createSafeTrackingFunction(trackBarracaRegistrationPartnershipSelection),
    trackBarracaRegistrationContactPreference: createSafeTrackingFunction(trackBarracaRegistrationContactPreference),
    trackBarracaRegistrationPhotoUpload: createSafeTrackingFunction(trackBarracaRegistrationPhotoUpload),
    trackBarracaRegistrationSubmit: createSafeTrackingFunction(trackBarracaRegistrationSubmit),
    trackBarracaRegistrationAbandonment: createSafeTrackingFunction(trackBarracaRegistrationAbandonment),
    
    // Registration marquee tracking
    trackRegistrationMarqueeView: createSafeTrackingFunction(trackRegistrationMarqueeView),
    trackRegistrationMarqueeInstagramClick: createSafeTrackingFunction(trackRegistrationMarqueeInstagramClick),
    trackRegistrationMarqueeBarracaClick: createSafeTrackingFunction(trackRegistrationMarqueeBarracaClick),
    
    // Cloudflare tracking
    trackCloudflareImageLoad: createSafeTrackingFunction(trackCloudflareImageLoad),
    trackCloudflareImageError: createSafeTrackingFunction(trackCloudflareImageError),
    trackCloudflareServiceStatus: createSafeTrackingFunction(trackCloudflareServiceStatus),
    
    // Language and feature tracking
    trackLanguageSpecificInteraction: createSafeTrackingFunction(trackLanguageSpecificInteraction),
    trackTranslationUsage: createSafeTrackingFunction(trackTranslationUsage),
    trackFeatureAdoption: createSafeTrackingFunction(trackFeatureAdoption),
    trackNewFeatureDiscovery: createSafeTrackingFunction(trackNewFeatureDiscovery),
    
    // Status
    getStatus: useCallback(() => {
      try {
        return getAnalyticsStatus();
      } catch (error) {
        console.warn('⚠️ Analytics status check failed:', error);
        return {
          isInitialized: false,
          measurementId: 'Error',
          environment: 'unknown'
        };
      }
    }, [])
  };
}; 