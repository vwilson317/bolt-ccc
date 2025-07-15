import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe, 
  ArrowLeft,
  Star,
  Users,
  Calendar,
  Gift
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getEffectiveOpenStatus } from '../utils/environmentUtils';
import BarracaPageDetail from '../components/BarracaPageDetail';
import ShareButton from '../components/ShareButton';

const BarracaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { barracas, weatherOverride, isLoading } = useApp();

  const barraca = barracas.find(b => b.id === id);

  // Debug logging
  console.log('🔍 BarracaDetail Debug:', {
    id,
    barracasCount: barracas.length,
    isLoading,
    barracaFound: !!barraca,
    barracaIds: barracas.map(b => b.id),
    environmentInfo: import.meta.env.VITE_APP_ENV
  });

  useEffect(() => {
    // Only redirect if we're not loading and the barraca is not found
    if (!isLoading && barracas.length > 0 && !barraca) {
      // Redirect to discover page if barraca not found
      navigate('/discover');
    }
  }, [barraca, navigate, isLoading, barracas.length]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/logo-icon-color.png"
              alt="Logo Icon"
              className="w-24 h-24 min-w-24 max-w-24 object-contain"
            />
            <div className="flex flex-col justify-center ml-4 h-24">
              <span
                className="leading-none font-bold tracking-tight text-beach-700"
                style={{ fontSize: '2.2rem', lineHeight: 1.1, letterSpacing: '0.04em' }}
              >
                CARIOCA
              </span>
              <span
                className="leading-none font-medium tracking-tight text-beach-500"
                style={{ fontSize: '1.3rem', lineHeight: 1.1, maxWidth: '80%', alignSelf: 'center', letterSpacing: '0.08em' }}
              >
                COASTAL CLUB
              </span>
            </div>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">Loading barraca...</h1>
        </div>
      </div>
    );
  }

  // Show not found state only after loading is complete and barraca is not found and barracas list is not empty
  if (!isLoading && barracas.length > 0 && !barraca) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-beach-500 mb-4">Barraca Not Found</h1>
          <Link 
            to="/discover" 
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  const effectiveIsOpen = getEffectiveOpenStatus(barraca, weatherOverride);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button and share */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            
            {barraca && (
              <ShareButton 
                barraca={barraca} 
                variant="button" 
                size="md"
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BarracaPageDetail 
          barraca={barraca} 
          weatherOverride={weatherOverride}
        />
      </div>
    </div>
  );
};

export default BarracaDetailPage; 