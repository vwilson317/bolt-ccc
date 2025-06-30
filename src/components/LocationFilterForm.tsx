import React, { useState } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import LocationSelector from './LocationSelector';

interface LocationFilterFormProps {
  onSubmit: (data: {
    primaryLocation: string;
    neighboringLocations: string[];
  }) => void;
  className?: string;
}

const LocationFilterForm: React.FC<LocationFilterFormProps> = ({
  onSubmit,
  className = '',
}) => {
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

  const [primaryLocation, setPrimaryLocation] = useState('');
  const [neighboringLocations, setNeighboringLocations] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{
    primaryLocation?: string;
    neighboringLocations?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: {
      primaryLocation?: string;
      neighboringLocations?: string;
    } = {};

    if (!primaryLocation) {
      errors.primaryLocation = 'Please select a primary location';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        primaryLocation,
        neighboringLocations,
      });
    }
  };

  const handleReset = () => {
    setPrimaryLocation('');
    setNeighboringLocations([]);
    setFormErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-orange-500" />
            Location Preferences
          </h3>
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-600 flex items-center text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Reset
          </button>
        </div>

        <LocationSelector
          availableLocations={southZoneNeighborhoods}
          onPrimaryLocationChange={setPrimaryLocation}
          onNeighboringLocationsChange={setNeighboringLocations}
          initialPrimaryLocation={primaryLocation}
          initialNeighboringLocations={neighboringLocations}
        />

        {formErrors.primaryLocation && (
          <p className="mt-2 text-sm text-red-600">{formErrors.primaryLocation}</p>
        )}
        {formErrors.neighboringLocations && (
          <p className="mt-2 text-sm text-red-600">{formErrors.neighboringLocations}</p>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>
    </form>
  );
};

export default LocationFilterForm;