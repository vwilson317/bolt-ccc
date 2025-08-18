import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Barraca, WeatherData, SearchFilters, EmailSubscription } from '../types';
import { fetchBarracas } from '../data/mockData';
import { WeatherService } from '../services/weatherService';
import { BarracaService } from '../services/barracaService';
import { EmailService } from '../services/emailService';
import { WeatherOverrideService, WeatherOverride } from '../services/weatherOverrideService';
import { getToken } from 'firebase/messaging';
import { NotificationService } from '../services/notificationService';
// @ts-expect-error: If types are missing for uuid, install @types/uuid or add a declaration file
import { v4 as uuidv4 } from 'uuid';
import { FirestoreService, type BarracaStatus } from '../services/firestoreService';
import { firebaseApp, messaging } from '../lib/firebase';

export { firebaseApp, messaging };

interface AppContextType {
  barracas: Barraca[];
  filteredBarracas: Barraca[];
  weather: WeatherData | null;
  searchFilters: SearchFilters;
  isLoading: boolean;
  isAdmin: boolean;
  isSpecialAdmin: boolean;
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
  refreshBarracas: () => Promise<void>;
  firestoreConnected: boolean;
  barracaStatuses: Map<string, BarracaStatus>;
  // Infinite Scroll
  allBarracas: Barraca[];
  hasMore: boolean;
  loadMore: () => Promise<void>;
  totalBarracas: number;
  isLoadingMore: boolean;
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
  
  // Infinite scroll state
  const [allBarracas, setAllBarracas] = useState<Barraca[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBarracas, setTotalBarracas] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Initialize admin state from localStorage
  const [isAdmin, setIsAdmin] = useState(() => {
    const savedAdminState = localStorage.getItem('admin_session');
    if (savedAdminState) {
      try {
        const parsed = JSON.parse(savedAdminState);
        // Check if session is still valid (24 hours)
        if (parsed.timestamp && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
          return parsed.isAdmin || false;
        }
      } catch (error) {
        console.warn('Error parsing admin session:', error);
      }
    }
    return false;
  });
  
  const [isSpecialAdmin, setIsSpecialAdmin] = useState(() => {
    const savedAdminState = localStorage.getItem('admin_session');
    if (savedAdminState) {
      try {
        const parsed = JSON.parse(savedAdminState);
        // Check if session is still valid (24 hours)
        if (parsed.timestamp && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
          return parsed.isSpecialAdmin || false;
        }
      } catch (error) {
        console.warn('Error parsing admin session:', error);
      }
    }
    return false;
  });
  
  const [emailSubscriptions, setEmailSubscriptions] = useState<EmailSubscription[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [weatherOverride, setWeatherOverride] = useState(false);
  const [overrideExpiry, setOverrideExpiry] = useState<Date | null>(null);
  const [selectedBarraca, setSelectedBarraca] = useState<Barraca | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => {
    let id = localStorage.getItem('session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('session_id', id);
    }
    // Always return a string
    return id || '';
  });
  const [barracaStatuses, setBarracaStatuses] = useState<Map<string, BarracaStatus>>(new Map());
  const [firestoreConnected, setFirestoreConnected] = useState(false);

  // Enhanced barraca fetching with Firestore status and pagination
  const fetchBarracasWithStatus = useCallback(async (page: number = currentPage): Promise<{ barracas: Barraca[], total: number }> => {
    try {
      // Convert search filters to service filters
      const serviceFilters = {
        query: searchFilters.query || undefined,
        location: searchFilters.location || undefined,
        locations: searchFilters.locations.length > 0 ? searchFilters.locations : undefined,
        status: searchFilters.status,
        rating: searchFilters.rating
      };

      const result = await BarracaService.getAll(page, pageSize, serviceFilters);
      
      // Overlay Firestore status on top of database data
      const barracasWithStatus = result.barracas.map(barraca => {
        const firestoreStatus = barracaStatuses.get(barraca.id);
        if (firestoreStatus) {
          return {
            ...barraca,
            isOpen: firestoreStatus.isOpen,
            manualStatus: firestoreStatus.manualStatus,
            specialAdminOverride: firestoreStatus.specialAdminOverride,
            specialAdminOverrideExpires: firestoreStatus.specialAdminOverrideExpires
          };
        }
        return barraca;
      });
      
      return {
        barracas: barracasWithStatus,
        total: result.total
      };
    } catch (error) {
      console.error('Error fetching barracas with status:', error);
      throw error;
    }
  }, [barracaStatuses, currentPage, pageSize, searchFilters]);

