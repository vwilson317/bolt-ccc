import ReactGA from 'react-ga4';

// Analytics service for Google Analytics 4
class AnalyticsService {
  private isInitialized = false;
  private measurementId: string;

  constructor() {
    // Safely get the measurement ID with fallback
    try {
      this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
    } catch (error) {
      console.warn('⚠️ Could not access VITE_GA_MEASUREMENT_ID:', error);
      this.measurementId = '';
    }
  }

  // Initialize Google Analytics
  init() {
    if (!this.measurementId) {
      console.warn('⚠️ Google Analytics Measurement ID not found. Analytics will be disabled.');
      console.warn('💡 Set VITE_GA_MEASUREMENT_ID environment variable to enable analytics.');
      return;
    }

    if (this.isInitialized) {
      console.warn('⚠️ Google Analytics already initialized.');
      return;
    }

    try {
      ReactGA.initialize(this.measurementId, {
        gaOptions: {
          siteSpeedSampleRate: 100
        }
      });
      this.isInitialized = true;
      console.log('✅ Google Analytics initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google Analytics:', error);
    }
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.isInitialized) return;

    try {
      ReactGA.send({
        hitType: 'pageview',
        page: path,
        title: title || document.title
      });
      console.log(`📊 Page view tracked: ${path}`);
    } catch (error) {
      console.error('❌ Failed to track page view:', error);
    }
  }

  // Track custom events
  trackEvent(category: string, action: string, label?: string, value?: number) {
    if (!this.isInitialized) return;

    try {
      ReactGA.event({
        category,
        action,
        label,
        value
      });
      console.log(`📊 Event tracked: ${category} - ${action}${label ? ` - ${label}` : ''}`);
    } catch (error) {
      console.error('❌ Failed to track event:', error);
    }
  }

  // Track barraca interactions
  trackBarracaView(barracaId: string, barracaName: string) {
    this.trackEvent('Barraca', 'View', `${barracaName} (${barracaId})`);
  }

  trackBarracaFilter(filterType: string, filterValue: string) {
    this.trackEvent('Barraca', 'Filter', `${filterType}: ${filterValue}`);
  }

  trackBarracaSearch(searchTerm: string) {
    this.trackEvent('Barraca', 'Search', searchTerm);
  }

  // Track weather interactions
  trackWeatherView(location: string) {
    this.trackEvent('Weather', 'View', location);
  }

  trackWeatherRefresh(location: string) {
    this.trackEvent('Weather', 'Refresh', location);
  }

  // Track story interactions
  trackStoryView(storyId: string, storyTitle: string) {
    this.trackEvent('Story', 'View', `${storyTitle} (${storyId})`);
  }

  trackStoryShare(storyId: string, storyTitle: string, platform: string) {
    this.trackEvent('Story', 'Share', `${storyTitle} (${storyId}) - ${platform}`);
  }

  // Track user engagement
  trackEmailSubscription(email: string, preferences: any) {
    this.trackEvent('User', 'Email Subscription', email);
  }

  trackLanguageChange(fromLang: string, toLang: string) {
    this.trackEvent('User', 'Language Change', `${fromLang} → ${toLang}`);
  }

  trackAdminLogin(success: boolean) {
    this.trackEvent('Admin', 'Login', success ? 'Success' : 'Failed');
  }

  trackAdminAction(action: string, details?: string) {
    this.trackEvent('Admin', action, details);
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number) {
    try {
      this.trackEvent('Performance', metric, undefined, Math.round(value));
    } catch (error) {
      console.warn('⚠️ Performance tracking failed:', error);
    }
  }

  // Track errors
  trackError(error: string, context?: string) {
    this.trackEvent('Error', error, context);
  }

  // Track user journey
  trackUserJourney(step: string, details?: string) {
    this.trackEvent('User Journey', step, details);
  }

  // Track mobile vs desktop usage
  trackDeviceType() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.trackEvent('Device', 'Type', isMobile ? 'Mobile' : 'Desktop');
  }

  // Track screen size
  trackScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.trackEvent('Device', 'Screen Size', `${width}x${height}`);
  }

  // Track time on page
  trackTimeOnPage(page: string, timeSpent: number) {
    this.trackEvent('Engagement', 'Time on Page', page, Math.round(timeSpent / 1000));
  }

  // Track scroll depth
  trackScrollDepth(page: string, depth: number) {
    this.trackEvent('Engagement', 'Scroll Depth', page, depth);
  }

  // Track CTA clicks
  trackCTAClick(ctaType: string, ctaText: string, page: string) {
    this.trackEvent('CTA', 'Click', `${ctaType}: ${ctaText} on ${page}`);
  }

  // Track external links
  trackExternalLink(url: string, page: string) {
    this.trackEvent('External Link', 'Click', `${url} from ${page}`);
  }

  // Track social media interactions
  trackSocialShare(platform: string, content: string) {
    this.trackEvent('Social', 'Share', `${platform}: ${content}`);
  }

  // Track form submissions
  trackFormSubmission(formName: string, success: boolean) {
    this.trackEvent('Form', 'Submission', `${formName} - ${success ? 'Success' : 'Failed'}`);
  }

  // Track app install prompts
  trackPWAInstall(prompted: boolean, installed: boolean) {
    this.trackEvent('PWA', 'Install', `${prompted ? 'Prompted' : 'Not Prompted'} - ${installed ? 'Installed' : 'Not Installed'}`);
  }

  // Get analytics status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      measurementId: this.measurementId ? 'Configured' : 'Not Configured',
      environment: import.meta.env.VITE_APP_ENV || 'development'
    };
  }
}

