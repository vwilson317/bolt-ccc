import React from 'react';
import { useTranslation } from 'react-i18next';
import { Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';

const WeatherBar: React.FC = () => {
  const { t } = useTranslation();
  const { weather, isLoading, refreshWeather } = useWeather();

  if (!weather) return null;

  const getBeachConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBeachConditionText = (condition: string) => {
    return t(`weather.conditions.${condition}`);
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          {/* Weather Info */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Thermometer className="h-4 w-4" />
              <span className="font-medium">{weather.temperature}°C</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1">
              <Droplets className="h-4 w-4" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Wind className="h-4 w-4" />
              <span>{weather.windSpeed} km/h</span>
            </div>
          </div>

          {/* Beach Conditions */}
          <div className="flex items-center space-x-3">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getBeachConditionColor(weather.beachConditions)}`}>
              <div className="w-2 h-2 rounded-full bg-white mr-2" />
              {weather.beachConditions.charAt(0).toUpperCase() + weather.beachConditions.slice(1)}
            </div>
            <button
              onClick={refreshWeather}
              disabled={isLoading}
              className="p-1 rounded hover:bg-white/20 transition-colors disabled:opacity-50"
              title={t('common.retry')}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherBar;