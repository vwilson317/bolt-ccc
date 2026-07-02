import { trackCTAClick } from '../services/posthogAnalyticsService';

export const BRAND_NAME = 'Alva';
export const PARENT_BRAND_NAME = 'Carioca Coastal Club';

// Reusing the existing Carioca Coastal Club community WhatsApp group and
// Instagram account as placeholder contact channels until Alva has its own.
export const WHATSAPP_URL = 'https://chat.whatsapp.com/FVLJK8eqKzUKY7oUfnymD5?mode=gi_t';
export const INSTAGRAM_URL = 'https://instagram.com/Carioca_Coastal_Club';
export const INSTAGRAM_HANDLE = '@Carioca_Coastal_Club';

/**
 * Instagram's in-app browser blocks window.open() silently (pages fail to
 * load with no error), so any external link must navigate via
 * window.location.href instead. See CLAUDE.md → Instagram WebView Constraints.
 */
export const openExternalLink = (url: string): void => {
  const isInstagramBrowser = /Instagram/.test(navigator.userAgent);
  if (isInstagramBrowser) {
    window.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/** Tracks every outbound CTA click in PostHog before navigating. */
export const handleCTAClick = (ctaType: string, ctaText: string, page: string, url: string): void => {
  trackCTAClick(ctaType, ctaText, page);
  openExternalLink(url);
};
