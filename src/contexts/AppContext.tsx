import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Barraca, WeatherData, SearchFilters, EmailSubscription } from '../types';
import { fetchBarracas } from '../data/mockData';
import { WeatherService } from '../services/weatherService';
import { BarracaService } from '../services/barracaService';
import { EmailService } from '../services/emailService';

interface AppContextType {
  barracas: Barraca[];
  filteredBarracas: Barraca[];
  weather: WeatherData | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  isAdmin: boolean;
  emailSubscriptions: EmailSubscription[];
  currentLanguage?: string;
  weatherOverride: boolean;
  overrideExpiry: Date | null;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  addBarraca: (barraca: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Barraca>;
  updateBarraca: (id: string, updates: Partial<Barraca>) => Promise<Barraca>;
  setWeatherOverride: (override: boolean) => void;
  deleteBarraca: (id: string) => Promise<void>;
  subscribeEmail: (email: string) => Promise<boolean>;
  checkEmailSubscription: (email: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  refreshWeather: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export { AppContext };

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
  const [barracas, setBarracas] = useState<Barraca[]>([]);
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
  const [currentLanguage] = useState<string>('en');
  const [weatherOverride, setWeatherOverride] = useState(false);
  const [overrideExpiry, setOverrideExpiry] = useState<Date | null>(null);

  // Load barracas from database on mount
  useEffect(() => {
    const loadBarracas = async () => {
      setIsLoading(true);
      try {
        const fetchedBarracas = await fetchBarracas();
        fetchedBarracas.sort((a, b) => a.location.localeCompare(b.location));
        setBarracas(fetchedBarracas);
      } catch (error) {
        console.error('Failed to load barracas:', error);
        // Keep empty array if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadBarracas();
  }, []);

  // Load email subscriptions from database on mount
  useEffect(() => {
    const loadEmailSubscriptions = async () => {
      try {
        const subscriptions = await EmailService.getActiveSubscriptions();
        setEmailSubscriptions(subscriptions);
      } catch (error) {
        console.error('Failed to load email subscriptions:', error);
        // Keep empty array if loading fails
      }
    };

    loadEmailSubscriptions();
  }, []);

  // Enhanced filter logic for comprehensive search
  const filteredBarracas = barracas.filter(barraca => {
    // Apply weather override - if active, show all barracas as closed
    const effectiveIsOpen = weatherOverride ? false : barraca.isOpen;
    
    // Text search: name, barraca number, location
    const searchQuery = searchFilters.query.toLowerCase();
    const matchesQuery = searchQuery === '' || 
      barraca.name.toLowerCase().includes(searchQuery) ||
      (barraca.barracaNumber && barraca.barracaNumber.toLowerCase().includes(searchQuery)) ||
      barraca.location.toLowerCase().includes(searchQuery);
    
    // Status filter (all, open, closed)
    const matchesStatus = searchFilters.status === 'all' ||
      (searchFilters.status === 'open' && effectiveIsOpen) ||
      (searchFilters.status === 'closed' && !effectiveIsOpen);
    
    // Legacy openNow filter (for backward compatibility)
    const matchesOpenNow = !searchFilters.openNow || effectiveIsOpen;
    
    // Location filter (neighborhood)
    const matchesLocation = searchFilters.location === '' ||
      barraca.location.toLowerCase().includes(searchFilters.location.toLowerCase());

    return matchesQuery && matchesStatus && matchesOpenNow && matchesLocation;
  });

  // Load weather data on mount
  useEffect(() => {
    refreshWeather();
  }, []);

  // Check for weather override expiry every minute
  useEffect(() => {
    const checkExpiry = () => {
      if (weatherOverride && overrideExpiry && new Date() >= overrideExpiry) {
        console.log('🌅 Weather override expired at midnight, reverting to normal display');
        setWeatherOverride(false);
        setOverrideExpiry(null);
      }
    };

    // Check immediately
    checkExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiry, 60000);

    return () => clearInterval(interval);
  }, [weatherOverride, overrideExpiry]);

  const updateSearchFilters = (filters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  const addBarraca = async (barracaData: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBarraca = await BarracaService.create(barracaData);
      setBarracas(prev => [...prev, newBarraca]);
      return newBarraca;
    } catch (error) {
      console.error('Failed to add barraca:', error);
      throw error;
    }
  };

  const updateBarraca = async (id: string, updates: Partial<Barraca>) => {
    try {
      const updatedBarraca = await BarracaService.update(id, updates);
      setBarracas(prev => prev.map(barraca => 
        barraca.id === id ? updatedBarraca : barraca
      ));
      return updatedBarraca;
    } catch (error) {
      console.error('Failed to update barraca:', error);
      throw error;
    }
  };

  const deleteBarraca = async (id: string) => {
    try {
      await BarracaService.delete(id);
      setBarracas(prev => prev.filter(barraca => barraca.id !== id));
    } catch (error) {
      console.error('Failed to delete barraca:', error);
      throw error;
    }
  };

  const handleSetWeatherOverride = (override: boolean) => {
    setWeatherOverride(override);
    
    if (override) {
      // Set expiry to next midnight
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      setOverrideExpiry(tomorrow);
    } else {
      setOverrideExpiry(null);
    }
  };

  const subscribeEmail = async (email: string): Promise<boolean> => {
    try {
      const success = await EmailService.subscribe(email);
      if (success) {
        // Refresh email subscriptions from database
        const subscriptions = await EmailService.getActiveSubscriptions();
        setEmailSubscriptions(subscriptions);
      }
      return success;
    } catch (error) {
      console.error('Failed to subscribe email:', error);
      return false;
    }
  };

  const checkEmailSubscription = async (email: string): Promise<boolean> => {
    try {
      const subscription = await EmailService.getByEmail(email);
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check email subscription:', error);
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
          
          // Refresh barracas from database to get updated status
          try {
            const refreshedBarracas = await fetchBarracas();
            setBarracas(refreshedBarracas);
          } catch (error) {
            console.error('Failed to refresh barracas after weather update:', error);
          }
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
    currentLanguage,
    weatherOverride,
    overrideExpiry,
    updateSearchFilters,
    addBarraca,
    updateBarraca,
    setWeatherOverride: handleSetWeatherOverride,
    deleteBarraca,
    subscribeEmail,
    checkEmailSubscription,
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