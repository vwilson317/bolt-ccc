import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, Droplets, Wind, Thermometer, RefreshCw } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';

const WeatherWidget: React.FC = () => {
  const { t } = useTranslation();
  const { weather, isLoading, refreshWeather } = useWeather();

  if (!weather) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 animate-pulse">
        <div className="h-6 bg-white/20 rounded mb-4"></div>
        <div className="h-4 bg-white/20 rounded mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-2/3"></div>
      </div>
    );
  }

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
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold" data-lingo-skip>Rio de Janeiro</h3>
          <p className="text-blue-100 text-xs" data-lingo-skip>{t('weather.current')}</p>
        </div>
        <button
          onClick={refreshWeather}
          disabled={isLoading}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
          title={t('common.retry')}
          aria-label="Refresh weather data"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main temperature display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Thermometer className="h-5 w-5 mr-2 text-blue-200" />
          <div>
            <div className="text-3xl font-bold" data-lingo-skip>{weather.temperature}°C</div>
            <div className="text-xs text-blue-100" data-lingo-skip>
              {t('weather.feelsLike')} {weather.feelsLike}°C
            </div>
          </div>
        </div>
        
        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${getBeachConditionColor(weather.beachConditions)}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-white mr-1.5" />
          {weather.beachConditions.charAt(0).toUpperCase() + weather.beachConditions.slice(1)}
        </div>
      </div>

      {/* Weather details in compact grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center bg-white/10 rounded-md p-2">
          <Droplets className="h-3.5 w-3.5 mr-1.5 text-blue-200" />
          <span className="text-xs" data-lingo-skip>{weather.humidity}% {t('weather.humidity')}</span>
        </div>
        <div className="flex items-center bg-white/10 rounded-md p-2">
          <Wind className="h-3.5 w-3.5 mr-1.5 text-blue-200" />
          <span className="text-xs" data-lingo-skip>{weather.windSpeed} km/h</span>
        </div>
        <div className="flex items-center bg-white/10 rounded-md p-2 col-span-2">
          <Cloud className="h-3.5 w-3.5 mr-1.5 text-blue-200" />
          <span className="text-xs" data-lingo-skip>{weather.description}</span>
        </div>
      </div>

      {/* Beach recommendation - compact version */}
      <div className="bg-white/10 rounded-md p-3 text-sm">
        <p className="font-medium text-sm mb-1" data-lingo-skip>
          {weather.beachConditions === 'excellent' || weather.beachConditions === 'good' 
            ? '🏖️ Perfect barraca day!' 
            : weather.beachConditions === 'fair'
            ? '⛅ Decent conditions'
            : '🌧️ Consider alternatives'
          }
        </p>
        <p className="text-xs text-blue-100" data-lingo-skip>
          {getBeachConditionText(weather.beachConditions)}
        </p>
      </div>
    </div>
  );
};

export default WeatherWidget;