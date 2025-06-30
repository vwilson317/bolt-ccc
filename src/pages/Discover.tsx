import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, MapPin, X, Hash, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useStory } from '../contexts/StoryContext';
import { useWeather } from '../contexts/WeatherContext';
import BarracaGrid from '../components/BarracaGrid';
import StoryCarousel from '../components/StoryCarousel';
import WeatherWidget from '../components/WeatherWidget';

const Discover: React.FC = () => {
  const { t } = useTranslation();
  const { filteredBarracas, searchFilters, updateSearchFilters } = useApp();
  const { featureFlags } = useStory();
  const { weather } = useWeather();
  const [showFilters, setShowFilters] = useState(false);

  // Complete list of South Zone beaches
  const southZoneNeighborhoods = [
    'Copacabana', 
    'Ipanema', 
    'Leblon', 
    'Leme', 
    'Arpoador',
    'Diabo Beach',
    'Flamengo',
    'Botafogo',
    'Urca',
    'Vermelha Beach',
    'São Conrado',
    'Barra da Tijuca',
    'Recreio',
    'Joatinga',
    'Pepino Beach'
  ];

  const availabilityOptions = [
    { value: 'all', label: t('discover.filters.all'), icon: null },
    { value: 'open', label: t('discover.filters.open'), icon: CheckCircle },
    { value: 'closed', label: t('discover.filters.closed'), icon: XCircle }
  ];

  const handleSearchChange = (query: string) => {
    updateSearchFilters({ query });
  };

  const handleLocationFilter = (location: string) => {
    updateSearchFilters({ 
      location: searchFilters.location === location ? '' : location 
    });
  };

  const handleAvailabilityFilter = (status: 'all' | 'open' | 'closed') => {
    updateSearchFilters({ status });
  };

  const clearFilters = () => {
    updateSearchFilters({ query: '', openNow: false, location: '', status: 'all' });
  };

  const hasActiveFilters = searchFilters.query || searchFilters.location || searchFilters.status !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('discover.title')}
            </h1>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              {t('discover.subtitle')}
            </p>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('discover.searchPlaceholder')}
                value={searchFilters.query}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none transition-all duration-200"
              />
            </div>
            
            {/* Quick Search Examples */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-orange-100 text-sm">{t('search.examples.try')}</span>
              {['001', 'Ipanema', 'Sol e Mar', 'Leblon'].map((example) => (
                <button
                  key={example}
                  onClick={() => handleSearchChange(example)}
                  className="bg-white/20 text-white px-3 py-1 rounded-full text-sm hover:bg-white/30 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Carousel - Only show if feature is enabled */}
      {featureFlags.enableStoryBanner && <StoryCarousel />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Weather Widget */}
        {weather && (
          <div className="mb-8">
            <WeatherWidget />
          </div>
        )}
        
        {/* Results Header & Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredBarracas.length} {t('discover.resultsFound')} {filteredBarracas.length === 1 ? t('discover.barraca') : t('discover.barracas')} {t('discover.found')}
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
                {t('search.filters')}
              </button>
            </div>
          </div>

          {/* Minimal Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Availability Filter - Compact */}
                <div className="flex-shrink-0">
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {availabilityOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleAvailabilityFilter(option.value as 'all' | 'open' | 'closed')}
                          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            searchFilters.status === option.value
                              ? 'bg-orange-500 text-white shadow-sm'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                          }`}
                        >
                          {Icon && <Icon className="h-4 w-4 mr-1" />}
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Neighborhood Filter - Scrollable */}
                <div className="flex-1">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {southZoneNeighborhoods.map((neighborhood) => (
                      <button
                        key={neighborhood}
                        onClick={() => handleLocationFilter(neighborhood)}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          searchFilters.location === neighborhood
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {neighborhood}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display - Compact */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchFilters.query && (
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <Search className="h-3 w-3 mr-1" />
                  "{searchFilters.query}"
                </span>
              )}
              {searchFilters.status !== 'all' && (
                <span className={`px-3 py-1 rounded-full text-sm flex items-center ${
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
              {searchFilters.location && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {searchFilters.location}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search Tips - Simplified */}
        {searchFilters.query === '' && !hasActiveFilters && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">{t('search.tips.title')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-blue-800">
              <div className="flex items-center">
                <Hash className="h-4 w-4 mr-2 text-blue-600" />
                <span>{t('search.tips.number')}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                <span>{t('search.tips.beach')}</span>
              </div>
              <div className="flex items-center">
                <Search className="h-4 w-4 mr-2 text-blue-600" />
                <span>{t('search.tips.name')}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                <span>{t('search.tips.filter')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredBarracas.length > 0 ? (
          <BarracaGrid barracas={filteredBarracas} />
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
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {t('discover.clearAllFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;