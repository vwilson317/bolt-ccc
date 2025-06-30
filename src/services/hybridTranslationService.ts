import { supabase } from '../lib/supabase';
import { TranslationKey, TranslationValue, ContentTranslation } from '../types/translation';

export interface TranslationSource {
  source: 'lingo' | 'database' | 'fallback';
  key: string;
  value: string;
  locale: string;
}

export interface HybridTranslationOptions {
  fallbackToOriginal?: boolean;
  cacheResults?: boolean;
  logSource?: boolean;
}

class HybridTranslationService {
  private cache = new Map<string, TranslationSource>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly cacheTimestamps = new Map<string, number>();

  /**
   * Get translation with priority: Lingo → Database → Fallback
   */
  async translate(
    key: string, 
    locale: string, 
    fallback?: string,
    options: HybridTranslationOptions = {}
  ): Promise<TranslationSource> {
    const cacheKey = `${key}:${locale}`;
    const now = Date.now();

    // Check cache first
    if (options.cacheResults !== false) {
      const cached = this.cache.get(cacheKey);
      const timestamp = this.cacheTimestamps.get(cacheKey);
      if (cached && timestamp && (now - timestamp) < this.CACHE_TTL) {
        if (options.logSource) {
          console.log(`[HybridTranslation] Cache hit: ${key} (${cached.source})`);
        }
        return cached;
      }
    }

    // 1. Try Lingo translation first (static content)
    const lingoTranslation = await this.getLingoTranslation(key, locale);
    if (lingoTranslation) {
      const result: TranslationSource = {
        source: 'lingo',
        key,
        value: lingoTranslation,
        locale
      };
      this.setCache(cacheKey, result);
      if (options.logSource) {
        console.log(`[HybridTranslation] Lingo: ${key}`);
      }
      return result;
    }

    // 2. Try database translation (dynamic content)
    const dbTranslation = await this.getDatabaseTranslation(key, locale);
    if (dbTranslation) {
      const result: TranslationSource = {
        source: 'database',
        key,
        value: dbTranslation,
        locale
      };
      this.setCache(cacheKey, result);
      if (options.logSource) {
        console.log(`[HybridTranslation] Database: ${key}`);
      }
      return result;
    }

    // 3. Try language variant fallback (e.g., pt-BR → pt)
    if (locale.includes('-')) {
      const baseLocale = locale.split('-')[0];
      const variantTranslation = await this.translate(key, baseLocale, fallback, options);
      if (variantTranslation.source !== 'fallback') {
        return variantTranslation;
      }
    }

    // 4. Fallback to English
    if (locale !== 'en') {
      const englishTranslation = await this.translate(key, 'en', fallback, options);
      if (englishTranslation.source !== 'fallback') {
        return englishTranslation;
      }
    }

    // 5. Final fallback
    const result: TranslationSource = {
      source: 'fallback',
      key,
      value: fallback || key,
      locale
    };
    this.setCache(cacheKey, result);
    if (options.logSource) {
      console.log(`[HybridTranslation] Fallback: ${key}`);
    }
    return result;
  }

  /**
   * Get translation from Lingo's static translation system
   */
  private async getLingoTranslation(key: string, locale: string): Promise<string | null> {
    try {
      // Check if this looks like a Lingo-generated key (contains path-like structure)
      if (key.includes('/') || key.includes('declaration') || key.includes('argument')) {
        // This is likely a Lingo internal key, not a user-facing translation
        return null;
      }

      // For now, since Lingo hasn't generated translations yet, we'll return null
      // to fall back to database translations or fallback values
      return null;
    } catch (error) {
      console.warn('[HybridTranslation] Error getting Lingo translation:', error);
      return null;
    }
  }

