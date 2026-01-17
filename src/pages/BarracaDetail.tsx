import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Clock, 
  Star,
  MessageCircle,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getEffectiveOpenStatus } from '../utils/environmentUtils';
import ShareButton from '../components/ShareButton';
import BackNavigation from '../components/BackNavigation';
import SEOHead from '../components/SEOHead';
import StarRating from '../components/StarRating';
// import BarracaPageDetail from '../components/BarracaPageDetail';
import BarracaMenu from '../components/BarracaMenu';
import { MenuService } from '../services/menuService';
import type { BarracaMenu as BarracaMenuType } from '../types/menu';

// Helper function to format phone number for WhatsApp
const formatPhoneForWhatsApp = (phone: string) => {
  return phone.replace(/\D/g, '');
};

const BarracaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { barracas, weatherOverride, isLoading } = useApp();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [selectedFavorite, setSelectedFavorite] = useState<string | null>(null);
  const [menu, setMenu] = useState<BarracaMenuType | null>(null);
  const [commonMenuPreview, setCommonMenuPreview] = useState<string[]>([]);

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
      // Add a small delay to prevent immediate redirect
      const timer = setTimeout(() => {
        navigate('/discover');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [barraca, navigate, isLoading, barracas.length]);

  // Initialize like count with a mock value based on barraca ID
  useEffect(() => {
    if (barraca) {
      // Generate a mock like count based on the barraca ID for consistency
      const mockLikeCount = Math.floor(Math.random() * 100) + 50; // 50-150 likes
      setLikeCount(mockLikeCount);
    }
  }, [barraca]);

  // Load mock menu for barraca 82 (Portuguese fallback when English missing)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!id) return;
      const lang = (typeof i18n.language === 'string' && i18n.language.startsWith('pt')) ? 'pt' : 'en';
      const result = await MenuService.getMenuForBarraca(id, lang as 'en' | 'pt');
      if (isMounted) setMenu(result);
      setCommonMenuPreview(MenuService.getCommonMenuPreview(lang as 'en' | 'pt'));
    })();
    return () => { isMounted = false; };
  }, [id, i18n.language]);

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleFavoriteClick = (favoriteName: string) => {
    setSelectedFavorite(favoriteName);
    
    // Scroll to menu section
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
      
      // Find and scroll to the matching menu item
      setTimeout(() => {
        const menuItems = document.querySelectorAll('[data-menu-item]');
        menuItems.forEach((item) => {
          const itemName = item.getAttribute('data-menu-item');
          if (itemName && itemName.toLowerCase().includes(favoriteName.toLowerCase())) {
            // Scroll the carousel to show this item
            const carousel = item.closest('.overflow-x-auto');
            if (carousel) {
              const itemElement = item as HTMLElement;
              const carouselElement = carousel as HTMLElement;
              const itemLeft = itemElement.offsetLeft;
              const carouselWidth = carouselElement.offsetWidth;
              
              // Calculate scroll position to center the item
              const scrollTo = itemLeft - (carouselWidth / 2) + (itemElement.offsetWidth / 2);
              
              carouselElement.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
              });
            }
          }
        });
      }, 500); // Wait for the page scroll to complete
    }
    
    // Clear selection after 3 seconds
    setTimeout(() => {
      setSelectedFavorite(null);
    }, 3000);
  };

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
          <p className="text-gray-600 mb-6">
            The barraca with ID "{id}" could not be found. You will be redirected to the discover page shortly.
          </p>
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

  // Prevent access for non-partnered barracas
  if (barraca && !barraca.partnered) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* SEO Head for sharing */}
        {barraca && (
          <SEOHead
            title={`${barraca.name} - Carioca Coastal Club`}
            description={barraca.description || `Discover ${barraca.name} at ${barraca.location}. ${barraca.menuPreview?.join(', ') || ''}`}
            image={barraca.photos?.horizontal?.[0] || 'https://cariocacoastalclub.com/group-v-1-logo.jpg'}
            type="article"
            url={`https://cariocacoastalclub.com/barraca/${barraca.id}`}
          />
        )}
        {/* Header with back button and share */}
        <BackNavigation
          sticky
          rightContent={
            barraca && (
              <ShareButton 
                barraca={barraca} 
                variant="button" 
                size="sm"
                className="!bg-pink-500 !text-white hover:!bg-pink-600 !px-3 !py-1.5 !text-sm"
              />
            )
          }
        />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {barraca.name}
                </h1>
                <div className="flex items-center justify-center text-gray-600 mb-6">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="text-lg">{barraca.location}</span>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-yellow-800 mb-3">
                  {t('barraca.notPartnered')}
                </h2>
                <p className="text-yellow-700 mb-4">
                  {t('barraca.notPartneredMessage')}
                </p>
                <div className="text-sm text-yellow-600">
                  Only basic information is available.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const effectiveIsOpen = barraca ? getEffectiveOpenStatus(barraca, weatherOverride) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Always Visible WhatsApp Button - Mobile Only */}
      {barraca?.contact?.phone && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <a
            href={`https://wa.me/${formatPhoneForWhatsApp(barraca.contact.phone)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 hover:scale-110"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        </div>
      )}

      {/* Full-Width Hero Section */}
      <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
        <img
          src={barraca?.photos?.horizontal?.[0] || '/under-construction.png'}
          alt={barraca?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Share Button */}
            {barraca && (
          <div className="absolute top-4 right-4 z-10">
              <ShareButton 
                barraca={barraca} 
                variant="button" 
                size="sm"
              className="!bg-black/50 !backdrop-blur-sm !text-white hover:!bg-black/70 !p-3 !rounded-full"
            />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-20">
          {effectiveIsOpen !== null && (
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm ${
              effectiveIsOpen 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                effectiveIsOpen ? 'bg-green-200' : 'bg-red-200'
              }`} />
              {effectiveIsOpen ? t('barraca.open') : t('barraca.closed')}
            </span>
          )}
        </div>

        {/* Barraca Number */}
        {barraca?.barracaNumber && (
          <div className="absolute bottom-4 right-4">
            <span className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
              #{barraca.barracaNumber}
            </span>
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {barraca?.name}
            </h1>
            
            <div className="flex items-center text-white/90 mb-2">
              <MapPin className="h-5 w-5 mr-2 text-pink-400" />
              <span className="text-lg">{barraca?.location}</span>
            </div>
            <div className="flex items-center text-white/90">
              <Clock className="h-5 w-5 mr-2" />
              <span>{barraca?.typicalHours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating and Like Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Rating */}
            {barraca?.rating && (
              <div className="flex items-center gap-3">
                <StarRating 
                  rating={barraca.rating} 
                  size="lg" 
                  showLabel={true}
                />
              </div>
            )}
            
            {/* Review Button */}
            <button
              onClick={() => {
                const reviewsSection = document.getElementById('reviews-section');
                if (reviewsSection) {
                  reviewsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-beach-50 text-beach-700 rounded-full hover:bg-beach-100 transition-colors font-medium"
            >
              <Star className="h-4 w-4" />
              <span className="text-sm">Reviews</span>
            </button>
            
            {/* Like Counter */}
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 ${
                isLiked 
                  ? 'bg-pink-50 text-pink-600 border border-pink-200' 
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Heart 
                className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} 
              />
              <span className="font-medium text-sm">{likeCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Map Section */}
        <div className="mb-8 md:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            Location
          </h2>
          <div className="space-y-6">
            {/* Map */}
            {/* <div className="bg-gray-100 rounded-xl overflow-hidden h-64 md:h-80">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${barraca?.coordinates?.lat},${barraca?.coordinates?.lng}&zoom=15&maptype=roadmap`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${barraca?.name} location`}
              />
            </div> */}
            
            {/* Location Details */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-beach-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{barraca?.name}</h3>
                  <p className="text-gray-700 mb-3">{barraca?.location}</p>
                  <div className="text-sm text-gray-500">
                    Coordinates: {barraca?.coordinates?.lat?.toFixed(6)}, {barraca?.coordinates?.lng?.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 md:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            {t('barraca.about')}
          </h2>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            {barraca?.description}
          </p>
        </div>
        
                {/* Common Menu Cards (always visible) */}
                {commonMenuPreview && commonMenuPreview.length > 0 && (
          <div id="menu-section" className="mb-8 md:mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              {t('barraca.menu')}
            </h2>
            <div className="relative">
              {/* Menu Carousel */}
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                {commonMenuPreview.map((item, index) => (
                  <div
                    key={index}
                    data-menu-item={item}
                    className={`flex-shrink-0 w-64 md:w-80 bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${
                      selectedFavorite && item.toLowerCase().includes(selectedFavorite.toLowerCase())
                        ? 'border-beach-500 shadow-lg scale-105 ring-2 ring-beach-200'
                        : 'border-gray-100'
                    }`}
                  >
                    {/* Menu Item Photo */}
                    <div className="h-40 bg-gray-100 flex items-center justify-center">
                      <img
                        src={`/api/placeholder/300/200?text=${encodeURIComponent(item)}`}
                        alt={item}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      {/* Icon Fallback */}
                      <div 
                        className="hidden w-full h-full items-center justify-center bg-beach-50"
                        style={{ display: 'none' }}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 bg-beach-500 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                          <span className="text-beach-700 font-medium text-sm">{item}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Item Details */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{item}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Delicious {item.toLowerCase()} made with fresh ingredients
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-beach-600 font-medium">R$ 15-25</span>
                        <button className="text-beach-500 hover:text-beach-600 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Scroll Indicators */}
              <div className="flex justify-center mt-4 gap-2">
                {commonMenuPreview.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-gray-300"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section */}
        <div className="mb-8 md:mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            Favorites
          </h2>
          <div className="space-y-3">
            <button 
              onClick={() => handleFavoriteClick('Caipirinha')}
              className="w-full flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg px-2"
            >
              <span className="text-gray-900 font-medium">Caipirinha</span>
              <span className="text-beach-600 font-semibold">R$ 18</span>
            </button>
            <button 
              onClick={() => handleFavoriteClick('Coconut Water')}
              className="w-full flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg px-2"
            >
              <span className="text-gray-900 font-medium">Coconut Water</span>
              <span className="text-beach-600 font-semibold">R$ 12</span>
            </button>
            <button 
              onClick={() => handleFavoriteClick('Grilled Fish')}
              className="w-full flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg px-2"
            >
              <span className="text-gray-900 font-medium">Grilled Fish</span>
              <span className="text-beach-600 font-semibold">R$ 45</span>
            </button>
            <button 
              onClick={() => handleFavoriteClick('Fresh Fruit Plate')}
              className="w-full flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg px-2"
            >
              <span className="text-gray-900 font-medium">Fresh Fruit Plate</span>
              <span className="text-beach-600 font-semibold">R$ 22</span>
            </button>
            <button 
              onClick={() => handleFavoriteClick('Beach Burger')}
              className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors rounded-lg px-2"
            >
              <span className="text-gray-900 font-medium">Beach Burger</span>
              <span className="text-beach-600 font-semibold">R$ 28</span>
            </button>
          </div>
        </div>

        {/* Menu (mock from markdown for barraca 82) */}
        {menu && (
          <BarracaMenu menu={menu} />
        )}

        {/* Amenities */}
        {barraca?.amenities && barraca.amenities.length > 0 && (
          <div className="mb-8 md:mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              {t('barraca.amenities')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {barraca.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 text-gray-700 px-3 md:px-4 py-2 md:py-3 rounded-xl text-sm"
                >
                  <Star className="h-4 w-4 mr-2 md:mr-3 text-yellow-500 flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {/* <div className="mb-8 md:mb-16">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            {barraca?.contact?.phone && (
              <a
                href={`https://wa.me/${formatPhoneForWhatsApp(barraca.contact.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center text-base md:text-lg font-medium"
              >
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                {t('barraca.whatsapp')}
              </a>
            )}
          </div>
        </div> */}

        {/* CTA Buttons */}
        {/* {barraca?.ctaButtons && barraca.ctaButtons.length > 0 && (
          <div className="pt-6 md:pt-8 border-t border-gray-200">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              Special Offers
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {barraca.ctaButtons
                .filter(button => button && button.action && button.action.value && button.text)
                .map((button, index) => (
                  <a
                    key={index}
                    href={button.action.value}
                    target={button.action.target || "_blank"}
                    rel="noopener noreferrer"
                    className="flex-1 bg-beach-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-beach-600 transition-colors text-center text-base md:text-lg font-medium"
                  >
                    {button.text}
                  </a>
                ))}
            </div>
          </div>
        )} */}

        {/* Reviews Section */}
        <div id="reviews-section" className="pt-8 md:pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-6">
            Customer Reviews
          </h2>
          <div className="space-y-4 md:space-y-6">
            {/* Review 1 */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-6">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-beach-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    M
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Maria Silva</h4>
                    <div className="flex items-center gap-2">
                      <StarRating rating={3} size="sm" />
                      <span className="text-xs md:text-sm text-gray-500">2 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                "Amazing atmosphere and the best caipirinhas! The staff is super friendly and the view is incredible. Definitely coming back!"
              </p>
            </div>

            {/* Review 2 */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-6">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    J
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">João Costa</h4>
                    <div className="flex items-center gap-2">
                      <StarRating rating={2} size="sm" />
                      <span className="text-xs md:text-sm text-gray-500">1 week ago</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                "Great spot for sunset drinks. The food is delicious and the service is quick. Perfect place to relax after a day at the beach."
              </p>
            </div>

            {/* Review 3 */}
            <div className="bg-gray-50 rounded-xl p-4 md:p-6">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                    A
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Ana Santos</h4>
                    <div className="flex items-center gap-2">
                      <StarRating rating={3} size="sm" />
                      <span className="text-xs md:text-sm text-gray-500">2 weeks ago</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                "Love this place! The cocktails are amazing and the vibe is perfect. Great music and friendly atmosphere. Highly recommend!"
              </p>
            </div>
          </div>
          
          {/* Add Review Button */}
          <div className="mt-6 md:mt-8">
            <button className="bg-beach-500 text-white px-6 py-3 rounded-xl hover:bg-beach-600 transition-colors font-medium">
              Write a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarracaDetailPage; 