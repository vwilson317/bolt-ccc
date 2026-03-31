import posthog from 'posthog-js';

// PostHog Analytics service
class PostHogAnalyticsService {
  private isInitialized = false;
  private apiKey: string;
  private apiHost: string;

  constructor() {
    // Safely get the PostHog configuration
    try {
      this.apiKey = import.meta.env.VITE_POSTHOG_API_KEY || '';
      this.apiHost = import.meta.env.VITE_POSTHOG_API_HOST || 'https://app.posthog.com';
    } catch (error) {
      console.warn('⚠️ Could not access PostHog environment variables:', error);
      this.apiKey = '';
      this.apiHost = 'https://app.posthog.com';
    }
  }

  // Initialize PostHog
  init() {
    if (!this.apiKey) {
      console.warn('⚠️ PostHog API Key not found. Analytics will be disabled.');
      console.warn('💡 Set VITE_POSTHOG_API_KEY environment variable to enable analytics.');
      return;
    }

    if (this.isInitialized) {
      console.warn('⚠️ PostHog already initialized.');
      return;
    }

    try {
      posthog.init(this.apiKey, {
        api_host: this.apiHost,
        loaded: (posthog) => {
          if (posthog) {
            console.log('✅ PostHog initialized successfully');
          }
        },
        capture_pageview: false, // We'll handle page views manually
        capture_pageleave: true,
        autocapture: true,
        disable_session_recording: false,
        enable_recording_console_log: false,
        enable_recording_network_payloads: false,
        respect_dnt: true,
        persistence: 'localStorage',
        cross_subdomain_cookie: false,
        secure_cookie: true,
        property_blacklist: ['$initial_referrer', '$initial_referring_domain'],
        sanitize_properties: (properties) => {
          // Remove sensitive data
          delete properties.$current_url;
          delete properties.$pathname;
          return properties;
        }
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize PostHog:', error);
    }
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.isInitialized) return;

    try {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        $pathname: path,
        $title: title || document.title,
        $referrer: document.referrer
      });
      console.log(`📊 Page view tracked: ${path}`);
    } catch (error) {
      console.error('❌ Failed to track page view:', error);
    }
  }

  // Track custom events
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;

    try {
      posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent
      });
      console.log(`📊 Event tracked: ${eventName}`, properties);
    } catch (error) {
      console.error('❌ Failed to track event:', error);
    }
  }

  // Track barraca interactions
  trackBarracaView(barracaId: string, barracaName: string, partnered: boolean = false) {
    this.trackEvent('barraca_viewed', {
      barraca_id: barracaId,
      barraca_name: barracaName,
      partnered: partnered,
      category: 'Barraca'
    });
  }

  trackBarracaFilter(filterType: string, filterValue: string) {
    this.trackEvent('barraca_filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
      category: 'Barraca'
    });
  }

  trackBarracaSearch(searchTerm: string) {
    this.trackEvent('barraca_search', {
      search_term: searchTerm,
      category: 'Barraca'
    });
  }

  trackBarracaStatusChange(barracaId: string, oldStatus: string, newStatus: string, reason: string) {
    this.trackEvent('barraca_status_changed', {
      barraca_id: barracaId,
      old_status: oldStatus,
      new_status: newStatus,
      reason: reason,
      category: 'Barraca'
    });
  }

  // Track weather interactions
  trackWeatherView(location: string) {
    this.trackEvent('weather_viewed', {
      location: location,
      category: 'Weather'
    });
  }

  trackWeatherRefresh(location: string) {
    this.trackEvent('weather_refreshed', {
      location: location,
      category: 'Weather'
    });
  }

  trackWeatherOverride(active: boolean, expiresAt?: Date) {
    this.trackEvent('weather_override_toggled', {
      active: active,
      expires_at: expiresAt?.toISOString(),
      category: 'Weather'
    });
  }

  // Track story interactions
  trackStoryView(storyId: string, storyTitle: string) {
    this.trackEvent('story_viewed', {
      story_id: storyId,
      story_title: storyTitle,
      category: 'Story'
    });
  }

  trackStoryShare(storyId: string, storyTitle: string, platform: string) {
    this.trackEvent('story_shared', {
      story_id: storyId,
      story_title: storyTitle,
      platform: platform,
      category: 'Story'
    });
  }

  // Track user engagement
  trackEmailSubscription(email: string, preferences?: any) {
    this.trackEvent('email_subscription', {
      email: email,
      preferences: preferences,
      category: 'User'
    });
  }

  trackLanguageChange(fromLang: string, toLang: string) {
    this.trackEvent('language_changed', {
      from_language: fromLang,
      to_language: toLang,
      category: 'User'
    });
  }

  // Track admin actions
  trackAdminLogin(success: boolean, adminType: 'regular' | 'special' = 'regular') {
    this.trackEvent('admin_login', {
      success: success,
      admin_type: adminType,
      category: 'Admin'
    });
  }

  trackAdminAction(action: string, details?: string) {
    this.trackEvent('admin_action', {
      action: action,
      details: details,
      category: 'Admin'
    });
  }

  // Track notification interactions
  trackNotificationPermission(granted: boolean) {
    this.trackEvent('notification_permission', {
      granted: granted,
      category: 'Notification'
    });
  }

  trackNotificationTokenSaved(success: boolean) {
    this.trackEvent('notification_token_saved', {
      success: success,
      category: 'Notification'
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number) {
    this.trackEvent('performance_metric', {
      metric: metric,
      value: value,
      category: 'Performance'
    });
  }

  // Track errors
  trackError(error: string, context?: string) {
    this.trackEvent('error_occurred', {
      error: error,
      context: context,
      category: 'Error'
    });
  }

  // Track CTA clicks
  trackCTAClick(ctaType: string, ctaText: string, page: string) {
    this.trackEvent('cta_clicked', {
      cta_type: ctaType,
      cta_text: ctaText,
      page: page,
      category: 'CTA'
    });
  }

  // Track photo gallery interactions
  trackPhotoGalleryView(galleryId: string, galleryTitle: string, photoCount: number) {
    this.trackEvent('photo_gallery_viewed', {
      gallery_id: galleryId,
      gallery_title: galleryTitle,
      photo_count: photoCount,
      category: 'Photo Gallery'
    });
  }

  trackPhotoView(photoId: string, photoTitle: string, galleryId: string, viewMode: 'grid' | 'lightbox' = 'grid') {
    this.trackEvent('photo_viewed', {
      photo_id: photoId,
      photo_title: photoTitle,
      gallery_id: galleryId,
      view_mode: viewMode,
      category: 'Photo Gallery'
    });
  }

  trackPhotoLightboxOpen(photoId: string, photoTitle: string, galleryId: string) {
    this.trackEvent('photo_lightbox_opened', {
      photo_id: photoId,
      photo_title: photoTitle,
      gallery_id: galleryId,
      category: 'Photo Gallery'
    });
  }

  trackPhotoLightboxClose(photoId: string, photoTitle: string, galleryId: string) {
    this.trackEvent('photo_lightbox_closed', {
      photo_id: photoId,
      photo_title: photoTitle,
      gallery_id: galleryId,
      category: 'Photo Gallery'
    });
  }

  trackPhotoNavigation(direction: 'next' | 'previous', photoId: string, galleryId: string) {
    this.trackEvent('photo_navigation', {
      direction: direction,
      photo_id: photoId,
      gallery_id: galleryId,
      category: 'Photo Gallery'
    });
  }

  trackPhotoDownload(photoId: string, photoTitle: string, galleryId: string) {
    this.trackEvent('photo_downloaded', {
      photo_id: photoId,
      photo_title: photoTitle,
      gallery_id: galleryId,
      category: 'Photo Gallery'
    });
  }

  trackPhotoShare(photoId: string, photoTitle: string, galleryId: string, method: 'native' | 'clipboard') {
    this.trackEvent('photo_shared', {
      photo_id: photoId,
      photo_title: photoTitle,
      gallery_id: galleryId,
      share_method: method,
      category: 'Photo Gallery'
    });
  }

  trackPhotoArchiveClick(archiveUrl: string, galleryId: string) {
    this.trackEvent('photo_archive_clicked', {
      archive_url: archiveUrl,
      gallery_id: galleryId,
      category: 'Photo Gallery'
    });
  }

  trackPhotoLoadError(photoUrl: string, galleryId: string) {
    this.trackEvent('photo_load_error', {
      photo_url: photoUrl,
      gallery_id: galleryId,
      category: 'Photo Gallery'
    });
  }

  trackPhotoLoadSuccess(photoUrl: string, galleryId: string) {
    this.trackEvent('photo_load_success', {
      photo_url: photoUrl,
      gallery_id: galleryId,
      category: 'Photo Gallery'
    });
  }

  trackPhotosListingView(galleryCount: number) {
    this.trackEvent('photos_listing_viewed', {
      gallery_count: galleryCount,
      category: 'Photo Gallery'
    });
  }

  trackPhotoGalleryCardClick(galleryId: string, galleryTitle: string, photoCount: number) {
    this.trackEvent('photo_gallery_card_clicked', {
      gallery_id: galleryId,
      gallery_title: galleryTitle,
      photo_count: photoCount,
      category: 'Photo Gallery'
    });
  }

  // Track barraca registration interactions
  trackBarracaRegistrationView() {
    this.trackEvent('barraca_registration_viewed', {
      category: 'Barraca Registration'
    });
  }

  // Track hosting guidelines interactions
  trackHostingGuidelinesView() {
    this.trackEvent('hosting_guidelines_viewed', {
      page_path: '/hosting-guidelines',
      category: 'Hosting'
    });
  }

  trackHostingGuidelinesSectionRead(sectionNumber: number, sectionTitle: string) {
    this.trackEvent('hosting_guidelines_section_read', {
      section_number: sectionNumber,
      section_title: sectionTitle,
      page_path: '/hosting-guidelines',
      category: 'Hosting'
    });
  }

  trackHostingBarracaPartnerClick(handle: string, area: string) {
    this.trackEvent('hosting_barraca_partner_clicked', {
      instagram_handle: handle,
      beach_area: area,
      page_path: '/hosting-guidelines',
      category: 'Hosting'
    });
  }

  trackBarracaRegistrationSubmit(success: boolean, formData?: any) {
    const amenitiesCount = formData?.amenities?.length || 0;
    const partnershipsCount = [
      formData?.qrCodes,
      formData?.repeatDiscounts,
      formData?.hotelPartnerships,
      formData?.contentCreation,
      formData?.onlineOrders
    ].filter(Boolean).length;
    
    this.trackEvent('barraca_registration_submitted', {
      success: success,
      amenities_count: amenitiesCount,
      partnerships_count: partnershipsCount,
      category: 'Barraca Registration'
    });
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.isInitialized) return;

    try {
      posthog.people.set(properties);
      console.log('📊 User properties set:', properties);
    } catch (error) {
      console.error('❌ Failed to set user properties:', error);
    }
  }

  // Identify user
  identify(userId: string, properties?: Record<string, any>) {
    if (!this.isInitialized) return;

    try {
      posthog.identify(userId, properties);
      console.log('📊 User identified:', userId);
    } catch (error) {
      console.error('❌ Failed to identify user:', error);
    }
  }

  // Reset user
  reset() {
    if (!this.isInitialized) return;

    try {
      posthog.reset();
      console.log('📊 User reset');
    } catch (error) {
      console.error('❌ Failed to reset user:', error);
    }
  }

  // Get analytics status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      apiKey: this.apiKey ? 'Configured' : 'Not Configured',
      apiHost: this.apiHost,
      environment: import.meta.env.VITE_APP_ENV || 'development'
    };
  }
}

