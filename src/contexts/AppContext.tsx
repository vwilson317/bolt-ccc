import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Barraca, WeatherData, SearchFilters, EmailSubscription } from '../types';
import { fetchBarracas } from '../data/mockData';
import { WeatherService } from '../services/weatherService';
import { BarracaService } from '../services/barracaService';
import { EmailService } from '../services/emailService';
import { WeatherOverrideService, WeatherOverride } from '../services/weatherOverrideService';

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
  selectedBarraca: Barraca | null;
  openBarracaModal: (barraca: Barraca) => void;
  closeBarracaModal: () => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  addBarraca: (barraca: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Barraca>;
  updateBarraca: (id: string, updates: Partial<Barraca>) => Promise<Barraca>;
  setWeatherOverride: (override: boolean) => Promise<void>;
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
    locations: [],
    status: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailSubscriptions, setEmailSubscriptions] = useState<EmailSubscription[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [weatherOverride, setWeatherOverride] = useState(false);
  const [overrideExpiry, setOverrideExpiry] = useState<Date | null>(null);
  const [selectedBarraca, setSelectedBarraca] = useState<Barraca | null>(null);

  // Load barracas from database on mount
  useEffect(() => {
    const loadBarracas = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Loading barracas...');
        const fetchedBarracas = await fetchBarracas();
        console.log('📊 Fetched barracas:', fetchedBarracas.length, fetchedBarracas.map(b => b.id));
        
        // Sort barracas: partnered first, then non-partnered, with location sorting within each group
        fetchedBarracas.sort((a, b) => {
          // First, sort by partnered status (partnered first)
          if (a.partnered !== b.partnered) {
            return a.partnered ? -1 : 1;
          }
          // Then, sort by location within each group
          return a.location.localeCompare(b.location);
        });
        
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

  // Load weather override status from database on mount
  useEffect(() => {
    const loadWeatherOverride = async () => {
      try {
        const override = await WeatherOverrideService.getStatus();
        setWeatherOverride(override.is_active);
        setOverrideExpiry(override.expires_at);
      } catch (error) {
        console.error('Failed to load weather override status:', error);
        // Keep default values if loading fails
      }
    };

    loadWeatherOverride();
  }, []);

  // Enhanced filter logic for comprehensive search
  const filteredBarracas = barracas.filter(barraca => {
    // Text search: name, barraca number, location
    const searchQuery = searchFilters.query.toLowerCase();
    const matchesQuery = searchQuery === '' || 
      barraca.name.toLowerCase().includes(searchQuery) ||
      (barraca.barracaNumber && barraca.barracaNumber.toLowerCase().includes(searchQuery)) ||
      barraca.location.toLowerCase().includes(searchQuery);
    
    // Status filter (all, open, closed) - respect weather override
    const effectiveIsOpen = weatherOverride ? false : barraca.isOpen;
    const matchesStatus = searchFilters.status === 'all' ||
      (searchFilters.status === 'open' && effectiveIsOpen) ||
      (searchFilters.status === 'closed' && !effectiveIsOpen);
    
    // Legacy openNow filter (for backward compatibility)
    const matchesOpenNow = !searchFilters.openNow || effectiveIsOpen;
    
    // Location filter (neighborhood) - support both single and multiple locations
    const matchesLocation = 
      searchFilters.location === '' && searchFilters.locations.length === 0 ||
      (searchFilters.location !== '' && barraca.location.toLowerCase().includes(searchFilters.location.toLowerCase())) ||
      (searchFilters.locations.length > 0 && searchFilters.locations.some(loc => 
        barraca.location.toLowerCase().includes(loc.toLowerCase())
      ));

    return matchesQuery && matchesStatus && matchesOpenNow && matchesLocation;
  }).sort((a, b) => {
    // Maintain the same sorting: partnered first, then non-partnered, with location sorting within each group
    if (a.partnered !== b.partnered) {
      return a.partnered ? -1 : 1;
    }
    return a.location.localeCompare(b.location);
  });

  // Load weather data on mount
  useEffect(() => {
    refreshWeather();
  }, []);

  // Subscribe to weather override changes (real-time)
  useEffect(() => {
    const subscription = WeatherOverrideService.subscribeToChanges((payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const newOverride = payload.new;
        setWeatherOverride(newOverride.is_active);
        setOverrideExpiry(newOverride.expires_at ? new Date(newOverride.expires_at) : null);
      } else if (payload.eventType === 'DELETE') {
        setWeatherOverride(false);
        setOverrideExpiry(null);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check for weather override expiry every minute
  useEffect(() => {
    if (!weatherOverride || !overrideExpiry) return;
    
    const checkExpiry = async () => {
      if (new Date() >= overrideExpiry) {
        console.log('🌅 Weather override expired at midnight, reverting to normal display');
        try {
          await WeatherOverrideService.clearExpired();
          // Don't set state here; let the real-time subscription update state
        } catch (error) {
          console.error('Failed to clear expired weather override:', error);
        }
      }
    };
    
    // Check immediately
    checkExpiry();
    
    // Set up interval
    const interval = setInterval(checkExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [overrideExpiry]); // Remove weatherOverride from dependencies to prevent loops
  const updateSearchFilters = useCallback((filters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const addBarraca = useCallback(async (barracaData: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBarraca = await BarracaService.create(barracaData);
      setBarracas(prev => [...prev, newBarraca]);
      return newBarraca;
    } catch (error) {
      console.error('Failed to add barraca:', error);
      throw error;
    }
  }, []);

  const updateBarraca = useCallback(async (id: string, updates: Partial<Barraca>) => {
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
  }, []);

  const deleteBarraca = useCallback(async (id: string) => {
    try {
      await BarracaService.delete(id);
      setBarracas(prev => prev.filter(barraca => barraca.id !== id));
    } catch (error) {
      console.error('Failed to delete barraca:', error);
      throw error;
    }
  }, []);

  const handleSetWeatherOverride = useCallback(async (override: boolean) => {
    try {
      let expiryDate: Date | undefined;
      
      if (override) {
        // Set expiry to next midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        expiryDate = tomorrow;
      }

      const success = await WeatherOverrideService.setStatus(override, expiryDate);
      
      if (success) {
        setWeatherOverride(override);
        setOverrideExpiry(expiryDate || null);
      }
    } catch (error) {
      console.error('Failed to set weather override:', error);
      throw error;
    }
  }, []);
  const subscribeEmail = useCallback(async (email: string): Promise<boolean> => {
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
  }, []);

  const checkEmailSubscription = useCallback(async (email: string): Promise<boolean> => {
    try {
      const subscription = await EmailService.getByEmail(email);
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check email subscription:', error);
      return false;
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Mock admin authentication
    if (email === 'admin@cariocacoastal.com' && password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
  }, []);

  const refreshWeather = useCallback(async () => {
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
  }, []);

  const openBarracaModal = useCallback((barraca: Barraca) => {
    setSelectedBarraca(barraca);
  }, []);

  const closeBarracaModal = useCallback(() => {
    setSelectedBarraca(null);
  }, []);

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
    selectedBarraca,
    openBarracaModal,
    closeBarracaModal,
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