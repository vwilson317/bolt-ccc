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
}