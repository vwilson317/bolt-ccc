import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MapPin, Check, X as XIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getEffectiveOpenStatus } from '../utils/environmentUtils';

const HeroCarousel: React.FC = () => {
  const { t } = useTranslation();
  const { barracas, weatherOverride } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  // Track which slide indices have had their image loaded at least once
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(new Set([0]));
  const touchThreshold = 50; // Minimum px to trigger swipe
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Filter to only 3-star rated barracas for hero display, limited to 6
  const threeStarBarracas = barracas
    .filter(barraca => barraca.rating === 3)
    .slice(0, 6);

  const total = threeStarBarracas.length;

  // When currentSlide changes, mark the next slide as loaded so its image is preloaded
  useEffect(() => {
    if (total === 0) return;
    const next = (currentSlide + 1) % total;
    setLoadedSlides(prev => {
      if (prev.has(next)) return prev;
      const updated = new Set(prev);
      updated.add(next);
      return updated;
    });
  }, [currentSlide, total]);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const prev2 = (prev - 1 + total) % total;
      setLoadedSlides(ls => {
        if (ls.has(prev2)) return ls;
        const updated = new Set(ls);
        updated.add(prev2);
        return updated;
      });
      return prev2;
    });
  };

  const goToSlide = (index: number) => {
    setLoadedSlides(prev => {
      if (prev.has(index)) return prev;
      const updated = new Set(prev);
      updated.add(index);
      return updated;
    });
    setCurrentSlide(index);
  };

  if (total === 0) return null;

  // Helper: Barraca Details Row (for mobile)
  const BarracaDetailsRow = ({ barraca }: { barraca: typeof threeStarBarracas[0] }) => {
    const effectiveIsOpen = getEffectiveOpenStatus(barraca, weatherOverride);
    return (
      <div className="flex flex-col xs:flex-row items-center justify-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-b-2xl shadow-sm sm:hidden">
        <div className="flex items-center text-sky-700 font-semibold text-xs">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="truncate max-w-[100px]">{barraca.location}</span>
        </div>
        <div className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{barraca.name}</div>
        <div className="text-gray-600 text-xs text-center line-clamp-2 max-w-[120px]">{barraca.description}</div>
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium status-pulse ${
          effectiveIsOpen 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-1 dot-pulse ${
            effectiveIsOpen ? 'bg-green-400' : 'bg-red-400'
          }`} />
          {effectiveIsOpen ? t('barraca.open') : t('barraca.closed')}
        </div>
      </div>
    );
  };

  // Minimal Mobile Hero Overlay
  const MinimalMobileHero = ({ barraca }: { barraca: typeof threeStarBarracas[0] }) => {
    const effectiveIsOpen = getEffectiveOpenStatus(barraca, weatherOverride);
    return (
      <div className="absolute inset-0 z-20 sm:hidden pointer-events-none">
        {/* Optional: subtle gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        {/* Centered Name and Status */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-center text-white text-2xl font-bold drop-shadow-md truncate max-w-[280px] px-4">
            {barraca.name}
          </div>
          <div className="flex items-center text-gray-300 text-xs font-medium uppercase tracking-wider mt-1">
            {effectiveIsOpen ? (
              <Check className="h-4 w-4 mr-1 text-gray-300" strokeWidth={2} />
            ) : (
              <XIcon className="h-4 w-4 mr-1 text-gray-300" strokeWidth={2} />
            )}
            <span>{effectiveIsOpen ? t('barraca.open').toUpperCase() : t('barraca.closed').toUpperCase()}</span>
          </div>
        </div>
        {/* Location in lower right */}
        <div className="absolute bottom-4 right-4 flex items-center bg-black/40 rounded-full px-3 py-1 pointer-events-auto">
          <MapPin className="h-4 w-4 mr-1 text-gray-200" />
          <span className="text-white text-xs font-medium drop-shadow-md truncate max-w-[120px]">{barraca.location}</span>
        </div>
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
      {/* Only slides in loadedSlides have their backgroundImage set; unloaded slides render
          as invisible placeholders so they don't trigger an image fetch. */}
      <div className="absolute inset-0">
        {threeStarBarracas.map((barraca, index) => {
          const isLoaded = loadedSlides.has(index);
          const imageUrl = isLoaded
            ? (window.innerWidth < 768
                ? (barraca.photos.vertical[0] || barraca.photos.horizontal[0])
                : (barraca.photos.horizontal[0] || barraca.photos.vertical[0]))
            : undefined;
          return (
            <div
              key={barraca.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: imageUrl
                    ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${imageUrl})`
                    : undefined,
                  transform: `translateY(${scrollY * 0.5}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Minimal Mobile Hero Overlay */}
      <MinimalMobileHero barraca={threeStarBarracas[currentSlide]} />

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

          {/* Barraca Info Overlay - Desktop Only */}
          <div className="hidden sm:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20 inline-block pointer-events-auto">
              <div className="flex items-center justify-center mb-3 md:mb-4">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2 text-sky-300" />
                <span className="text-base md:text-lg font-semibold">{threeStarBarracas[currentSlide].location}</span>
              </div>
              <h3 className="text-xl md:text-3xl font-bold mb-2 truncate max-w-2xl mx-auto">{threeStarBarracas[currentSlide].name}</h3>
              <p className="text-gray-200 mb-3 md:mb-4 max-w-xl mx-auto text-sm md:text-base line-clamp-2">
                {threeStarBarracas[currentSlide].description}
              </p>
              {(() => {
                const effectiveIsOpen = getEffectiveOpenStatus(threeStarBarracas[currentSlide], weatherOverride);
                return (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium status-pulse ${
                    effectiveIsOpen 
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-400/30'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 dot-pulse ${
                      effectiveIsOpen ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    {effectiveIsOpen ? t('barraca.open') : t('barraca.closed')}
                  </div>
                );
              })()}
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
        {threeStarBarracas.map((_, index) => (
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