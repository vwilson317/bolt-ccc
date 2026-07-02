import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 'md', 
  showLabel = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const containerClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  };

  const getRatingColor = (rating: 1 | 2 | 3) => {
    switch (rating) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-yellow-500';
      case 3:
        return 'text-yellow-600';
      default:
        return 'text-gray-300';
    }
  };

  const getRatingLabel = (rating: 1 | 2 | 3) => {
    switch (rating) {
      case 1:
        return 'Good';
      case 2:
        return 'Great';
      case 3:
        return 'Excellent';
      default:
        return '';
    }
  };

  return (
    <div className={`flex items-center ${containerClasses[size]} ${className}`}>
      {[1, 2, 3].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? `fill-current ${getRatingColor(rating)}` 
              : 'text-gray-300'
          }`}
        />
      ))}
      {showLabel && (
        <span className={`text-sm font-medium ${
          size === 'sm' ? 'ml-1' : size === 'md' ? 'ml-2' : 'ml-3'
        } ${getRatingColor(rating)}`}>
          {getRatingLabel(rating)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 