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
  const isTimerActiveRef = useRef(false);

  // Get current media safely
  const currentMedia = currentStory?.media?.[viewState.currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';
  const storyDuration = isVideo ? (currentMedia?.duration || 10) * 1000 : 5000;

  console.log('🎬 StoryViewer render:', {
    isOpen: isStoryViewerOpen,
    currentStory: currentStory?.barracaName,
    currentMediaIndex: viewState.currentMediaIndex,
    totalMedia: currentStory?.media?.length,
    currentMedia: currentMedia?.url,
    isPlaying: viewState.isPlaying,
    isPaused: viewState.isPaused,
    progress: viewState.progress,
    isLoading,
    loadError,
    timerActive: isTimerActiveRef.current
  });

  // Stable progress management function
  const startProgressTimer = useCallback(() => {
    // Don't start if already active
    if (isTimerActiveRef.current) {
      console.log('⚠️ Timer already active, skipping start');
      return;
    }

    // Clear any existing timer first
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }

    // Check all conditions
    if (!viewState.isPlaying || viewState.isPaused || !currentMedia || isLoading || loadError) {
      console.log('❌ Not starting timer:', { 
        isPlaying: viewState.isPlaying, 
        isPaused: viewState.isPaused, 
        hasMedia: !!currentMedia,
        isLoading,
        loadError
      });
      return;
    }

    console.log('🚀 Starting progress timer for duration:', storyDuration, 'ms');
    isTimerActiveRef.current = true;
    
    const startTime = Date.now();
    const startProgress = viewState.progress;

    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = startProgress + (elapsed / storyDuration) * 100;
      
      console.log('⏱️ Progress:', Math.round(newProgress) + '%');
      
      if (newProgress >= 100) {
        console.log('✅ Story complete, advancing');
        
        // Clear timer first
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
          isTimerActiveRef.current = false;
        }
        
        updateProgress(100);
        
        // Mark media as viewed and advance
        if (currentMedia) {
          markMediaAsViewed(currentMedia.id);
        }
        
        // Use setTimeout to avoid state conflicts
        setTimeout(() => {
          nextMedia();
        }, 50);
      } else {
        updateProgress(newProgress);
      }
    }, 100);

    console.log('✅ Timer started with ID:', progressTimerRef.current);
  }, [viewState.isPlaying, viewState.isPaused, viewState.progress, storyDuration, currentMedia?.id, isLoading, loadError, updateProgress, markMediaAsViewed, nextMedia]);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      console.log('⏹️ Stopping progress timer');
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
      isTimerActiveRef.current = false;
    }
  }, []);

  // Handle media loading
  const handleMediaLoad = useCallback(() => {
    console.log('📷 Media loaded successfully');
    setIsLoading(false);
    setLoadError(false);
  }, []);

  const handleMediaError = useCallback(() => {
    console.error('❌ Media failed to load');
    setIsLoading(false);
    setLoadError(true);
    stopProgressTimer();
  }, [stopProgressTimer]);

  // Touch/gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    console.log('👆 Touch start - pausing');
    pauseStory();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      console.log('👆 Touch end - resuming');
      resumeStory();
      return;
    }

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        console.log('👆 Swipe right - previous media');
        previousMedia();
      } else {
        console.log('👆 Swipe left - next media');
        nextMedia();
      }
    } else {
      console.log('👆 Touch end - resuming');
      resumeStory();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Tap to pause/play
  const handleContainerTap = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const containerWidth = rect.width;

    if (tapX > containerWidth / 3 && tapX < (containerWidth * 2) / 3) {
      if (viewState.isPlaying && !viewState.isPaused) {
        console.log('👆 Tap to pause');
        pauseStory();
      } else {
        console.log('👆 Tap to resume');
        resumeStory();
      }
    }
  };

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStoryViewerOpen) return;

      console.log('⌨️ Key pressed:', e.key);
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
    console.log('🔄 Media changed, resetting state');
    resetProgress();
    setIsLoading(true);
    setLoadError(false);
    stopProgressTimer();
  }, [currentMedia?.id, resetProgress, stopProgressTimer]);

  // Start timer when conditions are met - FIXED: Separate effect with minimal dependencies
  useEffect(() => {
    if (!isStoryViewerOpen || !currentMedia) return;

    console.log('🎯 Timer condition check:', {
      isPlaying: viewState.isPlaying,
      isPaused: viewState.isPaused,
      isLoading,
      loadError,
      timerActive: isTimerActiveRef.current
    });

    if (viewState.isPlaying && !viewState.isPaused && !isLoading && !loadError && !isTimerActiveRef.current) {
      console.log('▶️ Starting timer with delay');
      // Small delay to ensure state is stable
      const timeoutId = setTimeout(() => {
        startProgressTimer();
      }, 200);
      
      return () => clearTimeout(timeoutId);
    } else if ((!viewState.isPlaying || viewState.isPaused) && isTimerActiveRef.current) {
      console.log('⏸️ Stopping timer');
      stopProgressTimer();
    }
  }, [viewState.isPlaying, viewState.isPaused, isLoading, loadError, isStoryViewerOpen, currentMedia?.id, startProgressTimer, stopProgressTimer]);

  // Mark story as viewed when opened
  useEffect(() => {
    if (currentStory && isStoryViewerOpen) {
      console.log('👁️ Marking story as viewed:', currentStory.id);
      markStoryAsViewed(currentStory.id);
    }
  }, [currentStory?.id, isStoryViewerOpen, markStoryAsViewed]);

  // Auto-close if no story or media
  useEffect(() => {
    if (isStoryViewerOpen && (!currentStory || !currentMedia)) {
      console.log('❌ No story or media available, closing viewer');
      closeStoryViewer();
    }
  }, [isStoryViewerOpen, currentStory, currentMedia, closeStoryViewer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
        isTimerActiveRef.current = false;
      }
    };
  }, []);

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
              src={currentStory.media[0]?.url || currentMedia.url}
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
          {/* Pause/Play Button */}
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

          {/* Close Button */}
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
        {/* Loading State */}
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
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-sm rounded-full p-4 border border-white/20">
            <Play className="h-8 w-8 text-white fill-current" />
          </div>
        </div>
      )}

      {/* Enhanced Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/80 text-white p-3 rounded-lg text-xs font-mono space-y-1">
          <div className="text-yellow-400 font-bold">🎬 Story Debug</div>
          <div>Story: {currentStory.barracaName}</div>
          <div>Media: {viewState.currentMediaIndex + 1}/{currentStory.media.length}</div>
          <div>Progress: {Math.round(viewState.progress)}%</div>
          <div>Playing: {viewState.isPlaying ? '▶️ YES' : '⏸️ NO'}</div>
          <div>Paused: {viewState.isPaused ? '⏸️ YES' : '▶️ NO'}</div>
          <div>Loading: {isLoading ? '⏳ YES' : '✅ NO'}</div>
          <div>Error: {loadError ? '❌ YES' : '✅ NO'}</div>
          <div>Timer: {isTimerActiveRef.current ? '🟢 ACTIVE' : '🔴 INACTIVE'}</div>
          <div>Duration: {storyDuration}ms ({storyDuration/1000}s)</div>
          <div className="text-blue-400">Timer ID: {progressTimerRef.current ? 'SET' : 'NULL'}</div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;