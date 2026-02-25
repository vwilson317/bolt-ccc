import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Barraca, WeatherData, SearchFilters, EmailSubscription } from '../types';
// import { fetchBarracas } from '../data/mockData';
import { WeatherService } from '../services/weatherService';
import { BarracaService } from '../services/barracaService';
import { EmailService } from '../services/emailService';
// Firebase messaging removed
// NotificationService removed with push messaging
// @ts-expect-error: If types are missing for uuid, install @types/uuid or add a declaration file
import { v4 as uuidv4 } from 'uuid';
// Firestore removed
// import { getEffectiveOpenStatus } from '../utils/environmentUtils';

// Firebase removed

interface AppContextType {
  barracas: Barraca[];
  weather: WeatherData | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  isInitialLoading: boolean;
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
  refreshWeather: () => Promise<void>;
  refreshBarracas: () => Promise<void>;
  firestoreConnected: boolean;
  barracaStatuses: Map<string, any>;
  // New Infinite Scroll
  page: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  totalBarracas: number;
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

export const AppProvider: React.FC<AppProviderProps> = ({ children }: AppProviderProps) => {
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // New infinite scroll state
  const [page, setPage] = useState(1);
  const [totalBarracas, setTotalBarracas] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  

  
  const [emailSubscriptions, setEmailSubscriptions] = useState<EmailSubscription[]>([]);
  const [currentLanguage] = useState<string>('en');
  const weatherOverride = false;
  const overrideExpiry: Date | null = null;
  const [selectedBarraca, setSelectedBarraca] = useState<Barraca | null>(null);
  // Push messaging removed
  const [barracaStatuses] = useState<Map<string, any>>(new Map());
  const [firestoreConnected] = useState(false);

  // Enhanced barraca fetching with Firestore status and pagination
  const fetchBarracasWithStatus = useCallback(async (page: number = 1): Promise<{ barracas: Barraca[], total: number }> => {
    try {
      // Convert search filters to service filters
      const serviceFilters = {
        query: searchFilters.query || undefined,
        location: searchFilters.location || undefined,
        locations: searchFilters.locations.length > 0 ? searchFilters.locations : undefined,
        status: searchFilters.status,
        rating: searchFilters.rating
      };

      const result = await BarracaService.getAll(page, 12, serviceFilters);
      
      return {
        barracas: result.barracas,
        total: result.total
      };
    } catch (error) {
      console.error('Error fetching barracas with status:', error);
      throw error;
    }
  }, [barracaStatuses, searchFilters]);

  // Initial barraca fetching without dependencies for app initialization
  const fetchInitialBarracas = useCallback(async (): Promise<{ barracas: Barraca[], total: number }> => {
    try {
      // Use default filters for initial load
      const serviceFilters = {
        query: undefined,
        location: undefined,
        locations: undefined,
        status: 'all' as const,
        rating: undefined
      };

      const result = await BarracaService.getAll(1, 12, serviceFilters);
      
      // Don't overlay Firestore status for initial load - it will be handled later
      return {
        barracas: result.barracas,
        total: result.total
      };
    } catch (error) {
      console.error('Error fetching initial barracas:', error);
      throw error;
    }
  }, []);



  // Comprehensive initial loading effect
  useEffect(() => {
    const initializeApp = async () => {
      setIsInitialLoading(true);
      setIsLoading(true);
      
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Initial loading timeout reached, forcing app to load');
        setIsLoading(false);
        setIsInitialLoading(false);
      }, 15000); // 15 second timeout
      
      try {
        // Load all initial data in parallel
        const [barracasResult, emailSubscriptions] = await Promise.allSettled([
          (async () => {
            let retries = 0;
            const maxRetries = 3;
            
            while (retries < maxRetries) {
              try {
                console.log('🔄 Loading barracas from Supabase...');
                const result = await fetchInitialBarracas();
                setBarracas(result.barracas);
                setTotalBarracas(result.total);
                setPage(1);
                setHasMore(result.barracas.length < result.total);
                console.log('✅ Barracas loaded from Supabase');
                return result;
              } catch (error) {
                retries++;
                console.error(`Failed to load barracas (attempt ${retries}/${maxRetries}):`, error);
                
                if (retries >= maxRetries) {
                  console.error('Max retries reached for loading barracas');
                  throw error;
                } else {
                  await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                }
              }
            }
          })(),
          EmailService.getActiveSubscriptions()
        ]);

        // Handle email subscriptions result
        if (emailSubscriptions.status === 'fulfilled') {
          setEmailSubscriptions(emailSubscriptions.value);
        } else {
          console.error('Failed to load email subscriptions:', emailSubscriptions.reason);
        }

        console.log('✅ Initial app data loaded');
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
        setIsInitialLoading(false);
      }
    };

    initializeApp();
  }, [fetchInitialBarracas]);



  // Firestore subscriptions and overlays removed

  // Load weather data on mount
  useEffect(() => {
    refreshWeather();
  }, []);

  const updateSearchFilters = useCallback((filters: Partial<SearchFilters>) => {
    setSearchFilters((prev: SearchFilters) => ({ ...prev, ...filters }));
  }, []);

  // Refetch data when search filters change
  useEffect(() => {
    const refetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchBarracasWithStatus(1);
        setBarracas(result.barracas);
        setTotalBarracas(result.total);
        setPage(1);
        setHasMore(result.barracas.length < result.total);
      } catch (error) {
        console.error('Failed to refetch data with new filters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    refetchData();
  }, [searchFilters, fetchBarracasWithStatus]);

  const addBarraca = useCallback(async (barracaData: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBarraca = await BarracaService.create(barracaData);
      setBarracas((prev: Barraca[]) => [...prev, newBarraca]);
      
      return newBarraca;
    } catch (error) {
      console.error('Failed to add barraca:', error);
      throw error;
    }
  }, []);

  const updateBarraca = useCallback(async (id: string, updates: Partial<Barraca>) => {
    try {
      const updatedBarraca = await BarracaService.update(id, updates);
      setBarracas((prev: Barraca[]) => prev.map((barraca: Barraca) => 
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
      setBarracas((prev: Barraca[]) => prev.filter((barraca: Barraca) => barraca.id !== id));
      
      // Note: Firestore cleanup would be handled by the external app or admin panel
    } catch (error) {
      console.error('Failed to delete barraca:', error);
      throw error;
    }
  }, []);

  // Weather override is no longer active; this is kept for API compatibility
  const handleSetWeatherOverride = useCallback(async (_override: boolean) => {
    // No-op: open/closed is determined solely by time window (07:00–18:00)
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



  const refreshWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      const weatherData = await WeatherService.getCurrentWeather();
      setWeather(weatherData);
      
      // Update weather-dependent barracas if needed
      if (weatherData) {
        const updatedCount = await WeatherService.updateWeatherDependentBarracas();
        if (updatedCount > 0) {
          // Refresh barracas from database to get updated status
          try {
            const result = await fetchBarracasWithStatus(1);
            setBarracas(result.barracas);
            setTotalBarracas(result.total);
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
  }, [fetchBarracasWithStatus]);

  const openBarracaModal = useCallback((barraca: Barraca) => {
    setSelectedBarraca(barraca);
  }, []);

  const closeBarracaModal = useCallback(() => {
    setSelectedBarraca(null);
  }, []);



  // New infinite scroll loadMore function with retry mechanism
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const nextPageNum = page + 1;
        const result = await fetchBarracasWithStatus(nextPageNum);
        
        // Append new barracas to existing ones
        setBarracas((prev: Barraca[]) => [...prev, ...result.barracas]);
        setTotalBarracas(result.total);
        setPage(nextPageNum);
        setHasMore(result.barracas.length > 0 && (page * 12 + result.barracas.length) < result.total);
        break; // Success, exit retry loop
      } catch (error) {
        retries++;
        console.error(`Failed to load more barracas (attempt ${retries}/${maxRetries}):`, error);
        
        if (retries >= maxRetries) {
          console.error('Max retries reached for loading more barracas');
          // Could show a user-friendly error message here
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
    
    setIsLoading(false);
  }, [isLoading, hasMore, page, fetchBarracasWithStatus]);



  // Update the existing refreshBarracas function
  const refreshBarracas = useCallback(async () => {
    try {
      console.log('🔄 Refreshing barracas from Supabase...');
      const result = await fetchBarracasWithStatus(1);
      
      setBarracas(result.barracas);
      setTotalBarracas(result.total);
      setPage(1);
      setHasMore(result.barracas.length < result.total);
      console.log('✅ Barracas refreshed from Supabase');
    } catch (error) {
      console.error('Failed to refresh barracas:', error);
      throw error;
    }
  }, [fetchBarracasWithStatus]);

  // Push messaging removed

  const value: AppContextType = {
    barracas,
    weather,
    searchFilters,
    isLoading,
    isInitialLoading,
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
    refreshWeather,
    refreshBarracas,
    firestoreConnected,
    barracaStatuses,
    // New Infinite Scroll
    page,
    hasMore,
    loadMore,
    totalBarracas
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
