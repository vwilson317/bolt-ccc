import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  isHero?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  [key: string]: any; // Allow other props to pass through
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholderSrc,
  isHero = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(isHero); // Hero images are always "in view"
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract object-fit classes from className
  const getObjectFitClass = (className: string) => {
    if (className.includes('object-cover')) return 'object-cover';
    if (className.includes('object-contain')) return 'object-contain';
    if (className.includes('object-fill')) return 'object-fill';
    if (className.includes('object-none')) return 'object-none';
    if (className.includes('object-scale-down')) return 'object-scale-down';
    return 'object-cover'; // default
  };

  const objectFitClass = getObjectFitClass(className);

  // Generate a low-quality placeholder if none provided
  const generatePlaceholder = (originalSrc: string) => {
    if (placeholderSrc) return placeholderSrc;
    
    // Create a more flexible placeholder that adapts to the container
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E`;
  };

  const placeholder = generatePlaceholder(src);

  useEffect(() => {
    // For hero images, load immediately
    if (isHero) {
      setIsInView(true);
      return;
    }

    // Set up intersection observer for lazy loading
    if (!observerRef.current && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              // Once in view, we can disconnect the observer
              if (observerRef.current) {
                observerRef.current.disconnect();
              }
            }
          });
        },
        {
          rootMargin: '100px', // Start loading 100px before the image comes into view
          threshold: 0.01
        }
      );
    }

    if (observerRef.current && containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isHero]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // If it's a hero image or already in view, render the image immediately
  if (isHero || isInView) {
    return (
      <div ref={containerRef} className="relative w-full h-full">
        {/* Placeholder/Blur Image */}
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 ${objectFitClass} transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ filter: 'blur(10px)' }}
          aria-hidden="true"
        />
        
        {/* Main Image */}
        {!hasError && (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading={isHero ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        )}
        
        {/* Loading Spinner */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beach-500"></div>
          </div>
        )}
        
        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Image unavailable</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For non-hero images that are not yet in view, just show the placeholder
  return (
    <div ref={containerRef} className="relative">
      <img
        src={placeholder}
        alt=""
        className={`${className} ${objectFitClass}`}
        style={{ filter: 'blur(10px)' }}
        aria-hidden="true"
      />
    </div>
  );
};

export default LazyImage; 