// Create singleton instance with error handling
let analyticsInstance: AnalyticsService;

try {
  analyticsInstance = new AnalyticsService();
} catch (error) {
  console.error('❌ Failed to create analytics instance:', error);
  // Create a fallback instance
  analyticsInstance = new AnalyticsService();
}

export const analytics = analyticsInstance;

// Export individual tracking functions for convenience with safety checks
export const initAnalytics = () => {
  try {
    return analytics?.init?.();
  } catch (error) {
    console.warn('⚠️ Analytics initialization failed:', error);
  }
};

export const trackPageView = (path: string, title?: string) => {
  try {
    return analytics?.trackPageView?.(path, title);
  } catch (error) {
    console.warn('⚠️ Page view tracking failed:', error);
  }
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  try {
    return analytics?.trackEvent?.(category, action, label, value);
  } catch (error) {
    console.warn('⚠️ Event tracking failed:', error);
  }
};

export const trackBarracaView = (barracaId: string, barracaName: string) => {
  try {
    return analytics?.trackBarracaView?.(barracaId, barracaName);
  } catch (error) {
    console.warn('⚠️ Barraca view tracking failed:', error);
  }
};

export const trackBarracaFilter = (filterType: string, filterValue: string) => {
  try {
    return analytics?.trackBarracaFilter?.(filterType, filterValue);
  } catch (error) {
    console.warn('⚠️ Barraca filter tracking failed:', error);
  }
};

export const trackBarracaSearch = (searchTerm: string) => {
  try {
    return analytics?.trackBarracaSearch?.(searchTerm);
  } catch (error) {
    console.warn('⚠️ Barraca search tracking failed:', error);
  }
};

export const trackWeatherView = (location: string) => {
  try {
    return analytics?.trackWeatherView?.(location);
  } catch (error) {
    console.warn('⚠️ Weather view tracking failed:', error);
  }
};

export const trackWeatherRefresh = (location: string) => {
  try {
    return analytics?.trackWeatherRefresh?.(location);
  } catch (error) {
    console.warn('⚠️ Weather refresh tracking failed:', error);
  }
};

export const trackStoryView = (storyId: string, storyTitle: string) => {
  try {
    return analytics?.trackStoryView?.(storyId, storyTitle);
  } catch (error) {
    console.warn('⚠️ Story view tracking failed:', error);
  }
};

export const trackStoryShare = (storyId: string, storyTitle: string, platform: string) => {
  try {
    return analytics?.trackStoryShare?.(storyId, storyTitle, platform);
  } catch (error) {
    console.warn('⚠️ Story share tracking failed:', error);
  }
};

