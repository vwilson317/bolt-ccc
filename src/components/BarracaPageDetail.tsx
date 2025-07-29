import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Phone, Mail, ExternalLink, MessageCircle, Star } from 'lucide-react';
import { Barraca } from '../types';
import { getEffectiveOpenStatus } from '../utils/environmentUtils';
import ShareButton from './ShareButton';
import EventList from './EventList';

// Helper function to format phone number for WhatsApp
const formatPhoneForWhatsApp = (phone: string) => {
  return phone.replace(/\D/g, '');
};

interface BarracaPageDetailProps {
  barraca: Barraca | undefined;
  weatherOverride?: boolean;
}

const BarracaPageDetail: React.FC<BarracaPageDetailProps> = ({ 
  barraca, 
  weatherOverride = false
}) => {
  const { t } = useTranslation();

  // Handle case where barraca is undefined (still loading)
  if (!barraca) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">Loading barraca...</h1>
        </div>
      </div>
    );
  }

  // Prevent access for non-partnered barracas
  if (!barraca.partnered) {
    return (
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
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
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
    );
  }

  const effectiveIsOpen = getEffectiveOpenStatus(barraca, weatherOverride);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={barraca.photos?.horizontal?.[0] || '/api/placeholder/600/400'}
          alt={barraca.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          {effectiveIsOpen !== null && (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              effectiveIsOpen 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                effectiveIsOpen ? 'bg-green-200' : 'bg-red-200'
              }`} />
              {effectiveIsOpen ? t('barraca.open') : t('barraca.closed')}
            </span>
          )}
        </div>

        {/* Barraca Number */}
        {barraca.barracaNumber && (
          <div className="absolute bottom-4 right-4">
            <span className="bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              #{barraca.barracaNumber}
            </span>
          </div>
        )}


      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Location */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {barraca.name}
          </h1>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{barraca.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{barraca.typicalHours}</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {t('barraca.about')}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {barraca.description}
          </p>
        </div>

        {/* Menu Preview */}
        {barraca.menuPreview && barraca.menuPreview.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t('barraca.menu')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {barraca.menuPreview.map((item, index) => (
                <span
                  key={index}
                  className="bg-beach-50 text-beach-700 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {barraca.amenities && barraca.amenities.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t('barraca.amenities')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {barraca.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm"
                >
                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {t('barraca.contact')}
          </h2>
          <div className="space-y-3">
            {barraca.contact?.phone && (
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-3 text-gray-500" />
                <a
                  href={`tel:${barraca.contact.phone}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {barraca.contact.phone}
                </a>
              </div>
            )}
            {barraca.contact?.email && (
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <a
                  href={`mailto:${barraca.contact.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {barraca.contact.email}
                </a>
              </div>
            )}
            {barraca.contact?.website && (
              <div className="flex items-center">
                <ExternalLink className="h-5 w-5 mr-3 text-gray-500" />
                <a
                  href={barraca.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {t('barraca.website')}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {barraca.contact?.phone && (
            <a
              href={`https://wa.me/${formatPhoneForWhatsApp(barraca.contact.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {t('barraca.whatsapp')}
            </a>
          )}
          {barraca.contact?.phone && (
            <a
              href={`tel:${barraca.contact.phone}`}
              className="flex-1 bg-beach-500 text-white px-6 py-3 rounded-lg hover:bg-beach-600 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {t('barraca.call')}
            </a>
          )}
        </div>

        {/* CTA Buttons */}
        {barraca.ctaButtons && barraca.ctaButtons.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Special Offers
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {barraca.ctaButtons
                .filter(button => button && button.action && button.action.value && button.text)
                .map((button, index) => (
                  <a
                    key={index}
                    href={button.action.value}
                    target={button.action.target || "_blank"}
                    rel="noopener noreferrer"
                    className="flex-1 bg-beach-500 text-white px-6 py-3 rounded-lg hover:bg-beach-600 transition-colors text-center font-medium"
                  >
                    {button.text}
                  </a>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarracaPageDetail; 