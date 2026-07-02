import React from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Check } from 'lucide-react';
import { useStory } from '../contexts/StoryContext';

interface StoryRingProps {
  barracaId: string;
  barracaName: string;
  imageUrl: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const StoryRing: React.FC<StoryRingProps> = ({ 
  barracaId, 
  barracaName, 
  imageUrl, 
  size = 'md',
  showLabel = true 
}) => {
  const { t } = useTranslation();
  const { stories, viewState, openStoryViewer } = useStory();
  
  const barracaStories = stories.filter(story => story.barracaId === barracaId);
  const hasStories = barracaStories.length > 0;
  const isViewed = barracaStories.every(story => viewState.viewedStories.has(story.id));

  if (!hasStories) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const handleClick = () => {
    if (barracaStories.length > 0) {
      console.log('🎯 StoryRing clicked:', barracaName);
      openStoryViewer(barracaStories[0].id);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleClick}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden hover:scale-105 transition-all duration-300 ${
          isViewed ? 'opacity-60' : 'opacity-100'
        }`}
        aria-label={t('stories.viewStories', { name: barracaName })}
      >
        {/* Gradient Ring */}
        <div className={`absolute inset-0 rounded-full p-0.5 ${
          isViewed 
            ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300' 
            : 'bg-gradient-to-r from-beach-400 via-beach-500 to-ocean-600'
        }`}>
          <div className="w-full h-full rounded-full bg-white p-0.5">
            <img
              src={imageUrl}
              alt={barracaName}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.src = '';
              }}
            />
          </div>
        </div>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full">
          <div className="bg-white/90 rounded-full p-1">
            <Play className="h-3 w-3 text-beach-500 fill-current" />
          </div>
        </div>

        {/* Story Count Badge */}
        {barracaStories.length > 1 && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-beach-500 to-ocean-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
            {barracaStories.length}
          </div>
        )}

        {/* Viewed Indicator */}
        {isViewed && (
          <div className="absolute -bottom-1 -right-1 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
            <Check className="h-3 w-3" />
          </div>
        )}
      </button>

      {showLabel && (
        <span className={`text-xs text-center max-w-16 truncate font-medium ${
          isViewed ? 'text-gray-400' : 'text-gray-700'
        }`}>
          {barracaName}
        </span>
      )}
    </div>
  );
};

export default StoryRing;