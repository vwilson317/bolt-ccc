import { Barraca, WeatherData, CTAButtonConfig } from '../types';
import { BarracaService } from '../services/barracaService';

// Sample custom CTA button configurations
const sampleCTAButtons: CTAButtonConfig[] = [
  {
    id: 'reserve-premium',
    text: 'Reserve VIP',
    action: {
      type: 'url',
      value: '/reserve/vip',
      target: '_blank',
      trackingEvent: 'vip_reservation_clicked'
    },
    style: 'primary',
    position: 1,
    visibilityConditions: {
      requiresOpen: true,
      memberOnly: true
    },
    icon: 'Star',
    enabled: true
  },
  {
    id: 'menu-special',
    text: 'Today\'s Menu',
    action: {
      type: 'url',
      value: '/menu/daily',
      target: '_blank',
      trackingEvent: 'daily_menu_clicked'
    },
    style: 'secondary',
    position: 2,
    visibilityConditions: {
      timeRestrictions: {
        startTime: '11:00',
        endTime: '22:00'
      }
    },
    icon: 'Menu',
    enabled: true
  },
  {
    id: 'contact-whatsapp',
    text: 'WhatsApp',
    action: {
      type: 'whatsapp',
      value: '+55 21 99999-1234',
      trackingEvent: 'whatsapp_contact_clicked'
    },
    style: 'outline',
    position: 3,
    visibilityConditions: {},
    icon: 'MessageCircle',
    enabled: true
  }
];

// No fallback mock data - database only

// Function to fetch barracas from database only
export const fetchBarracas = async (): Promise<Barraca[]> => {
  try {
    console.log('🔄 Fetching barracas from database...');
    console.log('🔧 Environment:', import.meta.env.VITE_APP_ENV);
    console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL_DEV);
    console.log('🔧 Has anon key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY_DEV);
    
    const barracas = await BarracaService.getAll();
    
    if (barracas && barracas.length > 0) {
      console.log(`✅ Successfully fetched ${barracas.length} barracas from database`);
      console.log('📋 Barraca IDs:', barracas.map(b => b.id));
      return barracas;
    } else {
      console.log('⚠️ No barracas found in database');
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching barracas from database:', error);
    console.log('🔄 Returning empty array - no fallback to mock data');
    return [];
  }
};

// Export empty array for backward compatibility
export const mockBarracas: Barraca[] = [];

export const mockWeatherData: WeatherData = {
  temperature: 28,
  feelsLike: 32,
  humidity: 65,
  windSpeed: 12,
  windDirection: 180,
  description: 'Partly Cloudy',
  icon: 'partly-cloudy',
  beachConditions: 'excellent'
};

// Mock weather API function
export const fetchWeatherData = async (): Promise<WeatherData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data with some variation
  const variations = [
    { ...mockWeatherData, temperature: 25, feelsLike: 28, beachConditions: 'good' as const },
    { ...mockWeatherData, temperature: 30, feelsLike: 35, beachConditions: 'excellent' as const },
    { ...mockWeatherData, temperature: 22, feelsLike: 25, description: 'Overcast', beachConditions: 'fair' as const }
  ];
  
  return variations[Math.floor(Math.random() * variations.length)];
};