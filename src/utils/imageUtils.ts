// Image optimization utilities

export interface ImageSize {
  width: number;
  height: number;
  quality?: number;
}

export const GRID_IMAGE_SIZES: ImageSize[] = [
  { width: 400, height: 300, quality: 80 }, // Mobile
  { width: 600, height: 400, quality: 80 }, // Tablet
  { width: 800, height: 600, quality: 75 }, // Desktop
];

export const HERO_IMAGE_SIZES: ImageSize[] = [
  { width: 600, height: 400, quality: 85 },
  { width: 1200, height: 800, quality: 80 },
  { width: 1800, height: 1200, quality: 75 },
];

/**
 * Generate responsive image srcset for different screen sizes
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: ImageSize[],
  format: 'webp' | 'jpeg' = 'webp'
): string {
  return sizes
    .map(size => {
      const params = new URLSearchParams({
        width: size.width.toString(),
        height: size.height.toString(),
        quality: (size.quality || 80).toString(),
        format
      });
      return `${baseUrl}?${params} ${size.width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(containerWidth: string = '100vw'): string {
  return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw`;
}

/**
 * Get optimized image URL for grid display
 */
export function getGridImageUrl(imageUrl: string, size: ImageSize): string {
  if (!imageUrl || imageUrl.startsWith('/api/placeholder')) {
    return imageUrl;
  }
  
  // If using Supabase Storage, you can add transformation parameters
  // For now, return the original URL
  return imageUrl;
}

/**
 * Check if image should be preloaded (first few images)
 */
export function shouldPreloadImage(index: number, preloadCount: number = 3): boolean {
  return index < preloadCount;
}

/**
 * Get fetch priority for images
 */
export function getFetchPriority(index: number, preloadCount: number = 3): 'high' | 'low' {
  return shouldPreloadImage(index, preloadCount) ? 'high' : 'low';
}

/**
 * Preload a single image. Resolves on load or error to avoid blocking forever.
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    const done = () => {
      img.onload = null;
      img.onerror = null;
      resolve();
    };
    img.onload = done;
    img.onerror = done;
    img.src = url;
  });
}

/**
 * Preload multiple images with an optional timeout safeguard.
 */
export async function preloadImages(urls: string[], timeoutMs: number = 4000): Promise<void> {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  if (uniqueUrls.length === 0) return;

  const preloadAll = Promise.all(uniqueUrls.map(preloadImage)).then(() => undefined);
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  await Promise.race([preloadAll, timeout]);
}
