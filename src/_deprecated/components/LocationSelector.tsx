import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

interface LocationSelectorProps {
  availableLocations: string[];
  onPrimaryLocationChange?: (location: string) => void;
  onNeighboringLocationsChange?: (locations: string[]) => void;
  initialPrimaryLocation?: string;
  initialNeighboringLocations?: string[];
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  availableLocations,
  onPrimaryLocationChange,
  onNeighboringLocationsChange,
  initialPrimaryLocation = '',
  initialNeighboringLocations = [],
  className = '',
}) => {
  const [primaryLocation, setPrimaryLocation] = useState<string>(initialPrimaryLocation);
  const [neighboringLocations, setNeighboringLocations] = useState<string[]>(initialNeighboringLocations);
  
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(false);
  const [isNeighboringOpen, setIsNeighboringOpen] = useState(false);
  
  const [primarySearchTerm, setPrimarySearchTerm] = useState('');
  const [neighboringSearchTerm, setNeighboringSearchTerm] = useState('');

  // Filter out the primary location from neighboring options
  const availableNeighboringLocations = availableLocations.filter(
    location => location !== primaryLocation
  );

  // Filter locations based on search terms
  const filteredPrimaryLocations = availableLocations.filter(location => 
    location.toLowerCase().includes(primarySearchTerm.toLowerCase())
  );
  
  const filteredNeighboringLocations = availableNeighboringLocations.filter(location => 
    location.toLowerCase().includes(neighboringSearchTerm.toLowerCase())
  );

  // Notify parent components of changes
  useEffect(() => {
    if (onPrimaryLocationChange) {
      onPrimaryLocationChange(primaryLocation);
    }
  }, [primaryLocation, onPrimaryLocationChange]);

  useEffect(() => {
    if (onNeighboringLocationsChange) {
      onNeighboringLocationsChange(neighboringLocations);
    }
  }, [neighboringLocations, onNeighboringLocationsChange]);

  // Update neighboring locations when primary location changes
  useEffect(() => {
    // Remove primary location from neighboring locations if it exists
    if (primaryLocation && neighboringLocations.includes(primaryLocation)) {
      setNeighboringLocations(prev => prev.filter(loc => loc !== primaryLocation));
    }
  }, [primaryLocation, neighboringLocations]);

  // Handle primary location selection
  const handlePrimaryLocationSelect = (location: string) => {
    setPrimaryLocation(location);
    setIsPrimaryOpen(false);
    setPrimarySearchTerm('');
  };

  // Handle neighboring location selection
  const handleNeighboringLocationToggle = (location: string) => {
    setNeighboringLocations(prev => 
      prev.includes(location)
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  // Clear primary location
  const clearPrimaryLocation = () => {
    setPrimaryLocation('');
    if (onPrimaryLocationChange) {
      onPrimaryLocationChange('');
    }
  };

  // Remove a specific neighboring location
  const removeNeighboringLocation = (location: string) => {
    setNeighboringLocations(prev => prev.filter(loc => loc !== location));
  };

  // Clear all neighboring locations
  const clearNeighboringLocations = () => {
    setNeighboringLocations([]);
    if (onNeighboringLocationsChange) {
      onNeighboringLocationsChange([]);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Location Combobox */}
      <div className="space-y-2">
        <label htmlFor="primary-location" className="block text-sm font-medium text-gray-700">
          Primary Location
        </label>
        <div className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <input
                id="primary-location"
                type="text"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent transition-colors"
                placeholder="Select a location"
                value={primarySearchTerm}
                onChange={(e) => {
                  setPrimarySearchTerm(e.target.value);
                  setIsPrimaryOpen(true);
                }}
                onFocus={() => setIsPrimaryOpen(true)}
                aria-expanded={isPrimaryOpen}
                aria-controls="primary-location-options"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600"
                onClick={() => setIsPrimaryOpen(!isPrimaryOpen)}
                aria-label="Toggle options"
              >
                <ChevronsUpDown className="h-4 w-4" />
              </button>
            </div>
            {primaryLocation && (
              <button
                type="button"
                className="ml-2 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={clearPrimaryLocation}
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isPrimaryOpen && (
            <ul
              id="primary-location-options"
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              role="listbox"
            >
              {filteredPrimaryLocations.length === 0 ? (
                <li className="relative py-2 px-4 text-gray-500">No locations found</li>
              ) : (
                filteredPrimaryLocations.map((location) => (
                  <li
                    key={location}
                    className={`relative cursor-pointer select-none py-2 px-4 hover:bg-beach-100 ${
                      primaryLocation === location ? 'bg-beach-50 text-beach-600' : 'text-gray-900'
                    }`}
                    onClick={() => handlePrimaryLocationSelect(location)}
                    role="option"
                    aria-selected={primaryLocation === location}
                  >
                    <div className="flex items-center justify-between">
                      <span>{location}</span>
                      {primaryLocation === location && <Check className="h-4 w-4 text-beach-600" />}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {primaryLocation && (
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beach-100 text-beach-800">
              {primaryLocation}
            </span>
          </div>
        )}
      </div>

      {/* Neighboring Locations Multi-Select Combobox */}
      <div className="space-y-2">
        <label htmlFor="neighboring-locations" className="block text-sm font-medium text-gray-700">
          Neighboring Locations
        </label>
        <div className="relative">
          <div className="flex">
            <div className="relative flex-grow">
              <input
                id="neighboring-locations"
                type="text"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beach-500 focus:border-transparent transition-colors"
                placeholder="Select neighboring locations"
                value={neighboringSearchTerm}
                onChange={(e) => {
                  setNeighboringSearchTerm(e.target.value);
                  setIsNeighboringOpen(true);
                }}
                onFocus={() => setIsNeighboringOpen(true)}
                aria-expanded={isNeighboringOpen}
                aria-controls="neighboring-locations-options"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600"
                onClick={() => setIsNeighboringOpen(!isNeighboringOpen)}
                aria-label="Toggle options"
              >
                <ChevronsUpDown className="h-4 w-4" />
              </button>
            </div>
            {neighboringLocations.length > 0 && (
              <button
                type="button"
                className="ml-2 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={clearNeighboringLocations}
                aria-label="Clear all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {isNeighboringOpen && (
            <ul
              id="neighboring-locations-options"
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              role="listbox"
              aria-multiselectable="true"
            >
              {filteredNeighboringLocations.length === 0 ? (
                <li className="relative py-2 px-4 text-gray-500">
                  {primaryLocation ? "No other locations available" : "Select a primary location first"}
                </li>
              ) : (
                filteredNeighboringLocations.map((location) => (
                  <li
                    key={location}
                    className={`relative cursor-pointer select-none py-2 px-4 hover:bg-beach-100 ${
                      neighboringLocations.includes(location) ? 'bg-beach-50 text-beach-600' : 'text-gray-900'
                    }`}
                    onClick={() => handleNeighboringLocationToggle(location)}
                    role="option"
                    aria-selected={neighboringLocations.includes(location)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{location}</span>
                      {neighboringLocations.includes(location) && <Check className="h-4 w-4 text-beach-600" />}
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {neighboringLocations.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {neighboringLocations.map((location) => (
              <span
                key={location}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {location}
                <button
                  type="button"
                  className="ml-1.5 h-3.5 w-3.5 rounded-full inline-flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-200 transition-colors"
                  onClick={() => removeNeighboringLocation(location)}
                  aria-label={`Remove ${location}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;