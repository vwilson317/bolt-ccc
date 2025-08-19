import React from 'react';
import { Thermometer, Droplets, Wind, Cloud } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';
import { useApp } from '../contexts/AppContext';

export type WeatherMarqueeColorScheme = 'pink' | 'white';

interface WeatherMarqueeProps {
  colorScheme?: WeatherMarqueeColorScheme;
  className?: string;
  stickyOffsetClassName?: string; // e.g., 'top-16'
  useDefaultBorders?: boolean;
  useSolidIcons?: boolean; // New prop to control icon style
}

const WeatherMarquee: React.FC<WeatherMarqueeProps> = ({
  colorScheme = 'white',
  className = '',
  stickyOffsetClassName = 'top-16',
  useDefaultBorders = true
}) => {
  const { weather, weatherByLocation } = useWeather();
  const { barracas } = useApp();

  const baseBgClass = colorScheme === 'pink' ? 'bg-pink-500 text-white' : 'bg-white text-gray-800';
  const containerBorderClass = useDefaultBorders && colorScheme === 'white' ? 'border-y border-gray-100' : '';

  // Neighborhood names from database
  const neighborhoodNames = React.useMemo(() => {
    const names = [...new Set(barracas.map(b => b.location).filter(Boolean))] as string[];
    names.sort((a, b) => a.localeCompare(b));
    return names;
  }, [barracas]);

  const hasAnyWeather = Boolean(weather) || Object.keys(weatherByLocation).length > 0;
  if (!hasAnyWeather) return null;

  const renderSequence = (keyPrefix: string) => (
    <div className="marquee-content pr-8" key={keyPrefix}>
      {neighborhoodNames.map((loc) => {
        const w = weatherByLocation[loc] || weather;
        return (
          <div className="flex items-center gap-3 mr-6" key={`${keyPrefix}-${loc}`}>
            <div className="flex items-center gap-0.5 text-sm font-semibold">
              <i className={`fa fa-map-marker h-4 w-4 ${colorScheme === 'pink' ? 'text-white' : 'text-pink-500'}`} aria-hidden="true"></i>
              <span className={`truncate ${colorScheme === 'pink' ? 'text-white' : 'text-pink-500'}`} data-lingo-skip>{loc}</span>
            </div>
            <div className="flex items-center gap-1 text-sm opacity-95">
              <Thermometer className="h-4 w-4" />
              <span data-lingo-skip>{w ? `${w.temperature}°C` : '—'}</span>
            </div>
            <div className="flex items-center gap-1 text-sm opacity-95">
              <Droplets className="h-4 w-4" />
              <span data-lingo-skip>{w ? `${w.humidity}%` : '—'}</span>
            </div>
            <div className="flex items-center gap-1 text-sm opacity-95">
              <Wind className="h-4 w-4" />
              <span data-lingo-skip>{w ? `${w.windSpeed} km/h` : '—'}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-sm opacity-95">
              <Cloud className="h-4 w-4" />
              <span className="truncate max-w-[12rem]" data-lingo-skip>{w ? w.description : '—'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className={`sticky ${stickyOffsetClassName} z-30 ${baseBgClass} ${containerBorderClass} ${className} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 marquee-container">
        <div className="marquee-track py-2">
          {renderSequence('A')}
          {renderSequence('B')}
        </div>
      </div>
    </div>
  );
};

export default WeatherMarquee;


