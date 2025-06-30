import React from 'react';
import { useTranslation } from 'react-i18next';
import { Barraca, CTAButtonConfig } from '../types';
import { useStory } from '../contexts/StoryContext';
import { 
  getCTAButtonsForBarraca, 
  handleCTAButtonClick, 
  getCTAButtonIcon, 
  getCTAButtonClasses 
} from '../utils/ctaButtonUtils';

interface CTAButtonGroupProps {
  barraca: Barraca;
  size?: 'sm' | 'md' | 'lg';
  maxButtons?: number;
  className?: string;
  context?: {
    currentTime?: Date;
    isLoggedIn?: boolean;
    weatherConditions?: string;
  };
}

const CTAButtonGroup: React.FC<CTAButtonGroupProps> = ({ 
  barraca, 
  size = 'md', 
  maxButtons = 3,
  className = '',
  context = {}
}) => {
  const { t } = useTranslation();
  const { featureFlags } = useStory();

  // Get appropriate CTA buttons based on feature flag and configuration
  const ctaButtons = getCTAButtonsForBarraca(
    barraca, 
    featureFlags.customCtaButtons, 
    t,
    context
  ).slice(0, maxButtons);

  if (ctaButtons.length === 0) {
    return null;
  }

  const handleButtonClick = (button: CTAButtonConfig) => {
    try {
      handleCTAButtonClick(button.action, barraca);
    } catch (error) {
      console.error('Error handling CTA button click:', error);
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      {ctaButtons.map((button) => {
        const IconComponent = getCTAButtonIcon(button.icon);
        const buttonClasses = getCTAButtonClasses(button.style, size);

        return (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button)}
            className={buttonClasses}
            title={button.text}
            aria-label={button.text}
          >
            {IconComponent && (
              <IconComponent className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${button.text ? 'mr-1.5' : ''}`} />
            )}
            <span className={size === 'sm' ? 'hidden sm:inline' : ''}>{button.text}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CTAButtonGroup;