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

  // Local state - simplified
  const [isMuted, setIsMuted] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  
  // Refs
  const progressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMedia = currentStory?.media?.[viewState.currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';
  const STORY_DURATION = 5000; // 5 seconds for all stories

  console.log('🎬 StoryViewer:', {
    isOpen: isStoryViewerOpen,
    story: currentStory?.barracaName,
    mediaIndex: viewState.currentMediaIndex,
    totalMedia: currentStory?.media?.length,
    isLoaded: isMediaLoaded,
    isPlaying: viewState.isPlaying,
    isPaused: viewState.isPaused,
    progress: Math.round(viewState.progress),
    hasTimer: !!progressTimerRef.current
  });

  // Clear timer utility
  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      cancelAnimationFrame(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // Start progress timer - COMPLETELY REWRITTEN
  const startProgressTimer = useCallback(() => {
    console.log('🚀 Starting progress timer');
    
    clearProgressTimer();
    startTimeRef.current = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const progress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      
      updateProgress(progress);
      
      if (progress >= 100) {
        console.log('✅ Story complete - moving to next');
        if (currentMedia) {
          markMediaAsViewed(currentMedia.id);
        }
        nextMedia();
        return;
      }
      
      if (viewState.isPlaying && !viewState.isPaused && isMediaLoaded) {
        progressTimerRef.current = requestAnimationFrame(animate);
      }
    };
    
    progressTimerRef.current = requestAnimationFrame(animate);
  }, [clearProgressTimer, updateProgress, currentMedia, markMediaAsViewed, nextMedia, viewState.isPlaying, viewState.isPaused, isMediaLoaded]);

  // Media loading handlers
  const handleMediaLoad = useCallback(() => {
    console.log('📷 Media loaded successfully');
    setIsMediaLoaded(true);
    setLoadError(false);
  }, []);

  const handleMediaError = useCallback(() => {
    console.error('❌ Media failed to load');
    setIsMediaLoaded(false);
    setLoadError(true);
    clearProgressTimer();
  }, [clearProgressTimer]);

  // Touch/gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    containerRef.current?.setAttribute('data-touch-start', `${touch.clientX},${touch.clientY}`);
    pauseStory();
  }, [pauseStory]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchStart = containerRef.current?.getAttribute('data-touch-start');
    if (!touchStart) {
      resumeStory();
      return;
    }

    const [startX, startY] = touchStart.split(',').map(Number);
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        previousMedia();
      } else {
        nextMedia();
      }
    } else {
      resumeStory();
    }

    containerRef.current?.removeAttribute('data-touch-start');
  }, [resumeStory, previousMedia, nextMedia]);

  // Tap to pause/play
  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const containerWidth = rect.width;

    // Only handle center taps
    if (tapX > containerWidth / 3 && tapX < (containerWidth * 2) / 3) {
      if (viewState.isPlaying && !viewState.isPaused) {
        pauseStory();
      } else {
        resumeStory();
      }
    }
  }, [viewState.isPlaying, viewState.isPaused, pauseStory, resumeStory]);

  // Keyboard controls
  useEffect(() => {
    if (!isStoryViewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Reset when media changes
  useEffect(() => {
    console.log('🔄 Media changed - resetting');
    clearProgressTimer();
    setIsMediaLoaded(false);
    setLoadError(false);
    resetProgress();
  }, [currentMedia?.id, clearProgressTimer, resetProgress]);

  // MAIN TIMER CONTROL - SIMPLIFIED
  useEffect(() => {
    if (!isStoryViewerOpen || !currentMedia) {
      clearProgressTimer();
      return;
    }

    const shouldRun = isMediaLoaded && viewState.isPlaying && !viewState.isPaused;
    const isRunning = !!progressTimerRef.current;

    console.log('🎯 Timer control:', { shouldRun, isRunning, isLoaded: isMediaLoaded, playing: viewState.isPlaying, paused: viewState.isPaused });

    if (shouldRun && !isRunning) {
      console.log('▶️ Starting timer');
      startProgressTimer();
    } else if (!shouldRun && isRunning) {
      console.log('⏸️ Stopping timer');
      clearProgressTimer();
    }

    return clearProgressTimer;
  }, [isStoryViewerOpen, currentMedia?.id, isMediaLoaded, viewState.isPlaying, viewState.isPaused, startProgressTimer, clearProgressTimer]);

  // Mark story as viewed when opened
  useEffect(() => {
    if (currentStory && isStoryViewerOpen) {
      markStoryAsViewed(currentStory.id);
    }
  }, [currentStory?.id, isStoryViewerOpen, markStoryAsViewed]);

  // Cleanup on unmount
  useEffect(() => {
    return clearProgressTimer;
  }, [clearProgressTimer]);

  if (!isStoryViewerOpen || !currentStory || !currentMedia) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress Bars */}
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

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4">
        <div className="flex items-center space-x-3 text-white">
          <div className="w-8 h-8 rounded-full border-2 border-white/30 overflow-hidden">
            <img
              src={currentStory.media[0]?.url || currentMedia.url}
              alt={currentStory.barracaName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{currentStory.barracaName}</h3>
            <p className="text-xs text-white/70">
              {Math.floor((Date.now() - currentMedia.timestamp.getTime()) / (1000 * 60 * 60))}h ago
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Pause/Play Button */}
          <button
            onClick={viewState.isPlaying && !viewState.isPaused ? pauseStory : resumeStory}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/20"
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
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={closeStoryViewer}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/20"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Media Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={handleContainerClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading State */}
        {!isMediaLoaded && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <div className="text-center">
              <p className="text-lg mb-2">Failed to load media</p>
              <button
                onClick={nextMedia}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Media Content */}
        {!loadError && (
          <>
            {isVideo ? (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={currentMedia.url}
                className="max-w-full max-h-full object-contain"
                autoPlay
                muted={isMuted}
                playsInline
                onLoadedData={handleMediaLoad}
                onCanPlay={handleMediaLoad}
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
          </>
        )}
      </div>

      {/* Caption */}
      {currentMedia.caption && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p className="text-white text-sm leading-relaxed max-w-2xl">
            {currentMedia.caption}
          </p>
        </div>
      )}

      {/* Pause Overlay */}
      {viewState.isPaused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/20">
            <Play className="h-8 w-8 text-white fill-current" />
          </div>
        </div>
      )}

      {/* Simple Debug Info */}
      {import.meta.env.DEV && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/80 text-white p-2 rounded text-xs space-y-1">
          <div>Progress: {Math.round(viewState.progress)}%</div>
          <div>Playing: {viewState.isPlaying ? '▶️' : '⏸️'}</div>
          <div>Loaded: {isMediaLoaded ? '✅' : '⏳'}</div>
          <div>Timer: {progressTimerRef.current ? '🟢' : '🔴'}</div>
          <button 
            onClick={startProgressTimer}
            className="bg-blue-600 px-2 py-1 rounded text-xs mt-1"
          >
            Force Start
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;