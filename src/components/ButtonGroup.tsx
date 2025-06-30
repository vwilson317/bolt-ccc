import React from 'react';
import FixedSizeButton from './FixedSizeButton';
import { LucideIcon } from 'lucide-react';

interface ButtonOption {
  id: string;
  text: string;
  icon?: LucideIcon;
}

interface ButtonGroupProps {
  options: ButtonOption[];
  selectedId?: string;
  onChange: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  options,
  selectedId,
  onChange,
  size = 'md',
  className = '',
  fullWidth = false,
}) => {
  return (
    <div className={`flex ${fullWidth ? 'w-full' : ''} ${className}`}>
      <div className={`inline-flex rounded-md shadow-sm ${fullWidth ? 'w-full' : ''}`}>
        {options.map((option, index) => {
          const isSelected = option.id === selectedId;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;
          
          // Adjust border radius based on position
          let borderRadius = '';
          if (isFirst && isLast) borderRadius = 'rounded-md';
          else if (isFirst) borderRadius = 'rounded-l-md';
          else if (isLast) borderRadius = 'rounded-r-md';
          
          return (
            <div 
              key={option.id} 
              className={`${fullWidth ? 'flex-1' : ''} ${index > 0 ? '-ml-px' : ''}`}
            >
              <FixedSizeButton
                text={option.text}
                icon={option.icon}
                onClick={() => onChange(option.id)}
                variant={isSelected ? 'primary' : 'outline'}
                size={size}
                className={`${borderRadius} ${fullWidth ? 'w-full' : ''}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ButtonGroup;