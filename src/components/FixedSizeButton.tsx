import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FixedSizeButtonProps {
  text: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

const FixedSizeButton: React.FC<FixedSizeButtonProps> = ({
  text,
  onClick,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  title,
}) => {
  // Fixed dimensions based on size
  const dimensions = {
    sm: 'w-24 h-8',
    md: 'w-32 h-10',
    lg: 'w-40 h-12',
  };

  // Styles based on variant
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'bg-white border border-blue-500 text-blue-500 hover:bg-blue-50',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  // Text size based on button size
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Icon size based on button size
  const iconSize = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        ${dimensions[size]}
        ${variantStyles[variant]}
        ${textSize[size]}
        flex items-center justify-center
        rounded-md
        font-medium
        transition-colors
        duration-200
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      <div className="flex items-center justify-center space-x-1.5 px-2">
        {Icon && <Icon className={iconSize[size]} />}
        <span className="truncate">{text}</span>
      </div>
    </button>
  );
};

export default FixedSizeButton;