import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, MapPin, X, CheckCircle, XCircle, Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useStory } from '../contexts/StoryContext';
import BarracaGrid from '../components/BarracaGrid';
import StoryCarousel from '../components/StoryCarousel';
import LocationFilterCheckboxes from '../components/LocationFilterCheckboxes';
import StarRating from '../components/StarRating';

import { useInfiniteScrollV2 } from '../hooks/useInfiniteScrollV2';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import WeatherMarquee from '../components/WeatherMarquee';

const Discover: React.FC = () => {
  const { t } = useTranslation();
  const { 
    barracas, 
    searchFilters, 
    updateSearchFilters, 
    totalBarracas,
    hasMore,
    loadMore,
    isLoading
  } = useApp();
  const { featureFlags } = useStory();
    const [showFilters, setShowFilters] = useState(true);

  // New infinite scroll hook
  const loadingRef = useInfiniteScrollV2({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
    threshold: 800
  });

  // Scroll animations
  const resultsAnimation = useScrollAnimation('slideUp');

  // Compute unique locations from loaded barracas
  const dynamicLocations = React.useMemo(() => {
    const locationsSet = new Set<string>();
    barracas.forEach(b => {
      if (b.location && b.location.trim()) {
        locationsSet.add(b.location.trim());
      }
    });
    return Array.from(locationsSet).sort((a, b) => a.localeCompare(b));
  }, [barracas]);

  // Auto-prefetch if the viewport isn't filled (up to 3 attempts)
  const prefetchAttemptsRef = useRef(0);
  useEffect(() => {
    if (!hasMore || isLoading) return;
    if (prefetchAttemptsRef.current >= 3) return;
    const doc = document.documentElement;
    const viewportFilled = doc.scrollHeight > window.innerHeight + 200;
    if (!viewportFilled) {
      prefetchAttemptsRef.current += 1;
      loadMore();
    }
  }, [barracas.length, hasMore, isLoading, loadMore]);

  const availabilityOptions = [
    { value: 'all', label: t('discover.filters.all'), icon: null },
    { value: 'open', label: t('discover.filters.open'), icon: CheckCircle },
    { value: 'closed', label: t('discover.filters.closed'), icon: XCircle }
  ];

  const ratingOptions: {
    value: 1 | 2 | 3 | undefined;
    label: string;
    icon: React.ComponentType<{ className?: string }> | null;
    rating?: 1 | 2 | 3;
  }[] = [
    { value: undefined, label: t('discover.filters.allRatings'), icon: null },
    { value: 3, label: t('discover.filters.excellent'), icon: Star, rating: 3 },
    { value: 2, label: t('discover.filters.great'), icon: Star, rating: 2 },
    { value: 1, label: t('discover.filters.good'), icon: Star, rating: 1 }
  ];

  // Debounced search handler
  const handleSearchChange = useCallback((query: string) => {
    updateSearchFilters({ query });
  }, [updateSearchFilters]);

  // removed unused handleLocationFilter

  const handleAvailabilityFilter = (status: 'all' | 'open' | 'closed') => {
    updateSearchFilters({ status });
  };

  const handleRatingFilter = (rating: 1 | 2 | 3 | undefined) => {
    updateSearchFilters({ rating });
  };

  const handleLocationsChange = React.useCallback((locations: string[]) => {
    // Update both location (for backward compatibility) and locations array
    if (locations.length === 1) {
      updateSearchFilters({ location: locations[0], locations: locations });
    } else if (locations.length > 1) {
      updateSearchFilters({ location: '', locations: locations });
    } else {
      updateSearchFilters({ location: '', locations: [] });
    }
  }, [updateSearchFilters]);

  const clearFilters = () => {
    updateSearchFilters({ query: '', openNow: false, location: '', locations: [], status: 'all', rating: undefined });
  };

  const hasActiveFilters = searchFilters.query || searchFilters.location || searchFilters.locations.length > 0 || searchFilters.status !== 'all' || searchFilters.rating !== undefined;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header Section */}
      <section className="relative pt-24 pb-32 min-h-[450px] z-0">
        
        <div className="absolute inset-0 w-full h-full bg-[url('https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/sunrise-2.jpg?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 w-full h-full bg-black/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {t('discover.title')}
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto drop-shadow">
              {t('discover.subtitle')}
            </p>
          </div>
          

        </div>
            </section>

      {/* Sticky Search and Weather Group - overlaps hero with negative margin */}
      <div className="sticky top-16 z-50">
        {/* Weather Marquee */}
        <WeatherMarquee colorScheme="pink" stickyOffsetClassName="top-0" useSolidIcons={true} />

        {/* Search Bar */}
        <div className="bg-white/95 backdrop-blur-sm border-y border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-pink-500 z-10 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t('discover.searchPlaceholder')}
                  value={searchFilters.query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-base rounded-lg bg-white text-gray-900 placeholder-gray-400 border border-gray-200 shadow-sm focus:ring-4 focus:ring-pink-100 focus:border-pink-300 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 mt-4">
        {/* Filters Row (desktop) */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              {/* Filters Panel */}
              {showFilters && (
                <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 mb-0">
                  <div className="space-y-3">
                    {/* Availability Filter */}
                    <div>
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                        <h3 className="text-xs md:text-sm font-medium text-gray-700" data-lingo-skip>Availability</h3>
                      </div>
                      <div className="flex gap-1 md:gap-2 bg-gray-100 rounded-lg p-1 w-fit">
                        {availabilityOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleAvailabilityFilter(option.value as 'all' | 'open' | 'closed')}
                              className={`flex items-center px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                                searchFilters.status === option.value
                                  ? 'bg-beach-500 text-white shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                              }`}
                            >
                              {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />}
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <div className="flex items-center mb-2">
                        <Star className="h-3.5 w-3.5 text-yellow-500 mr-1.5" />
                        <h3 className="text-xs md:text-sm font-medium text-gray-700" data-lingo-skip>Rating</h3>
                      </div>
                      <div className="flex gap-1 md:gap-2 bg-gray-100 rounded-lg p-1 w-fit">
                        {ratingOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value ?? 'all'}
                              onClick={() => handleRatingFilter(option.value)}
                              className={`flex items-center px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                                searchFilters.rating === option.value
                                  ? 'bg-yellow-500 text-white shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                              }`}
                            >
                              {option.rating ? (
                                <StarRating rating={option.rating} size="sm" className="mr-1" />
                              ) : (
                                Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                              )}
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Location Filter Checkboxes */}
                    <LocationFilterCheckboxes
                      availableLocations={dynamicLocations}
                      onLocationsChange={handleLocationsChange}
                      initialLocations={searchFilters.locations.length > 0 ? searchFilters.locations : (searchFilters.location ? [searchFilters.location] : [])}
                    />
                  </div>
                  
                </div>
              )}
            </div>
          </div>
          {/* Results Header & Controls Row BELOW the widgets */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {barracas.length} of {totalBarracas} {t('discover.resultsFound')} {totalBarracas === 1 ? t('discover.barraca') : t('discover.barracas')} {t('discover.found')}
            </h2>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t('search.clear')}
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {/* Active Filters Display - Compact */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5 md:gap-2 mt-4">
              {searchFilters.query && (
                <span className="bg-beach-100 text-beach-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm flex items-center">
                  <Search className="h-3 w-3 mr-1" />
                  "{searchFilters.query}"
                </span>
              )}
              {searchFilters.status !== 'all' && (
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm flex items-center ${
                  searchFilters.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {searchFilters.status === 'open' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {searchFilters.status === 'open' ? t('barraca.open') : t('barraca.closed')}
                </span>
              )}
              {searchFilters.locations.length > 0 && (
                <span className="bg-purple-100 text-purple-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {searchFilters.locations.length === 1 
                    ? searchFilters.locations[0]
                    : searchFilters.locations.length <= 3
                    ? searchFilters.locations.join(', ')
                    : `${searchFilters.locations.length} locations`
                  }
                </span>
              )}
              {searchFilters.rating && (
                <span className="bg-yellow-100 text-yellow-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm flex items-center">
                  <Star className="h-3 w-3 mr-1" />
                  <StarRating rating={searchFilters.rating} size="sm" className="mr-1" />
                  {searchFilters.rating === 3 ? 'Excellent' : searchFilters.rating === 2 ? 'Great' : 'Good'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div ref={resultsAnimation.ref} className={resultsAnimation.animationClasses}>
          {barracas.length > 0 ? (
            <>
              <BarracaGrid barracas={barracas} />
              
              {/* Infinite Scroll Loading Indicator */}
              {hasMore && (
                <div ref={loadingRef} className="flex justify-center py-8">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Loading more barracas...</span>
                  </div>
                </div>
              )}
              
              {/* End of Results */}
              {!hasMore && barracas.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    You've reached the end of all {totalBarracas} barracas
                  </p>
                </div>
              )}
            </>
          ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('discover.noResults')}</h3>
            <p className="text-gray-600 mb-6">
              {searchFilters.query 
                ? t('discover.noResultsMessage', { query: searchFilters.query })
                : t('discover.adjustCriteria')
              }
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-beach-500 text-white rounded-lg hover:bg-beach-600 transition-colors"
            >
              {t('discover.clearAllFilters')}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Discover;