import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarracaRegistration } from '../types';

interface RegistrationMarqueeProps {
  className?: string;
}

// Helper function to open Instagram link appropriately
const openInstagramLink = (instagramHandle: string) => {
  const cleanHandle = instagramHandle.replace('@', '').replace('https://instagram.com/', '');
  // Open one deterministic tab to avoid mobile deep-link blank/fallback tabs.
  window.open(`https://instagram.com/${cleanHandle}`, '_blank', 'noopener,noreferrer');
};

// Mock data for testing the marquee display
const mockApprovedRegistrations: BarracaRegistration[] = [];

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
          } else {
            console.warn('API not available, using mock data');
            setApprovedRegistrations(mockApprovedRegistrations);
          }
        }
      } catch (error) {
        console.error('Error fetching approved registrations:', error);
        // Fallback to mock data if API fails
        setApprovedRegistrations(mockApprovedRegistrations);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedRegistrations();
  }, []);

  // Track marquee view when data is loaded
  useEffect(() => {
    if (!loading && approvedRegistrations.length > 0) {
    }
  }, [loading, approvedRegistrations.length]);

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
    <div className={`sticky top-16 z-30 bg-white border-b-2 border-pink-500 shadow-lg -mt-px ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-2">
          {/* Title on the left */}
          <div className="flex-shrink-0 mr-6">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {t('marquee.title')}
              </span>
            </h3>
          </div>
          
          {/* Scrolling names on the right */}
          <div className="flex-1 marquee-container">
            <div className="marquee-track">
              <div className="marquee-content pr-8">
                {marqueeItems.map((registration, index) => (
                  <div
                    key={`${registration.id}-${index}`}
                    className="flex items-center gap-3 mr-6 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      if (registration.contact?.instagram) {
                        openInstagramLink(registration.contact.instagram);
                      } else {
                      }
                    }}
                  >
                    <span className="text-pink-500">🤙🏽</span>
                    <span className="truncate">{registration.name}</span>
                    {registration.contact?.instagram && (
                      <span className="text-pink-500 hover:text-pink-700">
                        @{registration.contact.instagram.replace('@', '')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="marquee-content pr-8">
                {marqueeItems.map((registration, index) => (
                  <div
                    key={`${registration.id}-${index}-duplicate`}
                    className="flex items-center gap-3 mr-6 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      if (registration.contact?.instagram) {
                        openInstagramLink(registration.contact.instagram);
                      } else {
                      }
                    }}
                  >
                    <span className="text-pink-500">🤙🏽</span>
                    <span className="truncate">{registration.name}</span>
                    {registration.contact?.instagram && (
                      <span className="text-pink-500 hover:text-pink-700">
                        @{registration.contact.instagram.replace('@', '')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMarquee;