  // Utility function to check and clear expired admin sessions
  const checkAndClearExpiredSession = useCallback(() => {
    const savedAdminState = localStorage.getItem('admin_session');
    if (savedAdminState) {
      try {
        const parsed = JSON.parse(savedAdminState);
        // Check if session is expired (24 hours)
        if (parsed.timestamp && (Date.now() - parsed.timestamp) >= 24 * 60 * 60 * 1000) {
          localStorage.removeItem('admin_session');
          setIsAdmin(false);
          setIsSpecialAdmin(false);
          console.log('Admin session expired and cleared');
        }
      } catch (error) {
        console.warn('Error checking admin session:', error);
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  // Utility function to extend admin session
  const extendAdminSession = useCallback(() => {
    const savedAdminState = localStorage.getItem('admin_session');
    if (savedAdminState) {
      try {
        const parsed = JSON.parse(savedAdminState);
        const updatedSessionData = {
          ...parsed,
          timestamp: Date.now()
        };
        localStorage.setItem('admin_session', JSON.stringify(updatedSessionData));
      } catch (error) {
        console.warn('Error extending admin session:', error);
      }
    }
  }, []);

  // Check for expired sessions on mount
  useEffect(() => {
    checkAndClearExpiredSession();
  }, [checkAndClearExpiredSession]);

  // Set up periodic session check (every hour)
  useEffect(() => {
    const interval = setInterval(() => {
      checkAndClearExpiredSession();
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [checkAndClearExpiredSession]);

  // Load barracas from database on mount
  useEffect(() => {
    const loadBarracas = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Loading barracas from Supabase...');
        const result = await fetchBarracasWithStatus(1);
        
        setAllBarracas(result.barracas);
        setBarracas(result.barracas);
        setTotalBarracas(result.total);
        setHasMore(result.barracas.length === pageSize);
        console.log('✅ Barracas loaded from Supabase');
      } catch (error) {
        console.error('Failed to load barracas:', error);
        // Keep empty array if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadBarracas();
  }, [fetchBarracasWithStatus, pageSize]);

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

  // Initialize Firestore real-time subscriptions
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupFirestoreSubscriptions = async () => {
      try {
        // Subscribe to all barraca status updates
        unsubscribe = FirestoreService.subscribeToAllBarracaStatus((statuses) => {
          const statusMap = new Map<string, BarracaStatus>();
          statuses.forEach(status => {
            statusMap.set(status.barracaId, status);
          });
          setBarracaStatuses(statusMap);
          setFirestoreConnected(true);
        });

        console.log('✅ Firestore real-time subscriptions initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Firestore subscriptions:', error);
        setFirestoreConnected(false);
      }
    };

    setupFirestoreSubscriptions();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      FirestoreService.cleanup();
    };
  }, []);

  // With infinite scroll, filteredBarracas is all loaded barracas
  // Apply weather override to all loaded barracas
  const filteredBarracas = allBarracas.map(barraca => {
    if (weatherOverride) {
      return {
        ...barraca,
        isOpen: false
      };
    }
    return barraca;
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
    // Reset to page 1 when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage]);

  // Refetch data when search filters change
  useEffect(() => {
    const refetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchBarracasWithStatus(1);
        setAllBarracas(result.barracas);
        setBarracas(result.barracas);
        setTotalBarracas(result.total);
        setCurrentPage(1);
        setHasMore(result.barracas.length === pageSize);
      } catch (error) {
        console.error('Failed to refetch data with new filters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    refetchData();
  }, [searchFilters, fetchBarracasWithStatus, pageSize]);

  const addBarraca = useCallback(async (barracaData: Omit<Barraca, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Extend admin session if user is admin
      if (isAdmin || isSpecialAdmin) {
        extendAdminSession();
      }
      
      const newBarraca = await BarracaService.create(barracaData);
      setBarracas(prev => [...prev, newBarraca]);
      
      return newBarraca;
    } catch (error) {
      console.error('Failed to add barraca:', error);
      throw error;
    }
  }, [isAdmin, isSpecialAdmin, extendAdminSession]);

  const updateBarraca = useCallback(async (id: string, updates: Partial<Barraca>) => {
    try {
      // Extend admin session if user is admin
      if (isAdmin || isSpecialAdmin) {
        extendAdminSession();
      }
      
      const updatedBarraca = await BarracaService.update(id, updates);
      setBarracas(prev => prev.map(barraca => 
        barraca.id === id ? updatedBarraca : barraca
      ));
      
      return updatedBarraca;
    } catch (error) {
      console.error('Failed to update barraca:', error);
      throw error;
    }
  }, [isAdmin, isSpecialAdmin, extendAdminSession]);

  const deleteBarraca = useCallback(async (id: string) => {
    try {
      await BarracaService.delete(id);
      setBarracas(prev => prev.filter(barraca => barraca.id !== id));
      
      // Note: Firestore cleanup would be handled by the external app or admin panel
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
      setIsSpecialAdmin(false); // Ensure special admin is false
      
      // Save admin session to localStorage
      const sessionData = {
        isAdmin: true,
        isSpecialAdmin: false,
        timestamp: Date.now()
      };
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      
      return true;
    }
    // Special admin authentication
    if (email === 'special@cariocacoastal.com' && password === 'special123') {
      setIsAdmin(true);
      setIsSpecialAdmin(true); // Set special admin flag
      
      // Save admin session to localStorage
      const sessionData = {
        isAdmin: true,
        isSpecialAdmin: true,
        timestamp: Date.now()
      };
      localStorage.setItem('admin_session', JSON.stringify(sessionData));
      
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    setIsSpecialAdmin(false);
    
    // Clear admin session from localStorage
    localStorage.removeItem('admin_session');
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
            const result = await fetchBarracasWithStatus(currentPage);
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

  // Pagination functions
  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page > Math.ceil(totalBarracas / pageSize)) return;
    
    setCurrentPage(page);
    setIsLoading(true);
    
    try {
      const result = await fetchBarracasWithStatus(page);
      setBarracas(result.barracas);
      setTotalBarracas(result.total);
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [totalBarracas, pageSize, fetchBarracasWithStatus]);

  const nextPage = useCallback(() => {
    const nextPageNum = currentPage + 1;
    if (nextPageNum <= Math.ceil(totalBarracas / pageSize)) {
      goToPage(nextPageNum);
    }
  }, [currentPage, totalBarracas, pageSize, goToPage]);

  // Infinite scroll functions
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await fetchBarracasWithStatus(nextPage);
      
      setAllBarracas(prev => [...prev, ...result.barracas]);
      setCurrentPage(nextPage);
      setHasMore(result.barracas.length === pageSize);
    } catch (error) {
      console.error('Failed to load more barracas:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, currentPage, fetchBarracasWithStatus, pageSize]);

  // Update the existing refreshBarracas function
  const refreshBarracas = useCallback(async () => {
    try {
      // Extend admin session if user is admin
      if (isAdmin || isSpecialAdmin) {
        extendAdminSession();
      }
      
      console.log('🔄 Refreshing barracas from Supabase...');
      const result = await fetchBarracasWithStatus(currentPage);
      
      setBarracas(result.barracas);
      setTotalBarracas(result.total);
      console.log('✅ Barracas refreshed from Supabase');
    } catch (error) {
      console.error('Failed to refresh barracas:', error);
      throw error;
    }
  }, [isAdmin, isSpecialAdmin, extendAdminSession, fetchBarracasWithStatus, currentPage]);

  useEffect(() => {
    // Register service worker and get FCM token
    const setupFCM = async () => {
      if (!messaging) return;
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Get token using getToken from firebase/messaging
          const token = await getToken(messaging, { serviceWorkerRegistration: registration });
          setFcmToken(token);
        }
      } catch (err) {
        console.error('FCM setup error:', err);
      }
    };
    if ('serviceWorker' in navigator && messaging) {
      setupFCM();
    }
  }, [messaging]);

  useEffect(() => {
    // Save FCM token to Supabase when available
    if (fcmToken && sessionId && sessionId !== '') {
      NotificationService.saveToken(sessionId, fcmToken);
    }
  }, [fcmToken, sessionId]);

  const value: AppContextType = {
    barracas,
    filteredBarracas,
    weather,
    searchFilters,
    isLoading,
    isAdmin,
    isSpecialAdmin,
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
    refreshWeather,
    refreshBarracas,
    firestoreConnected,
    barracaStatuses,
    // Infinite Scroll
    allBarracas,
    hasMore,
    loadMore,
    totalBarracas,
    isLoadingMore
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};