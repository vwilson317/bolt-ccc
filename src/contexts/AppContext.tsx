import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Barraca, WeatherData, SearchFilters, EmailSubscription } from '../types';
import { mockBarracas } from '../data/mockData';
import { WeatherService } from '../services/weatherService';

interface AppContextType {
  barracas: Barraca[];
  filteredBarracas: Barraca[];
  weather: WeatherData | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  isAdmin: boolean;
  emailSubscriptions: EmailSubscription[];
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  addBarraca: (barraca: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBarraca: (id: string, updates: Partial<Barraca>) => void;
  deleteBarraca: (id: string) => void;
  subscribeEmail: (email: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  refreshWeather: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [barracas, setBarracas] = useState<Barraca[]>(mockBarracas);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    openNow: false,
    location: '',
    status: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailSubscriptions, setEmailSubscriptions] = useState<EmailSubscription[]>([]);

  // Enhanced filter logic for comprehensive search
  const filteredBarracas = barracas.filter(barraca => {
    // Text search: name, barraca number, location
    const searchQuery = searchFilters.query.toLowerCase();
    const matchesQuery = searchQuery === '' || 
      barraca.name.toLowerCase().includes(searchQuery) ||
      (barraca.barracaNumber && barraca.barracaNumber.toLowerCase().includes(searchQuery)) ||
      barraca.location.toLowerCase().includes(searchQuery);
    
    // Status filter (all, open, closed)
    const matchesStatus = searchFilters.status === 'all' ||
      (searchFilters.status === 'open' && barraca.isOpen) ||
      (searchFilters.status === 'closed' && !barraca.isOpen);
    
    // Legacy openNow filter (for backward compatibility)
    const matchesOpenNow = !searchFilters.openNow || barraca.isOpen;
    
    // Location filter (neighborhood)
    const matchesLocation = searchFilters.location === '' ||
      barraca.location.toLowerCase().includes(searchFilters.location.toLowerCase());

    return matchesQuery && matchesStatus && matchesOpenNow && matchesLocation;
  });

  // Load weather data on mount
  useEffect(() => {
    refreshWeather();
  }, []);

  const updateSearchFilters = (filters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  const addBarraca = (barracaData: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBarraca: Barraca = {
      ...barracaData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBarracas(prev => [...prev, newBarraca]);
  };

  const updateBarraca = (id: string, updates: Partial<Barraca>) => {
    setBarracas(prev => prev.map(barraca => 
      barraca.id === id 
        ? { ...barraca, ...updates, updatedAt: new Date() }
        : barraca
    ));
  };

  const deleteBarraca = (id: string) => {
    setBarracas(prev => prev.filter(barraca => barraca.id !== id));
  };

  const subscribeEmail = async (email: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const subscription: EmailSubscription = {
        email,
        subscribedAt: new Date(),
        preferences: {
          newBarracas: true,
          specialOffers: true
        }
      };
      
      setEmailSubscriptions(prev => [...prev, subscription]);
      return true;
    } catch (error) {
      return false;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    // Mock admin authentication
    if (email === 'admin@cariocacoastal.com' && password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
  };

  const refreshWeather = async () => {
    setIsLoading(true);
    try {
      const weatherData = await WeatherService.getCurrentWeather();
      setWeather(weatherData);
      
      // Update weather-dependent barracas if needed
      if (weatherData) {
        const updatedCount = await WeatherService.updateWeatherDependentBarracas();
        if (updatedCount > 0) {
          console.log(`🌤️ Updated ${updatedCount} weather-dependent barracas based on conditions`);
          
          // Refresh barracas from database (mock implementation)
          // In a real app, this would fetch from the database
          setBarracas(prev => prev.map(barraca => {
            if (barraca.weatherDependent) {
              // Update open status based on weather conditions
              const shouldBeOpen = 
                weatherData.beachConditions === 'excellent' || 
                weatherData.beachConditions === 'good';
              
              if (barraca.isOpen !== shouldBeOpen) {
                return {
                  ...barraca,
                  isOpen: shouldBeOpen,
                  updatedAt: new Date()
                };
              }
            }
            return barraca;
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AppContextType = {
    barracas,
    filteredBarracas,
    weather,
    searchFilters,
    isLoading,
    isAdmin,
    emailSubscriptions,
    updateSearchFilters,
    addBarraca,
    updateBarraca,
    deleteBarraca,
    subscribeEmail,
    adminLogin,
    adminLogout,
    refreshWeather
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};