import toast from 'react-hot-toast';

/**
 * FLOW. community has no backend wiring yet — every button that would
 * normally trigger a real action (booking, joining WhatsApp, notifications,
 * etc.) surfaces a friendly toast instead of pretending to do something it
 * can't.
 */
export const flowComingSoon = (label: string) => () => toast(`${label} — coming soon`);

/** Juan is the FLOW. community host — event booking requests go straight to him on WhatsApp. */
export const FLOW_HOST_WHATSAPP = '5521989743770';

/** Invite link for the FLOW. community WhatsApp group ("Join WhatsApp" CTAs). */
export const FLOW_WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/ISMGlHBmvmjJQh9dgKrZaR?s=sh&p=i&mlu=2';

/**
 * Social share image (og:image / twitter:image) for FLOW. community pages —
 * shown as the preview photo when a /projects/flow link is shared in
 * WhatsApp, iMessage, etc. Same artwork as the FLOW favicon.
 */
export const FLOW_SHARE_IMAGE = '/flow/android-chrome-512x512.png';
export const FLOW_SHARE_IMAGE_SIZE = 512;

/**
 * Instagram's in-app browser blocks window.open() silently (pages fail to
 * load with no error), so WhatsApp deep links — and any link at all while
 * inside Instagram's WebView — must navigate via window.location.href
 * instead. See CLAUDE.md → Instagram WebView Constraints.
 */
export const openFlowExternalLink = (url: string): void => {
  const isInstagramBrowser = /Instagram/.test(navigator.userAgent);
  const isDeepLink = url.startsWith('https://wa.me/') || url.startsWith('https://chat.whatsapp.com/') || url.startsWith('whatsapp://');
  if (isInstagramBrowser || isDeepLink) {
    window.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/** Opens the FLOW. community WhatsApp group invite link. */
export const openFlowCommunityWhatsApp = (): void => openFlowExternalLink(FLOW_WHATSAPP_GROUP_URL);

export interface FlowBookingMessageDetails {
  title: string;
  category: string;
  dateLabel: string;
  timeLabel?: string;
  location?: string;
}

/** Builds a wa.me link pre-filled with the booking details and opens it. */
export const openFlowBookingWhatsApp = (details: FlowBookingMessageDetails): void => {
  const lines = [
    "Hi Juan! I'd like to book this on FLOW. community:",
    `📌 ${details.title}`,
    `🏷️ ${details.category}`,
    `🗓️ ${details.dateLabel}`,
  ];
  if (details.timeLabel) lines.push(`🕐 ${details.timeLabel}`);
  if (details.location) lines.push(`📍 ${details.location}`);

  const message = encodeURIComponent(lines.join('\n'));
  openFlowExternalLink(`https://wa.me/${FLOW_HOST_WHATSAPP}?text=${message}`);
};
