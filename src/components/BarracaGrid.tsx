import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, MessageCircle, Instagram, Wifi, Umbrella, Hash, Users, Eye, Calendar } from 'lucide-react';
import { Barraca } from '../types';
import StoryRing from './StoryRing';
import { useStory } from '../contexts/StoryContext';

interface BarracaGridProps {
  barracas: Barraca[];
}

const BarracaGrid: React.FC<BarracaGridProps> = ({ barracas }) => {
  const { t } = useTranslation();
  const { stories, featureFlags } = useStory();

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
    // Remove all non-numeric characters and add Brazil country code if needed
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  };

  const hasStories = (barracaId: string) => {
    return stories.some(story => story.barracaId === barracaId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {barracas.map((barraca) => (
        <div key={barraca.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transform hover:scale-105 transition-all duration-200">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={barraca.images[0]}
              alt={barraca.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                barraca.isOpen 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-red-500/90 text-white'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  barraca.isOpen ? 'bg-green-200' : 'bg-red-200'
                }`} />
                {barraca.isOpen ? t('barraca.open') : t('barraca.closed')}
              </span>
            </div>
            {barraca.weatherDependent && (
              <div className="absolute top-4 left-4">
                <span className="bg-blue-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {t('barraca.weatherDependent')}
                </span>
              </div>
            )}
            {barraca.barracaNumber && (
              <div className="absolute bottom-4 left-4">
                <span className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center">
                  <Hash className="h-3 w-3 mr-1" />
                  {barraca.barracaNumber}
                </span>
              </div>
            )}
            {/* Loyalty Member Badge */}
            <div className="absolute bottom-4 right-4">
              <span className="bg-yellow-500/90 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center">
                <Users className="h-3 w-3 mr-1" />
                Member Perks
              </span>
            </div>
            
            {/* Story Ring - Only show if feature is enabled and barraca has stories */}
            {featureFlags.enableStoryBanner && hasStories(barraca.id) && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
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

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {barraca.name}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{barraca.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">{barraca.typicalHours}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {barraca.description}
            </p>

            {/* Menu Preview */}
            {barraca.menuPreview.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  {t('barraca.menuPreview')}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {barraca.menuPreview.slice(0, 3).map((item, index) => (
                    <span
                      key={index}
                      className="bg-sky-50 text-sky-700 px-2 py-1 rounded-full text-xs"
                    >
                      {item}
                    </span>
                  ))}
                  {barraca.menuPreview.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{barraca.menuPreview.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Amenities */}
            {barraca.amenities.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {barraca.amenities.slice(0, 4).map((amenity, index) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs"
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {amenity}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact Info & Actions */}
            <div className="flex items-center justify-between">
              {/* Contact Icons */}
              <div className="flex space-x-2">
                {barraca.contact.phone && (
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(barraca.contact.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
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
                    className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              {/* Minimal Action Buttons */}
              <div className="flex space-x-2">
                {barraca.isOpen && (
                  <button className="flex items-center px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                    <Calendar className="h-3 w-3 mr-1" />
                    Reserve
                  </button>
                )}
                <button className="flex items-center px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
                  <Eye className="h-3 w-3 mr-1" />
                  Details
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarracaGrid;