// Google Analytics Data API Service
// Only returns real GA4 data when API is properly configured

// Type declarations for Google APIs
declare global {
  interface Window {
    gapi?: {
      auth2: {
        getAuthInstance(): {
          isSignedIn: {
            get(): boolean;
          };
          currentUser: {
            get(): {
              getAuthResponse(): {
                access_token: string;
              };
            };
          };
        };
      };
    };
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }): {
            requestAccessToken(): void;
          };
        };
      };
    };
  }
}

interface GA4Metrics {
  activeUsers?: number;
  totalUsers?: number;
  screenPageViews?: number;
  eventCount?: number;
  sessions?: number;
  averageSessionDuration?: number;
  bounceRate?: number;
  newUsers?: number;
}

interface GA4Dimensions {
  date?: string;
  pagePath?: string;
  deviceCategory?: string;
  country?: string;
  city?: string;
}

interface GA4Response {
  metricHeaders: Array<{ name: string }>;
  dimensionHeaders: Array<{ name: string }>;
  rows: Array<{
    dimensionValues: Array<{ value: string }>;
    metricValues: Array<{ value: string }>;
  }>;
  rowCount: number;
  metadata: {
    currencyCode: string;
    timeZone: string;
  };
}

class GoogleAnalyticsApiService {
  private propertyId: string;
  private measurementId: string;
  private accessToken: string | null = null;
  private isInitialized = false;
  private hasRealGA4Access = false;

  constructor() {
    this.propertyId = import.meta.env.VITE_GA_PROPERTY_ID || '';
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
  }

  // Initialize the service
  async init(): Promise<boolean> {
    try {
      // Check if we have Property ID configured
      if (this.propertyId) {
        console.log('✅ Google Analytics Property ID found:', this.propertyId);
        console.log('✅ Google Analytics tracking found:', this.measurementId);
        
        this.hasRealGA4Access = true;
        this.isInitialized = true;
        console.log('✅ Google Analytics API service initialized with real data access');
        return true;
      } else {
        console.warn('⚠️ Google Analytics not fully configured. Using local tracking only.');
        console.warn('⚠️ Set VITE_GA_PROPERTY_ID for real GA4 data');
        this.isInitialized = true;
        this.hasRealGA4Access = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Analytics API service:', error);
      return false;
    }
  }

  // Get access token using Google OAuth or service account
  private async getAccessToken(): Promise<void> {
    try {
      // Method 1: Try to get token from environment variable (for service accounts)
      const serviceAccountToken = import.meta.env.VITE_GA_ACCESS_TOKEN;
      if (serviceAccountToken) {
        this.accessToken = serviceAccountToken;
        console.log('✅ Using service account access token');
        return;
      }

      // // Method 2: Try to get token from Google OAuth (if user is signed in)
      // if (typeof window !== 'undefined' && window.gapi) {
      //   try {
      //     const authInstance = window.gapi.auth2.getAuthInstance();
      //     if (authInstance && authInstance.isSignedIn.get()) {
      //       const user = authInstance.currentUser.get();
      //       const authResponse = user.getAuthResponse();
      //       this.accessToken = authResponse.access_token;
      //       console.log('✅ Using OAuth access token');
      //       return;
      //     }
      //   } catch (error) {
      //     console.warn('⚠️ OAuth not available:', error);
      //   }
      // }

      // Method 3: Try to get token from Google Identity Services
      // if (typeof window !== 'undefined' && window.google) {
      //   try {
      //     const tokenClient = window.google.accounts.oauth2.initTokenClient({
      //       client_id: import.meta.env.VITE_GA_CLIENT_ID || '',
      //       scope: 'https://www.googleapis.com/auth/analytics.readonly',
      //       callback: (tokenResponse: any) => {
      //         this.accessToken = tokenResponse.access_token;
      //         console.log('✅ Using Google Identity Services token');
      //       },
      //     });
          
      //     if (tokenClient) {
      //       tokenClient.requestAccessToken();
      //       return;
      //     }
      //   } catch (error) {
      //     console.warn('⚠️ Google Identity Services not available:', error);
      //   }
      // }

      console.warn('⚠️ No access token available. Set VITE_GA_ACCESS_TOKEN or configure OAuth.');
      this.accessToken = null;
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      this.accessToken = null;
    }
  }

  // Get new users since June 31st until current day
  async getTotalUsers(): Promise<number> {
    if (!this.isInitialized) {
      console.log('❌ GA4 API not initialized');
      return 0;
    }

    if (!this.hasRealGA4Access) {
      console.log('❌ No real GA4 access available');
      console.log('   - hasRealGA4Access:', this.hasRealGA4Access);
      return 0;
    }

    try {
      // Calculate the date range: June 31st (or July 1st if June 31st doesn't exist) to today
      const today = new Date();
      const launchDate = new Date(today.getFullYear(), 6, 1); // Month is 0-indexed, so 5 = July
      
      const startDate = launchDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const endDate = today.toISOString().split('T')[0];

      console.log(`📊 Querying new users from ${startDate} to ${endDate}`);
      console.log(`🔧 Property ID: ${this.propertyId}`);

      // Make the actual GA4 Data API call
      const response = await this.runGA4Report({
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'newUsers' }]
      });

      console.log('📋 Full GA4 API Response:', JSON.stringify(response, null, 2));

      if (response.rows && response.rows.length > 0) {
        const newUsers = parseInt(response.rows[0].metricValues[0].value);
        console.log(`✅ Found ${newUsers} new users since ${startDate}`);
        console.log(`📊 Raw metric value: "${response.rows[0].metricValues[0].value}"`);
        console.log(`📊 Parsed as integer: ${newUsers}`);
        return newUsers;
      }

      console.log('ℹ️ No new users data found in GA4');
      console.log('📋 Response structure:', {
        hasRows: !!response.rows,
        rowCount: response.rowCount,
        rowsLength: response.rows?.length,
        metricHeaders: response.metricHeaders,
        dimensionHeaders: response.dimensionHeaders
      });
      return 0;
    } catch (error) {
      console.error('❌ Failed to fetch new users from GA4 API:', error);
      console.error('📋 Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        propertyId: this.propertyId,
        hasAccessToken: !!this.accessToken
      });
      return 0;
    }
  }

  // Get real-time active users - only returns real data if GA4 API is available
  async getActiveUsers(): Promise<number> {
    if (!this.isInitialized) {
      console.log('❌ GA4 API not initialized for active users');
      return 0;
    }

    if (!this.hasRealGA4Access) {
      console.log('❌ No real GA4 access available for active users');
      return 0;
    }

    try {
      // For real-time active users, we need to use a different approach
      // GA4 Data API doesn't provide real-time data directly
      // We'll use recent events to approximate active users
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const startDate = yesterday.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      console.log(`📊 Querying active users from ${startDate} to ${endDate}`);

      const response = await this.runGA4Report({
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'activeUsers' }]
      });

      console.log('📋 Active Users GA4 API Response:', JSON.stringify(response, null, 2));

      if (response.rows && response.rows.length > 0) {
        const activeUsers = parseInt(response.rows[0].metricValues[0].value);
        console.log(`✅ Found ${activeUsers} active users`);
        console.log(`📊 Raw metric value: "${response.rows[0].metricValues[0].value}"`);
        console.log(`📊 Parsed as integer: ${activeUsers}`);
        return activeUsers;
      }

      console.log('ℹ️ No active users data found in GA4');
      console.log('📋 Response structure:', {
        hasRows: !!response.rows,
        rowCount: response.rowCount,
        rowsLength: response.rows?.length
      });
      return 0;
    } catch (error) {
      console.error('❌ Failed to fetch active users from GA4 API:', error);
      return 0;
    }
  }

  // Get page views - only returns real data if GA4 API is available
  async getPageViews(): Promise<number> {
    if (!this.isInitialized) {
      console.log('❌ GA4 API not initialized for page views');
      return 0;
    }

    if (!this.hasRealGA4Access) {
      console.log('❌ No real GA4 access available for page views');
      return 0;
    }

    try {
      // Get page views for the same date range as new users
      const today = new Date();
      const june31st = new Date(today.getFullYear(), 5, 31);
      
      if (june31st.getMonth() !== 5) {
        june31st.setDate(1);
        june31st.setMonth(6);
      }

      const startDate = june31st.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];

      console.log(`📊 Querying page views from ${startDate} to ${endDate}`);

      const response = await this.runGA4Report({
        dateRanges: [{ startDate, endDate }],
        metrics: [{ name: 'screenPageViews' }]
      });

      console.log('📋 Page Views GA4 API Response:', JSON.stringify(response, null, 2));

      if (response.rows && response.rows.length > 0) {
        const pageViews = parseInt(response.rows[0].metricValues[0].value);
        console.log(`✅ Found ${pageViews} page views since ${startDate}`);
        console.log(`📊 Raw metric value: "${response.rows[0].metricValues[0].value}"`);
        console.log(`📊 Parsed as integer: ${pageViews}`);
        return pageViews;
      }

      console.log('ℹ️ No page views data found in GA4');
      console.log('📋 Response structure:', {
        hasRows: !!response.rows,
        rowCount: response.rowCount,
        rowsLength: response.rows?.length
      });
      return 0;
    } catch (error) {
      console.error('❌ Failed to fetch page views from GA4 API:', error);
      return 0;
    }
  }

  // Run a GA4 Data API report
  private async runGA4Report(request: any): Promise<GA4Response> {
    try {
      // Use Netlify function to avoid CORS issues
      const functionUrl = '/.netlify/functions/ga4-api';
      
      console.log('🔗 Calling GA4 Data API via Netlify function:', functionUrl);
      console.log('📋 Request payload:', JSON.stringify(request, null, 2));
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      console.log('📡 HTTP Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GA4 API error response:', response.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('📋 Error details:', errorData);
        } catch (e) {
          console.error('📋 Raw error response:', errorText);
        }
        
        throw new Error(`GA4 API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ GA4 API response received successfully');
      console.log('📋 Response metadata:', {
        rowCount: data.rowCount,
        metricHeaders: data.metricHeaders,
        dimensionHeaders: data.dimensionHeaders,
        metadata: data.metadata
      });
      
      return data;
      
    } catch (error) {
      console.error('❌ GA4 Data API call failed:', error);
      console.error('📋 Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        propertyId: this.propertyId
      });
      throw error;
    }
  }

  // Get service status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      propertyId: this.propertyId ? 'Configured' : 'Not Configured',
      measurementId: this.measurementId ? 'Configured' : 'Not Configured',
      hasRealGA4Access: this.hasRealGA4Access
    };
  }
}

// Create singleton instance
let gaApiInstance: GoogleAnalyticsApiService;

try {
  gaApiInstance = new GoogleAnalyticsApiService();
} catch (error) {
  console.error('❌ Failed to create GA API instance:', error);
  gaApiInstance = new GoogleAnalyticsApiService();
}

export const gaApiService = gaApiInstance;

// Export convenience functions
export const initGA4Api = () => {
  try {
    return gaApiService?.init?.();
  } catch (error) {
    console.warn('⚠️ GA4 API initialization failed:', error);
    return Promise.resolve(false);
  }
};

export const getActiveUsers = () => {
  try {
    return gaApiService?.getActiveUsers?.();
  } catch (error) {
    console.warn('⚠️ Failed to get active users:', error);
    return Promise.resolve(0);
  }
};

export const getTotalUsers = () => {
  try {
    return gaApiService?.getTotalUsers?.();
  } catch (error) {
    console.warn('⚠️ Failed to get total users:', error);
    return Promise.resolve(0);
  }
};

export const getPageViews = () => {
  try {
    return gaApiService?.getPageViews?.();
  } catch (error) {
    console.warn('⚠️ Failed to get page views:', error);
    return Promise.resolve(0);
  }
};

export const getGA4ApiStatus = () => {
  try {
    return gaApiService?.getStatus?.() || { 
      isInitialized: false, 
      propertyId: 'Not Configured', 
      measurementId: 'Not Configured',
      hasRealGA4Access: false
    };
  } catch (error) {
    console.warn('⚠️ GA4 API status check failed:', error);
    return { 
      isInitialized: false, 
      propertyId: 'Error', 
      measurementId: 'Error',
      hasRealGA4Access: false
    };
  }
};

