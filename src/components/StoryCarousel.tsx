import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStory } from '../contexts/StoryContext';
import StoryRing from './StoryRing';
import { useApp } from '../contexts/AppContext';

const StoryCarousel: React.FC = () => {
  const { t } = useTranslation();
  const { stories, featureFlags, viewState } = useStory();
  const { barracas } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!featureFlags.enableStoryBanner || stories.length === 0) {
    return null;
  }

  // Get unique barracas that have stories and sort them by viewing status and recency
  const barracasWithStories = barracas
    .filter(barraca => stories.some(story => story.barracaId === barraca.id))
    .map(barraca => {
      const barracaStories = stories.filter(story => story.barracaId === barraca.id);
      const isViewed = barracaStories.every(story => viewState.viewedStories.has(story.id));
      const mostRecentStoryTime = Math.max(...barracaStories.map(story => story.createdAt.getTime()));
      
      return {
        ...barraca,
        isViewed,
        mostRecentStoryTime,
        storyCount: barracaStories.length
      };
    })
    .sort((a, b) => {
      // First, separate by viewing status: unviewed first, viewed last
      if (a.isViewed !== b.isViewed) {
        return a.isViewed ? 1 : -1;
      }
      
      // Within each group, sort by most recent story time (newest first)
      return b.mostRecentStoryTime - a.mostRecentStoryTime;
    });

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const touch = e.touches[0];
    setStartX(touch.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const touch = e.touches[0];
    const x = touch.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (barracasWithStories.length === 0) return null;

  return (
    <div className="relative bg-white border-b border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('stories.title')}
            <span className="text-sm text-gray-500 ml-2">
              ({barracasWithStories.filter(b => !b.isViewed).length} {t('stories.new')})
            </span>
          </h3>
        </div>

        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {barracasWithStories.map((barraca) => (
            <div key={barraca.id} className="flex-shrink-0">
              <StoryRing
                barracaId={barraca.id}
                barracaName={barraca.name}
                imageUrl={barraca.photos.horizontal[0] || barraca.photos.vertical[0]}
                size="lg"
                showLabel={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryCarousel;