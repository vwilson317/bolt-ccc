import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initPostHogAnalytics,
  trackPageView,
  trackEvent,
  trackBarracaView,
  trackBarracaFilter,
  trackBarracaSearch,
  trackWeatherView,
  trackStoryView,
  trackEmailSubscription,
  trackAdminLogin,
  trackCTAClick,
  trackPhotoGalleryView,
  trackPhotoView,
  trackBarracaRegistrationView,
  trackBarracaRegistrationSubmit,
  getPostHogAnalyticsStatus
} from '../services/posthogAnalyticsService';

export const usePostHogAnalytics = () => {
  const location = useLocation();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHogAnalytics();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  // Wrapper functions for tracking
  const trackBarracaViewEvent = useCallback((barracaId: string, barracaName: string, partnered?: boolean) => {
    trackBarracaView(barracaId, barracaName, partnered);
  }, []);

  const trackBarracaFilterEvent = useCallback((filterType: string, filterValue: string) => {
    trackBarracaFilter(filterType, filterValue);
  }, []);

  const trackBarracaSearchEvent = useCallback((searchTerm: string) => {
    trackBarracaSearch(searchTerm);
  }, []);

  const trackWeatherViewEvent = useCallback((location: string) => {
    trackWeatherView(location);
  }, []);

  const trackStoryViewEvent = useCallback((storyId: string, storyTitle: string) => {
    trackStoryView(storyId, storyTitle);
  }, []);

  const trackEmailSubscriptionEvent = useCallback((email: string, preferences?: any) => {
    trackEmailSubscription(email, preferences);
  }, []);

  const trackAdminLoginEvent = useCallback((success: boolean, adminType?: 'regular' | 'special') => {
    trackAdminLogin(success, adminType);
  }, []);

  const trackCTAClickEvent = useCallback((ctaType: string, ctaText: string, page: string) => {
    trackCTAClick(ctaType, ctaText, page);
  }, []);

  const trackPhotoGalleryViewEvent = useCallback((galleryId: string, galleryTitle: string, photoCount: number) => {
    trackPhotoGalleryView(galleryId, galleryTitle, photoCount);
  }, []);

  const trackPhotoViewEvent = useCallback((photoId: string, photoTitle: string, galleryId: string, viewMode?: 'grid' | 'lightbox') => {
    trackPhotoView(photoId, photoTitle, galleryId, viewMode);
  }, []);

  const trackBarracaRegistrationViewEvent = useCallback(() => {
    trackBarracaRegistrationView();
  }, []);

  const trackBarracaRegistrationSubmitEvent = useCallback((success: boolean, formData?: any) => {
    trackBarracaRegistrationSubmit(success, formData);
  }, []);

  const trackCustomEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    trackEvent(eventName, properties);
  }, []);

  const getStatus = useCallback(() => {
    return getPostHogAnalyticsStatus();
  }, []);

  return {
    // Basic tracking
    trackEvent: trackCustomEvent,
    trackPageView,
    
    // Barraca tracking
    trackBarracaView: trackBarracaViewEvent,
    trackBarracaFilter: trackBarracaFilterEvent,
    trackBarracaSearch: trackBarracaSearchEvent,
    
    // Weather tracking
    trackWeatherView: trackWeatherViewEvent,
    
    // Story tracking
    trackStoryView: trackStoryViewEvent,
    
    // User tracking
    trackEmailSubscription: trackEmailSubscriptionEvent,
    
    // Admin tracking
    trackAdminLogin: trackAdminLoginEvent,
    
    // CTA tracking
    trackCTAClick: trackCTAClickEvent,
    
    // Photo gallery tracking
    trackPhotoGalleryView: trackPhotoGalleryViewEvent,
    trackPhotoView: trackPhotoViewEvent,
    
    // Barraca registration tracking
    trackBarracaRegistrationView: trackBarracaRegistrationViewEvent,
    trackBarracaRegistrationSubmit: trackBarracaRegistrationSubmitEvent,
    
    // Status
    getStatus
  };
};
