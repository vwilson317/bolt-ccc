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

// Mock barraca data for fallback when database is not available
const mockBarracasData: Barraca[] = [
  {
    id: 'barraca-1',
    name: 'Barraca do João',
    barracaNumber: '80',
    location: 'Ipanema',
    coordinates: { lat: -22.9868, lng: -43.2050 },
    isOpen: true,
    typicalHours: '8:00 AM - 6:00 PM',
    description: 'A traditional beachside barraca serving fresh seafood and cold drinks with stunning ocean views. Perfect for a relaxing day at the beach.',
    photos: {
      horizontal: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
      vertical: ['/api/placeholder/400/600']
    },
    menuPreview: ['Caipirinha', 'Grilled Fish', 'Açaí Bowl', 'Fresh Coconut Water'],
    contact: {
      phone: '+55 21 99999-1234',
      email: 'joao@barraca.com',
      website: 'https://barracadojoao.com'
    },
    amenities: ['Beach Chairs', 'Umbrellas', 'WiFi', 'Restrooms'],
    weatherDependent: true,
    partnered: true,
    weekendHoursEnabled: false,
    weekendHours: null,
    manualStatus: 'undefined',
    specialAdminOverride: false,
    specialAdminOverrideExpires: null,
    ctaButtons: sampleCTAButtons.slice(0, 2),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'barraca-2',
    name: 'Surf & Turf Beach Bar',
    barracaNumber: '45',
    location: 'Copacabana',
    coordinates: { lat: -22.9711, lng: -43.1822 },
    isOpen: false,
    typicalHours: '9:00 AM - 7:00 PM',
    description: 'Modern beach bar with live music, craft cocktails, and international cuisine. The perfect spot for sunset drinks.',
    photos: {
      horizontal: ['/api/placeholder/600/400', '/api/placeholder/600/400'],
      vertical: ['/api/placeholder/400/600']
    },
    menuPreview: ['Mojito', 'Grilled Prawns', 'Burger', 'Tropical Smoothie'],
    contact: {
      phone: '+55 21 88888-5678',
      email: 'info@surfturf.com'
    },
    amenities: ['Live Music', 'Cocktail Bar', 'Beach Service', 'Parking'],
    weatherDependent: true,
    partnered: true,
    weekendHoursEnabled: true,
    weekendHours: {
      friday: { open: '10:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '20:00' }
    },
    manualStatus: 'undefined',
    specialAdminOverride: false,
    specialAdminOverrideExpires: null,
    ctaButtons: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'barraca-3',
    name: 'Praia Tropical',
    barracaNumber: '12',
    location: 'Leblon',
    coordinates: { lat: -22.9844, lng: -43.2148 },
    isOpen: true,
    typicalHours: '7:00 AM - 8:00 PM',
    description: 'Family-friendly beach spot with traditional Brazilian food and fresh fruit juices. Great for kids and families.',
    photos: {
      horizontal: ['/api/placeholder/600/400'],
      vertical: ['/api/placeholder/400/600']
    },
    menuPreview: ['Fresh Juice', 'Pão de Açúcar', 'Grilled Chicken', 'Ice Cream'],
    contact: {
      phone: '+55 21 77777-9999'
    },
    amenities: ['Kids Area', 'Family Tables', 'Fresh Juices', 'Shade'],
    weatherDependent: false,
    partnered: true,
    weekendHoursEnabled: false,
    weekendHours: null,
    manualStatus: 'undefined',
    specialAdminOverride: false,
    specialAdminOverrideExpires: null,
    ctaButtons: [sampleCTAButtons[2]],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Function to fetch barracas from database with fallback to mock data
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
      console.log('⚠️ No barracas found in database, using mock data');
      return mockBarracasData;
    }
  } catch (error) {
    console.error('❌ Error fetching barracas from database:', error);
    console.log('🔄 Falling back to mock data');
    return mockBarracasData;
  }
};

// Export mock data for backward compatibility
export const mockBarracas: Barraca[] = mockBarracasData;

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