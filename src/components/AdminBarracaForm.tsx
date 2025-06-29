import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { Barraca } from '../types';

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
    weatherDependent: false
  });

  const [isSaving, setIsSaving] = useState(false);

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
          weatherDependent: barraca.weatherDependent
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
        amenities: formData.amenities.filter(amenity => amenity.trim() !== '')
      };

      if (barracaId) {
        updateBarraca(barracaId, barracaData);
      } else {
        addBarraca(barracaData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save barraca:', error);
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          {barracaId ? 'Edit Barraca' : 'Add New Barraca'}
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
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barraca Number
            </label>
            <input
              type="text"
              value={formData.barracaNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, barracaNumber: e.target.value }))}
              placeholder="e.g. 001"
              pattern="[0-9]*"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <select
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Select neighborhood</option>
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
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        {/* Availability and Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={formData.isOpen ? 'open' : 'closed'}
              onChange={(e) => setFormData(prev => ({ ...prev, isOpen: e.target.value === 'open' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typical Hours
            </label>
            <input
              type="text"
              value={formData.typicalHours}
              onChange={(e) => setFormData(prev => ({ ...prev, typicalHours: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.weatherDependent}
                onChange={(e) => setFormData(prev => ({ ...prev, weatherDependent: e.target.checked }))}
                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Weather Dependent</span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Images (URLs)
            </label>
            <button
              type="button"
              onClick={() => addArrayItem('images')}
              className="text-sky-600 hover:text-sky-800 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Image
            </button>
          </div>
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={image}
                onChange={(e) => updateArrayItem('images', index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
              Menu Preview Items
            </label>
            <button
              type="button"
              onClick={() => addArrayItem('menuPreview')}
              className="text-sky-600 hover:text-sky-800 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>
          {formData.menuPreview.map((item, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateArrayItem('menuPreview', index, e.target.value)}
                placeholder="Menu item name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
          <h4 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value }
                }))}
                placeholder="+55 21 99999-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={formData.contact.website}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact: { ...prev.contact, website: e.target.value }
                }))}
                placeholder="https://instagram.com/barraca"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Amenities
            </label>
            <button
              type="button"
              onClick={() => addArrayItem('amenities')}
              className="text-sky-600 hover:text-sky-800 flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Amenity
            </button>
          </div>
          {formData.amenities.map((amenity, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={amenity}
                onChange={(e) => updateArrayItem('amenities', index, e.target.value)}
                placeholder="WiFi, Umbrellas, etc."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg disabled:opacity-50 flex items-center"
          >
            {isSaving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Barraca'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBarracaForm;