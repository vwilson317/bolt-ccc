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
  const ctaButtonTypes = ['url', 'phone', 'email', 'whatsapp', 'reservation', 'details', 'custom'];
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
          contact: barraca.contact,
          amenities: barraca.amenities,
          weatherDependent: barraca.weatherDependent,
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Availability and Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.form.availability')}
            </label>
            <select
              value={formData.isOpen ? 'open' : 'closed'}
              onChange={(e) => setFormData(prev => ({ ...prev, isOpen: e.target.value === 'open' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.weatherDependent}
                onChange={(e) => setFormData(prev => ({ ...prev, weatherDependent: e.target.checked }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{t('admin.form.weatherDependent')}</span>
            </label>
          </div>
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
              className="text-orange-600 hover:text-orange-800 flex items-center text-sm"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="text-orange-600 hover:text-orange-800 flex items-center text-sm"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="text-orange-600 hover:text-orange-800 flex items-center text-sm"
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="flex items-center text-orange-600 hover:text-orange-800 text-sm"
            >
              <Settings className="h-4 w-4 mr-1" />
              {showCTAConfig ? t('common.less') : t('common.more')}
            </button>
          </div>

          {showCTAConfig && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600" data-lingo-skip>
                  Configure custom call-to-action buttons for this barraca. Leave empty to use default buttons.
                </p>
                <button
                  type="button"
                  onClick={addCTAButton}
                  className="text-orange-600 hover:text-orange-800 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('common.add')} Button
                </button>
              </div>

              {formData.ctaButtons.map((button, index) => (
                <div key={button.id} className="border border-gray-100 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-gray-900" data-lingo-skip>Button {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeCTAButton(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Button Text {t('admin.form.required')}
                      </label>
                      <input
                        type="text"
                        value={button.text}
                        onChange={(e) => updateCTAButton(index, { text: e.target.value })}
                        placeholder="Reserve Now"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Action Type {t('admin.form.required')}
                      </label>
                      <select
                        value={button.action.type}
                        onChange={(e) => updateCTAButton(index, { 
                          action: { ...button.action, type: e.target.value as any }
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      >
                        {ctaButtonTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Action Value {t('admin.form.required')}
                      </label>
                      <input
                        type="text"
                        value={button.action.value}
                        onChange={(e) => updateCTAButton(index, { 
                          action: { ...button.action, value: e.target.value }
                        })}
                        placeholder="URL, phone, etc."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" data-lingo-skip>
                        Style
                      </label>
                      <select
                        value={button.style}
                        onChange={(e) => updateCTAButton(index, { style: e.target.value as any })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      >
                        {ctaButtonStyles.map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" data-lingo-skip>
                        Icon
                      </label>
                      <select
                        value={button.icon || ''}
                        onChange={(e) => updateCTAButton(index, { icon: e.target.value || undefined })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="" data-lingo-skip>No Icon</option>
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" data-lingo-skip>
                        Position
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={button.position}
                        onChange={(e) => updateCTAButton(index, { position: parseInt(e.target.value) || 1 })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={button.enabled}
                          onChange={(e) => updateCTAButton(index, { enabled: e.target.checked })}
                          className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-xs text-gray-700" data-lingo-skip>Enabled</span>
                      </label>
                    </div>
                  </div>

                  {/* Visibility Conditions */}
                  <div className="border-t border-gray-100 pt-3">
                    <h6 className="text-xs font-medium text-gray-700 mb-2" data-lingo-skip>Visibility Conditions</h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={button.visibilityConditions.requiresOpen || false}
                          onChange={(e) => updateCTAButton(index, {
                            visibilityConditions: {
                              ...button.visibilityConditions,
                              requiresOpen: e.target.checked || undefined
                            }
                          })}
                          className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-700" data-lingo-skip>Requires Open</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={button.visibilityConditions.requiresClosed || false}
                          onChange={(e) => updateCTAButton(index, {
                            visibilityConditions: {
                              ...button.visibilityConditions,
                              requiresClosed: e.target.checked || undefined
                            }
                          })}
                          className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-700" data-lingo-skip>Requires Closed</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={button.visibilityConditions.memberOnly || false}
                          onChange={(e) => updateCTAButton(index, {
                            visibilityConditions: {
                              ...button.visibilityConditions,
                              memberOnly: e.target.checked || undefined
                            }
                          })}
                          className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-700" data-lingo-skip>Member Only</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={button.visibilityConditions.weatherDependent || false}
                          onChange={(e) => updateCTAButton(index, {
                            visibilityConditions: {
                              ...button.visibilityConditions,
                              weatherDependent: e.target.checked || undefined
                            }
                          })}
                          className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-xs text-gray-700" data-lingo-skip>Weather Dependent</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center"
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