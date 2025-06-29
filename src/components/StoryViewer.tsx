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
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Timer management with refs to avoid stale closures
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMedia = currentStory?.media?.[viewState.currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';
  const storyDuration = isVideo ? (currentMedia?.duration || 10) * 1000 : 5000;

  console.log('🎬 StoryViewer render:', {
    isOpen: isStoryViewerOpen,
    currentStory: currentStory?.barracaName,
    currentMediaIndex: viewState.currentMediaIndex,
    totalMedia: currentStory?.media?.length,
    isMediaReady,
    isPlaying: viewState.isPlaying,
    isPaused: viewState.isPaused,
    progress: viewState.progress,
    hasTimer: !!timerRef.current,
    storyDuration
  });

  // Clear timer function
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      console.log('🛑 Clearing timer');
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start timer function - FIXED VERSION
  const startTimer = useCallback(() => {
    console.log('🚀 Starting timer attempt:', {
      isMediaReady,
      isPlaying: viewState.isPlaying,
      isPaused: viewState.isPaused,
      hasCurrentMedia: !!currentMedia,
      currentProgress: viewState.progress
    });

    // Clear any existing timer first
    clearTimer();

    // Check all conditions
    if (!isMediaReady || !viewState.isPlaying || viewState.isPaused || !currentMedia) {
      console.log('❌ Cannot start timer - conditions not met');
      return;
    }

    console.log('✅ Starting timer - all conditions met');
    
    // Start from current progress
    const startProgress = viewState.progress;
    const startTime = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressIncrement = (elapsed / storyDuration) * 100;
      const newProgress = startProgress + progressIncrement;
      
      console.log('⏱️ Timer tick:', {
        elapsed,
        progressIncrement,
        newProgress,
        startProgress,
        storyDuration
      });
      
      if (newProgress >= 100) {
        console.log('✅ Story complete! Moving to next');
        clearTimer();
        updateProgress(100);
        
        // Mark current media as viewed
        if (currentMedia) {
          markMediaAsViewed(currentMedia.id);
        }
        
        // Move to next media after a brief delay
        setTimeout(() => {
          console.log('🔄 Triggering nextMedia()');
          nextMedia();
        }, 100);
      } else {
        updateProgress(newProgress);
      }
    }, 100); // Update every 100ms for smooth progress
    
    console.log('✅ Timer started successfully with ID:', timerRef.current);
  }, [isMediaReady, viewState.isPlaying, viewState.isPaused, viewState.progress, currentMedia, storyDuration, clearTimer, updateProgress, markMediaAsViewed, nextMedia]);

  // Enhanced media ready detection
  const handleMediaReady = useCallback(() => {
    console.log('📷 Media ready event fired');
    setIsMediaReady(true);
    setLoadError(false);
  }, []);

  const handleMediaError = useCallback(() => {
    console.error('❌ Media failed to load');
    setIsMediaReady(false);
    setLoadError(true);
    clearTimer();
  }, [clearTimer]);

  // Touch handlers
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

  // Tap to pause/play
  const handleContainerTap = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const containerWidth = rect.width;

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

  // Reset when media changes
  useEffect(() => {
    console.log('🔄 Media changed - resetting everything');
    clearTimer();
    setIsMediaReady(false);
    setLoadError(false);
    resetProgress();
  }, [currentMedia?.id, clearTimer, resetProgress]);

  // SIMPLIFIED TIMER CONTROL - This is the key fix!
  useEffect(() => {
    console.log('🎯 Timer control effect:', {
      isStoryViewerOpen,
      hasCurrentMedia: !!currentMedia,
      isMediaReady,
      isPlaying: viewState.isPlaying,
      isPaused: viewState.isPaused,
      hasTimer: !!timerRef.current
    });

    // Only run if story viewer is open and we have media
    if (!isStoryViewerOpen || !currentMedia) {
      clearTimer();
      return;
    }

    // Should the timer be running?
    const shouldTimerRun = isMediaReady && viewState.isPlaying && !viewState.isPaused;
    const isTimerRunning = !!timerRef.current;

    console.log('🎯 Timer decision:', { shouldTimerRun, isTimerRunning });

    if (shouldTimerRun && !isTimerRunning) {
      console.log('▶️ Starting timer');
      startTimer();
    } else if (!shouldTimerRun && isTimerRunning) {
      console.log('⏸️ Stopping timer');
      clearTimer();
    }

    // Cleanup function
    return () => {
      if (!shouldTimerRun) {
        clearTimer();
      }
    };
  }, [
    isStoryViewerOpen,
    currentMedia?.id,
    isMediaReady,
    viewState.isPlaying,
    viewState.isPaused,
    startTimer,
    clearTimer
  ]);

  // Mark story as viewed when opened
  useEffect(() => {
    if (currentStory && isStoryViewerOpen) {
      markStoryAsViewed(currentStory.id);
    }
  }, [currentStory?.id, isStoryViewerOpen, markStoryAsViewed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

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
        {!isMediaReady && !loadError && (
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
                onLoadedData={handleMediaReady}
                onCanPlay={handleMediaReady}
                onError={handleMediaError}
                onEnded={nextMedia}
              />
            ) : (
              <img
                ref={mediaRef as React.RefObject<HTMLImageElement>}
                src={currentMedia.url}
                alt={currentMedia.caption || ''}
                className="max-w-full max-h-full object-contain"
                onLoad={handleMediaReady}
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

      {/* Debug Panel - Only in Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/90 text-white p-3 rounded-lg text-xs font-mono space-y-1 max-w-xs">
          <div className="text-yellow-400 font-bold">🎬 Story Debug v4</div>
          <div>Story: {currentStory.barracaName}</div>
          <div>Media: {viewState.currentMediaIndex + 1}/{currentStory.media.length}</div>
          <div>Progress: {Math.round(viewState.progress)}%</div>
          <div>Playing: {viewState.isPlaying ? '▶️ YES' : '⏸️ NO'}</div>
          <div>Paused: {viewState.isPaused ? '⏸️ YES' : '▶️ NO'}</div>
          <div>Media Ready: {isMediaReady ? '✅ YES' : '⏳ NO'}</div>
          <div>Error: {loadError ? '❌ YES' : '✅ NO'}</div>
          <div>Timer Active: {timerRef.current ? '🟢 YES' : '🔴 NO'}</div>
          <div>Duration: {storyDuration}ms</div>
          <div>Type: {isVideo ? '📹 Video' : '🖼️ Image'}</div>
          
          {/* Manual Controls */}
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="text-blue-400 font-bold">Manual Controls:</div>
            <div className="flex gap-1 mt-1 flex-wrap">
              <button 
                onClick={() => {
                  console.log('🔧 Manual: Force ready + start');
                  setIsMediaReady(true);
                  setLoadError(false);
                }}
                className="bg-green-600 px-2 py-1 rounded text-xs"
              >
                Force Ready
              </button>
              <button 
                onClick={() => {
                  console.log('🔧 Manual: Start timer');
                  startTimer();
                }}
                className="bg-blue-600 px-2 py-1 rounded text-xs"
              >
                Start Timer
              </button>
              <button 
                onClick={() => {
                  console.log('🔧 Manual: Next media');
                  nextMedia();
                }}
                className="bg-purple-600 px-2 py-1 rounded text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;