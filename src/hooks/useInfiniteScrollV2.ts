import { useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollV2Options {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // Prefetch distance from bottom to trigger load (in pixels)
  debounceMs?: number; // Debounce time for load more calls
  rootMargin?: string; // Deprecated: not used; rootMargin is derived from threshold
}

export const useInfiniteScrollV2 = ({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 100,
  debounceMs = 300,
  rootMargin = '0px'
}: UseInfiniteScrollV2Options) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading) {
        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Debounce the load more call
        debounceTimeoutRef.current = setTimeout(() => {
          onLoadMore();
        }, debounceMs);
      }
    },
    [hasMore, isLoading, onLoadMore, debounceMs]
  );

  useEffect(() => {
    const element = loadingRef.current;
    if (!element) return;

    // Create intersection observer with configurable options
    observerRef.current = new IntersectionObserver(handleObserver, {
      // Prefetch when the sentinel is within `threshold` px of the viewport bottom
      rootMargin: `0px 0px ${threshold}px 0px`,
      threshold: 0 // Trigger as soon as it intersects within the margin
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleObserver, threshold, rootMargin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return loadingRef;
};
