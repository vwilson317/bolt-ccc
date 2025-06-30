import { supabase } from '../lib/supabase';

// Types for translation service
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

export interface TranslationCache {
  [key: string]: {
    [language: string]: {
      value: string;
      timestamp: number;
    };
  };
}

// Cache for translations (in-memory cache)
const translationCache: TranslationCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'pt', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Translation key generation
export const generateTranslationKey = (
  contentType: string,
  contentId: string,
  fieldName: string
): string => {
  return `${contentType}_${contentId}_${fieldName}`;
};

// Cache management
const getCachedTranslation = (key: string, language: string): string | null => {
  const cached = translationCache[key]?.[language];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }
  return null;
};

const setCachedTranslation = (key: string, language: string, value: string): void => {
  if (!translationCache[key]) {
    translationCache[key] = {};
  }
  translationCache[key][language] = {
    value,
    timestamp: Date.now(),
  };
};

const clearCache = (): void => {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
};

// Translation key operations
export const createTranslationKey = async (
  keyName: string,
  context?: string
): Promise<TranslationKey | null> => {
  try {
    const { data, error } = await supabase
      .from('translation_keys')
      .insert({
        key_name: keyName,
        context,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating translation key:', error);
      return null;
    }

    return {
      id: data.id,
      keyName: data.key_name,
      context: data.context,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error creating translation key:', error);
    return null;
  }
};

export const getTranslationKey = async (keyName: string): Promise<TranslationKey | null> => {
  try {
    const { data, error } = await supabase
      .from('translation_keys')
      .select()
      .eq('key_name', keyName)
      .single();

    if (error) {
      console.error('Error fetching translation key:', error);
      return null;
    }

    return {
      id: data.id,
      keyName: data.key_name,
      context: data.context,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching translation key:', error);
    return null;
  }
};

export const getOrCreateTranslationKey = async (
  keyName: string,
  context?: string
): Promise<TranslationKey | null> => {
  let key = await getTranslationKey(keyName);
  if (!key) {
    key = await createTranslationKey(keyName, context);
  }
  return key;
};

// Translation value operations
export const createTranslationValue = async (
  keyId: string,
  languageCode: string,
  value: string
): Promise<TranslationValue | null> => {
  try {
    const { data, error } = await supabase
      .from('translation_values')
      .insert({
        key_id: keyId,
        language_code: languageCode,
        value,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating translation value:', error);
      return null;
    }

    // Clear cache for this key
    const key = await getTranslationKeyById(keyId);
    if (key) {
      delete translationCache[key.keyName]?.[languageCode];
    }

    return {
      id: data.id,
      keyId: data.key_id,
      languageCode: data.language_code,
      value: data.value,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error creating translation value:', error);
    return null;
  }
};

export const updateTranslationValue = async (
  keyId: string,
  languageCode: string,
  value: string
): Promise<TranslationValue | null> => {
  try {
    const { data, error } = await supabase
      .from('translation_values')
      .update({ value })
      .eq('key_id', keyId)
      .eq('language_code', languageCode)
      .select()
      .single();

    if (error) {
      console.error('Error updating translation value:', error);
      return null;
    }

    // Clear cache for this key
    const key = await getTranslationKeyById(keyId);
    if (key) {
      delete translationCache[key.keyName]?.[languageCode];
    }

    return {
      id: data.id,
      keyId: data.key_id,
      languageCode: data.language_code,
      value: data.value,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error updating translation value:', error);
    return null;
  }
};

export const getTranslationValue = async (
  keyId: string,
  languageCode: string
): Promise<TranslationValue | null> => {
  try {
    const { data, error } = await supabase
      .from('translation_values')
      .select()
      .eq('key_id', keyId)
      .eq('language_code', languageCode)
      .single();

    if (error) {
      console.error('Error fetching translation value:', error);
      return null;
    }

    return {
      id: data.id,
      keyId: data.key_id,
      languageCode: data.language_code,
      value: data.value,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching translation value:', error);
    return null;
  }
};

// Helper function to get translation key by ID
const getTranslationKeyById = async (keyId: string): Promise<TranslationKey | null> => {
  try {
    const { data, error } = await supabase
      .from('translation_keys')
      .select()
      .eq('id', keyId)
      .single();

    if (error) {
      console.error('Error fetching translation key by ID:', error);
      return null;
    }

    return {
      id: data.id,
      keyName: data.key_name,
      context: data.context,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching translation key by ID:', error);
    return null;
  }
};

// Main translation function with fallback chain
export const getTranslation = async (
  keyName: string,
  language: string,
  fallbackValue?: string
): Promise<string> => {
  // Check cache first
  const cachedValue = getCachedTranslation(keyName, language);
  if (cachedValue) {
    return cachedValue;
  }

  try {
    // Get translation key
    const key = await getTranslationKey(keyName);
    if (!key) {
      return fallbackValue || keyName;
    }

    // Try exact language match
    let translation = await getTranslationValue(key.id, language);
    
    // If not found, try language variant (e.g., pt-BR -> pt)
    if (!translation && language.includes('-')) {
      const baseLanguage = language.split('-')[0];
      translation = await getTranslationValue(key.id, baseLanguage);
    }
    
    // If still not found, try English fallback
    if (!translation && language !== 'en') {
      translation = await getTranslationValue(key.id, 'en');
    }

    const result = translation?.value || fallbackValue || keyName;
    
    // Cache the result
    setCachedTranslation(keyName, language, result);
    
    return result;
  } catch (error) {
    console.error('Error getting translation:', error);
    return fallbackValue || keyName;
  }
};

// Content translation mapping operations
export const createContentTranslation = async (
  contentType: string,
  contentId: string,
  fieldName: string,
  translationKeyId: string
): Promise<ContentTranslation | null> => {
  try {
    const { data, error } = await supabase
      .from('content_translations')
      .insert({
        content_type: contentType,
        content_id: contentId,
        field_name: fieldName,
        translation_key_id: translationKeyId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating content translation:', error);
      return null;
    }

    return {
      id: data.id,
      contentType: data.content_type,
      contentId: data.content_id,
      fieldName: data.field_name,
      translationKeyId: data.translation_key_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error creating content translation:', error);
    return null;
  }
};

export const getContentTranslation = async (
  contentType: string,
  contentId: string,
  fieldName: string
): Promise<ContentTranslation | null> => {
  try {
    const { data, error } = await supabase
      .from('content_translations')
      .select(`
        *,
        translation_keys (
          key_name
        )
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('field_name', fieldName)
      .single();

    if (error) {
      console.error('Error fetching content translation:', error);
      return null;
    }

    return {
      id: data.id,
      contentType: data.content_type,
      contentId: data.content_id,
      fieldName: data.field_name,
      translationKeyId: data.translation_key_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching content translation:', error);
    return null;
  }
};

// High-level translation functions
export const translateContent = async (
  contentType: string,
  contentId: string,
  fieldName: string,
  language: string,
  fallbackValue?: string
): Promise<string> => {
  try {
    // Get content translation mapping
    const contentTranslation = await getContentTranslation(contentType, contentId, fieldName);
    
    if (!contentTranslation) {
      return fallbackValue || `${contentType}_${contentId}_${fieldName}`;
    }

    // Get the translation key
    const key = await getTranslationKeyById(contentTranslation.translationKeyId);
    if (!key) {
      return fallbackValue || `${contentType}_${contentId}_${fieldName}`;
    }

    // Get the translated value
    return await getTranslation(key.keyName, language, fallbackValue);
  } catch (error) {
    console.error('Error translating content:', error);
    return fallbackValue || `${contentType}_${contentId}_${fieldName}`;
  }
};

export const setContentTranslation = async (
  contentType: string,
  contentId: string,
  fieldName: string,
  translations: Record<string, string>
): Promise<boolean> => {
  try {
    const keyName = generateTranslationKey(contentType, contentId, fieldName);
    
    // Get or create translation key
    const key = await getOrCreateTranslationKey(keyName, `${contentType}_${fieldName}`);
    if (!key) {
      return false;
    }

    // Create content translation mapping if it doesn't exist
    let contentTranslation = await getContentTranslation(contentType, contentId, fieldName);
    if (!contentTranslation) {
      contentTranslation = await createContentTranslation(
        contentType,
        contentId,
        fieldName,
        key.id
      );
      if (!contentTranslation) {
        return false;
      }
    }

    // Set translations for each language
    for (const [language, value] of Object.entries(translations)) {
      if (SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
        const existingValue = await getTranslationValue(key.id, language);
        if (existingValue) {
          await updateTranslationValue(key.id, language, value);
        } else {
          await createTranslationValue(key.id, language, value);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error setting content translation:', error);
    return false;
  }
};

// Bulk operations
export const getTranslationsForContent = async (
  contentType: string,
  contentId: string,
  language: string
): Promise<Record<string, string>> => {
  try {
    const { data, error } = await supabase
      .from('content_translations')
      .select(`
        field_name,
        translation_keys (
          key_name,
          translation_values (
            value
          )
        )
      `)
      .eq('content_type', contentType)
      .eq('content_id', contentId);

    if (error) {
      console.error('Error fetching translations for content:', error);
      return {};
    }

    const translations: Record<string, string> = {};
    
    for (const item of data) {
      const keyName = item.translation_keys.key_name;
      const translationValue = item.translation_keys.translation_values?.find(
        (tv: any) => tv.language_code === language
      );
      
      if (translationValue) {
        translations[item.field_name] = translationValue.value;
      }
    }

    return translations;
  } catch (error) {
    console.error('Error getting translations for content:', error);
    return {};
  }
};

// Cache management
export const invalidateTranslationCache = (keyName?: string): void => {
  if (keyName) {
    delete translationCache[keyName];
  } else {
    clearCache();
  }
};

// Export cache management functions
export { clearCache, getCachedTranslation, setCachedTranslation }; 