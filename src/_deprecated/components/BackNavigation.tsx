import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

interface BackNavigationProps {
  /** The text to display for the back action */
  label?: string;
  /** The URL to navigate to (if provided, uses Link instead of navigate(-1)) */
  to?: string;
  /** Whether to show a more prominent back button style */
  variant?: 'subtle' | 'prominent';
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the component in a sticky header */
  sticky?: boolean;
  /** Optional right side content (like share buttons) */
  rightContent?: React.ReactNode;
  /** Whether to use a more compact mobile-friendly design */
  compact?: boolean;
}

const BackNavigation: React.FC<BackNavigationProps> = ({
  label,
  to,
  variant = 'subtle',
  className = '',
  sticky = false,
  rightContent,
  compact = false
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const defaultLabel = label || t('common.back', 'Back');
  
  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  const baseClasses = sticky 
    ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm'
    : '';

  const containerClasses = `
    ${baseClasses}
    ${sticky ? 'sticky top-16 z-40' : ''}
    ${className}
  `.trim();

  const buttonClasses = variant === 'prominent'
    ? 'flex items-center space-x-2 text-beach-600 hover:text-beach-700 transition-colors duration-200 font-medium'
    : 'flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200';

  const iconClasses = compact ? 'h-4 w-4' : 'h-5 w-5';
  const textClasses = compact ? 'text-sm' : 'text-base';

  const content = (
    <div className={`flex items-center justify-between ${compact ? 'h-10' : 'h-12'}`}>
      {to ? (
        <Link to={to} className={`${buttonClasses} ${textClasses}`}>
          <ChevronLeft className={iconClasses} />
          <span>{defaultLabel}</span>
        </Link>
      ) : (
        <button onClick={handleBack} className={`${buttonClasses} ${textClasses}`}>
          <ChevronLeft className={iconClasses} />
          <span>{defaultLabel}</span>
        </button>
      )}
      
      {rightContent && (
        <div className="flex items-center">
          {rightContent}
        </div>
      )}
    </div>
  );

  if (sticky) {
    return (
      <div className={containerClasses}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {content}
    </div>
  );
};

export default BackNavigation;
