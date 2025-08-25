import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, ExternalLink, ChevronRight, MapPin } from 'lucide-react';
import { photoService, PhotoDate, Location } from '../services/photoService';
import EmailSubscriptionSection from '../components/EmailSubscriptionSection';
import SEOHead from '../components/SEOHead';

const Photos: React.FC = () => {
  const { t } = useTranslation();
  const [photoDates, setPhotoDates] = useState<PhotoDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load photo dates from service
  useEffect(() => {
    const loadPhotoDates = async () => {
      try {
        const dates = await photoService.getPhotoDates();
        setPhotoDates(dates);
      } catch (error) {
        console.error('Error loading photo dates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotoDates();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderLocation = (location: string | Location[] | undefined) => {
    if (!location) return null;
    
    if (typeof location === 'string') {
      return (
        <div className="flex items-center text-xs text-gray-500 mb-2 relative z-10">
          <MapPin className="h-3 w-3 mr-1 text-beach-500" />
          <span className="truncate">{location}</span>
        </div>
      );
    }
    
    if (Array.isArray(location)) {
      return (
        <div className="flex items-center text-xs text-gray-500 mb-2 relative z-10">
          <MapPin className="h-3 w-3 mr-1 text-beach-500 flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {location.map((loc, index) => (
              <span key={index} className="flex items-center">
                {loc.barracaId ? (
                  <Link
                    to={`/barraca/${loc.barracaId}`}
                    className="text-beach-600 hover:text-beach-700 underline transition-colors duration-200 truncate relative z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {loc.name}
                  </Link>
                ) : (
                  <span className="truncate">{loc.name}</span>
                )}
                {index < location.length - 1 && <span className="text-gray-400 mx-1">•</span>}
              </span>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100 pt-20">
        {/* SEO Head for loading state */}
        <SEOHead
          title="Loading Photos - Carioca Coastal Club"
          description="Loading photo galleries from Carioca Coastal Club"
        />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100 pt-20">
      {/* SEO Head for Photos page */}
      <SEOHead
        title="Photo Gallery - Carioca Coastal Club"
        description="Browse our collection of beautiful photos from Rio de Janeiro's beaches and beach vendors (barracas). Discover the vibrant beach culture of Carioca."
        image="/logo_320x320.png"
        type="website"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Photo Dates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {photoDates.map((photoDate) => (
            <Link
              key={photoDate.id}
              to={`/photos/${photoDate.id}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative">
                {photoDate.thumbnail ? (
                  <img
                    src={photoDate.thumbnail}
                    alt={photoDate.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-beach-200 to-beach-300 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-beach-600" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {photoDate.photoCount} {t('photos.photos', 'photos')}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-beach-600 transition-colors duration-200">
                  {photoDate.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  {formatDate(photoDate.date)}
                </p>
                {renderLocation(photoDate.location)}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500 font-light">
                    {formatShortDate(photoDate.date)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-beach-500 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {photoDates.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {t('photos.noPhotos', 'No photos available yet')}
            </h3>
            <p className="text-gray-500">
              {t('photos.noPhotosDescription', 'Check back soon for new photo galleries')}
            </p>
          </div>
        )}
      </div>

      {/* Email Subscription Section - Full Viewport */}
      <EmailSubscriptionSection
        title={t('emailSubscription.title', 'Stay Connected')}
        description={t('emailSubscription.description', 'Get notified about new events and promotions')}
        className="w-full"
        backgroundImages={{
          desktop: "https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/IMG_3792.jpg",
          mobile: "https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/editsV1/IMG_3792.jpg"
        }}
      />
    </div>
  );
};

export default Photos;
