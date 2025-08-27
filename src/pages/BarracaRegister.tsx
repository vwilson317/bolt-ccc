import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Save, MapPin, Clock, Phone, Mail, Instagram, Camera, X, Handshake } from 'lucide-react';
import { BarracaRegistration } from '../types';
import RegistrationMarquee from '../components/RegistrationMarquee';
import { useAnalytics } from '../hooks/useAnalytics';

const BarracaRegister: React.FC = () => {
  const { t } = useTranslation();
  const analytics = useAnalytics();
  
  const [formData, setFormData] = useState<Partial<BarracaRegistration>>({
    name: '',
    ownerName: '',
    barracaNumber: '',
    location: '',
    coordinates: { lat: -22.9711, lng: -43.1822 },
    typicalHours: '',
    description: '',
    nearestPosto: '',
    contact: {
      phone: '',
      email: '',
      instagram: ''
    },
    countryCode: '+55',
    amenities: [],
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
    preferredContactMethod: 'whatsapp',
    // English fluency information
    englishFluency: 'no',
    englishSpeakerNames: '',
    // Tab system for tracking orders
    tabSystem: 'name_only'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    phone?: string;
    email?: string;
  }>({});
  const [hasStartedForm, setHasStartedForm] = useState(false);
  const [lastFieldInteracted, setLastFieldInteracted] = useState<string>();

  // Track form view on component mount
  useEffect(() => {
    analytics.trackBarracaRegistrationView();
    
    // Track form abandonment on page unload
    const handleBeforeUnload = () => {
      if (hasStartedForm) {
        analytics.trackBarracaRegistrationAbandonment(lastFieldInteracted);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasStartedForm, lastFieldInteracted, analytics]);

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
    t('registration.amenities.WiFi'),
    t('registration.amenities.Shower'),
    t('registration.amenities.Food'),
    t('registration.amenities.Lockers')  
];

  // Common vibe types from translations
  const commonVibes = [
    t('registration.vibes.familyFriendly'),
    t('registration.vibes.lgbtq'),
    t('registration.vibes.relaxed'),
    t('registration.vibes.volleyball'),
    t('registration.vibes.frescoball'),
    t('registration.vibes.party'),
    t('registration.vibes.sports'),
    t('registration.vibes.romantic'),
    t('registration.vibes.quiet'),
    t('registration.vibes.beachGames'),
    t('registration.vibes.fitness'),
  ];

  const handleInputChange = (field: string, value: any) => {
    // Track form start on first interaction
    if (!hasStartedForm) {
      setHasStartedForm(true);
      analytics.trackBarracaRegistrationStart();
    }
    
    // Track field interaction
    setLastFieldInteracted(field);
    analytics.trackBarracaRegistrationFieldInteraction(field, typeof value === 'string' ? value : undefined);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    // Track form start on first interaction
    if (!hasStartedForm) {
      setHasStartedForm(true);
      analytics.trackBarracaRegistrationStart();
    }
    
    // Track field interaction
    setLastFieldInteracted(`contact.${field}`);
    analytics.trackBarracaRegistrationFieldInteraction(`contact.${field}`, value);
    
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact!,
        [field]: value
      }
    }));

    // Clear validation error when user starts typing
    setValidationErrors(prev => ({
      ...prev,
      [field]: undefined
    }));

    // Real-time validation
    if (field === 'phone' && value.trim()) {
      if (!validateBrazilianPhone(value)) {
        const errorMessage = 'Please enter a valid Brazilian phone number';
        setValidationErrors(prev => ({
          ...prev,
          phone: errorMessage
        }));
        // Track validation error
        analytics.trackBarracaRegistrationValidationError('phone', errorMessage);
      }
    } else if (field === 'email' && value.trim()) {
      if (!validateEmail(value)) {
        const errorMessage = 'Please enter a valid email address';
        setValidationErrors(prev => ({
          ...prev,
          email: errorMessage
        }));
        // Track validation error
        analytics.trackBarracaRegistrationValidationError('email', errorMessage);
      }
    }
  };

  const handleArrayFieldChange = (field: 'amenities' | 'environment', filteredIndex: number, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const commonItems = field === 'amenities' ? commonAmenities : commonVibes;
      const customItems = currentArray.filter(item => !commonItems.includes(item));
      
      // Find the actual index in the original array
      const actualIndex = currentArray.findIndex(item => item === customItems[filteredIndex]);
      
      if (actualIndex === -1) return prev; // Item not found, return unchanged
      
      return {
        ...prev,
        [field]: currentArray.map((item, i) => i === actualIndex ? value : item)
      };
    });
  };

  const addArrayFieldItem = (field: 'amenities' | 'environment') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const removeArrayFieldItem = (field: 'amenities' | 'environment', filteredIndex: number) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      const commonItems = field === 'amenities' ? commonAmenities : commonVibes;
      const customItems = currentArray.filter(item => !commonItems.includes(item));
      
      // Find the actual index in the original array
      const actualIndex = currentArray.findIndex(item => item === customItems[filteredIndex]);
      
      if (actualIndex === -1) return prev; // Item not found, return unchanged
      
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== actualIndex)
      };
    });
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

  // Validation functions
  const validateBrazilianPhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Brazilian phone numbers should be 10-11 digits
    // Mobile: 11 digits (e.g., 11987654321)
    // Landline: 10 digits (e.g., 1187654321)
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return false;
    }
    
    // Check if it starts with a valid area code (11-99)
    const areaCode = parseInt(cleanPhone.substring(0, 2));
    if (areaCode < 11 || areaCode > 99) {
      return false;
    }
    
    return true;
  };

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Quick helper to fill the form with test data for verification
  const fillWithTestData = () => {
    setFormData({
      name: 'Barraca Teste do Carioca',
      ownerName: 'João Silva',
      barracaNumber: '42',
      location: 'Ipanema',
      coordinates: { lat: -22.985, lng: -43.2048 },
      typicalHours: '09:00 - 18:00',
      description: 'Barraca confortável com ótimos petiscos, cadeiras e guarda-sóis. Ideal para família.',
      nearestPosto: 'Posto 9',
      contact: {
        phone: '(21) 98765-4321',
        email: 'contato@barracateste.com',
        instagram: '@barracateste'
      },
      countryCode: '+55',
      amenities: [
        t('registration.amenities.WiFi'),
        t('registration.amenities.Food'),
        t('registration.amenities.Shower')
      ],
      environment: [
        t('registration.vibes.familyFriendly'),
        t('registration.vibes.relaxed'),
        t('registration.vibes.beachGames')
      ],
      defaultPhoto: '/group-v-1.jpg',
      weekendHoursEnabled: true,
      weekendHours: {
        friday: { open: '10:00', close: '22:00' },
        saturday: { open: '09:00', close: '22:00' },
        sunday: { open: '09:00', close: '20:00' }
      },
      additionalInfo: 'Aceitamos cartão e PIX. Promoções especiais nos fins de semana.',
      qrCodes: true,
      repeatDiscounts: true,
      hotelPartnerships: false,
      contentCreation: true,
      onlineOrders: false,
      contactForPhotos: true,
      contactForStatus: true,
      preferredContactMethod: 'whatsapp',
      englishFluency: 'fluent',
      englishSpeakerNames: 'Ana, João',
      tabSystem: 'number_on_chair'
    });
    setValidationErrors({});
  };

  // Helper function to strip country code from phone number for display
  const getDisplayPhoneNumber = (phone: string, countryCode: string) => {
    if (!phone) return '';
    // Remove the country code if it's at the beginning of the phone number
    const codeToRemove = countryCode.replace('+', '');
    if (phone.startsWith(countryCode) || phone.startsWith(codeToRemove)) {
      return phone.replace(new RegExp(`^(${countryCode}|${codeToRemove})\\s*`), '').trim();
    }
    return phone;
  };

  // Helper function to get the full phone number with country code
  const getFullPhoneNumber = (phone: string, countryCode: string) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\s+/g, ' ').trim();
    return `${countryCode} ${cleanPhone}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!validateBrazilianPhone(formData.contact?.phone || '')) {
      toast.error('Please enter a valid Brazilian phone number (e.g., (11) 98765-4321 or 11987654321)');
      return;
    }
    
    // Validate email if provided
    if (formData.contact?.email && !validateEmail(formData.contact.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Show loading toast
    console.log('Showing loading toast...');
    const loadingToast = toast.loading(t('toast.loading'));
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Clean up the data
      const cleanedData = {
        ...formData,
        amenities: formData.amenities?.filter(amenity => amenity.trim() !== '') || [],
        environment: formData.environment?.filter(env => env.trim() !== '') || [],
        contact: {
          phone: getFullPhoneNumber(formData.contact?.phone?.trim() || '', formData.countryCode || '+55'),
          email: formData.contact?.email?.trim() || '',
          instagram: formData.contact?.instagram?.trim() || ''
        }
      };

      // Submit to registration service
      const response = await fetch('/.netlify/functions/barraca-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to submit registration: ${response.status} ${responseText}`);
      }

      // Dismiss loading toast and show success toast
      console.log('Showing success toast...');
      toast.dismiss(loadingToast);
      toast.success(t('toast.success'));
      setSubmitMessage({ type: 'success', text: t('registration.form.successMessage') });
      
      // Track successful submission
      analytics.trackBarracaRegistrationSubmit(true, cleanedData);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          ownerName: '',
          barracaNumber: '',
          location: '',
          coordinates: { lat: -22.9711, lng: -43.1822 },
          typicalHours: '9:00 - 18:00',
          description: '',
          nearestPosto: '',
          contact: {
            phone: '',
            email: '',
            instagram: ''
          },
          countryCode: '+55',
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
          preferredContactMethod: 'whatsapp',
          // English fluency information
          englishFluency: 'no',
          englishSpeakerNames: '',
          // Tab system for tracking orders
          tabSystem: 'name_only'
        });
        // Clear validation errors
        setValidationErrors({});
        // Reset submit message
        setSubmitMessage(null);
        // Reset submitting state
        setIsSubmitting(false);
      }, 3000);

    } catch (error) {
      console.error('Registration error:', error);
      // Dismiss loading toast and show error toast
      console.log('Showing error toast...');
      toast.dismiss(loadingToast);
      toast.error(t('toast.error'));
      setSubmitMessage({ type: 'error', text: t('registration.form.errorMessage') });
      
      // Track failed submission
      analytics.trackBarracaRegistrationSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100">
      {/* Registration Marquee at the top */}
      <RegistrationMarquee />
      
      <div className="flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-beach-500 to-beach-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Handshake className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('registration.title')}
            </h1>
            <p className="text-gray-600 mb-4">
              {t('registration.subtitle')}
            </p>
            {/* <div className="flex justify-center">
              <button
                type="button"
                onClick={fillWithTestData}
                className="px-4 py-2 text-sm font-medium text-white bg-beach-600 hover:bg-beach-700 rounded-lg shadow"
              >
                Fill with test data
              </button>
            </div> */}
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
                  {t('registration.form.ownerName')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  placeholder={t('registration.form.ownerNamePlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.nearestPosto')} *
                </label>
                <select
                  required
                  value={formData.nearestPosto || ''}
                  onChange={(e) => handleInputChange('nearestPosto', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                >
                  <option value="">{t('registration.form.selectPosto')}</option>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={`Posto ${num}`}>
                      Posto {num}
                    </option>
                  ))}
                </select>
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


          </div>

          {/* English Fluency & Tab System */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.englishFluency')} & {t('registration.form.tabSystem')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* English Fluency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.englishFluency')} *
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  {t('registration.form.englishFluencyDescription')}
                </p>
                <select
                  value={formData.englishFluency || 'no'}
                  onChange={(e) => handleInputChange('englishFluency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                >
                  <option value="no">{t('registration.form.englishFluencyNo')}</option>
                  <option value="not_fluent">{t('registration.form.englishFluencyNotFluent')}</option>
                  <option value="fluent">{t('registration.form.englishFluencyFluent')}</option>
                </select>
              </div>

              {/* Tab System */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.tabSystem')} *
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  {t('registration.form.tabSystemDescription')}
                </p>
                <select
                  value={formData.tabSystem || 'name_only'}
                  onChange={(e) => handleInputChange('tabSystem', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                >
                  <option value="name_only">{t('registration.form.tabSystemNameOnly')}</option>
                  <option value="individual_paper">{t('registration.form.tabSystemIndividualPaper')}</option>
                  <option value="number_on_chair">{t('registration.form.tabSystemNumberOnChair')}</option>
                  <option value="digital">{t('registration.form.tabSystemDigital')}</option>
                </select>
              </div>
            </div>

            {/* English Speaker Names - Only show if fluent is selected */}
            {formData.englishFluency === 'fluent' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.englishSpeakerNames')} *
                </label>
                <input
                  type="text"
                  value={formData.englishSpeakerNames || ''}
                  onChange={(e) => handleInputChange('englishSpeakerNames', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  placeholder={t('registration.form.englishSpeakerNamesPlaceholder')}
                />
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.contactInfo')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.phone')} *
                </label>
                <div className="flex">
                  <div className="relative w-28">
                    <select
                      value={formData.countryCode || '+55'}
                      onChange={(e) => handleInputChange('countryCode', e.target.value)}
                      className="w-full pl-2 pr-6 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent bg-white text-gray-900 text-sm font-medium"
                      style={{ fontSize: '14px' }}
                    >
                      <option value="+55" className="text-gray-900">🇧🇷 +55</option>
                      <option value="+1" className="text-gray-900">🇺🇸 +1</option>
                      <option value="+44" className="text-gray-900">🇬🇧 +44</option>
                      <option value="+33" className="text-gray-900">🇫🇷 +33</option>
                      <option value="+49" className="text-gray-900">🇩🇪 +49</option>
                      <option value="+34" className="text-gray-900">🇪🇸 +34</option>
                      <option value="+39" className="text-gray-900">🇮🇹 +39</option>
                      <option value="+81" className="text-gray-900">🇯🇵 +81</option>
                      <option value="+86" className="text-gray-900">🇨🇳 +86</option>
                      <option value="+91" className="text-gray-900">🇮🇳 +91</option>
                      <option value="+7" className="text-gray-900">🇷🇺 +7</option>
                      <option value="+61" className="text-gray-900">🇦🇺 +61</option>
                      <option value="+52" className="text-gray-900">🇲🇽 +52</option>
                      <option value="+54" className="text-gray-900">🇦🇷 +54</option>
                      <option value="+56" className="text-gray-900">🇨🇱 +56</option>
                      <option value="+57" className="text-gray-900">🇨🇴 +57</option>
                      <option value="+58" className="text-gray-900">🇻🇪 +58</option>
                      <option value="+593" className="text-gray-900">🇪🇨 +593</option>
                      <option value="+595" className="text-gray-900">🇵🇾 +595</option>
                      <option value="+598" className="text-gray-900">🇺🇾 +598</option>
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      required
                      value={getDisplayPhoneNumber(formData.contact?.phone || '', formData.countryCode || '+55')}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border border-l-0 rounded-r-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent ${
                        validationErrors.phone 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-beach-500'
                      }`}
                      placeholder="(11) 98765-4321 or 11987654321"
                    />
                  </div>
                </div>
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Format: (11) 98765-4321 or 11987654321
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('registration.form.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.contact?.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent ${
                      validationErrors.email 
                        ? 'border-red-300 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-beach-500'
                    }`}
                    placeholder={t('registration.form.emailPlaceholder')}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                )}
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

          {/* Vibe */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {t('registration.form.vibe')}
            </h2>
            
            <p className="text-sm text-gray-600 mb-4">
              {t('registration.form.vibeDescription')}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonVibes.map((vibe: string) => (
                <label key={vibe} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.environment?.includes(vibe)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({
                          ...prev,
                          environment: [...(prev.environment || []), vibe]
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          environment: prev.environment?.filter(e => e !== vibe) || []
                        }));
                      }
                    }}
                    className="w-4 h-4 text-beach-600 border-gray-300 rounded focus:ring-beach-500"
                  />
                  <span className="text-sm text-gray-700">{vibe}</span>
                </label>
              ))}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('registration.form.customVibe')}
              </label>
              {formData.environment?.filter(env => !commonVibes.includes(env)).map((env, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={env}
                    onChange={(e) => handleArrayFieldChange('environment', index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                    placeholder={t('registration.form.customVibePlaceholder')}
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
                + {t('registration.form.addCustomVibe')}
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
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {(() => {
                  const selectedCount = [
                    formData.qrCodes,
                    formData.repeatDiscounts,
                    formData.hotelPartnerships,
                    formData.contentCreation,
                    formData.onlineOrders
                  ].filter(Boolean).length;
                  return t('registration.form.partnershipsSelected', { count: selectedCount });
                })()}
              </div>
              <button
                type="button"
                onClick={() => {
                  const allSelected = formData.qrCodes && formData.repeatDiscounts && 
                    formData.hotelPartnerships && formData.contentCreation && formData.onlineOrders;
                  
                  setFormData(prev => ({
                    ...prev,
                    qrCodes: !allSelected,
                    repeatDiscounts: !allSelected,
                    hotelPartnerships: !allSelected,
                    contentCreation: !allSelected,
                    onlineOrders: !allSelected
                  }));
                }}
                className="px-4 py-2 text-sm font-medium text-beach-600 hover:bg-beach-50 rounded-lg border border-beach-200 transition-colors"
              >
                {formData.qrCodes && formData.repeatDiscounts && 
                 formData.hotelPartnerships && formData.contentCreation && formData.onlineOrders
                  ? t('registration.form.clearAllPartnerships')
                  : t('registration.form.selectAllPartnerships')
                }
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="qrCodes"
                  checked={formData.qrCodes}
                  onChange={(e) => {
                    handleInputChange('qrCodes', e.target.checked);
                    analytics.trackBarracaRegistrationPartnershipSelection('QR Codes', e.target.checked);
                  }}
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
                  onChange={(e) => {
                    handleInputChange('repeatDiscounts', e.target.checked);
                    analytics.trackBarracaRegistrationPartnershipSelection('Repeat Discounts', e.target.checked);
                  }}
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
                  onChange={(e) => {
                    handleInputChange('hotelPartnerships', e.target.checked);
                    analytics.trackBarracaRegistrationPartnershipSelection('Hotel Partnerships', e.target.checked);
                  }}
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
                  onChange={(e) => {
                    handleInputChange('contentCreation', e.target.checked);
                    analytics.trackBarracaRegistrationPartnershipSelection('Content Creation', e.target.checked);
                  }}
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
                  onChange={(e) => {
                    handleInputChange('onlineOrders', e.target.checked);
                    analytics.trackBarracaRegistrationPartnershipSelection('Online Orders', e.target.checked);
                  }}
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
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {(() => {
                  const selectedCount = [
                    formData.contactForPhotos,
                    formData.contactForStatus
                  ].filter(Boolean).length;
                  return t('registration.form.preferencesSelected', { count: selectedCount });
                })()}
              </div>
              <button
                type="button"
                onClick={() => {
                  const allSelected = formData.contactForPhotos && formData.contactForStatus;
                  
                  setFormData(prev => ({
                    ...prev,
                    contactForPhotos: !allSelected,
                    contactForStatus: !allSelected
                  }));
                }}
                className="px-4 py-2 text-sm font-medium text-beach-600 hover:bg-beach-50 rounded-lg border border-beach-200 transition-colors"
              >
                {formData.contactForPhotos && formData.contactForStatus
                  ? t('registration.form.clearAllPreferences')
                  : t('registration.form.selectAllPreferences')
                }
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="contactForPhotos"
                  checked={formData.contactForPhotos}
                  onChange={(e) => {
                    handleInputChange('contactForPhotos', e.target.checked);
                    analytics.trackBarracaRegistrationContactPreference('Contact for Photos', e.target.checked);
                  }}
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
                  onChange={(e) => {
                    handleInputChange('contactForStatus', e.target.checked);
                    analytics.trackBarracaRegistrationContactPreference('Contact for Status', e.target.checked);
                  }}
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
                 <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                   formData.defaultPhoto 
                     ? 'border-beach-300 bg-beach-50 hover:bg-beach-100' 
                     : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                 }`}>
                   <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full h-full">
                     {formData.defaultPhoto ? (
                       <div className="relative w-full h-full">
                         <img 
                           src={formData.defaultPhoto} 
                           alt="Barraca preview" 
                           className="w-full h-full object-cover rounded-lg"
                         />
                         <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                           <button
                             type="button"
                             onClick={(e) => {
                               e.preventDefault();
                               e.stopPropagation();
                               handleInputChange('defaultPhoto', '');
                             }}
                             className="opacity-0 hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200"
                             title="Remove photo"
                           >
                             <X className="w-5 h-5" />
                           </button>
                         </div>
                         <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                           {t('registration.form.clickToChangePhoto')}
                         </div>
                       </div>
                     ) : (
                       <>
                         <Camera className="w-8 h-8 mb-4 text-gray-500" />
                         <p className="mb-2 text-sm text-gray-500">
                           <span className="font-semibold">{t('registration.form.clickToUpload')}</span> {t('registration.form.dragAndDrop')}
                         </p>
                         <p className="text-xs text-gray-500">{t('registration.form.fileTypes')}</p>
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
                                                 // Validate file size (10MB limit)
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error(t('registration.form.fileSizeError'));
                          analytics.trackBarracaRegistrationPhotoUpload(false, file.size);
                          return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          handleInputChange('defaultPhoto', e.target?.result as string);
                          analytics.trackBarracaRegistrationPhotoUpload(true, file.size);
                        };
                        reader.onerror = () => {
                          analytics.trackBarracaRegistrationPhotoUpload(false, file.size);
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
    </div>
  </div>
  );
};

export default BarracaRegister;
