// Translation system types and interfaces

// Core translation types
export interface TranslationKey {
  id: string;
  keyName: string;
  context?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationValue {
  id: string;
  keyId: string;
  languageCode: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentTranslation {
  id: string;
  contentType: string;
  contentId: string;
  fieldName: string;
  translationKeyId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cache types
export interface TranslationCache {
  [key: string]: {
    [language: string]: {
      value: string;
      timestamp: number;
    };
  };
}

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'pt', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Language metadata
export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export const LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isRTL: false,
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    isRTL: false,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isRTL: false,
  },
};

// Content types that can be translated
export const TRANSLATABLE_CONTENT_TYPES = [
  'barraca',
  'product',
  'story',
  'category',
  'review',
  'announcement',
] as const;

export type TranslatableContentType = typeof TRANSLATABLE_CONTENT_TYPES[number];

// Field types that can be translated
export const TRANSLATABLE_FIELD_TYPES = [
  'name',
  'description',
  'title',
  'subtitle',
  'content',
  'menu_preview',
  'amenities',
  'specialties',
  'instructions',
  'notes',
] as const;

export type TranslatableFieldType = typeof TRANSLATABLE_FIELD_TYPES[number];

// Translation status
export type TranslationStatus = 'pending' | 'in_progress' | 'completed' | 'reviewed' | 'approved';

// Translation metadata
export interface TranslationMetadata {
  status: TranslationStatus;
  translator?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  qualityScore?: number;
  confidence?: number;
  isAutoTranslated: boolean;
  sourceLanguage?: string;
  notes?: string;
}

// Extended translation value with metadata
export interface TranslationValueWithMetadata extends TranslationValue {
  metadata?: TranslationMetadata;
}

// Translation request/response types
export interface TranslationRequest {
  keyName: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TranslationResponse {
  keyName: string;
  targetLanguage: string;
  translatedValue: string;
  confidence: number;
  isAutoTranslated: boolean;
  alternatives?: string[];
}

// Bulk translation operations
export interface BulkTranslationRequest {
  translations: TranslationRequest[];
  batchId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface BulkTranslationResponse {
  batchId: string;
  results: TranslationResponse[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    averageConfidence: number;
  };
}

// Translation statistics
export interface TranslationStats {
  totalKeys: number;
  totalValues: number;
  completionByLanguage: Record<SupportedLanguage, number>;
  missingTranslations: Array<{
    keyName: string;
    missingLanguages: SupportedLanguage[];
  }>;
  recentlyUpdated: Array<{
    keyName: string;
    language: SupportedLanguage;
    updatedAt: Date;
  }>;
}

// Translation search and filter types
export interface TranslationSearchFilters {
  context?: string;
  language?: SupportedLanguage;
  status?: TranslationStatus;
  isAutoTranslated?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  hasMissingTranslations?: boolean;
}

export interface TranslationSearchResult {
  key: TranslationKey;
  values: TranslationValueWithMetadata[];
  contentTranslations: ContentTranslation[];
  missingLanguages: SupportedLanguage[];
}

// Translation workflow types
export interface TranslationWorkflow {
  id: string;
  name: string;
  steps: TranslationWorkflowStep[];
  currentStep: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface TranslationWorkflowStep {
  id: string;
  name: string;
  type: 'translation' | 'review' | 'approval';
  assignee?: string;
  completedBy?: string;
  completedAt?: Date;
  isRequired: boolean;
  order: number;
}

// Translation quality types
export interface TranslationQualityMetrics {
  accuracy: number; // 0-100
  fluency: number; // 0-100
  consistency: number; // 0-100
  culturalAppropriateness: number; // 0-100
  overallScore: number; // 0-100
  feedback?: string;
}

// Translation export/import types
export interface TranslationExport {
  version: string;
  exportedAt: Date;
  languages: SupportedLanguage[];
  translations: Array<{
    keyName: string;
    context?: string;
    values: Record<SupportedLanguage, string>;
  }>;
}

export interface TranslationImport {
  version: string;
  importedAt: Date;
  languages: SupportedLanguage[];
  translations: Array<{
    keyName: string;
    context?: string;
    values: Record<SupportedLanguage, string>;
  }>;
  importOptions: {
    overwriteExisting: boolean;
    createMissingKeys: boolean;
    validateBeforeImport: boolean;
  };
}

// Utility types
export type TranslationKeyGenerator = (
  contentType: string,
  contentId: string,
  fieldName: string
) => string;

export type TranslationFallbackStrategy = (
  keyName: string,
  language: string,
  fallbackValue?: string
) => Promise<string>;

// Hook return types
export interface UseTranslatedContentReturn {
  t: (keyName: string, fallbackValue?: string) => Promise<string>;
  translateContent: (
    contentType: string,
    contentId: string,
    fieldName: string,
    fallbackValue?: string
  ) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface UseTranslationManagerReturn {
  createTranslation: (
    keyName: string,
    translations: Record<SupportedLanguage, string>,
    context?: string
  ) => Promise<boolean>;
  updateTranslation: (
    keyName: string,
    language: SupportedLanguage,
    value: string
  ) => Promise<boolean>;
  deleteTranslation: (keyName: string, language?: SupportedLanguage) => Promise<boolean>;
  getTranslationStats: () => Promise<TranslationStats>;
  searchTranslations: (filters: TranslationSearchFilters) => Promise<TranslationSearchResult[]>;
  exportTranslations: (languages: SupportedLanguage[]) => Promise<TranslationExport>;
  importTranslations: (importData: TranslationImport) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export interface UseTranslationCacheReturn {
  getCachedTranslation: (keyName: string, language: string) => string | null;
  setCachedTranslation: (keyName: string, language: string, value: string) => void;
  invalidateCache: (keyName?: string) => void;
  clearCache: () => void;
  getCacheStats: () => {
    totalKeys: number;
    totalEntries: number;
    memoryUsage: number;
  };
}

// Component prop types
export interface TranslatedTextProps {
  keyName: string;
  fallbackValue?: string;
  className?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

export interface TranslationEditorProps {
  keyName: string;
  context?: string;
  onSave?: (translations: Record<SupportedLanguage, string>) => void;
  onCancel?: () => void;
  initialTranslations?: Record<SupportedLanguage, string>;
  readOnly?: boolean;
}

export interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  showFlags?: boolean;
  showNativeNames?: boolean;
  className?: string;
  disabled?: boolean;
}

// Error types
export class TranslationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TranslationError';
  }
}

export const TRANSLATION_ERROR_CODES = {
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  VALUE_NOT_FOUND: 'VALUE_NOT_FOUND',
  INVALID_LANGUAGE: 'INVALID_LANGUAGE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type TranslationErrorCode = typeof TRANSLATION_ERROR_CODES[keyof typeof TRANSLATION_ERROR_CODES]; 