// Create singleton instance
let posthogAnalyticsInstance: PostHogAnalyticsService;

try {
  posthogAnalyticsInstance = new PostHogAnalyticsService();
} catch (error) {
  console.error('❌ Failed to create PostHog analytics instance:', error);
  posthogAnalyticsInstance = new PostHogAnalyticsService();
}

export const posthogAnalytics = posthogAnalyticsInstance;

// Export individual tracking functions for convenience
export const initPostHogAnalytics = () => {
  try {
    return posthogAnalytics?.init?.();
  } catch (error) {
    console.warn('⚠️ PostHog analytics initialization failed:', error);
  }
};

export const trackPageView = (path: string, title?: string) => {
  try {
    return posthogAnalytics?.trackPageView?.(path, title);
  } catch (error) {
    console.warn('⚠️ Page view tracking failed:', error);
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    return posthogAnalytics?.trackEvent?.(eventName, properties);
  } catch (error) {
    console.warn('⚠️ Event tracking failed:', error);
  }
};

// Export all the specific tracking functions
export const trackBarracaView = (barracaId: string, barracaName: string, partnered?: boolean) => {
  try {
    return posthogAnalytics?.trackBarracaView?.(barracaId, barracaName, partnered);
  } catch (error) {
    console.warn('⚠️ Barraca view tracking failed:', error);
  }
};

