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
  },
  {
    id: 'follow-instagram',
    text: 'Follow Us',
    action: {
      type: 'ig',
      value: 'https://instagram.com/barraca_example',
      target: '_blank',
      trackingEvent: 'instagram_follow_clicked'
    },
    style: 'outline',
    position: 4,
    visibilityConditions: {},
    icon: 'Instagram',
    enabled: true
  }
];

// Fallback mock data with ratings for testing
export const mockBarracas: Barraca[] = [
  {
    id: 'mock-1',
    name: 'Barraca do João',
    barracaNumber: '80',
    location: 'Ipanema',
    coordinates: { lat: -22.9838, lng: -43.2096 },
    isOpen: true,
    typicalHours: '8:00 - 18:00',
    description: 'Traditional beachside barraca serving fresh seafood and cold drinks with ocean views. Family-owned for over 30 years.',
    photos: {
      horizontal: ['https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg'],
      vertical: ['https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg']
    },
    menuPreview: ['Caipirinha', 'Grilled Fish', 'Coconut Water'],
    contact: {
      phone: '+55 21 99999-1234',
      email: 'joao@barraca.com'
    },
    amenities: ['WiFi', 'Umbrellas', 'Chairs'],
    weatherDependent: true,
    partnered: true,
    weekendHoursEnabled: false,
    rating: 3,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    ctaButtons: sampleCTAButtons
  },
  {
    id: 'mock-2',
    name: 'Surf & Turf Beach Bar',
    barracaNumber: '45',
    location: 'Copacabana',
    coordinates: { lat: -22.9711, lng: -43.1822 },
    isOpen: true,
    typicalHours: '9:00 - 19:00',
    description: 'Modern beachside spot famous for its tropical drinks and Instagram-worthy presentation. Popular with young professionals.',
    photos: {
      horizontal: ['https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg'],
      vertical: ['https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg']
    },
    menuPreview: ['Tropical Smoothies', 'Poke Bowl', 'Craft Beer'],
    contact: {
      phone: '+55 21 99999-5678',
      email: 'surf@turf.com'
    },
    amenities: ['WiFi', 'Charging Stations', 'Beach Volleyball'],
    weatherDependent: false,
    partnered: true,
    weekendHoursEnabled: true,
    rating: 2,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    ctaButtons: sampleCTAButtons
  },
  {
    id: 'mock-3',
    name: 'Praia Tropical',
    barracaNumber: '12',
    location: 'Leblon',
    coordinates: { lat: -22.9870, lng: -43.2090 },
    isOpen: false,
    typicalHours: '10:00 - 20:00',
    description: 'Upscale beachfront dining with premium cocktails and gourmet beach cuisine. Perfect for special occasions.',
    photos: {
      horizontal: ['https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg'],
      vertical: ['https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg']
    },
    menuPreview: ['Premium Cocktails', 'Gourmet Seafood', 'Wine Selection'],
    contact: {
      phone: '+55 21 99999-9999',
      email: 'tropical@praia.com'
    },
    amenities: ['VIP Service', 'Reservations', 'Private Cabanas'],
    weatherDependent: true,
    partnered: true,
    weekendHoursEnabled: true,
    rating: 1,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    ctaButtons: sampleCTAButtons
  }
];

// Function to fetch barracas from database with fallback to mock data
export const fetchBarracas = async (): Promise<Barraca[]> => {
  // Temporarily force mock data for testing
  console.log('🔄 Using mock data for testing');
  console.log('🔍 Mock barracas with ratings:', mockBarracas.filter(b => b.rating));
  return mockBarracas;
  
  // Original code commented out for testing
  /*
  try {
    console.log('🔄 Fetching barracas from database...');
    console.log('🔧 Environment:', import.meta.env.VITE_APP_ENV);
    console.log('🔧 Supabase URL:', import.meta.env.VITE_SUPABASE_URL_DEV);
    console.log('🔧 Has anon key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY_DEV);
    
    const barracas = await BarracaService.getAll();
    console.log('🔍 BarracaService.getAll() returned:', barracas);
    console.log('🔍 Barracas length:', barracas?.length);
    console.log('🔍 Barracas with ratings:', barracas?.filter(b => b.rating));
    
    if (barracas && barracas.length > 0) {
      console.log(`✅ Successfully fetched ${barracas.length} barracas from database`);
      console.log('📋 Barraca IDs:', barracas.map(b => b.id));
      return barracas;
    } else {
      console.log('⚠️ No barracas found in database, using mock data');
      console.log('🔍 Mock barracas with ratings:', mockBarracas.filter(b => b.rating));
      return mockBarracas;
    }
  } catch (error) {
    console.error('❌ Error fetching barracas from database:', error);
    console.log('🔄 Using mock data as fallback');
    console.log('🔍 Mock barracas with ratings:', mockBarracas.filter(b => b.rating));
    return mockBarracas;
  }
  */
};



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