export const trackEmailSubscription = (email: string, preferences?: any) => {
  try {
    return analytics?.trackEmailSubscription?.(email, preferences);
  } catch (error) {
    console.warn('⚠️ Email subscription tracking failed:', error);
  }
};

export const trackLanguageChange = (fromLang: string, toLang: string) => {
  try {
    return analytics?.trackLanguageChange?.(fromLang, toLang);
  } catch (error) {
    console.warn('⚠️ Language change tracking failed:', error);
  }
};

export const trackAdminLogin = (success: boolean) => {
  try {
    return analytics?.trackAdminLogin?.(success);
  } catch (error) {
    console.warn('⚠️ Admin login tracking failed:', error);
  }
};

export const trackAdminAction = (action: string, details?: string) => {
  try {
    return analytics?.trackAdminAction?.(action, details);
  } catch (error) {
    console.warn('⚠️ Admin action tracking failed:', error);
  }
};

export const trackPerformance = (metric: string, value: number) => {
  try {
    return analytics?.trackPerformance?.(metric, value);
  } catch (error) {
    console.warn('⚠️ Performance tracking failed:', error);
  }
};

export const trackError = (error: string, context?: string) => {
  try {
    return analytics?.trackError?.(error, context);
  } catch (err) {
    console.warn('⚠️ Error tracking failed:', err);
  }
};

export const trackUserJourney = (step: string, details?: string) => {
  try {
    return analytics?.trackUserJourney?.(step, details);
  } catch (error) {
    console.warn('⚠️ User journey tracking failed:', error);
  }
};

export const trackDeviceType = () => {
  try {
    return analytics?.trackDeviceType?.();
  } catch (error) {
    console.warn('⚠️ Device type tracking failed:', error);
  }
};

export const trackScreenSize = () => {
  try {
    return analytics?.trackScreenSize?.();
  } catch (error) {
    console.warn('⚠️ Screen size tracking failed:', error);
  }
};

export const trackTimeOnPage = (page: string, timeSpent: number) => {
  try {
    return analytics?.trackTimeOnPage?.(page, timeSpent);
  } catch (error) {
    console.warn('⚠️ Time on page tracking failed:', error);
  }
};

export const trackScrollDepth = (page: string, depth: number) => {
  try {
    return analytics?.trackScrollDepth?.(page, depth);
  } catch (error) {
    console.warn('⚠️ Scroll depth tracking failed:', error);
  }
};

export const trackCTAClick = (ctaType: string, ctaText: string, page: string) => {
  try {
    return analytics?.trackCTAClick?.(ctaType, ctaText, page);
  } catch (error) {
    console.warn('⚠️ CTA click tracking failed:', error);
  }
};

export const trackExternalLink = (url: string, page: string) => {
  try {
    return analytics?.trackExternalLink?.(url, page);
  } catch (error) {
    console.warn('⚠️ External link tracking failed:', error);
  }
};

export const trackSocialShare = (platform: string, content: string) => {
  try {
    return analytics?.trackSocialShare?.(platform, content);
  } catch (error) {
    console.warn('⚠️ Social share tracking failed:', error);
  }
};

export const trackFormSubmission = (formName: string, success: boolean) => {
  try {
    return analytics?.trackFormSubmission?.(formName, success);
  } catch (error) {
    console.warn('⚠️ Form submission tracking failed:', error);
  }
};

export const trackPWAInstall = (prompted: boolean, installed: boolean) => {
  try {
    return analytics?.trackPWAInstall?.(prompted, installed);
  } catch (error) {
    console.warn('⚠️ PWA install tracking failed:', error);
  }
};

export const getAnalyticsStatus = () => {
  try {
    return analytics?.getStatus?.() || { isInitialized: false, measurementId: 'Not Configured', environment: 'unknown' };
  } catch (error) {
    console.warn('⚠️ Analytics status check failed:', error);
    return { isInitialized: false, measurementId: 'Error', environment: 'unknown' };
  }
}; 