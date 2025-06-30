import React from 'react';
import { useHybridTranslation, useContentTranslation } from '../hooks/useHybridTranslation';

interface TranslatedContentProps {
  translationKey: string;
  fallback?: string;
  children?: (value: string, source: string, isLoading: boolean) => React.ReactNode;
  className?: string;
  showSource?: boolean;
  logSource?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ContentTranslatedProps {
  contentType: string;
  contentId: string;
  fieldName: string;
  fallback?: string;
  children?: (value: string, source: string, isLoading: boolean) => React.ReactNode;
  className?: string;
  showSource?: boolean;
  logSource?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Component for translating content using the hybrid system
 */
export function TranslatedContent({
  translationKey,
  fallback,
  children,
  className,
  showSource = false,
  logSource = false,
  autoRefresh = false,
  refreshInterval
}: TranslatedContentProps) {
  // Check if this looks like a Lingo internal key and provide a better fallback
  const isLingoKey = translationKey.includes('/') || translationKey.includes('declaration') || translationKey.includes('argument');
  const effectiveFallback = isLingoKey ? (fallback || 'Loading...') : (fallback || translationKey);

  const { value, source, isLoading, error } = useHybridTranslation(translationKey, effectiveFallback, {
    logSource,
    autoRefresh,
    refreshInterval
  });

  if (error) {
    console.error(`[TranslatedContent] Error translating key "${translationKey}":`, error);
  }

  if (children) {
    return <>{children(value, source, isLoading)}</>;
  }

  return (
    <span className={className}>
      {value}
      {showSource && (
        <span className="text-xs text-gray-500 ml-1" title={`Translation source: ${source}`}>
          [{source}]
        </span>
      )}
      {isLoading && (
        <span className="text-xs text-blue-500 ml-1">[loading]</span>
      )}
    </span>
  );
}

/**
 * Component for translating content items (barracas, products, etc.)
 */
export function ContentTranslated({
  contentType,
  contentId,
  fieldName,
  fallback,
  children,
  className,
  showSource = false,
  logSource = false,
  autoRefresh = false,
  refreshInterval
}: ContentTranslatedProps) {
  const { value, source, isLoading, error } = useContentTranslation(
    contentType,
    contentId,
    fieldName,
    fallback,
    {
      logSource,
      autoRefresh,
      refreshInterval
    }
  );

  if (error) {
    console.error(`[ContentTranslated] Error translating ${contentType}:${contentId}:${fieldName}:`, error);
  }

  if (children) {
    return <>{children(value, source, isLoading)}</>;
  }

  return (
    <span className={className}>
      {value}
      {showSource && (
        <span className="text-xs text-gray-500 ml-1" title={`Translation source: ${source}`}>
          [{source}]
        </span>
      )}
      {isLoading && (
        <span className="text-xs text-blue-500 ml-1">[loading]</span>
      )}
    </span>
  );
}

/**
 * Component for translating barraca content
 */
export function TranslatedBarraca({
  barracaId,
  fieldName,
  fallback,
  children,
  className,
  showSource = false,
  logSource = false
}: {
  barracaId: string;
  fieldName: string;
  fallback?: string;
  children?: (value: string, source: string, isLoading: boolean) => React.ReactNode;
  className?: string;
  showSource?: boolean;
  logSource?: boolean;
}) {
  return (
    <ContentTranslated
      contentType="barraca"
      contentId={barracaId}
      fieldName={fieldName}
      fallback={fallback}
      children={children}
      className={className}
      showSource={showSource}
      logSource={logSource}
    />
  );
}

/**
 * Component for translating product content
 */
export function TranslatedProduct({
  productId,
  fieldName,
  fallback,
  children,
  className,
  showSource = false,
  logSource = false
}: {
  productId: string;
  fieldName: string;
  fallback?: string;
  children?: (value: string, source: string, isLoading: boolean) => React.ReactNode;
  className?: string;
  showSource?: boolean;
  logSource?: boolean;
}) {
  return (
    <ContentTranslated
      contentType="product"
      contentId={productId}
      fieldName={fieldName}
      fallback={fallback}
      children={children}
      className={className}
      showSource={showSource}
      logSource={logSource}
    />
  );
}

/**
 * Component for translating story content
 */
export function TranslatedStory({
  storyId,
  fieldName,
  fallback,
  children,
  className,
  showSource = false,
  logSource = false
}: {
  storyId: string;
  fieldName: string;
  fallback?: string;
  children?: (value: string, source: string, isLoading: boolean) => React.ReactNode;
  className?: string;
  showSource?: boolean;
  logSource?: boolean;
}) {
  return (
    <ContentTranslated
      contentType="story"
      contentId={storyId}
      fieldName={fieldName}
      fallback={fallback}
      children={children}
      className={className}
      showSource={showSource}
      logSource={logSource}
    />
  );
}

/**
 * Component for showing translation source indicator
 */
export function TranslationSourceIndicator({ source }: { source: string }) {
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'lingo':
        return 'text-green-600 bg-green-100';
      case 'database':
        return 'text-blue-600 bg-blue-100';
      case 'fallback':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'lingo':
        return 'Lingo';
      case 'database':
        return 'DB';
      case 'fallback':
        return 'Fallback';
      default:
        return source;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(source)}`}
      title={`Translation source: ${source}`}
    >
      {getSourceLabel(source)}
    </span>
  );
}

/**
 * Component for showing translation loading state
 */
export function TranslationLoadingIndicator() {
  return (
    <span className="inline-flex items-center text-blue-500">
      <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading...
    </span>
  );
}

/**
 * Component for showing translation error state
 */
export function TranslationErrorIndicator({ error }: { error: string }) {
  return (
    <span className="inline-flex items-center text-red-500" title={`Translation error: ${error}`}>
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      Error
    </span>
  );
} 