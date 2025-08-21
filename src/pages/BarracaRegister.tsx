import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, MapPin, Clock, Phone, Mail, Instagram, Globe, Camera, X } from 'lucide-react';
import { BarracaRegistration } from '../types';
import RegistrationMarquee from '../components/RegistrationMarquee';

const BarracaRegister: React.FC = () => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<BarracaRegistration>>({
    name: '',
    barracaNumber: '',
    location: '',
    coordinates: { lat: -22.9711, lng: -43.1822 },
    typicalHours: '9:00 - 18:00',
    description: '',
    nearestPosto: '',
    contact: {
      phone: '',
      email: '',
      instagram: '',
      website: ''
    },
    amenities: [''],
    environment: [],
    defaultPhoto: '',
    weekendHoursEnabled: false,
    weekendHours: {
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '20:00' }
    },
    additionalInfo: '',
    // Partnership opportunities
    qrCodes: false,
    repeatDiscounts: false,
    hotelPartnerships: false,
    contentCreation: false,
    onlineOrders: false,
    // Contact preferences for photos and status updates
    contactForPhotos: false,
    contactForStatus: false,
    preferredContactMethod: undefined
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Complete list of South Zone neighborhoods
  const southZoneNeighborhoods = [
    'Copacabana', 
    'Ipanema', 
    'Leblon', 
    'Leme', 
    'Arpoador',
    'Diabo Beach',
    'Flamengo',
    'Botafogo',
    'Urca',
    'Vermelha Beach',
    'São Conrado',
    'Barra da Tijuca',
    'Recreio',
    'Prainha',
    'Grumari',
    'Niterói'
  ];

  // Common amenities
  const commonAmenities = [
    'WiFi',
    'Shower',
    'Food',
    'Lockers'  
];

  // Common environment types
  const commonEnvironments = [
    'Family Friendly',
    'LGBTQ+',
    'Relaxed',
    'Volleyball',
    'Frescoball',
    'Party',
    'Sports',
    'Romantic',
    'Quiet',
    'Beach Games',
    'Fitness',
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact!,
        [field]: value
      }
    }));
  };

  const handleArrayFieldChange = (field: 'amenities' | 'environment', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.map((item, i) => i === index ? value : item) || []
    }));
  };

  const addArrayFieldItem = (field: 'amenities' | 'environment') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayFieldItem = (field: 'amenities' | 'environment', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleWeekendHoursChange = (day: 'friday' | 'saturday' | 'sunday', field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      weekendHours: {
        ...prev.weekendHours!,
        [day]: {
          ...prev.weekendHours![day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Clean up the data
      const cleanedData = {
        ...formData,
        amenities: formData.amenities?.filter(amenity => amenity.trim() !== '') || [],
        environment: formData.environment?.filter(env => env.trim() !== '') || [],
        contact: {
          phone: formData.contact?.phone?.trim() || '',
          email: formData.contact?.email?.trim() || '',
          instagram: formData.contact?.instagram?.trim() || '',
          website: formData.contact?.website?.trim() || ''
        }
      };

      // Submit to registration service
      const response = await fetch('/api/barraca-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }

      setSubmitMessage({ type: 'success', text: t('registration.form.successMessage') });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          barracaNumber: '',
          location: '',
          coordinates: { lat: -22.9711, lng: -43.1822 },
          typicalHours: '9:00 - 18:00',
          description: '',
          nearestPosto: '',
          contact: {
            phone: '',
            email: '',
            instagram: '',
            website: ''
          },
          amenities: [''],
          environment: [],
          defaultPhoto: '',
          weekendHoursEnabled: false,
          weekendHours: {
            friday: { open: '10:00', close: '22:00' },
            saturday: { open: '10:00', close: '22:00' },
            sunday: { open: '10:00', close: '20:00' }
          },
          additionalInfo: '',
          // Partnership opportunities
          qrCodes: false,
          repeatDiscounts: false,
          hotelPartnerships: false,
          contentCreation: false,
          onlineOrders: false,
          // Contact preferences for photos and status updates
          contactForPhotos: false,
          contactForStatus: false,
          preferredContactMethod: undefined
        });
      }, 3000);

    } catch (error) {
      console.error('Registration error:', error);
      setSubmitMessage({ type: 'error', text: t('registration.form.errorMessage') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100 flex items-center justify-center p-4 pt-20">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-beach-500 to-beach-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('registration.title')}
          </h1>
          <p className="text-gray-600">
            {t('registration.subtitle')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.basicInfo')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.name')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  placeholder={t('registration.form.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.barracaNumber')}
                </label>
                <input
                  type="text"
                  value={formData.barracaNumber}
                  onChange={(e) => handleInputChange('barracaNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  placeholder={t('registration.form.barracaNumberPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('registration.form.location')} *
              </label>
              <select
                required
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
              >
                <option value="">{t('registration.form.locationPlaceholder')}</option>
                {southZoneNeighborhoods.map(neighborhood => (
                  <option key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('registration.form.description')} *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                placeholder={t('registration.form.descriptionPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nearest Posto
              </label>
              <input
                type="text"
                value={formData.nearestPosto || ''}
                onChange={(e) => handleInputChange('nearestPosto', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                placeholder="e.g., Posto 6, Posto 9"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.contactInfo')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.phone')} *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    value={formData.contact?.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                    placeholder={t('registration.form.phonePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.email')} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={formData.contact?.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                    placeholder={t('registration.form.emailPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.instagram')}
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.contact?.instagram}
                    onChange={(e) => handleContactChange('instagram', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                    placeholder={t('registration.form.instagramPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.website')}
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.contact?.website}
                    onChange={(e) => handleContactChange('website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                    placeholder={t('registration.form.websitePlaceholder')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.hours')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.typicalHours')} *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.typicalHours}
                    onChange={(e) => handleInputChange('typicalHours', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                    placeholder={t('registration.form.typicalHoursPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="weekendHoursEnabled"
                  checked={formData.weekendHoursEnabled}
                  onChange={(e) => handleInputChange('weekendHoursEnabled', e.target.checked)}
                  className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                />
                <label htmlFor="weekendHoursEnabled" className="text-sm font-medium text-gray-700">
                  {t('registration.form.weekendHoursEnabled')}
                </label>
              </div>
            </div>

            {formData.weekendHoursEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['friday', 'saturday', 'sunday'] as const).map(day => (
                  <div key={day} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={formData.weekendHours?.[day]?.open}
                        onChange={(e) => handleWeekendHoursChange(day, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                      />
                      <input
                        type="time"
                        value={formData.weekendHours?.[day]?.close}
                        onChange={(e) => handleWeekendHoursChange(day, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.amenities')}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonAmenities.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.amenities?.includes(amenity)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          amenities: [...(prev.amenities || []), amenity]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          amenities: prev.amenities?.filter(a => a !== amenity) || []
                        }));
                      }
                    }}
                    className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amenities
              </label>
              {formData.amenities?.filter(amenity => !commonAmenities.includes(amenity)).map((amenity, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={amenity}
                    onChange={(e) => handleArrayFieldChange('amenities', index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                    placeholder="Custom amenity"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayFieldItem('amenities', index)}
                    className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayFieldItem('amenities')}
                className="px-4 py-2 text-beach-600 hover:bg-beach-50 rounded-lg border border-beach-200"
              >
                + Add Custom Amenity
              </button>
            </div>
          </div>

          {/* Environment */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.environment')}
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              {t('registration.form.environmentDescription')}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonEnvironments.map(environment => (
                <label key={environment} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.environment?.includes(environment)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          environment: [...(prev.environment || []), environment]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          environment: prev.environment?.filter(e => e !== environment) || []
                        }));
                      }
                    }}
                    className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                  />
                  <span className="text-sm text-gray-700">{environment}</span>
                </label>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('registration.form.customEnvironment')}
              </label>
              {formData.environment?.filter(env => !commonEnvironments.includes(env)).map((env, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={env}
                    onChange={(e) => handleArrayFieldChange('environment', index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                    placeholder={t('registration.form.customEnvironmentPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayFieldItem('environment', index)}
                    className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                  >
                    {t('registration.form.remove')}
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayFieldItem('environment')}
                className="px-4 py-2 text-beach-600 hover:bg-beach-50 rounded-lg border border-beach-200"
              >
                + {t('registration.form.addCustomEnvironment')}
              </button>
            </div>
          </div>

          {/* Partnership Opportunities */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.partnership')}
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              {t('registration.form.partnershipDescription')}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="qrCodes"
                  checked={formData.qrCodes}
                  onChange={(e) => handleInputChange('qrCodes', e.target.checked)}
                  className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                />
                <label htmlFor="qrCodes" className="text-sm font-medium text-gray-700">
                  {t('registration.form.qrCodesDescription')}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="repeatDiscounts"
                  checked={formData.repeatDiscounts}
                  onChange={(e) => handleInputChange('repeatDiscounts', e.target.checked)}
                  className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                />
                <label htmlFor="repeatDiscounts" className="text-sm font-medium text-gray-700">
                  {t('registration.form.repeatDiscountsDescription')}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="hotelPartnerships"
                  checked={formData.hotelPartnerships}
                  onChange={(e) => handleInputChange('hotelPartnerships', e.target.checked)}
                  className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                />
                <label htmlFor="hotelPartnerships" className="text-sm font-medium text-gray-700">
                  {t('registration.form.hotelPartnershipsDescription')}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="contentCreation"
                  checked={formData.contentCreation}
                  onChange={(e) => handleInputChange('contentCreation', e.target.checked)}
                  className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                />
                <label htmlFor="contentCreation" className="text-sm font-medium text-gray-700">
                  {t('registration.form.contentCreationDescription')}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="onlineOrders"
                  checked={formData.onlineOrders}
                  onChange={(e) => handleInputChange('onlineOrders', e.target.checked)}
                  className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                />
                <label htmlFor="onlineOrders" className="text-sm font-medium text-gray-700">
                  {t('registration.form.onlineOrdersDescription')}
                </label>
              </div>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.contactPreferences')}
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              {t('registration.form.contactPreferencesDescription')}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="contactForPhotos"
                  checked={formData.contactForPhotos}
                  onChange={(e) => handleInputChange('contactForPhotos', e.target.checked)}
                  className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                />
                <label htmlFor="contactForPhotos" className="text-sm font-medium text-gray-700">
                  {t('registration.form.contactForPhotosDescription')}
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="contactForStatus"
                  checked={formData.contactForStatus}
                  onChange={(e) => handleInputChange('contactForStatus', e.target.checked)}
                  className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                />
                <label htmlFor="contactForStatus" className="text-sm font-medium text-gray-700">
                  {t('registration.form.contactForStatusDescription')}
                </label>
              </div>

              {(formData.contactForPhotos || formData.contactForStatus) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('registration.form.preferredContactMethod')}
                  </label>
                  <select
                    value={formData.preferredContactMethod || ''}
                    onChange={(e) => handleInputChange('preferredContactMethod', e.target.value || undefined)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  >
                    <option value="">{t('registration.form.selectContactMethod')}</option>
                    <option value="whatsapp">{t('registration.form.whatsapp')}</option>
                    <option value="instagram">{t('registration.form.instagram')}</option>
                    <option value="email">{t('registration.form.email')}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

                     {/* Default Photo */}
           <div className="space-y-6">
             <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
               {t('registration.form.defaultPhoto')}
             </h2>
             
             <div className="space-y-4">
               <p className="text-sm text-gray-600">
                 {t('registration.form.defaultPhotoDescription')}. This will be the main photo displayed for your barraca.
               </p>
               
               <div className="flex items-center justify-center w-full">
                 <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
                     {formData.defaultPhoto ? (
                       <div className="relative w-full h-full">
                         <img 
                           src={formData.defaultPhoto} 
                           alt="Barraca preview" 
                           className="w-full h-full object-cover rounded-lg"
                         />
                         <button
                           type="button"
                           onClick={() => handleInputChange('defaultPhoto', '')}
                           className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       </div>
                     ) : (
                       <>
                         <Camera className="w-8 h-8 mb-4 text-gray-500" />
                         <p className="mb-2 text-sm text-gray-500">
                           <span className="font-semibold">Click to upload</span> or drag and drop
                         </p>
                         <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                       </>
                     )}
                   </div>
                   <input 
                     type="file" 
                     className="hidden" 
                     accept="image/*"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onload = (e) => {
                           handleInputChange('defaultPhoto', e.target?.result as string);
                         };
                         reader.readAsDataURL(file);
                       }
                     }}
                   />
                 </label>
               </div>
             </div>
           </div>

           {/* Additional Information */}
           <div className="space-y-6">
             <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
               {t('registration.form.additionalInfo')}
             </h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   {t('registration.form.additionalInfo')}
                 </label>
                 <textarea
                   value={formData.additionalInfo}
                   onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                   rows={4}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                   placeholder={t('registration.form.additionalInfoPlaceholder')}
                 />
               </div>
             </div>
           </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            {submitMessage && (
              <div className={`mb-4 p-4 rounded-lg ${
                submitMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submitMessage.text}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-beach-600 hover:bg-beach-700 disabled:bg-beach-400 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{isSubmitting ? t('registration.form.submitting') : t('registration.form.submit')}</span>
            </button>
            
            <p className="text-sm text-gray-500 text-center mt-4">
              By submitting this form, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </form>
      </div>
      
      {/* Registration Marquee */}
      <RegistrationMarquee />
    </div>
  );
};

export default BarracaRegister;
