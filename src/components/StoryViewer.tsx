import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useStory } from '../contexts/StoryContext';

const StoryViewer: React.FC = () => {
  const {
    isStoryViewerOpen,
    currentStory,
    viewState,
    closeStoryViewer,
    nextMedia,
    previousMedia,
    pauseStory,
    resumeStory,
    markStoryAsViewed,
    markMediaAsViewed,
    updateProgress,
    resetProgress,
  } = useStory();

  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMedia = currentStory?.media[viewState.currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';
  const storyDuration = isVideo ? (currentMedia?.duration || 10) * 1000 : 5000;

  // Progress management
  const startProgress = useCallback(() => {
    if (!viewState.isPlaying || viewState.isPaused) return;

    const startTime = Date.now();
    const startProgress = viewState.progress;

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = startProgress + (elapsed / storyDuration) * 100;
      
      if (newProgress >= 100) {
        updateProgress(100);
        markMediaAsViewed(currentMedia?.id || '');
        nextMedia();
      } else {
        updateProgress(newProgress);
      }
    }, 50);
  }, [viewState.isPlaying, viewState.isPaused, viewState.progress, storyDuration, currentMedia?.id, updateProgress, markMediaAsViewed, nextMedia]);

  const stopProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // Handle media loading
  const handleMediaLoad = () => {
    setIsLoading(false);
    setLoadError(false);
    if (viewState.isPlaying && !viewState.isPaused) {
      startProgress();
    }
  };

  const handleMediaError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  // Touch/gesture handling for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    pauseStory();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      resumeStory();
      return;
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;

    // Horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        previousMedia();
      } else {
        nextMedia();
      }
    } else {
      resumeStory();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Tap to pause/play (center area only)
  const handleContainerTap = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const containerWidth = rect.width;

    // Only handle center taps (middle third)
    if (tapX > containerWidth / 3 && tapX < (containerWidth * 2) / 3) {
      if (viewState.isPlaying && !viewState.isPaused) {
        pauseStory();
      } else {
        resumeStory();
      }
    }
  };

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStoryViewerOpen) return;

      switch (e.key) {
        case 'Escape':
          closeStoryViewer();
          break;
        case 'ArrowLeft':
          previousMedia();
          break;
        case 'ArrowRight':
          nextMedia();
          break;
        case ' ':
          e.preventDefault();
          if (viewState.isPlaying && !viewState.isPaused) {
            pauseStory();
          } else {
            resumeStory();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isStoryViewerOpen, viewState.isPlaying, viewState.isPaused, closeStoryViewer, previousMedia, nextMedia, pauseStory, resumeStory]);

  // Progress timer management
  useEffect(() => {
    if (viewState.isPlaying && !viewState.isPaused && !isLoading) {
      startProgress();
    } else {
      stopProgress();
    }

    return stopProgress;
  }, [viewState.isPlaying, viewState.isPaused, isLoading, startProgress, stopProgress]);

  // Reset progress when media changes
  useEffect(() => {
    resetProgress();
    setIsLoading(true);
    setLoadError(false);
  }, [currentMedia?.id, resetProgress]);

  // Mark story as viewed when opened
  useEffect(() => {
    if (currentStory && isStoryViewerOpen) {
      markStoryAsViewed(currentStory.id);
    }
  }, [currentStory?.id, isStoryViewerOpen, markStoryAsViewed]);

  if (!isStoryViewerOpen || !currentStory || !currentMedia) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Beach Wave Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex space-x-1 p-2">
        {currentStory.media.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 transition-all duration-100 ease-linear rounded-full"
              style={{
                width: index < viewState.currentMediaIndex 
                  ? '100%' 
                  : index === viewState.currentMediaIndex 
                    ? `${viewState.progress}%` 
                    : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header with Beach Theme */}
      <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 rounded-full border-2 border-gradient-to-r from-orange-400 to-pink-500 overflow-hidden">
            <img
              src={currentStory.media[0].url}
              alt={currentStory.barracaName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{currentStory.barracaName}</h3>
            <p className="text-xs text-orange-200">
              {Math.floor((Date.now() - currentMedia.timestamp.getTime()) / (1000 * 60 * 60))}h ago
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Pause/Play Button with Beach Theme */}
          <button
            onClick={viewState.isPlaying && !viewState.isPaused ? pauseStory : resumeStory}
            className="p-2 rounded-full bg-gradient-to-r from-orange-500/30 to-pink-500/30 backdrop-blur-sm hover:from-orange-500/50 hover:to-pink-500/50 transition-all duration-200 border border-white/20"
          >
            {viewState.isPlaying && !viewState.isPaused ? (
              <Pause className="h-4 w-4 text-white" />
            ) : (
              <Play className="h-4 w-4 text-white" />
            )}
          </button>

          {/* Mute Button (for videos) */}
          {isVideo && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 backdrop-blur-sm hover:from-blue-500/50 hover:to-cyan-500/50 transition-all duration-200 border border-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          )}

          {/* Close Button with Beach Theme */}
          <button
            onClick={closeStoryViewer}
            className="p-2 rounded-full bg-gradient-to-r from-red-500/30 to-pink-500/30 backdrop-blur-sm hover:from-red-500/50 hover:to-pink-500/50 transition-all duration-200 border border-white/20"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Media Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={handleContainerTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading State with Beach Theme */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-orange-900/50 to-pink-900/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-red-900/50 to-pink-900/50 text-white">
            <div className="text-center">
              <p className="text-lg mb-2">Failed to load media</p>
              <button
                onClick={nextMedia}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg hover:from-orange-600 hover:to-pink-600 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Media Content */}
        {isVideo ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentMedia.url}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted={isMuted}
            playsInline
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            onEnded={nextMedia}
          />
        ) : (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={currentMedia.url}
            alt={currentMedia.caption || ''}
            className="max-w-full max-h-full object-contain"
            onLoad={handleMediaLoad}
            onError={handleMediaError}
          />
        )}
      </div>

      {/* Caption with Beach Theme */}
      {currentMedia.caption && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p className="text-white text-sm leading-relaxed max-w-2xl">
            {currentMedia.caption}
          </p>
        </div>
      )}

      {/* Pause Overlay with Beach Theme */}
      {viewState.isPaused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm rounded-full p-4 border border-white/20">
            <Play className="h-8 w-8 text-white fill-current" />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;