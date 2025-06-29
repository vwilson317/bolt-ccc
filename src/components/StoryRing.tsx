import React from 'react';
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
  const { stories, viewState, openStoryViewer } = useStory();
  
  const barracaStories = stories.filter(story => story.barracaId === barracaId);
  const hasStories = barracaStories.length > 0;
  const isViewed = barracaStories.every(story => viewState.viewedStories.has(story.id));

  if (!hasStories) return null;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const handleClick = () => {
    if (barracaStories.length > 0) {
      openStoryViewer(barracaStories[0].id);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleClick}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden hover:scale-105 transition-all duration-300 story-ring-hover ${
          isViewed ? 'story-ring-viewed' : 'story-ring-unviewed'
        }`}
      >
        {/* Beach Sunset Gradient Ring - Different gradients for different times/moods */}
        <div className={`absolute inset-0 rounded-full p-0.5 ${
          isViewed 
            ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300' 
            : 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 animate-pulse'
        }`}>
          <div className="w-full h-full rounded-full bg-white p-0.5">
            <img
              src={imageUrl}
              alt={barracaName}
              className={`w-full h-full object-cover rounded-full transition-all duration-300 ${
                isViewed ? 'grayscale-[20%] opacity-80' : 'grayscale-0 opacity-100'
              }`}
            />
          </div>
        </div>

        {/* Beach Wave Overlay Effect */}
        {!isViewed && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-transparent to-blue-200/20"></div>
        )}

        {/* Play Icon with Beach Theme */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-full">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-1">
            <Play className="h-3 w-3 text-orange-500 fill-current" />
          </div>
        </div>

        {/* Story Count Badge with Beach Colors */}
        {barracaStories.length > 1 && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
            {barracaStories.length}
          </div>
        )}

        {/* Watched Indicator with Beach Theme */}
        {isViewed && (
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
            <Check className="h-3 w-3" />
          </div>
        )}

        {/* Subtle Glow Effect for Unviewed Stories */}
        {!isViewed && (
          <div className="absolute inset-0 rounded-full shadow-lg shadow-orange-500/20"></div>
        )}
      </button>

      {showLabel && (
        <span className={`text-xs text-center max-w-16 truncate transition-colors duration-300 font-medium ${
          isViewed ? 'text-gray-400' : 'text-gray-700'
        }`}>
          {barracaName}
        </span>
      )}
    </div>
  );
};

export default StoryRing;