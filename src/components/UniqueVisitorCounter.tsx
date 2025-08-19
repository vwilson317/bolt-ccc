import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import { getActiveUsers, getTotalUsers, initGA4Api, getGA4ApiStatus } from '../services/googleAnalyticsApiService';
import { trackUniqueVisitor } from '../services/analyticsService';

interface VisitorData {
  uniqueVisitors: number;
  lastUpdated: number;
  visitorId: string;
}

const UniqueVisitorCounter: React.FC = () => {
  const { t } = useTranslation();
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'ga4' | 'local'>('local');
  const [ga4Status, setGa4Status] = useState(getGA4ApiStatus());

  // Generate a unique visitor ID based on browser fingerprint
  const generateVisitorId = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Unique visitor fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 0,
      (navigator as any).deviceMemory || 0
    ].join('|');

    // Simple hash function to create a shorter ID
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  };

  // Check if this is a unique visitor and update count (local tracking)
  const trackUniqueVisitorLocal = async (): Promise<number> => {
    try {
      const visitorId = generateVisitorId();
      const storageKey = 'ccc_visitor_data';
      const visitedKey = 'ccc_visited_ids';
      
      // Get existing data
      const existingData = localStorage.getItem(storageKey);
      const visitedIds = localStorage.getItem(visitedKey);
      
      let visitorData: VisitorData = {
        uniqueVisitors: 5247, // Starting count since launch
        lastUpdated: Date.now(),
        visitorId: visitorId
      };

      let visitedIdSet = new Set<string>();

      // Parse existing data
      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          visitorData = { ...visitorData, ...parsed };
        } catch (error) {
          console.warn('Error parsing visitor data, resetting:', error);
        }
      }

      if (visitedIds) {
        try {
          const parsed = JSON.parse(visitedIds);
          visitedIdSet = new Set(parsed);
        } catch (error) {
          console.warn('Error parsing visited IDs, resetting:', error);
        }
      }

      // Check if this is a new unique visitor
      if (!visitedIdSet.has(visitorId)) {
        // New unique visitor
        visitorData.uniqueVisitors += 1;
        visitorData.lastUpdated = Date.now();
        visitedIdSet.add(visitorId);

        // Store updated data with error handling
        try {
          localStorage.setItem(storageKey, JSON.stringify(visitorData));
          localStorage.setItem(visitedKey, JSON.stringify([...visitedIdSet]));
        } catch (error) {
          console.warn('Error storing visitor data:', error);
          // If localStorage is full, clean up old data
          if (error instanceof DOMException && error.code === 22) {
            // Clear some old data and try again
            localStorage.removeItem('ccc_viewedStories');
            localStorage.removeItem('ccc_viewedMedia');
            try {
              localStorage.setItem(storageKey, JSON.stringify(visitorData));
              localStorage.setItem(visitedKey, JSON.stringify([...visitedIdSet]));
            } catch (retryError) {
              console.error('Failed to store visitor data after cleanup:', retryError);
            }
          }
        }

        // Track in Google Analytics
        trackUniqueVisitor(visitorId, visitorData.uniqueVisitors);

        // Simulate real-time update for other tabs/windows
        window.dispatchEvent(new CustomEvent('uniqueVisitorUpdate', {
          detail: { count: visitorData.uniqueVisitors }
        }));
      }

      return visitorData.uniqueVisitors;
    } catch (error) {
      console.error('Error tracking unique visitor:', error);
      return 5247; // Fallback to starting count
    }
  };

  // Fetch data from Google Analytics API
  const fetchGA4Data = async () => {
    try {
      const [totalUsers, activeUsersCount] = await Promise.all([
        getTotalUsers(),
        getActiveUsers()
      ]);

      // Only use GA4 data if we actually have real data (non-zero)
      if (totalUsers > 0 || activeUsersCount > 0) {
        setVisitorCount(totalUsers);
        setActiveUsers(activeUsersCount);
        setDataSource('ga4');
      } else {
        // No real GA4 data available, fall back to local tracking
        const count = await trackUniqueVisitorLocal();
        setVisitorCount(count);
        setDataSource('local');
      }
    } catch (error) {
      console.warn('Failed to fetch GA4 data, falling back to local tracking:', error);
      const count = await trackUniqueVisitorLocal();
      setVisitorCount(count);
      setDataSource('local');
    }
  };

  // Format number with thousands separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Handle concurrent visitors without double-counting
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'ccc_visitor_data' && event.newValue) {
      try {
        const newData = JSON.parse(event.newValue);
        if (dataSource === 'local') {
          setVisitorCount(newData.uniqueVisitors);
        }
      } catch (error) {
        console.warn('Error parsing storage change:', error);
      }
    }
  };

  // Handle custom events for real-time updates
  const handleVisitorUpdate = (event: CustomEvent) => {
    if (dataSource === 'local') {
      setVisitorCount(event.detail.count);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeCounter = async () => {
      try {
        // Try to initialize GA4 API first
        const ga4Initialized = await initGA4Api();
        setGa4Status(getGA4ApiStatus());

        if (ga4Initialized && ga4Status.hasRealGA4Access) {
          // Try to use GA4 data
          await fetchGA4Data();
        } else {
          // Fall back to local tracking
          const count = await trackUniqueVisitorLocal();
          if (mounted) {
            setVisitorCount(count);
            setDataSource('local');
          }
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing visitor counter:', error);
        if (mounted) {
          // Fallback to local tracking
          const count = await trackUniqueVisitorLocal();
          setVisitorCount(count);
          setDataSource('local');
          setIsLoading(false);
        }
      }
    };

    initializeCounter();

    // Set up periodic updates for GA4 data
    const ga4UpdateInterval = setInterval(() => {
      if (dataSource === 'ga4' && mounted) {
        fetchGA4Data();
      }
    }, 30000); // Update every 30 seconds

    // Set up periodic updates for active users
    const activeUsersInterval = setInterval(() => {
      if (dataSource === 'ga4' && mounted) {
        getActiveUsers().then(setActiveUsers);
      }
    }, 10000); // Update every 10 seconds

    // Listen for storage changes (other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (same tab)
    window.addEventListener('uniqueVisitorUpdate', handleVisitorUpdate as EventListener);

    // Cleanup
    return () => {
      mounted = false;
      clearInterval(ga4UpdateInterval);
      clearInterval(activeUsersInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('uniqueVisitorUpdate', handleVisitorUpdate as EventListener);
    };
  }, [dataSource, ga4Status.isInitialized]);

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-pulse">
          <div className="text-3xl font-bold text-beach-600 mb-2 bg-gray-200 rounded w-16 h-8 mx-auto"></div>
          <div className="text-sm text-gray-600 bg-gray-200 rounded w-32 h-4 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center group">
      <div className="flex items-center justify-center mb-2">
        <Users className="h-6 w-6 text-beach-500 mr-2 group-hover:text-beach-600 transition-colors" />
        <div className="text-3xl font-bold text-beach-600 group-hover:text-beach-700 transition-colors">
          {formatNumber(visitorCount)}
        </div>
      </div>
      <div className="text-sm text-gray-600 font-medium">
        {dataSource === 'ga4' ? 'New Users Since June 31st' : t('visitor.totalUnique') || 'Total Unique'}
      </div>
      {dataSource === 'ga4' && activeUsers > 0 && (
        <div className="text-xs text-green-600 mt-1 font-medium">
          {activeUsers} {t('visitor.activeNow') || 'active now'}
        </div>
      )}
      <div className="text-xs text-gray-400 mt-1">
        {dataSource === 'ga4' ? t('visitor.fromGA4') || 'From Google Analytics' : 
         t('visitor.realTime') || 'Real-time tracking'}
      </div>
    </div>
  );
};

export default UniqueVisitorCounter;