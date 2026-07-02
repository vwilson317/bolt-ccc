import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface LocationFilterCheckboxesProps {
  availableLocations: string[];
  onLocationsChange: (locations: string[]) => void;
  initialLocations?: string[];
  className?: string;
}

const LocationFilterCheckboxes: React.FC<LocationFilterCheckboxesProps> = ({
  availableLocations,
  onLocationsChange,
  initialLocations = [],
  className = '',
}) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>(initialLocations);

  // Notify parent component when selections change
  useEffect(() => {
    onLocationsChange(selectedLocations);
  }, [selectedLocations, onLocationsChange]);

  // Toggle location selection
  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location)
        ? prev.filter(loc => loc !== location)
        : [...prev, location]
    );
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedLocations([]);
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-beach-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-700" data-lingo-skip>Filter by Location</h3>
        </div>
        {selectedLocations.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {availableLocations.map((location) => (
          <label
            key={location}
            className={`flex items-center p-2 rounded-md cursor-pointer text-sm ${
              selectedLocations.includes(location)
                ? 'bg-beach-50 border border-beach-200'
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedLocations.includes(location)}
              onChange={() => toggleLocation(location)}
              className="h-4 w-4 text-beach-500 rounded border-gray-300 focus:ring-beach-500"
            />
            <span className="ml-2 truncate">{location}</span>
          </label>
        ))}
      </div>

      {selectedLocations.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500">
            {selectedLocations.length} location{selectedLocations.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationFilterCheckboxes;