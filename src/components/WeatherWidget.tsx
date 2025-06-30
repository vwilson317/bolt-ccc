import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cloud, Droplets, Wind, Thermometer, RefreshCw } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';

const WeatherWidget: React.FC = () => {
  const { t } = useTranslation();
  const { weather, isLoading, refreshWeather } = useWeather();

  if (!weather) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-pulse">
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
    <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1" data-lingo-skip>Rio de Janeiro</h3>
          <p className="text-orange-100 text-sm" data-lingo-skip>{t('weather.current')}</p>
        </div>
        <button
          onClick={refreshWeather}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
          title={t('common.retry')}
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Temperature */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center mb-2">
            <Thermometer className="h-5 w-5 mr-2 text-orange-200" />
            <span className="text-sm text-orange-100" data-lingo-skip>Temperature</span>
          </div>
          <div className="text-3xl font-bold" data-lingo-skip>
            {weather.temperature}°C
          </div>
          <div className="text-sm text-orange-200" data-lingo-skip>
            {t('weather.feelsLike')} {weather.feelsLike}°C
          </div>
        </div>

        {/* Weather Details */}
        <div className="col-span-1 md:col-span-1 space-y-3">
          <div className="flex items-center">
            <Droplets className="h-4 w-4 mr-2 text-orange-200" />
            <span className="text-sm" data-lingo-skip>{t('weather.humidity')}: {weather.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Wind className="h-4 w-4 mr-2 text-orange-200" />
            <span className="text-sm" data-lingo-skip>{t('weather.wind')}: {weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center">
            <Cloud className="h-4 w-4 mr-2 text-orange-200" />
            <span className="text-sm" data-lingo-skip>{weather.description}</span>
          </div>
        </div>

        {/* Beach Conditions */}
        <div className="col-span-1 md:col-span-1">
          <div className="text-sm text-orange-100 mb-2" data-lingo-skip>
            {t('weather.barracaConditions')}
          </div>
          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium text-white ${getBeachConditionColor(weather.beachConditions)}`}>
            <div className="w-2 h-2 rounded-full bg-white mr-2" />
            {weather.beachConditions.charAt(0).toUpperCase() + weather.beachConditions.slice(1)}
          </div>
          <div className="text-xs text-orange-200 mt-1" data-lingo-skip>
            {getBeachConditionText(weather.beachConditions)}
          </div>
        </div>
      </div>

      {/* Beach Recommendation */}
      <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium mb-1" data-lingo-skip>
              {weather.beachConditions === 'excellent' || weather.beachConditions === 'good' 
                ? '🏖️ Perfect barraca day!' 
                : weather.beachConditions === 'fair'
                ? '⛅ Decent barraca conditions'
                : '🌧️ Consider indoor alternatives'
              }
            </p>
            <p className="text-sm text-orange-100" data-lingo-skip>
              {weather.beachConditions === 'excellent' || weather.beachConditions === 'good'
                ? 'Great weather for visiting your favorite barraca'
                : weather.beachConditions === 'fair'
                ? 'Still good for a quick barraca visit'
                : 'Check back later for better conditions'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;