import { useState, useEffect, useCallback, useContext } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { hybridTranslationService, TranslationSource, HybridTranslationOptions } from '../services/hybridTranslationService';
import { AppContext } from '../contexts/AppContext';

export interface UseHybridTranslationOptions extends HybridTranslationOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface TranslationResult {
  value: string;
  source: TranslationSource['source'];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for translating content using the hybrid system (Lingo + Database)
 */
export function useHybridTranslation(
  key: string,
  fallback?: string,
  options: UseHybridTranslationOptions = {}
): TranslationResult {
  const { i18n } = useI18nTranslation();
  const { currentLanguage } = useContext(AppContext);
  const [result, setResult] = useState<TranslationResult>({
    value: fallback || key,
    source: 'fallback',
    isLoading: true,
    error: null,
    refresh: async () => {}
  });

  const locale = currentLanguage || i18n.language || 'en';

  const fetchTranslation = useCallback(async () => {
    try {
      setResult(prev => ({ ...prev, isLoading: true, error: null }));
      
      const translation = await hybridTranslationService.translate(
        key,
        locale,
        fallback,
        options
      );

      setResult({
        value: translation.value,
        source: translation.source,
        isLoading: false,
        error: null,
        refresh: fetchTranslation
      });
    } catch (error) {
      console.error('[useHybridTranslation] Error fetching translation:', error);
      setResult({
        value: fallback || key,
        source: 'fallback',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Translation error',
        refresh: fetchTranslation
      });
    }
  }, [key, locale, fallback, options]);

  // Initial fetch
  useEffect(() => {
    fetchTranslation();
  }, [fetchTranslation]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options.autoRefresh) return;

    const interval = setInterval(fetchTranslation, options.refreshInterval || 30000);
    return () => clearInterval(interval);
  }, [fetchTranslation, options.autoRefresh, options.refreshInterval]);

  return result;
}

/**
 * Hook for translating content items (barracas, products, etc.)
 */
export function useContentTranslation(
  contentType: string,
  contentId: string,
  fieldName: string,
  fallback?: string,
  options: UseHybridTranslationOptions = {}
): TranslationResult {
  const key = `${contentType}_${contentId}_${fieldName}`;
  return useHybridTranslation(key, fallback, options);
}

/**
 * Hook for managing multiple translations at once
 */
export function useMultipleTranslations(
  translations: Array<{ key: string; fallback?: string }>,
  options: UseHybridTranslationOptions = {}
): Record<string, TranslationResult> {
  const { i18n } = useI18nTranslation();
  const { currentLanguage } = useContext(AppContext);
  const [results, setResults] = useState<Record<string, TranslationResult>>({});
  const [isLoading, setIsLoading] = useState(true);

  const locale = currentLanguage || i18n.language || 'en';

  const fetchAllTranslations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const translationPromises = translations.map(async ({ key, fallback }) => {
        try {
          const translation = await hybridTranslationService.translate(
            key,
            locale,
            fallback,
            options
          );

          return {
            key,
            result: {
              value: translation.value,
              source: translation.source,
              isLoading: false,
              error: null,
              refresh: async () => {
                const newTranslation = await hybridTranslationService.translate(
                  key,
                  locale,
                  fallback,
                  options
                );
                setResults(prev => ({
                  ...prev,
                  [key]: {
                    ...prev[key],
                    value: newTranslation.value,
                    source: newTranslation.source
                  }
                }));
              }
            }
          };
        } catch (error) {
          return {
            key,
            result: {
              value: fallback || key,
              source: 'fallback' as const,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Translation error',
              refresh: async () => {}
            }
          };
        }
      });

      const translationResults = await Promise.all(translationPromises);
      const resultsMap: Record<string, TranslationResult> = {};
      
      translationResults.forEach(({ key, result }) => {
        resultsMap[key] = result;
      });

      setResults(resultsMap);
    } catch (error) {
      console.error('[useMultipleTranslations] Error fetching translations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [translations, locale, options]);

  useEffect(() => {
    fetchAllTranslations();
  }, [fetchAllTranslations]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options.autoRefresh) return;

    const interval = setInterval(fetchAllTranslations, options.refreshInterval || 30000);
    return () => clearInterval(interval);
  }, [fetchAllTranslations, options.autoRefresh, options.refreshInterval]);

  // Add loading state to all results if still loading
  if (isLoading) {
    const loadingResults: Record<string, TranslationResult> = {};
    translations.forEach(({ key, fallback }) => {
      loadingResults[key] = {
        value: fallback || key,
        source: 'fallback',
        isLoading: true,
        error: null,
        refresh: async () => {}
      };
    });
    return loadingResults;
  }

  return results;
}

/**
 * Hook for getting translation statistics
 */
export function useTranslationStats() {
  const [stats, setStats] = useState({
    totalKeys: 0,
    totalValues: 0,
    coverageByLocale: {} as Record<string, number>
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const translationStats = await hybridTranslationService.getTranslationStats();
      setStats(translationStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch translation stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats
  };
}

/**
 * Hook for getting cache statistics
 */
export function useCacheStats() {
  const [cacheStats, setCacheStats] = useState({
    size: 0,
    keys: [] as string[]
  });

  const refreshCacheStats = useCallback(() => {
    const stats = hybridTranslationService.getCacheStats();
    setCacheStats(stats);
  }, []);

  useEffect(() => {
    refreshCacheStats();
  }, [refreshCacheStats]);

  return {
    cacheStats,
    refresh: refreshCacheStats,
    clearCache: () => {
      hybridTranslationService.clearAllCache();
      refreshCacheStats();
    }
  };
}

/**
 * Hook for setting database translations
 */
export function useSetTranslation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setTranslation = useCallback(async (
    key: string,
    locale: string,
    value: string,
    contentType?: string,
    contentId?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await hybridTranslationService.setDatabaseTranslation(
        key,
        locale,
        value,
        contentType,
        contentId
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set translation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    setTranslation,
    isLoading,
    error
  };
} 