  /**
   * Get translation from database
   */
  private async getDatabaseTranslation(key: string, locale: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('translation_values')
        .select('value')
        .eq('translation_key', key)
        .eq('locale', locale)
        .single();

      if (error || !data) {
        return null;
      }

      return data.value;
    } catch (error) {
      console.warn('[HybridTranslation] Error getting database translation:', error);
      return null;
    }
  }

  /**
   * Create or update database translation
   */
  async setDatabaseTranslation(
    key: string, 
    locale: string, 
    value: string,
    contentType?: string,
    contentId?: string
  ): Promise<void> {
    try {
      // First, ensure the translation key exists
      await this.ensureTranslationKey(key, contentType, contentId);

      // Then, upsert the translation value
      const { error } = await supabase
        .from('translation_values')
        .upsert({
          translation_key: key,
          locale,
          value,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Clear cache for this key
      this.clearCache(key, locale);
    } catch (error) {
      console.error('[HybridTranslation] Error setting database translation:', error);
      throw error;
    }
  }

  /**
   * Ensure translation key exists in database
   */
  private async ensureTranslationKey(
    key: string, 
    contentType?: string, 
    contentId?: string
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('translation_keys')
        .select('id')
        .eq('key', key)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (!data) {
        // Create the translation key
        const { error: insertError } = await supabase
          .from('translation_keys')
          .insert({
            key,
            content_type: contentType,
            content_id: contentId,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          throw insertError;
        }

        // If content mapping is provided, create the content translation record
        if (contentType && contentId) {
          await this.createContentTranslation(key, contentType, contentId);
        }
      }
    } catch (error) {
      console.error('[HybridTranslation] Error ensuring translation key:', error);
      throw error;
    }
  }

  /**
   * Create content translation mapping
   */
  private async createContentTranslation(
    key: string, 
    contentType: string, 
    contentId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_translations')
        .upsert({
          translation_key: key,
          content_type: contentType,
          content_id: contentId,
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('[HybridTranslation] Error creating content translation:', error);
      throw error;
    }
  }

  /**
   * Get all translations for a specific content item
   */
  async getContentTranslations(
    contentType: string, 
    contentId: string, 
    locale: string
  ): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('content_translations')
        .select(`
          translation_key,
          translation_values!inner(value)
        `)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('translation_values.locale', locale);

      if (error) {
        throw error;
      }

      const translations: Record<string, string> = {};
      data?.forEach(item => {
        if (item.translation_values && item.translation_values.length > 0) {
          translations[item.translation_key] = item.translation_values[0].value;
        }
      });

      return translations;
    } catch (error) {
      console.error('[HybridTranslation] Error getting content translations:', error);
      return {};
    }
  }

  /**
   * Get translation statistics
   */
  async getTranslationStats(): Promise<{
    totalKeys: number;
    totalValues: number;
    coverageByLocale: Record<string, number>;
  }> {
    try {
      // Get total keys
      const { count: totalKeys } = await supabase
        .from('translation_keys')
        .select('*', { count: 'exact', head: true });

      // Get total values
      const { count: totalValues } = await supabase
        .from('translation_values')
        .select('*', { count: 'exact', head: true });

      // Get coverage by locale
      const { data: localeData } = await supabase
        .from('translation_values')
        .select('locale');

      const coverageByLocale: Record<string, number> = {};
      const locales = ['en', 'es', 'pt'];
      
      locales.forEach(locale => {
        const count = localeData?.filter(item => item.locale === locale).length || 0;
        coverageByLocale[locale] = totalKeys ? Math.round((count / totalKeys) * 100) : 0;
      });

      return {
        totalKeys: totalKeys || 0,
        totalValues: totalValues || 0,
        coverageByLocale
      };
    } catch (error) {
      console.error('[HybridTranslation] Error getting translation stats:', error);
      return {
        totalKeys: 0,
        totalValues: 0,
        coverageByLocale: {}
      };
    }
  }

  /**
   * Clear cache for specific key and locale
   */
  private clearCache(key: string, locale: string): void {
    const cacheKey = `${key}:${locale}`;
    this.cache.delete(cacheKey);
    this.cacheTimestamps.delete(cacheKey);
  }

  /**
   * Set cache with timestamp
   */
  private setCache(key: string, value: TranslationSource): void {
    this.cache.set(key, value);
    this.cacheTimestamps.set(key, Date.now());
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const hybridTranslationService = new HybridTranslationService();

// Export convenience functions
export const translate = (key: string, locale: string, fallback?: string, options?: HybridTranslationOptions) =>
  hybridTranslationService.translate(key, locale, fallback, options);

export const setTranslation = (key: string, locale: string, value: string, contentType?: string, contentId?: string) =>
  hybridTranslationService.setDatabaseTranslation(key, locale, value, contentType, contentId);

export const getContentTranslations = (contentType: string, contentId: string, locale: string) =>
  hybridTranslationService.getContentTranslations(contentType, contentId, locale);

export const getTranslationStats = () => hybridTranslationService.getTranslationStats(); 