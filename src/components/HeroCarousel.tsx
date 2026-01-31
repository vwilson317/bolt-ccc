import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { photoService, Photo } from '../services/photoService';

const HeroCarousel: React.FC = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const touchThreshold = 50; // Minimum px to trigger swipe
  const containerRef = useRef<HTMLDivElement>(null);

  // Load photos for hero carousel
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const heroPhotos = await photoService.getHeroCarouselPhotos();
        setPhotos(heroPhotos);
      } catch (error) {
        console.error('Error loading hero carousel photos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
  }, []);

  // Track scroll position for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > touchThreshold) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Auto-advance slides
  useEffect(() => {
    if (photos.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Helper to format event location
  const formatEventLocation = (location: string | Array<{ name: string; barracaId?: string; instagram?: string }> | undefined): string => {
    if (!location) return '';
    if (typeof location === 'string') return location;
    if (Array.isArray(location)) {
      return location.map(loc => loc.name).join(', ');
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="relative h-[66vh] sm:h-[70vh] md:h-screen overflow-hidden z-0 bg-gradient-to-br from-beach-200 to-beach-300 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (photos.length === 0) return null;

  // Minimal Mobile Hero Overlay
  const MinimalMobileHero = ({ photo }: { photo: Photo }) => {
    const eventLocation = formatEventLocation(photo.eventLocation);
    return (
      <div className="absolute inset-0 z-20 sm:hidden pointer-events-none">
        {/* Optional: subtle gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        {/* Centered Event Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center text-white text-2xl font-bold drop-shadow-md truncate max-w-[280px] px-4 text-center">
            {photo.eventTitle || photo.title || 'Event'}
          </div>
          {photo.eventDate && (
            <div className="flex items-center text-gray-300 text-xs font-medium uppercase tracking-wider mt-1">
              <Calendar className="h-4 w-4 mr-1 text-gray-300" strokeWidth={2} />
              <span>{new Date(photo.eventDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        {/* Location in lower right */}
        {eventLocation && (
          <div className="absolute bottom-4 right-4 flex items-center bg-black/40 rounded-full px-3 py-1 pointer-events-auto">
            <MapPin className="h-4 w-4 mr-1 text-gray-200" />
            <span className="text-white text-xs font-medium drop-shadow-md truncate max-w-[120px]">{eventLocation}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      data-hero-carousel
      className="relative h-[66vh] sm:h-[70vh] md:h-screen overflow-hidden z-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${
                  window.innerWidth < 768
                    ? (photo.urlMobile || photo.url)
                    : photo.url
                })`,
                transform: `translateY(${scrollY * 0.5}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          </div>
        ))}
      </div>

      {/* Minimal Mobile Hero Overlay */}
      <MinimalMobileHero photo={photos[currentSlide]} />

      {/* Content Overlay (Desktop Only) with Parallax */}
      <div 
        className="relative z-10 flex h-full text-white pointer-events-none items-start sm:items-center justify-center"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8 sm:mt-0">
          <div className="mb-0 sm:mb-6 md:mb-8 animate-fade-in pt-4 sm:pt-0" style={{ minHeight: '33%' }}>
            <h1 className="hidden sm:block text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight pointer-events-auto">
              {t('hero.title')}
            </h1>
            <p className="hidden sm:block text-base sm:text-lg md:text-2xl mb-0 sm:mb-6 md:mb-8 text-gray-200 max-w-2xl mx-auto pointer-events-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Event Info Overlay - Desktop Only */}
          <div className="hidden sm:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20 inline-block pointer-events-auto">
              {formatEventLocation(photos[currentSlide].eventLocation) && (
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2 text-sky-300" />
                  <span className="text-base md:text-lg font-semibold">{formatEventLocation(photos[currentSlide].eventLocation)}</span>
                </div>
              )}
              <h3 className="text-xl md:text-3xl font-bold mb-2 truncate max-w-2xl mx-auto">
                {photos[currentSlide].eventTitle || photos[currentSlide].title || 'Event'}
              </h3>
              {photos[currentSlide].eventDescription && (
                <p className="text-gray-200 mb-3 md:mb-4 max-w-xl mx-auto text-sm md:text-base line-clamp-2">
                  {photos[currentSlide].eventDescription}
                </p>
              )}
              {photos[currentSlide].eventDate && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/10 text-white border border-white/30">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(photos[currentSlide].eventDate!).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 border border-white/30 pointer-events-auto"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 border border-white/30 pointer-events-auto"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2 pointer-events-auto">
        {photos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;