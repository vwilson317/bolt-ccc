import React from 'react';
import { Leaf, Award, Recycle, Droplets, Sun } from 'lucide-react';

interface EcoCertification {
  level: 'bronze' | 'silver' | 'gold';
  score: number; // 0-100
  criteria: {
    reefSafeSunscreen: boolean;
    plasticFreeOptions: boolean;
    localSourcing: boolean;
    wasteReduction: boolean;
    renewableEnergy: boolean;
  };
  verifiedBy: string;
  certificationDate: Date;
}

interface SustainabilityBadgeProps {
  certification?: EcoCertification;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const SustainabilityBadge: React.FC<SustainabilityBadgeProps> = ({ 
  certification, 
  size = 'md', 
  showDetails = false,
  className = ''
}) => {
  if (!certification) {
    return null;
  }

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-green-400 to-green-600';
    }
  };

  const getBadgeIcon = (level: string) => {
    switch (level) {
      case 'gold':
      case 'silver':
      case 'bronze':
        return Award;
      default:
        return Leaf;
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const IconComponent = getBadgeIcon(certification.level);
  const badgeColor = getBadgeColor(certification.level);

  const criteriaIcons = {
    reefSafeSunscreen: Sun,
    plasticFreeOptions: Recycle,
    localSourcing: Leaf,
    wasteReduction: Recycle,
    renewableEnergy: Sun
  };

  const criteriaLabels = {
    reefSafeSunscreen: 'Reef-Safe Sunscreen',
    plasticFreeOptions: 'Plastic-Free Options',
    localSourcing: 'Local Sourcing',
    wasteReduction: 'Waste Reduction',
    renewableEnergy: 'Renewable Energy'
  };

  if (showDetails) {
    return (
      <div className={`bg-white rounded-xl p-4 border border-green-200 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${badgeColor} flex items-center justify-center mr-3`}>
              <IconComponent className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-white`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 capitalize">
                {certification.level} Eco-Certified
              </h4>
              <p className="text-sm text-gray-600">
                Sustainability Score: {certification.score}/100
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {certification.score}
            </div>
            <div className="text-xs text-gray-500">
              /100
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${certification.score}%` }}
            ></div>
          </div>
        </div>

        {/* Criteria */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Sustainability Practices:</h5>
          {Object.entries(certification.criteria).map(([key, value]) => {
            const Icon = criteriaIcons[key as keyof typeof criteriaIcons];
            const label = criteriaLabels[key as keyof typeof criteriaLabels];
            
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {value ? '✓' : '×'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Verified by {certification.verifiedBy} on {certification.certificationDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // Simple badge view
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${badgeColor} flex items-center justify-center mr-2`}>
        <IconComponent className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-white`} />
      </div>
      <span className={`font-medium text-gray-700 capitalize ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
        {certification.level} Eco-Certified
      </span>
    </div>
  );
};

export default SustainabilityBadge;