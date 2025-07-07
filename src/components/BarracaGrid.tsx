import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, MessageCircle, Instagram, Wifi, Umbrella, Hash, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Barraca } from '../types';
import StoryRing from './StoryRing';
import CTAButtonGroup from './CTAButtonGroup';
import BarracaDetail from './BarracaDetail';
import { useStory } from '../contexts/StoryContext';
import { useApp } from '../contexts/AppContext';
import { getEffectiveOpenStatus } from '../utils/environmentUtils';

interface BarracaGridProps {
  barracas: Barraca[];
}

const BarracaGrid: React.FC<BarracaGridProps> = ({ barracas }) => {
  const { t } = useTranslation();
  const { stories, featureFlags } = useStory();
  const { weatherOverride } = useApp();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedBarraca, setSelectedBarraca] = useState<Barraca | null>(null);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return Wifi;
      case 'umbrellas':
      case 'shade umbrellas':
        return Umbrella;
      case 'whatsapp':
        return MessageCircle;
      case 'instagram':
        return Instagram;
      default:
        return Clock;
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  };

  const hasStories = (barracaId: string) => {
    return stories.some(story => story.barracaId === barracaId);
  };

  const toggleExpanded = (barracaId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(barracaId)) {
      newExpanded.delete(barracaId);
    } else {
      newExpanded.add(barracaId);
    }
    setExpandedCards(newExpanded);
  };

  const isExpanded = (barracaId: string) => expandedCards.has(barracaId);

  // Helper function to truncate description for desktop
  const getTruncatedDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {barracas.map((barraca) => (
        <div 
          key={barraca.id} 
          className={`bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col ${
            barraca.partnered ? 'cursor-pointer' : ''
          }`}
          onClick={() => barraca.partnered && setSelectedBarraca(barraca)}
        >
          {/* Mobile-Optimized Image Section */}
          <div className="relative h-40 md:h-48 overflow-hidden flex-shrink-0">
            <img
              src={barraca.images.length > 1 ? barraca.images[1] : barraca.images[0] ?? barraca.images[1]}
              alt={barraca.name}
              className="w-full h-full object-cover"
            />
            
            {/* Simplified Overlay - Only Essential Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status Badge - Larger for Mobile */}
            <div className="absolute top-3 right-3">
              {(() => {
                const effectiveIsOpen = getEffectiveOpenStatus(barraca, weatherOverride);
                return (
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium status-pulse ${
                    effectiveIsOpen 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 dot-pulse ${
                      effectiveIsOpen ? 'bg-green-200' : 'bg-red-200'
                    }`} />
                    {effectiveIsOpen ? t('barraca.open') : t('barraca.closed')}
                  </span>
                );
              })()}
            </div>

            {/* Barraca Number - Bottom Left */}
            {barraca.barracaNumber && (
              <div className="absolute bottom-3 left-3">
                <span className="bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium" data-lingo-skip>
                  #{barraca.barracaNumber}
                </span>
              </div>
            )}

            {/* Story Ring - Top Center (Mobile Optimized) */}
            {featureFlags.enableStoryBanner && hasStories(barraca.id) && (
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                <StoryRing
                  barracaId={barraca.id}
                  barracaName={barraca.name}
                  imageUrl={barraca.images[0]}
                  size="sm"
                  showLabel={false}
                />
              </div>
            )}
          </div>

          {/* Content Section - Mobile Optimized with Flex Layout */}
          <div className="p-4 md:p-6 flex flex-col flex-grow">
            {/* Header - Clean and Scannable */}
            <div className="mb-3 flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                  {barraca.name}
                </h3>
                {/* Partner Badge - Only show for partnered barracas */}
                {barraca.partnered && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md text-xs font-medium ml-2 flex-shrink-0">
                    {t('barraca.partner')}
                  </span>
                )}
              </div>
              
              {/* Location & Hours - Simplified */}
              <div className="space-y-1">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span className="text-sm">{barraca.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span className="text-sm">{barraca.typicalHours}</span>
                </div>
              </div>
            </div>

            {/* Collapsible Details for Mobile / Fixed Height for Desktop */}
            <div className="md:block flex-grow">
              {/* Always Visible: Top Menu Items */}
              {barraca.menuPreview.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {barraca.menuPreview.slice(0, 2).map((item, index) => (
                      <span
                        key={index}
                        className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                    {barraca.menuPreview.length > 2 && (
                      <button
                        onClick={() => toggleExpanded(barraca.id)}
                        className="text-xs text-gray-500 px-2 py-1 hover:text-gray-700 md:hidden"
                      >
                        {t('barraca.moreItems', { count: barraca.menuPreview.length - 2 })}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Description - Truncated on Desktop, Expandable on Mobile */}
              <div className="mb-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {/* Desktop: Always show truncated */}
                  <span className="hidden md:block">
                    {getTruncatedDescription(barraca.description)}
                  </span>
                  {/* Mobile: Show full if expanded, truncated if not */}
                  <span className="md:hidden">
                    {isExpanded(barraca.id) ? barraca.description : getTruncatedDescription(barraca.description, 80)}
                  </span>
                </p>
              </div>

              {/* Expandable Content on Mobile */}
              <div className={`md:block ${isExpanded(barraca.id) ? 'block' : 'hidden'}`}>
                {/* Additional Menu Items */}
                {barraca.menuPreview.length > 2 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {barraca.menuPreview.slice(2).map((item, index) => (
                        <span
                          key={index}
                          className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-xs font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Amenities - Simplified */}
                {barraca.amenities.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {barraca.amenities.slice(0, 3).map((amenity, index) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div
                            key={index}
                            className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {amenity}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Expand/Collapse Button */}
              <button
                onClick={() => toggleExpanded(barraca.id)}
                className="md:hidden w-full flex items-center justify-center py-2 text-sm text-gray-500 hover:text-gray-700 border-t border-gray-100 mt-3"
              >
                {isExpanded(barraca.id) ? (
                  <>
                    <span>{t('barraca.showLess')}</span>
                    <ChevronUp className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    <span>{t('barraca.showMore')}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </div>

            {/* Action Footer - Mobile Optimized with Configurable CTA Buttons - Fixed at Bottom */}
            <div className="mt-auto pt-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                {/* Contact Icons - Larger Touch Targets */}
                <div className="flex space-x-2">
                  {barraca.contact.phone && (
                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(barraca.contact.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                  {barraca.contact.website && (
                    <a
                      href={barraca.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                </div>
                
                {/* Configurable CTA Buttons */}
                <CTAButtonGroup 
                  barraca={barraca}
                  size="sm"
                  maxButtons={2}
                  context={{
                    currentTime: new Date(),
                    isLoggedIn: false, // This would come from your auth context
                    weatherConditions: 'good' // This would come from your weather context
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Barraca Detail Modal */}
      {selectedBarraca && (
        <BarracaDetail
          barraca={selectedBarraca}
          onClose={() => setSelectedBarraca(null)}
          weatherOverride={weatherOverride}
        />
      )}
    </div>
  );
};

export default BarracaGrid;