import ReactGA from 'react-ga4';

// Analytics service for Google Analytics 4
class AnalyticsService {
  private isInitialized = false;
  private measurementId: string;

  constructor() {
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
  }

  // Initialize Google Analytics
  init() {
    if (!this.measurementId) {
      console.warn('⚠️ Google Analytics Measurement ID not found. Analytics will be disabled.');
      return;
    }

    if (this.isInitialized) {
      console.warn('⚠️ Google Analytics already initialized.');
      return;
    }

    try {
      ReactGA.initialize(this.measurementId, {
        debug: import.meta.env.DEV,
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
    this.trackEvent('Performance', metric, undefined, Math.round(value));
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

// Create singleton instance
export const analytics = new AnalyticsService();

// Export individual tracking functions for convenience
export const {
  init: initAnalytics,
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
  getStatus: getAnalyticsStatus
} = analytics; 