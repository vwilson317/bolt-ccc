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
  const [isSpecialAdmin, setIsSpecialAdmin] = useState(false);
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

  // Enhanced barraca fetching with Firestore status
  const fetchBarracasWithStatus = useCallback(async (): Promise<Barraca[]> => {
    try {
      const fetchedBarracas = await fetchBarracas();
      
      // Enhance barracas with real-time status from Firestore
      const enhancedBarracas = fetchedBarracas.map(barraca => {
        const firestoreStatus = barracaStatuses.get(barraca.id);
        
        if (firestoreStatus) {
          // Use Firestore status if available
          return {
            ...barraca,
            isOpen: firestoreStatus.isOpen,
            manualStatus: firestoreStatus.manualStatus,
            specialAdminOverride: firestoreStatus.specialAdminOverride,
            specialAdminOverrideExpires: firestoreStatus.specialAdminOverrideExpires
          };
        }
        
        // Fallback to database status
        return barraca;
      });

      return enhancedBarracas;
    } catch (error) {
      console.error('Failed to fetch barracas with status:', error);
      throw error;
    }
  }, [barracaStatuses]);

  // Sync barracas to Firestore when they're loaded
  const syncBarracasToFirestore = useCallback(async (barracas: Barraca[]) => {
    try {
      console.log('🔄 Syncing barracas to Firestore...');
      for (const barraca of barracas) {
        await FirestoreService.syncBarracaToFirestore(barraca);
      }
      console.log(`✅ Synced ${barracas.length} barracas to Firestore`);
    } catch (error) {
      console.error('Failed to sync barracas to Firestore:', error);
    }
  }, []);

  // Load barracas from database on mount
  useEffect(() => {
    const loadBarracas = async () => {
      setIsLoading(true);
      try {
        const fetchedBarracas = await fetchBarracasWithStatus();
        
        // Move barraca with barracaNumber '80' to the front if it exists
        const index80 = fetchedBarracas.findIndex(b => b.barracaNumber === '80');
        if (index80 > -1) {
          const [barraca80] = fetchedBarracas.splice(index80, 1);
          fetchedBarracas.unshift(barraca80);
        }
        
        // Sort barracas: partnered first, then non-partnered, with location sorting within each group
        fetchedBarracas.sort((a, b) => {
          // First, sort by partnered status (partnered first)
          if (a.partnered !== b.partnered) {
            return a.partnered ? -1 : 1;
          }
          // Then, sort by location within each group
          return a.location.localeCompare(b.location);
        });
        
        // Ensure barraca 80 stays first
        if (index80 > -1) {
          const indexAfterSort = fetchedBarracas.findIndex(b => b.barracaNumber === '80');
          if (indexAfterSort > 0) {
            const [barraca80] = fetchedBarracas.splice(indexAfterSort, 1);
            fetchedBarracas.unshift(barraca80);
          }
        }
        
        setBarracas(fetchedBarracas);
        
        // Sync to Firestore after loading
        await syncBarracasToFirestore(fetchedBarracas);
      } catch (error) {
        console.error('Failed to load barracas:', error);
        // Keep empty array if loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadBarracas();
  }, [fetchBarracasWithStatus, syncBarracasToFirestore]);

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

    // Rating filter
    const matchesRating = !searchFilters.rating || barraca.rating === searchFilters.rating;

    return matchesQuery && matchesStatus && matchesOpenNow && matchesLocation && matchesRating;
  }).sort((a, b) => {
    // Enhanced sorting: partnered first, then by rating (highest first), then by location
    if (a.partnered !== b.partnered) {
      return a.partnered ? -1 : 1;
    }
    
    // Sort by rating (highest first) if both have ratings
    if (a.rating && b.rating) {
      if (a.rating !== b.rating) {
        return b.rating - a.rating; // Higher rating first
      }
    } else if (a.rating && !b.rating) {
      return -1; // Rated barracas first
    } else if (!a.rating && b.rating) {
      return 1;
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
      
      // Sync new barraca to Firestore
      await FirestoreService.syncBarracaToFirestore(newBarraca);
      
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
      
      // Sync updated barraca to Firestore
      await FirestoreService.syncBarracaToFirestore(updatedBarraca);
      
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
      return true;
    }
    // Special admin authentication
    if (email === 'special@cariocacoastal.com' && password === 'special123') {
      setIsAdmin(true);
      setIsSpecialAdmin(true); // Set special admin flag
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    setIsSpecialAdmin(false);
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
            const refreshedBarracas = await fetchBarracasWithStatus();
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
  }, [fetchBarracasWithStatus]);

  const openBarracaModal = useCallback((barraca: Barraca) => {
    setSelectedBarraca(barraca);
  }, []);

  const closeBarracaModal = useCallback(() => {
    setSelectedBarraca(null);
  }, []);

  // Update the existing refreshBarracas function
  const refreshBarracas = useCallback(async () => {
    try {
      const fetchedBarracas = await fetchBarracasWithStatus();
      
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
      console.error('Failed to refresh barracas:', error);
      throw error;
    }
  }, [fetchBarracasWithStatus]);

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
    barracaStatuses
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};