import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getEffectiveOpenStatus } from '../utils/environmentUtils';

const HeroCarousel: React.FC = () => {
  const { t } = useTranslation();
  const { barracas, weatherOverride } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % barracas.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [barracas.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % barracas.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + barracas.length) % barracas.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (barracas.length === 0) return null;

  return (
    <div className="relative h-[66vh] sm:h-[70vh] md:h-screen overflow-hidden">
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        {barracas.map((barraca, index) => (
          <div
            key={barraca.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${barraca.images[0]})`
              }}
            />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex items-center justify-center h-full text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-2xl mb-4 sm:mb-6 md:mb-8 text-gray-200 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Current Barraca Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20">
            <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2 text-sky-300" />
              <span className="text-sm sm:text-base md:text-lg font-semibold">{barracas[currentSlide].location}</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-3xl font-bold mb-1 sm:mb-2">
              {barracas[currentSlide].name}
            </h3>
            <p className="text-gray-200 mb-2 sm:mb-3 md:mb-4 max-w-xl mx-auto text-xs sm:text-sm md:text-base">
              {barracas[currentSlide].description}
            </p>
            {(() => {
              const effectiveIsOpen = getEffectiveOpenStatus(barracas[currentSlide], weatherOverride);
              return (
                <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium status-pulse ${
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

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 border border-white/30"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm p-2 md:p-3 rounded-full hover:bg-white/20 transition-all duration-200 border border-white/30"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {barracas.map((_, index) => (
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