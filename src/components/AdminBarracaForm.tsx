import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, Plus, Trash2, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Barraca, CTAButtonConfig } from '../types';

interface AdminBarracaFormProps {
  barracaId?: string | null;
  onCancel: () => void;
  onSave: () => void;
}

const AdminBarracaForm: React.FC<AdminBarracaFormProps> = ({ barracaId, onCancel, onSave }) => {
  const { t } = useTranslation();
  const { barracas, addBarraca, updateBarraca } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    barracaNumber: '',
    location: '',
    coordinates: { lat: -22.9711, lng: -43.1822 },
    isOpen: true,
    typicalHours: '9:00 - 18:00',
    description: '',
    images: [''],
    menuPreview: [''],
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    amenities: [''],
    weatherDependent: false,
    partnered: false,
    weekendHoursEnabled: false,
    weekendHours: {
      friday: { open: '10:00', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '20:00' }
    },
    specialAdminOverride: false,
    specialAdminOverrideExpires: null as Date | null,
    ctaButtons: [] as CTAButtonConfig[]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showCTAConfig, setShowCTAConfig] = useState(false);

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
    'Joatinga',
    'Pepino Beach'
  ];

  const ctaButtonStyles = ['primary', 'secondary', 'outline', 'ghost'];
  const ctaButtonTypes = ['url', 'phone', 'email', 'whatsapp', 'reservation', 'custom'];
  const iconOptions = ['Calendar', 'Eye', 'MessageCircle', 'Menu', 'Phone', 'Mail', 'ExternalLink', 'Star'];

  useEffect(() => {
    if (barracaId) {
      const barraca = barracas.find(b => b.id === barracaId);
      if (barraca) {
        setFormData({
          name: barraca.name,
          barracaNumber: barraca.barracaNumber || '',
          location: barraca.location,
          coordinates: barraca.coordinates,
          isOpen: barraca.isOpen,
          typicalHours: barraca.typicalHours,
          description: barraca.description,
          images: barraca.images,
          menuPreview: barraca.menuPreview,
          contact: {
            phone: barraca.contact.phone || '',
            email: barraca.contact.email || '',
            website: barraca.contact.website || ''
          },
          amenities: barraca.amenities,
          weatherDependent: barraca.weatherDependent,
          partnered: barraca.partnered,
          weekendHoursEnabled: barraca.weekendHoursEnabled,
          weekendHours: barraca.weekendHours || {
            friday: { open: '10:00', close: '22:00' },
            saturday: { open: '10:00', close: '22:00' },
            sunday: { open: '10:00', close: '20:00' }
          },
          specialAdminOverride: barraca.specialAdminOverride,
          specialAdminOverrideExpires: barraca.specialAdminOverrideExpires,
          ctaButtons: barraca.ctaButtons || []
        });
      }
    }
  }, [barracaId, barracas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const barracaData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
        menuPreview: formData.menuPreview.filter(item => item.trim() !== ''),
        amenities: formData.amenities.filter(amenity => amenity.trim() !== ''),
        ctaButtons: formData.ctaButtons.filter(button => button.text.trim() !== '' && button.action.value.trim() !== '')
      };

      if (barracaId) {
        await updateBarraca(barracaId, barracaData);
      } else {
        await addBarraca(barracaData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save barraca:', error);
      // Error message could be added here
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (field: 'images' | 'menuPreview' | 'amenities') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field: 'images' | 'menuPreview' | 'amenities', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: 'images' | 'menuPreview' | 'amenities', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // CTA Button management functions
  const addCTAButton = () => {
    const newButton: CTAButtonConfig = {
      id: `cta-${Date.now()}`,
      text: '',
      action: {
        type: 'url',
        value: '',
        target: '_blank',
        trackingEvent: 'online_store_clicked'
      },
      style: 'primary',
      position: formData.ctaButtons.length + 1,
      visibilityConditions: {},
      enabled: true
    };

    setFormData(prev => ({
      ...prev,
      ctaButtons: [...prev.ctaButtons, newButton]
    }));
  };

  const updateCTAButton = (index: number, updates: Partial<CTAButtonConfig>) => {
    setFormData(prev => ({
      ...prev,
      ctaButtons: prev.ctaButtons.map((button, i) => 
        i === index ? { ...button, ...updates } : button
      )
    }));
  };

  const removeCTAButton = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ctaButtons: prev.ctaButtons.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {barracaId ? t('admin.editBarraca') : t('admin.addBarraca')}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.form.name')} {t('admin.form.required')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.form.barracaNumber')}
            </label>
            <input
              type="text"
              value={formData.barracaNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, barracaNumber: e.target.value }))}
              placeholder="e.g. 001"
              pattern="[0-9]*"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.form.location')} {t('admin.form.required')}
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
            >
              <option value="">{t('admin.form.selectNeighborhood')}</option>
              {southZoneNeighborhoods.map((neighborhood) => (
                <option key={neighborhood} value={neighborhood}>
                  {neighborhood}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.form.description')} {t('admin.form.required')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
          />
        </div>



        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.weatherDependent}
                onChange={(e) => setFormData(prev => ({ ...prev, weatherDependent: e.target.checked }))}
                className="h-4 w-4 text-beach-600 focus:ring-beach-500 border-gray-300 rounded"
                disabled={!formData.partnered}
              />
              <span className={`ml-2 text-sm ${!formData.partnered ? 'text-gray-400' : 'text-gray-700'}`}>
                {t('admin.form.weatherDependent')}
              </span>
            </label>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.partnered}
                onChange={(e) => setFormData(prev => ({ ...prev, partnered: e.target.checked }))}
                className="h-4 w-4 text-beach-600 focus:ring-beach-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{t('admin.form.partnered')}</span>
            </label>
          </div>
        </div>

        {/* Partnered-only fields */}
        {formData.partnered && (
          <>
            {/* Availability and Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.form.availability')}
                </label>
                <select
                  value={formData.isOpen ? 'open' : 'closed'}
                  onChange={(e) => setFormData(prev => ({ ...prev, isOpen: e.target.value === 'open' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                >
                  <option value="open">{t('barraca.open')}</option>
                  <option value="closed">{t('barraca.closed')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.form.typicalHours')}
                </label>
                <input
                  type="text"
                  value={formData.typicalHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, typicalHours: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Weekend Hours */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-medium text-gray-900">Weekend Hours</h4>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.weekendHoursEnabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, weekendHoursEnabled: e.target.checked }))}
                    className="h-4 w-4 text-beach-600 focus:ring-beach-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Weekend Hours</span>
                </label>
              </div>
              
              {formData.weekendHoursEnabled && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Configure specific hours for Friday, Saturday, and Sunday. These hours will override regular business hours on weekends.
                  </p>
                  
                  {/* Friday Hours */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Friday Hours
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={formData.weekendHours.friday.open}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            weekendHours: {
                              ...prev.weekendHours,
                              friday: { ...prev.weekendHours.friday, open: e.target.value }
                            }
                          }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                        />
                        <span className="flex items-center text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData.weekendHours.friday.close}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            weekendHours: {
                              ...prev.weekendHours,
                              friday: { ...prev.weekendHours.friday, close: e.target.value }
                            }
                          }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {/* Saturday Hours */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Saturday Hours
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={formData.weekendHours.saturday.open}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            weekendHours: {
                              ...prev.weekendHours,
                              saturday: { ...prev.weekendHours.saturday, open: e.target.value }
                            }
                          }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                        />
                        <span className="flex items-center text-gray-500">to</span>
                        <input
                          type="time"
                          value={formData.weekendHours.saturday.close}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            weekendHours: {
                              ...prev.weekendHours,
                              saturday: { ...prev.weekendHours.saturday, close: e.target.value }
                            }
                          }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Sunday Hours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sunday Hours
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={formData.weekendHours.sunday.open}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          weekendHours: {
                            ...prev.weekendHours,
                            sunday: { ...prev.weekendHours.sunday, open: e.target.value }
                          }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                      />
                      <span className="flex items-center text-gray-500">to</span>
                      <input
                        type="time"
                        value={formData.weekendHours.sunday.close}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          weekendHours: {
                            ...prev.weekendHours,
                            sunday: { ...prev.weekendHours.sunday, close: e.target.value }
                          }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Images */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('admin.form.images')}
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('images')}
                  className="text-beach-600 hover:text-beach-800 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('admin.form.addImage')}
                </button>
              </div>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => updateArrayItem('images', index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('images', index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Menu Preview */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('admin.form.menuPreview')}
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('menuPreview')}
                  className="text-beach-600 hover:text-beach-800 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('admin.form.addItem')}
                </button>
              </div>
              {formData.menuPreview.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateArrayItem('menuPreview', index, e.target.value)}
                    placeholder="Menu item name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('menuPreview', index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">{t('admin.form.contact')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.form.whatsapp')}
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="+55 21 99999-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.form.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.form.instagram')}
                  </label>
                  <input
                    type="url"
                    value={formData.contact.website}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, website: e.target.value }
                    }))}
                    placeholder="https://instagram.com/barraca"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('admin.form.amenities')}
                </label>
                <button
                  type="button"
                  onClick={() => addArrayItem('amenities')}
                  className="text-beach-600 hover:text-beach-800 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('admin.form.addAmenity')}
                </button>
              </div>
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={amenity}
                    onChange={(e) => updateArrayItem('amenities', index, e.target.value)}
                    placeholder="WiFi, Umbrellas, etc."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('amenities', index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* CTA Buttons Configuration */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">{t('admin.form.ctaButtons')}</h4>
                <button
                  type="button"
                  onClick={() => setShowCTAConfig(!showCTAConfig)}
                  className="flex items-center text-beach-600 hover:text-beach-800 text-sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {showCTAConfig ? t('common.less') : t('common.more')}
                </button>
              </div>

              {showCTAConfig && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  {formData.ctaButtons.map((button, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={button.text}
                        onChange={(e) => updateCTAButton(index, { text: e.target.value })}
                        placeholder="Button text"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                      />
                      <select
                        value={button.action.type}
                        onChange={(e) => updateCTAButton(index, { action: { ...button.action, type: e.target.value as any } })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                      >
                        {ctaButtonTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={button.action.value}
                        onChange={(e) => updateCTAButton(index, { action: { ...button.action, value: e.target.value } })}
                        placeholder="URL, phone, email, etc."
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <select
                          value={button.style}
                          onChange={(e) => updateCTAButton(index, { style: e.target.value as any })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent"
                        >
                          {ctaButtonStyles.map(style => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeCTAButton(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCTAButton}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-beach-500 hover:text-beach-500 transition-colors"
                  >
                    <Plus className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Non-partnered message */}
        {!formData.partnered && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {t('admin.form.partneredRequired')}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{t('admin.form.partneredRequiredMessage')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-gradient-to-r from-beach-500 to-beach-600 text-white rounded-lg hover:from-beach-600 hover:to-beach-700 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center"
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? t('admin.form.saving') : t('admin.form.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBarracaForm;