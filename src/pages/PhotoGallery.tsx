import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, ChevronLeft, ChevronRight, Download, Share2, Calendar, MapPin, ExternalLink, Image } from 'lucide-react';
import { photoService, PhotoGalleryData, Location } from '../services/photoService';
import BackNavigation from '../components/BackNavigation';
import SEOHead from '../components/SEOHead';

// Hook to detect mobile device
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const PhotoGallery: React.FC = () => {
  const { dateId } = useParams<{ dateId: string }>();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [galleryData, setGalleryData] = useState<PhotoGalleryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Load gallery data from service
  useEffect(() => {
    const loadGalleryData = async () => {
      if (!dateId) return;
      
      try {
        console.log('🖼️ Loading gallery data for dateId:', dateId);
        const data = await photoService.getPhotoGallery(dateId);
        console.log('🖼️ Gallery data loaded:', data);
        if (data) {
          console.log('🖼️ Number of photos:', data.photos.length);
          console.log('🖼️ First photo URL:', data.photos[0]?.url);
          console.log('🖼️ All photo URLs:', data.photos.map(p => p.url));
        }
        setGalleryData(data);
      } catch (error) {
        console.error('❌ Error loading gallery data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGalleryData();
  }, [dateId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderLocation = (location: string | Location[] | undefined) => {
    if (!location) return null;
    
    if (typeof location === 'string') {
      return (
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-beach-500" />
          <span className="font-medium">{location}</span>
        </div>
      );
    }
    
    if (Array.isArray(location)) {
      return (
        <div className="flex items-center space-x-2 relative z-10">
          <MapPin className="h-5 w-5 text-beach-500" />
          <div className="flex flex-wrap gap-2">
            {location.map((loc, index) => (
              <span key={index}>
                {loc.barracaId ? (
                  <Link
                    to={`/barraca/${loc.barracaId}`}
                    className="font-medium text-beach-600 hover:text-beach-700 underline transition-colors duration-200 relative z-10"
                  >
                    {loc.name}
                  </Link>
                ) : (
                  <span className="font-medium">{loc.name}</span>
                )}
                {index < location.length - 1 && <span className="text-gray-400">•</span>}
              </span>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (galleryData && selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % galleryData.photos.length);
    }
  };

  const previousPhoto = () => {
    if (galleryData && selectedPhotoIndex !== null) {
      setSelectedPhotoIndex(selectedPhotoIndex === 0 ? galleryData.photos.length - 1 : selectedPhotoIndex - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isLightboxOpen) return;
    
    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        nextPhoto();
        break;
      case 'ArrowLeft':
        previousPhoto();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedPhotoIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100 pt-20">
        {/* Default SEO Head while loading */}
        <SEOHead
          title="Loading Photo Gallery - Carioca Coastal Club"
          description="Loading photo gallery from Carioca Coastal Club"
        />
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!galleryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100 pt-20">
        {/* SEO Head for not found state */}
        <SEOHead
          title="Gallery Not Found - Carioca Coastal Club"
          description="The requested photo gallery was not found"
        />
        
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('photos.galleryNotFound', 'Gallery not found')}
          </h1>
          <Link
            to="/photos"
            className="inline-flex items-center space-x-2 bg-beach-500 hover:bg-beach-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <span>{t('photos.backToPhotos', 'Back to Photos')}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Get the main photo (first photo) for Open Graph sharing
  const mainPhoto = galleryData?.photos[0];
  const mainPhotoUrl = mainPhoto?.url;
  const galleryTitle = galleryData?.title || 'Photo Gallery';
  const galleryDescription = galleryData?.description || `Gallery containing ${galleryData?.photos.length || 0} photos from ${galleryTitle}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100 pt-20">
      {/* SEO Head with dynamic Open Graph tags */}
      <SEOHead
        title={`${galleryTitle} - Carioca Coastal Club`}
        description={galleryDescription}
        image={mainPhotoUrl}
        type="article"
        url={window.location.href}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackNavigation
            to="/photos"
            label={t('photos.backToPhotos', 'Back to Photos')}
            variant="prominent"
            className="mb-4"
          />
          
          <div className="bg-gradient-to-br from-white via-beach-50 to-white rounded-2xl shadow-xl p-8 border border-beach-100">
            {/* Mobile Layout */}
            <div className="md:hidden mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-beach-800 to-beach-600 bg-clip-text text-transparent mb-3 tracking-tight">
                {galleryData.title}
              </h1>
              <div className="flex items-center space-x-2 text-gray-600 mb-3">
                <Calendar className="h-5 w-5 text-beach-500" />
                <span className="font-medium">{formatDate(galleryData.date)}</span>
              </div>
              {renderLocation(galleryData.location)}
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-beach-800 to-beach-600 bg-clip-text text-transparent mb-3 tracking-tight">
                  {galleryData.title}
                </h1>
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-beach-500" />
                    <span className="font-medium">{formatDate(galleryData.date)}</span>
                  </div>
                  {renderLocation(galleryData.location)}
                </div>
              </div>
              <div className="text-right ml-6">
                <div className="text-3xl font-bold text-beach-600">
                  {galleryData.photos.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {t('photos.photos', 'photos')}
                </div>
              </div>
            </div>
            
            {galleryData.description && (
              <p className="text-gray-700 leading-relaxed mb-6 text-lg font-light">
                {galleryData.description}
              </p>
            )}

            {/* Google Photos Archive Link */}
            <div className="bg-gradient-to-r from-beach-50 to-beach-100 rounded-lg p-4 md:p-6 border border-beach-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <img 
                    src="/google-photos-icon.png" 
                    alt="Google Photos" 
                    className="h-16 w-16 object-contain flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-800">
                      {t('photos.googlePhotosArchive', 'Google Photos Archive')}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {t('photos.googlePhotosDescription', 'Access our complete photo collection on Google Photos')}
                    </p>
                  </div>
                </div>
                <a
                  href={galleryData.archiveUrl || photoService.getGooglePhotosArchiveUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-beach-500 hover:bg-beach-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm md:text-base w-full md:w-auto justify-center"
                >
                  <span>{t('photos.viewArchive', 'View Archive')}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Count Badge - Mobile Only */}
        {isMobile && (
          <div className="mb-4 flex justify-center">
            <div className="bg-beach-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              {galleryData.photos.length} {t('photos.photos', 'photos')}
            </div>
          </div>
        )}

        {/* Photo Grid */}
        <div className={isMobile ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
          {galleryData.photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`group relative bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 ${
                isMobile ? 'aspect-[3/4]' : 'aspect-square'
              }`}
              onClick={() => openLightbox(index)}
            >
              <img
                src={isMobile && photo.urlMobile ? photo.urlMobile : photo.url}
                alt={photo.title || `Photo ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  console.error('❌ Image failed to load:', photo.url);
                  console.error('❌ Image element:', e.target);
                  // You could set a fallback image here
                  // e.target.src = '/fallback-image.jpg';
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully:', photo.url);
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end">
                <div className="w-full p-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  {photo.title && (
                    <h3 className="font-semibold text-base mb-2 drop-shadow-lg">{photo.title}</h3>
                  )}
                  {photo.timestamp && (
                    <p className="text-sm opacity-90 font-light">{formatTime(photo.timestamp)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {isLightboxOpen && selectedPhotoIndex !== null && galleryData && (
          <div 
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <div 
              className={`relative w-full h-full flex items-center justify-center ${isMobile ? 'p-0' : 'p-4'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className={`absolute z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 ${
                  isMobile ? 'top-4 right-4' : 'top-4 right-4'
                }`}
              >
                <X className={isMobile ? "h-5 w-5" : "h-6 w-6"} />
              </button>

              {/* Navigation buttons - hidden on mobile for full screen experience */}
              {!isMobile && (
                <>
                  <button
                    onClick={previousPhoto}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors duration-200"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors duration-200"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}

              {/* Photo */}
              <div className={`flex items-center justify-center ${isMobile ? 'w-full h-full' : 'max-w-full max-h-full'}`}>
                <img
                  src={isMobile && galleryData.photos[selectedPhotoIndex].urlMobile 
                    ? galleryData.photos[selectedPhotoIndex].urlMobile 
                    : galleryData.photos[selectedPhotoIndex].url}
                  alt={galleryData.photos[selectedPhotoIndex].title || `Photo ${selectedPhotoIndex + 1}`}
                  className={isMobile ? "w-full h-full object-cover" : "max-w-full max-h-full object-contain"}
                />
              </div>

              {/* Photo info - minimal */}
              <div className={`absolute text-white ${isMobile ? 'bottom-0 left-0 right-0' : 'bottom-6 left-6 right-6'}`}>
                <div className={`${isMobile ? 'bg-pink-500/70 p-3' : 'bg-pink-500/60 rounded-xl p-4 backdrop-blur-md border border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {galleryData.photos[selectedPhotoIndex].title && (
                        <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
                          {galleryData.photos[selectedPhotoIndex].title}
                        </h3>
                      )}
                      {galleryData.photos[selectedPhotoIndex].timestamp && (
                        <p className={`opacity-90 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {formatTime(galleryData.photos[selectedPhotoIndex].timestamp!)}
                        </p>
                      )}
                    </div>
                    {!isMobile && (
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => window.open(galleryData.photos[selectedPhotoIndex].url, '_blank')}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: galleryData.photos[selectedPhotoIndex].title || 'Photo',
                                url: galleryData.photos[selectedPhotoIndex].url
                              });
                            } else {
                              navigator.clipboard.writeText(galleryData.photos[selectedPhotoIndex].url);
                            }
                          }}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                          title="Share"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo counter */}
              <div className={`absolute text-white bg-black/50 rounded-lg px-3 py-1 text-sm ${
                isMobile ? 'top-4 left-4' : 'top-4 left-4'
              }`}>
                {selectedPhotoIndex + 1} / {galleryData.photos.length}
              </div>

              {/* Mobile swipe navigation */}
              {isMobile && (
                <div className="absolute inset-0 flex">
                  <div 
                    className="w-1/2 h-full cursor-pointer" 
                    onClick={previousPhoto}
                    title="Previous photo"
                  />
                  <div 
                    className="w-1/2 h-full cursor-pointer" 
                    onClick={nextPhoto}
                    title="Next photo"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
