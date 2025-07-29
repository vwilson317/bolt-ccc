import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, MessageCircle, Instagram, Wifi, Umbrella, Hash, Users, MousePointer, Mail, Calendar } from 'lucide-react';
import { Barraca, BarracaEvent } from '../types';
import StoryRing from './StoryRing';
import CTAButtonGroup from './CTAButtonGroup';
import { useStory } from '../contexts/StoryContext';
import { useApp } from '../contexts/AppContext';
import { getEffectiveOpenStatus } from '../utils/environmentUtils';
import EventStoryViewer from './EventStoryViewer';

interface BarracaGridProps {
  barracas: Barraca[];
}

const BarracaGrid: React.FC<BarracaGridProps> = ({ barracas }) => {
  const { t } = useTranslation();
  const { stories, featureFlags } = useStory();
  const { weatherOverride, openBarracaModal } = useApp();
  const [selectedEvent, setSelectedEvent] = useState<BarracaEvent | null>(null);

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

  const getRecentEvents = (barraca: Barraca) => {
    if (!barraca.previousEvents) return [];
    return barraca.previousEvents
      .filter(event => event.isActive && event.highlightPhotos.length > 0)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3); // Show up to 3 recent events
  };

  const handleEventStoryClick = (event: BarracaEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening barraca modal
    setSelectedEvent(event);
  };



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
          className={`bg-white rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col relative ${
            barraca.partnered ? 'cursor-pointer barraca-tap-feedback barraca-selectable active:scale-[0.98] md:active:scale-100 border border-transparent md:border-transparent' : 'border-2 border-gray-300'
          }`}
          onClick={() => barraca.partnered && openBarracaModal(barraca)}
        >
          {/* Mobile-Optimized Image Section */}
          <div className="relative min-h-[200px] max-h-[280px] md:aspect-[3/2] flex-shrink-0 bg-gray-100 flex items-center justify-center">
            <img
              src={barraca.photos.horizontal[0] || '/api/placeholder/600/400'}
              alt={barraca.name}
              className={`w-full h-auto max-h-full object-contain`}
            />
            
            {/* Simplified Overlay - Only Essential Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Status Badge - Larger for Mobile */}
            <div className="absolute top-3 right-3">
              {(() => {
                const effectiveIsOpen = getEffectiveOpenStatus(barraca, weatherOverride);
                if (effectiveIsOpen === null) {
                  // Non-partnered barracas show undetermined status
                  return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
                      <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-gray-300" />
                      {t('barraca.undetermined')}
                    </span>
                  );
                }
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
                  imageUrl={barraca.photos.horizontal[0] || '/api/placeholder/600/400'}
                  size="sm"
                  showLabel={false}
                />
              </div>
            )}

            {/* Event Story Circles - Top Left */}
            {(() => {
              const recentEvents = getRecentEvents(barraca);
              if (recentEvents.length === 0) return null;
              
              return (
                <div className="absolute top-3 left-3 flex space-x-1">
                  {recentEvents.map((event, index) => (
                    <button
                      key={event.id}
                      onClick={(e) => handleEventStoryClick(event, e)}
                      className="relative w-8 h-8 rounded-full overflow-hidden hover:scale-110 transition-transform duration-200"
                      style={{ zIndex: recentEvents.length - index }}
                      aria-label={`View ${event.title} photos`}
                    >
                      {/* Gradient Ring */}
                      <div className="absolute inset-0 rounded-full p-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <img
                            src={event.highlightPhotos[0]?.url}
                            alt={event.title}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>
                      
                      {/* Photo Count Badge */}
                      {event.photos.length > 1 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold text-[8px]">
                          {event.photos.length}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Mobile Tap Indicator - Only for partnered barracas */}
            {barraca.partnered && (
              <div className="absolute bottom-3 right-3 md:hidden">
                <div className="bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full">
                  <MousePointer className="h-3 w-3" />
                </div>
              </div>
            )}
          </div>

          {/* Content Section - Mobile Optimized with Flex Layout */}
          <div className="p-4 md:p-6 flex flex-col flex-grow">
            {/* Header - Clean and Scannable */}
            <div className="mb-3 flex-shrink-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`text-lg md:text-xl font-bold leading-tight ${
                  barraca.partnered ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {barraca.name}
                </h3> 
              </div>
              
              {/* Location - Only show location for non-partnered barracas */}
              <div className="space-y-1">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span className="text-sm">{barraca.location}</span>
                  {!barraca.partnered && (
                    <span className="ml-1 text-xs text-gray-400">• {t('barraca.limitedInfo')}</span>
                  )}
                </div>
                {barraca.partnered && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="text-sm">{barraca.typicalHours}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Collapsible Details for Mobile / Fixed Height for Desktop */}
            <div className="md:block flex-grow">
              {barraca.partnered ? (
                <>
                  {/* Always Visible: Top Menu Items */}
                  {barraca.menuPreview.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {barraca.menuPreview.slice(0, 2).map((item, index) => (
                          <span
                            key={index}
                            className="bg-beach-50 text-beach-700 px-2 py-1 rounded-md text-xs font-medium"
                          >
                            {item}
                          </span>
                        ))}

                      </div>
                    </div>
                  )}

                  {/* Description - Always truncated for cleaner look */}
                  <div className="mb-3">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {getTruncatedDescription(barraca.description, 80)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Non-partnered information */}
                  <div className="mb-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-1">
                            {t('barraca.notPartnered')}
                          </h4>
                          <p className="text-xs text-blue-700 leading-relaxed">
                            {t('barraca.notPartneredMessage')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>


                </>
              )}


            </div>

            {/* Action Footer - Mobile Optimized with Configurable CTA Buttons - Fixed at Bottom - Only for partnered barracas */}
            {barraca.partnered && (
              <div className="mt-auto pt-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between">
                  {/* Contact Icons - Larger Touch Targets */}
                  <div className="flex space-x-2">
                    {barraca.contact.email && (
                      <a
                        href={`mailto:${barraca.contact.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    {/* WhatsApp and Instagram icons removed from contact. Only available as CTA buttons. */}
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
            )}
          </div>
        </div>
      ))}

      {/* Event Story Viewer */}
      {selectedEvent && (
        <EventStoryViewer
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default BarracaGrid;