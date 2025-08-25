import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Download, Share2, Calendar, MapPin, ExternalLink, Image } from 'lucide-react';
import { photoService, PhotoGalleryData } from '../services/photoService';

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
        const data = await photoService.getPhotoGallery(dateId);
        setGalleryData(data);
      } catch (error) {
        console.error('Error loading gallery data:', error);
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
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('photos.galleryNotFound', 'Gallery not found')}
          </h1>
          <Link
            to="/photos"
            className="inline-flex items-center space-x-2 bg-beach-500 hover:bg-beach-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('photos.backToPhotos', 'Back to Photos')}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/photos"
            className="inline-flex items-center space-x-2 text-beach-600 hover:text-beach-700 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('photos.backToPhotos', 'Back to Photos')}</span>
          </Link>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-beach-800 mb-2">
                  {galleryData.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(galleryData.date)}</span>
                  </div>
                  {galleryData.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{galleryData.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-beach-600">
                  {galleryData.photos.length}
                </div>
                <div className="text-sm text-gray-600">
                  {t('photos.photos', 'photos')}
                </div>
              </div>
            </div>
            
            {galleryData.description && (
              <p className="text-gray-700 leading-relaxed mb-4">
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
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
                <div className="w-full p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photo.title && (
                    <h3 className="font-medium text-sm mb-1">{photo.title}</h3>
                  )}
                  {photo.timestamp && (
                    <p className="text-xs opacity-90">{formatTime(photo.timestamp)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {isLightboxOpen && selectedPhotoIndex !== null && galleryData && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            <div className={`relative w-full h-full flex items-center justify-center ${isMobile ? 'p-0' : 'p-4'}`}>
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className={`absolute z-10 text-white hover:text-gray-300 transition-colors duration-200 ${
                  isMobile ? 'top-4 right-4' : 'top-4 right-4'
                }`}
              >
                <X className={isMobile ? "h-6 w-6" : "h-8 w-8"} />
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

              {/* Photo info - simplified on mobile */}
              <div className={`absolute text-white ${isMobile ? 'bottom-0 left-0 right-0' : 'bottom-4 left-4 right-4'}`}>
                <div className={`${isMobile ? 'bg-black/70 p-3' : 'bg-black/50 rounded-lg p-4 backdrop-blur-sm'}`}>
                  <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-2' : ''}`}>
                    <div className={isMobile ? 'text-center' : ''}>
                      {galleryData.photos[selectedPhotoIndex].title && (
                        <h3 className={`font-medium mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}>
                          {galleryData.photos[selectedPhotoIndex].title}
                        </h3>
                      )}
                      {galleryData.photos[selectedPhotoIndex].description && (
                        <p className={`opacity-90 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          {galleryData.photos[selectedPhotoIndex].description}
                        </p>
                      )}
                      <div className={`flex items-center space-x-4 opacity-75 ${isMobile ? 'text-xs justify-center' : 'text-xs'}`}>
                        {galleryData.photos[selectedPhotoIndex].location && (
                          <span>{galleryData.photos[selectedPhotoIndex].location}</span>
                        )}
                        {galleryData.photos[selectedPhotoIndex].timestamp && (
                          <span>{formatTime(galleryData.photos[selectedPhotoIndex].timestamp!)}</span>
                        )}
                      </div>
                    </div>
                    {!isMobile && (
                      <div className="flex items-center space-x-2">
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
