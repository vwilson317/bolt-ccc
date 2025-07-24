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
  trackBarracaView(barracaId: string, barracaName: string, partnered: boolean = false) {
    this.trackEvent('Barraca', 'View', `${barracaName} (${barracaId}) - ${partnered ? 'Partnered' : 'Non-Partnered'}`);
  }

  trackBarracaFilter(filterType: string, filterValue: string) {
    this.trackEvent('Barraca', 'Filter', `${filterType}: ${filterValue}`);
  }

  trackBarracaSearch(searchTerm: string) {
    this.trackEvent('Barraca', 'Search', searchTerm);
  }

  trackBarracaStatusChange(barracaId: string, oldStatus: string, newStatus: string, reason: string) {
    this.trackEvent('Barraca', 'Status Change', `${barracaId}: ${oldStatus} → ${newStatus} (${reason})`);
  }

  trackBarracaManualStatus(barracaId: string, status: string, updatedBy: string) {
    this.trackEvent('Barraca', 'Manual Status', `${barracaId}: ${status} by ${updatedBy}`);
  }

  trackBarracaSpecialOverride(barracaId: string, override: boolean, expiresAt?: Date) {
    this.trackEvent('Barraca', 'Special Override', `${barracaId}: ${override ? 'Enabled' : 'Disabled'}${expiresAt ? ` until ${expiresAt.toISOString()}` : ''}`);
  }

  // Track weather interactions
  trackWeatherView(location: string) {
    this.trackEvent('Weather', 'View', location);
  }

  trackWeatherRefresh(location: string) {
    this.trackEvent('Weather', 'Refresh', location);
  }

  trackWeatherOverride(active: boolean, expiresAt?: Date) {
    this.trackEvent('Weather', 'Override', `${active ? 'Enabled' : 'Disabled'}${expiresAt ? ` until ${expiresAt.toISOString()}` : ''}`);
  }

  trackWeatherDependentBarracas(affectedCount: number) {
    this.trackEvent('Weather', 'Dependent Barracas', `Updated ${affectedCount} barracas`);
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

  trackVisitorSession(sessionId: string, isNewVisitor: boolean) {
    this.trackEvent('User', 'Session', `${sessionId} - ${isNewVisitor ? 'New' : 'Returning'} Visitor`);
  }

  trackUniqueVisitor(visitorId: string, totalCount: number) {
    this.trackEvent('User', 'Unique Visitor', `${visitorId} - Total: ${totalCount}`);
  }

  // Track admin actions
  trackAdminLogin(success: boolean, adminType: 'regular' | 'special' = 'regular') {
    this.trackEvent('Admin', 'Login', `${success ? 'Success' : 'Failed'} - ${adminType}`);
  }

  trackAdminAction(action: string, details?: string) {
    this.trackEvent('Admin', action, details);
  }

  trackAdminBarracaManagement(action: string, barracaId: string, details?: string) {
    this.trackEvent('Admin', `Barraca ${action}`, `${barracaId} - ${details || ''}`);
  }

  trackAdminWeatherOverride(active: boolean, reason?: string) {
    this.trackEvent('Admin', 'Weather Override', `${active ? 'Enabled' : 'Disabled'}${reason ? ` - ${reason}` : ''}`);
  }

  trackAdminManualStatus(barracaId: string, status: string) {
    this.trackEvent('Admin', 'Manual Status', `${barracaId}: ${status}`);
  }

  trackAdminSpecialOverride(barracaId: string, override: boolean, expiresAt?: Date) {
    this.trackEvent('Admin', 'Special Override', `${barracaId}: ${override ? 'Enabled' : 'Disabled'}${expiresAt ? ` until ${expiresAt.toISOString()}` : ''}`);
  }

  // Track notification interactions
  trackNotificationPermission(granted: boolean) {
    this.trackEvent('Notification', 'Permission', granted ? 'Granted' : 'Denied');
  }

  trackNotificationTokenSaved(success: boolean) {
    this.trackEvent('Notification', 'Token Saved', success ? 'Success' : 'Failed');
  }

  trackNotificationReceived(title: string) {
    this.trackEvent('Notification', 'Received', title);
  }

  trackNotificationClicked(title: string) {
    this.trackEvent('Notification', 'Clicked', title);
  }

  // Track weekend hours interactions
  trackWeekendHoursView(barracaId: string, day: string) {
    this.trackEvent('Weekend Hours', 'View', `${barracaId} - ${day}`);
  }

  trackWeekendHoursEnabled(barracaId: string, enabled: boolean) {
    this.trackEvent('Weekend Hours', 'Toggle', `${barracaId}: ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  // Track partnered vs non-partnered interactions
  trackPartneredBarracaInteraction(barracaId: string, action: string) {
    this.trackEvent('Partnered Barraca', action, barracaId);
  }

  trackNonPartneredBarracaInteraction(barracaId: string, action: string) {
    this.trackEvent('Non-Partnered Barraca', action, barracaId);
  }

  // Track external API interactions
  trackExternalApiCall(endpoint: string, success: boolean, responseTime?: number) {
    this.trackEvent('External API', endpoint, success ? 'Success' : 'Failed', responseTime);
  }

  trackExternalStatusUpdate(barracaId: string, success: boolean) {
    this.trackEvent('External API', 'Status Update', `${barracaId}: ${success ? 'Success' : 'Failed'}`);
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

  // Track Firestore interactions
  trackFirestoreConnection(success: boolean) {
    this.trackEvent('Firestore', 'Connection', success ? 'Connected' : 'Failed');
  }

  trackFirestoreSync(collection: string, success: boolean, recordCount?: number) {
    this.trackEvent('Firestore', 'Sync', `${collection}: ${success ? 'Success' : 'Failed'}${recordCount ? ` (${recordCount} records)` : ''}`);
  }

  // Track Supabase interactions
  trackSupabaseQuery(table: string, operation: string, success: boolean) {
    this.trackEvent('Supabase', 'Query', `${table}.${operation}: ${success ? 'Success' : 'Failed'}`);
  }

  // Track real-time subscriptions
  trackRealtimeSubscription(channel: string, success: boolean) {
    this.trackEvent('Realtime', 'Subscription', `${channel}: ${success ? 'Connected' : 'Failed'}`);
  }

  // Track feature usage
  trackFeatureUsage(feature: string, action: string, details?: string) {
    this.trackEvent('Feature', feature, `${action}${details ? ` - ${details}` : ''}`);
  }

  // Track business metrics
  trackBusinessMetric(metric: string, value: number, unit?: string) {
    this.trackEvent('Business', metric, unit, Math.round(value));
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

export const trackBarracaView = (barracaId: string, barracaName: string, partnered?: boolean) => {
  try {
    return analytics?.trackBarracaView?.(barracaId, barracaName, partnered);
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

export const trackBarracaStatusChange = (barracaId: string, oldStatus: string, newStatus: string, reason: string) => {
  try {
    return analytics?.trackBarracaStatusChange?.(barracaId, oldStatus, newStatus, reason);
  } catch (error) {
    console.warn('⚠️ Barraca status change tracking failed:', error);
  }
};

export const trackBarracaManualStatus = (barracaId: string, status: string, updatedBy: string) => {
  try {
    return analytics?.trackBarracaManualStatus?.(barracaId, status, updatedBy);
  } catch (error) {
    console.warn('⚠️ Barraca manual status tracking failed:', error);
  }
};

export const trackBarracaSpecialOverride = (barracaId: string, override: boolean, expiresAt?: Date) => {
  try {
    return analytics?.trackBarracaSpecialOverride?.(barracaId, override, expiresAt);
  } catch (error) {
    console.warn('⚠️ Barraca special override tracking failed:', error);
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

export const trackWeatherOverride = (active: boolean, expiresAt?: Date) => {
  try {
    return analytics?.trackWeatherOverride?.(active, expiresAt);
  } catch (error) {
    console.warn('⚠️ Weather override tracking failed:', error);
  }
};

export const trackWeatherDependentBarracas = (affectedCount: number) => {
  try {
    return analytics?.trackWeatherDependentBarracas?.(affectedCount);
  } catch (error) {
    console.warn('⚠️ Weather dependent barracas tracking failed:', error);
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

export const trackVisitorSession = (sessionId: string, isNewVisitor: boolean) => {
  try {
    return analytics?.trackVisitorSession?.(sessionId, isNewVisitor);
  } catch (error) {
    console.warn('⚠️ Visitor session tracking failed:', error);
  }
};

export const trackUniqueVisitor = (visitorId: string, totalCount: number) => {
  try {
    return analytics?.trackUniqueVisitor?.(visitorId, totalCount);
  } catch (error) {
    console.warn('⚠️ Unique visitor tracking failed:', error);
  }
};

export const trackAdminLogin = (success: boolean, adminType?: 'regular' | 'special') => {
  try {
    return analytics?.trackAdminLogin?.(success, adminType);
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

export const trackAdminBarracaManagement = (action: string, barracaId: string, details?: string) => {
  try {
    return analytics?.trackAdminBarracaManagement?.(action, barracaId, details);
  } catch (error) {
    console.warn('⚠️ Admin barraca management tracking failed:', error);
  }
};

export const trackAdminWeatherOverride = (active: boolean, reason?: string) => {
  try {
    return analytics?.trackAdminWeatherOverride?.(active, reason);
  } catch (error) {
    console.warn('⚠️ Admin weather override tracking failed:', error);
  }
};

export const trackAdminManualStatus = (barracaId: string, status: string) => {
  try {
    return analytics?.trackAdminManualStatus?.(barracaId, status);
  } catch (error) {
    console.warn('⚠️ Admin manual status tracking failed:', error);
  }
};

export const trackAdminSpecialOverride = (barracaId: string, override: boolean, expiresAt?: Date) => {
  try {
    return analytics?.trackAdminSpecialOverride?.(barracaId, override, expiresAt);
  } catch (error) {
    console.warn('⚠️ Admin special override tracking failed:', error);
  }
};

export const trackNotificationPermission = (granted: boolean) => {
  try {
    return analytics?.trackNotificationPermission?.(granted);
  } catch (error) {
    console.warn('⚠️ Notification permission tracking failed:', error);
  }
};

export const trackNotificationTokenSaved = (success: boolean) => {
  try {
    return analytics?.trackNotificationTokenSaved?.(success);
  } catch (error) {
    console.warn('⚠️ Notification token saved tracking failed:', error);
  }
};

export const trackNotificationReceived = (title: string) => {
  try {
    return analytics?.trackNotificationReceived?.(title);
  } catch (error) {
    console.warn('⚠️ Notification received tracking failed:', error);
  }
};

export const trackNotificationClicked = (title: string) => {
  try {
    return analytics?.trackNotificationClicked?.(title);
  } catch (error) {
    console.warn('⚠️ Notification clicked tracking failed:', error);
  }
};

export const trackWeekendHoursView = (barracaId: string, day: string) => {
  try {
    return analytics?.trackWeekendHoursView?.(barracaId, day);
  } catch (error) {
    console.warn('⚠️ Weekend hours view tracking failed:', error);
  }
};

export const trackWeekendHoursEnabled = (barracaId: string, enabled: boolean) => {
  try {
    return analytics?.trackWeekendHoursEnabled?.(barracaId, enabled);
  } catch (error) {
    console.warn('⚠️ Weekend hours enabled tracking failed:', error);
  }
};

export const trackPartneredBarracaInteraction = (barracaId: string, action: string) => {
  try {
    return analytics?.trackPartneredBarracaInteraction?.(barracaId, action);
  } catch (error) {
    console.warn('⚠️ Partnered barraca interaction tracking failed:', error);
  }
};

export const trackNonPartneredBarracaInteraction = (barracaId: string, action: string) => {
  try {
    return analytics?.trackNonPartneredBarracaInteraction?.(barracaId, action);
  } catch (error) {
    console.warn('⚠️ Non-partnered barraca interaction tracking failed:', error);
  }
};

export const trackExternalApiCall = (endpoint: string, success: boolean, responseTime?: number) => {
  try {
    return analytics?.trackExternalApiCall?.(endpoint, success, responseTime);
  } catch (error) {
    console.warn('⚠️ External API call tracking failed:', error);
  }
};

export const trackExternalStatusUpdate = (barracaId: string, success: boolean) => {
  try {
    return analytics?.trackExternalStatusUpdate?.(barracaId, success);
  } catch (error) {
    console.warn('⚠️ External status update tracking failed:', error);
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

export const trackFirestoreConnection = (success: boolean) => {
  try {
    return analytics?.trackFirestoreConnection?.(success);
  } catch (error) {
    console.warn('⚠️ Firestore connection tracking failed:', error);
  }
};

export const trackFirestoreSync = (collection: string, success: boolean, recordCount?: number) => {
  try {
    return analytics?.trackFirestoreSync?.(collection, success, recordCount);
  } catch (error) {
    console.warn('⚠️ Firestore sync tracking failed:', error);
  }
};

export const trackSupabaseQuery = (table: string, operation: string, success: boolean) => {
  try {
    return analytics?.trackSupabaseQuery?.(table, operation, success);
  } catch (error) {
    console.warn('⚠️ Supabase query tracking failed:', error);
  }
};

export const trackRealtimeSubscription = (channel: string, success: boolean) => {
  try {
    return analytics?.trackRealtimeSubscription?.(channel, success);
  } catch (error) {
    console.warn('⚠️ Realtime subscription tracking failed:', error);
  }
};

export const trackFeatureUsage = (feature: string, action: string, details?: string) => {
  try {
    return analytics?.trackFeatureUsage?.(feature, action, details);
  } catch (error) {
    console.warn('⚠️ Feature usage tracking failed:', error);
  }
};

export const trackBusinessMetric = (metric: string, value: number, unit?: string) => {
  try {
    return analytics?.trackBusinessMetric?.(metric, value, unit);
  } catch (error) {
    console.warn('⚠️ Business metric tracking failed:', error);
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