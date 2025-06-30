import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WeatherData } from '../types';
import { WeatherService } from '../services/weatherService';
import { useApp } from './AppContext';

interface WeatherContextType {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
  getWeatherForLocation: (location: string) => Promise<WeatherData>;
  weatherByLocation: Record<string, WeatherData>;
  lastUpdated: Date | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

interface WeatherProviderProps {
  children: ReactNode;
  refreshInterval?: number; // in milliseconds
}

export const WeatherProvider: React.FC<WeatherProviderProps> = ({ 
  children, 
  refreshInterval = 15 * 60 * 1000 // 15 minutes default
}) => {
  const { barracas } = useApp();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherByLocation, setWeatherByLocation] = useState<Record<string, WeatherData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load weather data for Rio de Janeiro on mount
  useEffect(() => {
    refreshWeather();
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      refreshWeather();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Load weather data for all unique barraca locations
  useEffect(() => {
    if (barracas.length > 0) {
      loadWeatherForBarracaLocations();
    }
  }, [barracas]);

  const refreshWeather = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const weatherData = await WeatherService.getCurrentWeather();
      setWeather(weatherData);
      setLastUpdated(new Date());
      
      // Update weather-dependent barracas if needed
      if (weatherData) {
        const updatedCount = await WeatherService.updateWeatherDependentBarracas();
        if (updatedCount > 0) {
          console.log(`🌤️ Updated ${updatedCount} weather-dependent barracas based on conditions`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      setError('Failed to load weather data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherForLocation = async (location: string): Promise<WeatherData> => {
    try {
      // Check if we already have weather for this location
      if (weatherByLocation[location] && lastUpdated) {
        const now = new Date();
        const minutesSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60);
        
        // Return cached data if it's less than 15 minutes old
        if (minutesSinceUpdate < 15) {
          return weatherByLocation[location];
        }
      }
      
      // Otherwise fetch fresh data
      const weatherData = await WeatherService.getCurrentWeather(location);
      
      // Update the cache
      setWeatherByLocation(prev => ({
        ...prev,
        [location]: weatherData
      }));
      
      return weatherData;
    } catch (error) {
      console.error(`Failed to fetch weather for ${location}:`, error);
      throw new Error(`Failed to load weather for ${location}`);
    }
  };

  const loadWeatherForBarracaLocations = async () => {
    try {
      // Get unique locations
      const locations = [...new Set(barracas.map(b => b.location))];
      
      if (locations.length === 0) return;
      
      // Fetch weather for all locations
      const weatherData = await WeatherService.getWeatherForLocations(locations);
      setWeatherByLocation(weatherData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch weather for locations:', error);
    }
  };

  const value: WeatherContextType = {
    weather,
    isLoading,
    error,
    refreshWeather,
    getWeatherForLocation,
    weatherByLocation,
    lastUpdated
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};