export const trackBarracaFilter = (filterType: string, filterValue: string) => {
  try {
    return posthogAnalytics?.trackBarracaFilter?.(filterType, filterValue);
  } catch (error) {
    console.warn('⚠️ Barraca filter tracking failed:', error);
  }
};

export const trackBarracaSearch = (searchTerm: string) => {
  try {
    return posthogAnalytics?.trackBarracaSearch?.(searchTerm);
  } catch (error) {
    console.warn('⚠️ Barraca search tracking failed:', error);
  }
};

export const trackWeatherView = (location: string) => {
  try {
    return posthogAnalytics?.trackWeatherView?.(location);
  } catch (error) {
    console.warn('⚠️ Weather view tracking failed:', error);
  }
};

export const trackStoryView = (storyId: string, storyTitle: string) => {
  try {
    return posthogAnalytics?.trackStoryView?.(storyId, storyTitle);
  } catch (error) {
    console.warn('⚠️ Story view tracking failed:', error);
  }
};

export const trackEmailSubscription = (email: string, preferences?: any) => {
  try {
    return posthogAnalytics?.trackEmailSubscription?.(email, preferences);
  } catch (error) {
    console.warn('⚠️ Email subscription tracking failed:', error);
  }
};

export const trackAdminLogin = (success: boolean, adminType?: 'regular' | 'special') => {
  try {
    return posthogAnalytics?.trackAdminLogin?.(success, adminType);
  } catch (error) {
    console.warn('⚠️ Admin login tracking failed:', error);
  }
};

