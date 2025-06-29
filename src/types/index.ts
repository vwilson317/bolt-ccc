export interface Barraca {
  id: string;
  name: string;
  barracaNumber?: string; // Added barraca number
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isOpen: boolean;
  typicalHours: string;
  description: string;
  images: string[];
  menuPreview: string[];
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  amenities: string[];
  weatherDependent: boolean;
  createdAt: Date;
  updatedAt: Date;
  ctaButtons?: CTAButtonConfig[]; // New configurable CTA buttons
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  description: string;
  icon: string;
  beachConditions: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SearchFilters {
  query: string;
  openNow: boolean;
  location: string;
  status: 'all' | 'open' | 'closed'; // Enhanced status filter
}

export interface EmailSubscription {
  email: string;
  subscribedAt: Date;
  preferences: {
    newBarracas: boolean;
    specialOffers: boolean;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'superuser' | 'admin';
  lastLogin: Date;
}

// Story Feature Types
export interface StoryMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  duration?: number; // in seconds, for videos
  caption?: string;
  timestamp: Date;
}

export interface Story {
  id: string;
  barracaId: string;
  barracaName: string;
  media: StoryMedia[];
  isViewed: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface StoryViewState {
  currentStoryIndex: number;
  currentMediaIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  viewedStories: Set<string>;
  viewedMedia: Set<string>;
}

export interface FeatureFlags {
  enableStoryBanner: boolean;
  enableChairReservation: boolean;
  enablePushNotifications: boolean;
  customCtaButtons: boolean; // New feature flag for configurable CTA buttons
}

// CTA Button Configuration Types
export interface CTAButtonConfig {
  id: string;
  text: string;
  action: CTAButtonAction;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  position: number; // Order/priority (lower numbers appear first)
  visibilityConditions: CTAVisibilityConditions;
  icon?: string; // Lucide icon name
  enabled: boolean;
}

export interface CTAButtonAction {
  type: 'url' | 'phone' | 'email' | 'whatsapp' | 'reservation' | 'details' | 'custom';
  value: string; // URL, phone number, email, etc.
  target?: '_blank' | '_self'; // For URL actions
  trackingEvent?: string; // Analytics tracking
}

export interface CTAVisibilityConditions {
  requiresOpen?: boolean; // Only show when barraca is open
  requiresClosed?: boolean; // Only show when barraca is closed
  timeRestrictions?: {
    startTime?: string; // HH:MM format
    endTime?: string; // HH:MM format
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  };
  memberOnly?: boolean; // Only show for logged-in members
  weatherDependent?: boolean; // Hide in bad weather
  customCondition?: string; // Custom JavaScript condition
}

// Default CTA Button Configurations
export interface DefaultCTAButtons {
  reserve: CTAButtonConfig;
  details: CTAButtonConfig;
  contact: CTAButtonConfig;
  menu: CTAButtonConfig;
}

// Unique Visitor Tracking Types
export interface VisitorData {
  uniqueVisitors: number;
  lastUpdated: number;
  visitorId: string;
}

export interface VisitorMetrics {
  totalUniqueVisitors: number;
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  lastUpdated: Date;
}