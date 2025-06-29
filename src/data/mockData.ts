import { Barraca, WeatherData } from '../types';

export const mockBarracas: Barraca[] = [
  {
    id: '1',
    name: 'Barraca do Zeca',
    barracaNumber: '001',
    location: 'Copacabana',
    coordinates: { lat: -22.9711, lng: -43.1822 },
    isOpen: true,
    typicalHours: '8:00 - 18:00',
    description: 'Traditional beachside barraca serving fresh seafood and cold drinks with ocean views.',
    images: [
      'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
      'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'
    ],
    menuPreview: ['Caipirinha', 'Grilled Fish', 'Coconut Water', 'Açaí Bowl'],
    contact: {
      phone: '+55 21 99999-1234',
      email: 'zeca@barraca.com'
    },
    amenities: ['WiFi', 'Umbrellas', 'Chairs', 'Bathrooms'],
    weatherDependent: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'Sol e Mar',
    barracaNumber: '015',
    location: 'Ipanema',
    coordinates: { lat: -22.9838, lng: -43.2096 },
    isOpen: true,
    typicalHours: '9:00 - 19:00',
    description: 'Modern beachside spot famous for its tropical drinks and Instagram-worthy presentation.',
    images: [
      'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg',
      'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'
    ],
    menuPreview: ['Tropical Smoothies', 'Poke Bowl', 'Craft Beer', 'Tapioca'],
    contact: {
      phone: '+55 21 99999-5678',
      website: 'www.solemar.com.br'
    },
    amenities: ['WiFi', 'Charging Stations', 'Beach Volleyball', 'Yoga Classes'],
    weatherDependent: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '3',
    name: 'Carioca Vibes',
    barracaNumber: '032',
    location: 'Leblon',
    coordinates: { lat: -22.9840, lng: -43.2277 },
    isOpen: false,
    typicalHours: '10:00 - 20:00',
    description: 'Upscale beach experience with gourmet food and premium drinks in Leblon.',
    images: [
      'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg',
      'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'
    ],
    menuPreview: ['Gourmet Burgers', 'Craft Cocktails', 'Fresh Oysters', 'Lobster Roll'],
    contact: {
      phone: '+55 21 99999-9012',
      email: 'info@cariocavibes.com',
      website: 'www.cariocavibes.com'
    },
    amenities: ['VIP Cabanas', 'Personal Service', 'WiFi', 'Premium Sound System'],
    weatherDependent: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '4',
    name: 'Praia Zen',
    barracaNumber: '008',
    location: 'Barra da Tijuca',
    coordinates: { lat: -23.0129, lng: -43.3187 },
    isOpen: true,
    typicalHours: '7:00 - 17:00',
    description: 'Peaceful beachside retreat focusing on wellness, healthy food, and relaxation.',
    images: [
      'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg',
      'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'
    ],
    menuPreview: ['Green Smoothies', 'Quinoa Salad', 'Kombucha', 'Vegan Wraps'],
    contact: {
      phone: '+55 21 99999-3456',
      email: 'wellness@praiazen.com'
    },
    amenities: ['Meditation Area', 'Yoga Mats', 'Wellness Workshops', 'Healthy Menu'],
    weatherDependent: false,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: '5',
    name: 'Posto 9 Beach Bar',
    barracaNumber: '009',
    location: 'Ipanema',
    coordinates: { lat: -22.9845, lng: -43.2105 },
    isOpen: false,
    typicalHours: '11:00 - 21:00',
    description: 'Famous beach bar at Posto 9 with live music and vibrant atmosphere.',
    images: [
      'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
      'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg'
    ],
    menuPreview: ['Live Music', 'Craft Beer', 'Grilled Prawns', 'Caipiroska'],
    contact: {
      phone: '+55 21 99999-7890',
      website: 'www.posto9bar.com'
    },
    amenities: ['Live Music', 'Dance Floor', 'WiFi', 'Beach Games'],
    weatherDependent: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '6',
    name: 'Leme Paradise',
    barracaNumber: '003',
    location: 'Leme',
    coordinates: { lat: -22.9658, lng: -43.1729 },
    isOpen: true,
    typicalHours: '8:30 - 18:30',
    description: 'Family-friendly barraca with traditional Brazilian beach food and games.',
    images: [
      'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg',
      'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg'
    ],
    menuPreview: ['Pastéis', 'Fresh Coconut', 'Grilled Corn', 'Açaí na Tigela'],
    contact: {
      phone: '+55 21 99999-4567',
      email: 'contato@lemeparadise.com'
    },
    amenities: ['Kids Area', 'Beach Games', 'Family Tables', 'Shade Umbrellas'],
    weatherDependent: false,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '7',
    name: 'Arpoador Sunset',
    barracaNumber: '021',
    location: 'Arpoador',
    coordinates: { lat: -22.9876, lng: -43.2089 },
    isOpen: true,
    typicalHours: '14:00 - 22:00',
    description: 'Perfect spot to watch the famous Arpoador sunset with craft cocktails and light bites.',
    images: [
      'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg',
      'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'
    ],
    menuPreview: ['Sunset Cocktails', 'Cheese Boards', 'Wine Selection', 'Bruschetta'],
    contact: {
      phone: '+55 21 99999-2468',
      website: 'www.arpoadorbar.com'
    },
    amenities: ['Sunset Views', 'Cocktail Bar', 'WiFi', 'Photography Spot'],
    weatherDependent: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '8',
    name: 'São Conrado Beach Club',
    barracaNumber: '045',
    location: 'São Conrado',
    coordinates: { lat: -23.0089, lng: -43.2567 },
    isOpen: false,
    typicalHours: '9:00 - 18:00',
    description: 'Exclusive beach club with premium amenities and hang gliding views.',
    images: [
      'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg',
      'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg'
    ],
    menuPreview: ['Premium Sushi', 'Champagne', 'Gourmet Salads', 'Fresh Lobster'],
    contact: {
      phone: '+55 21 99999-1357',
      email: 'vip@saoconradobeach.com',
      website: 'www.saoconradobeach.com'
    },
    amenities: ['VIP Service', 'Pool Access', 'Hang Gliding Views', 'Premium Dining'],
    weatherDependent: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-13')
  }
];

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