export const trackCTAClick = (ctaType: string, ctaText: string, page: string) => {
  try {
    return posthogAnalytics?.trackCTAClick?.(ctaType, ctaText, page);
  } catch (error) {
    console.warn('⚠️ CTA click tracking failed:', error);
  }
};

export const trackPhotoGalleryView = (galleryId: string, galleryTitle: string, photoCount: number) => {
  try {
    return posthogAnalytics?.trackPhotoGalleryView?.(galleryId, galleryTitle, photoCount);
  } catch (error) {
    console.warn('⚠️ Photo gallery view tracking failed:', error);
  }
};

export const trackPhotoView = (photoId: string, photoTitle: string, galleryId: string, viewMode?: 'grid' | 'lightbox') => {
  try {
    return posthogAnalytics?.trackPhotoView?.(photoId, photoTitle, galleryId, viewMode);
  } catch (error) {
    console.warn('⚠️ Photo view tracking failed:', error);
  }
};

export const trackPhotoLightboxOpen = (photoId: string, photoTitle: string, galleryId: string) => {
  try {
    return posthogAnalytics?.trackPhotoLightboxOpen?.(photoId, photoTitle, galleryId);
  } catch (error) {
    console.warn('⚠️ Photo lightbox open tracking failed:', error);
  }
};

export const trackPhotoLightboxClose = (photoId: string, photoTitle: string, galleryId: string) => {
  try {
    return posthogAnalytics?.trackPhotoLightboxClose?.(photoId, photoTitle, galleryId);
  } catch (error) {
    console.warn('⚠️ Photo lightbox close tracking failed:', error);
  }
};

export const trackPhotoNavigation = (direction: 'next' | 'previous', photoId: string, galleryId: string) => {
  try {
    return posthogAnalytics?.trackPhotoNavigation?.(direction, photoId, galleryId);
  } catch (error) {
    console.warn('⚠️ Photo navigation tracking failed:', error);
  }
};

