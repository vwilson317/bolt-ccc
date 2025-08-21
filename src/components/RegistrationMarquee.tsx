import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarracaRegistration } from '../types';

interface RegistrationMarqueeProps {
  className?: string;
}

// Mock data for testing the marquee display
const mockApprovedRegistrations: BarracaRegistration[] = [
  {
    id: 'mock-1',
    name: 'Barraca do João',
    location: 'Copacabana Beach',
    coordinates: { lat: -22.9707, lng: -43.1824 },
    typicalHours: '8:00 - 18:00',
    description: 'Traditional beach barraca with fresh coconut water',
    contact: { phone: '+55 21 99999-9999', email: 'joao@example.com' },
    amenities: ['chairs', 'umbrellas'],
    environment: ['family-friendly', 'relaxed'],
    weekendHoursEnabled: true,
    status: 'approved',
    submittedAt: new Date('2024-01-15'),
  },
  {
    id: 'mock-2',
    name: 'Barraca da Maria',
    location: 'Ipanema Beach',
    coordinates: { lat: -22.9871, lng: -43.2034 },
    typicalHours: '7:00 - 19:00',
    description: 'Famous for caipirinhas and beach volleyball',
    contact: { phone: '+55 21 98888-8888', email: 'maria@example.com' },
    amenities: ['chairs', 'umbrellas', 'volleyball'],
    environment: ['sports', 'party'],
    weekendHoursEnabled: true,
    status: 'approved',
    submittedAt: new Date('2024-01-20'),
  },
  {
    id: 'mock-3',
    name: 'Barraca do Pedro',
    location: 'Leblon Beach',
    coordinates: { lat: -22.9871, lng: -43.2034 },
    typicalHours: '8:30 - 17:30',
    description: 'Premium beach experience with gourmet snacks',
    contact: { phone: '+55 21 97777-7777', email: 'pedro@example.com' },
    amenities: ['chairs', 'umbrellas', 'food'],
    environment: ['relaxed', 'family-friendly'],
    weekendHoursEnabled: true,
    status: 'approved',
    submittedAt: new Date('2024-01-25'),
  },
  {
    id: 'mock-4',
    name: 'Barraca da Ana',
    location: 'Arpoador Beach',
    coordinates: { lat: -22.9871, lng: -43.2034 },
    typicalHours: '6:00 - 18:00',
    description: 'Surfer-friendly barraca with healthy options',
    contact: { phone: '+55 21 96666-6666', email: 'ana@example.com' },
    amenities: ['chairs', 'umbrellas', 'surf-rental'],
    environment: ['sports', 'relaxed'],
    weekendHoursEnabled: true,
    status: 'approved',
    submittedAt: new Date('2024-01-30'),
  },
  {
    id: 'mock-5',
    name: 'Barraca do Carlos',
    location: 'Barra da Tijuca Beach',
    coordinates: { lat: -23.0067, lng: -43.3656 },
    typicalHours: '7:30 - 19:30',
    description: 'Family-oriented barraca with kids activities',
    contact: { phone: '+55 21 95555-5555', email: 'carlos@example.com' },
    amenities: ['chairs', 'umbrellas', 'kids-zone'],
    environment: ['family-friendly', 'relaxed'],
    weekendHoursEnabled: true,
    status: 'approved',
    submittedAt: new Date('2024-02-05'),
  },
  {
    id: 'mock-6',
    name: 'Barraca da Sofia',
    location: 'Recreio Beach',
    coordinates: { lat: -23.0067, lng: -43.3656 },
    typicalHours: '8:00 - 18:00',
    description: 'LGBTQ+ friendly barraca with inclusive atmosphere',
    contact: { phone: '+55 21 94444-4444', email: 'sofia@example.com' },
    amenities: ['chairs', 'umbrellas', 'music'],
    environment: ['lgbtq+', 'party'],
    weekendHoursEnabled: true,
    status: 'approved',
    submittedAt: new Date('2024-02-10'),
  },
  {
    id: 'mock-7',
    name: 'Barraca do Roberto',
    location: 'Prainha Beach',
    coordinates: { lat: -23.0067, lng: -43.3656 },
    typicalHours: '6:30 - 17:00',
    description: 'Natural paradise barraca with organic food',
    contact: { phone: '+55 21 93333-3333', email: 'roberto@example.com' },
    amenities: ['chairs', 'umbrellas', 'organic-food'],
    environment: ['relaxed', 'family-friendly'],
    weekendHoursEnabled: true,
    status: 'approved',
    submittedAt: new Date('2024-02-15'),
  },
  {
    id: 'mock-8',
    name: 'Barraca da Fernanda',
    location: 'Grumari Beach',
    coordinates: { lat: -23.0067, lng: -43.3656 },
    typicalHours: '7:00 - 18:00',
    description: 'Eco-friendly barraca with sustainable practices',
    contact: { phone: '+55 21 92222-2222', email: 'fernanda@example.com' },
    amenities: ['chairs', 'umbrellas', 'eco-friendly'],
    environment: ['relaxed', 'family-friendly'],
    weekendHoursEnabled: true,
    status: 'approved',
    submittedAt: new Date('2024-02-20'),
  }
];

const RegistrationMarquee: React.FC<RegistrationMarqueeProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [approvedRegistrations, setApprovedRegistrations] = useState<BarracaRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedRegistrations = async () => {
      try {
        // In development mode, use mock data for testing
        if (process.env.NODE_ENV === 'development') {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          setApprovedRegistrations(mockApprovedRegistrations);
        } else {
          // Fetch approved registrations from the API
          const response = await fetch('/api/barraca-registrations?status=approved&limit=50');
          if (response.ok) {
            const data = await response.json();
            setApprovedRegistrations(data.registrations || []);
          }
        }
      } catch (error) {
        console.error('Error fetching approved registrations:', error);
        // Fallback to mock data if API fails
        if (process.env.NODE_ENV === 'development') {
          setApprovedRegistrations(mockApprovedRegistrations);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedRegistrations();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white border-t border-b border-gray-100 py-6 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('marquee.title')}
            </h3>
            <div className="text-gray-500 text-sm">
              {t('marquee.loading')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (approvedRegistrations.length === 0) {
    return null;
  }

  // Create a duplicated array for seamless scrolling
  const marqueeItems = [...approvedRegistrations, ...approvedRegistrations];

  return (
    <div className={`bg-white border-t border-b border-gray-100 py-6 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('marquee.title')}
          </h3>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-left">
            {marqueeItems.map((registration, index) => (
              <div
                key={`${registration.id}-${index}`}
                className="flex-shrink-0 mx-3 text-gray-700 font-medium text-sm whitespace-nowrap bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
              >
                {registration.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMarquee;
