// Import translation types
export * from './translation';
import type { SupportedLanguage, TranslatableContentType, TranslatableFieldType } from './translation';

export type BarracaPhotos = {
  horizontal: string[];
  vertical: string[];
};

export interface EventPhoto {
  id: string;
  url: string;
  isHighlight: boolean; // Whether this photo should be shown in highlights
  caption?: string;
  timestamp: Date;
}

export interface BarracaEvent {
  id: string;
  title: string;
  date: Date;
  description: string;
  photos: EventPhoto[]; // Raw photos including highlights
  highlightPhotos: EventPhoto[]; // Subset of highlight photos for quick access
  isActive: boolean; // Whether the event should be displayed
  createdAt: Date;
}

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
  photos: BarracaPhotos;
  menuPreview: string[];
  contact: {
    phone?: string;
    email?: string;
  };
  amenities: string[];
  weatherDependent: boolean;
  partnered: boolean; // Partnered barracas get special treatment
  weekendHoursEnabled: boolean; // New weekend hours feature
  weekendHours?: {
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  manualStatus?: 'open' | 'closed' | 'undefined'; // Manual status for non-partnered barracas
  specialAdminOverride: boolean; // Special admin override
  specialAdminOverrideExpires: Date | null; // When override expires
  createdAt: Date;
  updatedAt: Date;
  ctaButtons?: CTAButtonConfig[]; // New configurable CTA buttons
  previousEvents?: BarracaEvent[]; // Previous events held at this barraca
  // Translation support
  translations?: Record<SupportedLanguage, Partial<TranslatableBarracaFields>>;
}

// Translatable fields for Barraca
export interface TranslatableBarracaFields {
  name: string;
  description: string;
  menuPreview: string[];
  amenities: string[];
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
  location: string; // Keep for backward compatibility
  locations: string[]; // New field for multiple location support
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
  // Translation support
  translations?: Record<SupportedLanguage, Partial<TranslatableStoryFields>>;
}

export interface TranslatableStoryFields {
  barracaName: string;
  media: Array<{
    id: string;
    caption?: string;
  }>;
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
  enableTranslations: boolean; // New feature flag for translation system
}

export interface CTAButtonConfig {
  id: string;
  text: string;
  action: CTAButtonAction;
  style: 'primary' | 'secondary' | 'outline' | 'ghost';
  position: number; // Order/priority (lower numbers appear first)
  visibilityConditions: CTAVisibilityConditions;
  icon?: string; // Lucide icon name
  enabled: boolean;
  // Translation support
  translations?: Record<SupportedLanguage, Partial<TranslatableCTAButtonFields>>;
}

export interface TranslatableCTAButtonFields {
  text: string;
}

export interface CTAButtonAction {
  type: 'url' | 'phone' | 'email' | 'whatsapp' | 'ig' | 'reservation' | 'details' | 'custom';
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

export interface DefaultCTAButtons {
  reserve: CTAButtonConfig;
  details?: CTAButtonConfig;
  contact: CTAButtonConfig;
  menu: CTAButtonConfig;
}

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

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // in reais
  originalPrice?: number; // for sale items
  sku: string;
  brand: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  specifications: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  // Translation support
  translations?: Record<SupportedLanguage, Partial<TranslatableProductFields>>;
}

export interface TranslatableProductFields {
  name: string;
  description: string;
  tags: string[];
  specifications: Record<string, string>;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  // Translation support
  translations?: Record<SupportedLanguage, Partial<TranslatableProductCategoryFields>>;
}

export interface TranslatableProductCategoryFields {
  name: string;
  description: string;
}

export interface CustomerReview {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  productId?: string; // if review is for specific product
  barracaId: string;
  helpfulVotes: number;
  createdAt: Date;
  response?: {
    content: string;
    respondedAt: Date;
    respondedBy: string;
  };
  // Translation support
  translations?: Record<SupportedLanguage, Partial<TranslatableCustomerReviewFields>>;
}

export interface TranslatableCustomerReviewFields {
  title: string;
  content: string;
  response?: {
    content: string;
  };
}

export type TranslatableContent = Barraca | Product | Story | ProductCategory | CustomerReview;

export type TranslatableFields = 
  | TranslatableBarracaFields
  | TranslatableProductFields
  | TranslatableStoryFields
  | TranslatableProductCategoryFields
  | TranslatableCustomerReviewFields
  | TranslatableCTAButtonFields;

export interface TranslationContext {
  currentLanguage: SupportedLanguage;
  availableLanguages: SupportedLanguage[];
  isLoading: boolean;
  error: string | null;
  changeLanguage: (language: SupportedLanguage) => void;
  translateContent: (
    contentType: TranslatableContentType,
    contentId: string,
    fieldName: TranslatableFieldType,
    fallbackValue?: string
  ) => Promise<string>;
  getTranslatedField: <T extends TranslatableContent>(
    content: T,
    fieldName: keyof TranslatableFields,
    fallbackValue?: string
  ) => Promise<string>;
}

export interface AppContextType {
  barracas: Barraca[];
  filteredBarracas: Barraca[];
  weather: WeatherData | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  isAdmin: boolean;
  isSpecialAdmin: boolean;
  emailSubscriptions: EmailSubscription[];
  currentLanguage?: string;
  weatherOverride: boolean;
  overrideExpiry: Date | null;
  selectedBarraca: Barraca | null;
  openBarracaModal: (barraca: Barraca) => void;
  closeBarracaModal: () => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  addBarraca: (barraca: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Barraca>;
  updateBarraca: (id: string, updates: Partial<Barraca>) => Promise<Barraca>;
  setWeatherOverride: (override: boolean) => Promise<void>;
  deleteBarraca: (id: string) => Promise<void>;
  subscribeEmail: (email: string) => Promise<boolean>;
  checkEmailSubscription: (email: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  refreshWeather: () => Promise<void>;
  refreshBarracas: () => Promise<void>;
  firestoreConnected: boolean;
  barracaStatuses: Map<string, any>; // Using any for now to avoid import issues
}