export const trackPhotoDownload = (photoId: string, photoTitle: string, galleryId: string) => {
  try {
    return posthogAnalytics?.trackPhotoDownload?.(photoId, photoTitle, galleryId);
  } catch (error) {
    console.warn('⚠️ Photo download tracking failed:', error);
  }
};

export const trackPhotoShare = (photoId: string, photoTitle: string, galleryId: string, method: 'native' | 'clipboard') => {
  try {
    return posthogAnalytics?.trackPhotoShare?.(photoId, photoTitle, galleryId, method);
  } catch (error) {
    console.warn('⚠️ Photo share tracking failed:', error);
  }
};

export const trackPhotoArchiveClick = (archiveUrl: string, galleryId: string) => {
  try {
    return posthogAnalytics?.trackPhotoArchiveClick?.(archiveUrl, galleryId);
  } catch (error) {
    console.warn('⚠️ Photo archive click tracking failed:', error);
  }
};

export const trackPhotoLoadError = (photoUrl: string, galleryId: string) => {
  try {
    return posthogAnalytics?.trackPhotoLoadError?.(photoUrl, galleryId);
  } catch (error) {
    console.warn('⚠️ Photo load error tracking failed:', error);
  }
};

export const trackPhotoLoadSuccess = (photoUrl: string, galleryId: string) => {
  try {
    return posthogAnalytics?.trackPhotoLoadSuccess?.(photoUrl, galleryId);
  } catch (error) {
    console.warn('⚠️ Photo load success tracking failed:', error);
  }
};

export const trackPhotosListingView = (galleryCount: number) => {
  try {
    return posthogAnalytics?.trackPhotosListingView?.(galleryCount);
  } catch (error) {
    console.warn('⚠️ Photos listing view tracking failed:', error);
  }
};

export const trackPhotoGalleryCardClick = (galleryId: string, galleryTitle: string, photoCount: number) => {
  try {
    return posthogAnalytics?.trackPhotoGalleryCardClick?.(galleryId, galleryTitle, photoCount);
  } catch (error) {
    console.warn('⚠️ Photo gallery card click tracking failed:', error);
  }
};

export const trackHostingGuidelinesView = () => {
  try {
    return posthogAnalytics?.trackHostingGuidelinesView?.();
  } catch (error) {
    console.warn('⚠️ Hosting guidelines view tracking failed:', error);
  }
};

export const trackHostingGuidelinesSectionRead = (sectionNumber: number, sectionTitle: string) => {
  try {
    return posthogAnalytics?.trackHostingGuidelinesSectionRead?.(sectionNumber, sectionTitle);
  } catch (error) {
    console.warn('⚠️ Hosting guidelines section read tracking failed:', error);
  }
};

export const trackHostingBarracaPartnerClick = (handle: string, area: string) => {
  try {
    return posthogAnalytics?.trackHostingBarracaPartnerClick?.(handle, area);
  } catch (error) {
    console.warn('⚠️ Hosting barraca partner click tracking failed:', error);
  }
};

export const trackBarracaRegistrationView = () => {
  try {
    return posthogAnalytics?.trackBarracaRegistrationView?.();
  } catch (error) {
    console.warn('⚠️ Barraca registration view tracking failed:', error);
  }
};

export const trackBarracaRegistrationSubmit = (success: boolean, formData?: any) => {
  try {
    return posthogAnalytics?.trackBarracaRegistrationSubmit?.(success, formData);
  } catch (error) {
    console.warn('⚠️ Barraca registration submit tracking failed:', error);
  }
};

export const getPostHogAnalyticsStatus = () => {
  try {
    return posthogAnalytics?.getStatus?.() || { isInitialized: false, apiKey: 'Not Configured', apiHost: 'https://app.posthog.com', environment: 'unknown' };
  } catch (error) {
    console.warn('⚠️ PostHog analytics status check failed:', error);
    return { isInitialized: false, apiKey: 'Error', apiHost: 'https://app.posthog.com', environment: 'unknown' };
  }
};
