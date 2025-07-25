import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useStory } from '../contexts/StoryContext';
import { Story } from '../types';

const StoryBanner: React.FC = () => {
  const { stories, featureFlags, openStoryViewer } = useStory();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Filter stories that have media
  const validStories = stories.filter(story => story.media.length > 0);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || validStories.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % validStories.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, validStories.length]);

  // Don't render if feature is disabled or no stories
  if (!featureFlags.enableStoryBanner || validStories.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % validStories.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + validStories.length) % validStories.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleStoryClick = (story: Story) => {
    openStoryViewer(story.id);
  };

  const currentStory = validStories[currentSlide];

  return (
    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden bg-gray-900 border-b border-gray-200">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentStory.media[0].url}
          alt={currentStory.barracaName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Story Info */}
        <div className="flex-1 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${
                currentStory.isViewed ? 'border-gray-400' : 'border-white'
              } overflow-hidden`}>
                <img
                  src={currentStory.media[0].url}
                  alt={currentStory.barracaName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold">
                {currentStory.barracaName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300" data-lingo-skip>
                {currentStory.media.length} {currentStory.media.length === 1 ? 'story' : 'stories'}
              </p>
            </div>
          </div>
          
          {/* Story Preview */}
          <div className="hidden sm:block">
            <p className="text-sm text-gray-200 line-clamp-2" data-lingo-skip>
              {currentStory.media[0].caption || 'Check out our latest updates!'}
            </p>
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={() => handleStoryClick(currentStory)}
          className="flex-shrink-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors duration-200 rounded-full p-3 sm:p-4 border border-white/30"
        >
          <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-current" />
        </button>
      </div>

      {/* Navigation Arrows */}
      {validStories.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors duration-200 rounded-full p-2"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors duration-200 rounded-full p-2"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {validStories.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1">
          {validStories.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      {/* Story Count Badge */}
      <div className="absolute top-3 right-3 z-20 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
        {currentSlide + 1} / {validStories.length}
      </div>
    </div>
  );
};

export default StoryBanner;