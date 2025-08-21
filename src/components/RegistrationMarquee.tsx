import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarracaRegistration } from '../types';

interface RegistrationMarqueeProps {
  className?: string;
}

const RegistrationMarquee: React.FC<RegistrationMarqueeProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [approvedRegistrations, setApprovedRegistrations] = useState<BarracaRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedRegistrations = async () => {
      try {
        // Fetch approved registrations from the API
        const response = await fetch('/api/barraca-registrations?status=approved&limit=50');
        if (response.ok) {
          const data = await response.json();
          setApprovedRegistrations(data.registrations || []);
        }
      } catch (error) {
        console.error('Error fetching approved registrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedRegistrations();
  }, []);

  if (loading) {
    return (
      <div className={`bg-beach-50 border-t border-beach-200 py-4 ${className}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-beach-600 text-sm">
            {t('marquee.loading')}
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
    <div className={`bg-beach-50 border-t border-beach-200 py-4 overflow-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center text-beach-600 text-sm mb-2 font-medium">
          {t('marquee.title')}
        </div>
        <div className="relative">
          <div className="flex animate-scroll-left">
            {marqueeItems.map((registration, index) => (
              <div
                key={`${registration.id}-${index}`}
                className="flex-shrink-0 mx-4 text-beach-700 font-medium"
              >
                {registration.name}
                {index < marqueeItems.length - 1 && (
                  <span className="mx-2 text-beach-400">•</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMarquee;
