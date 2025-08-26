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

  // Simple local state
  const [isMuted, setIsMuted] = useState(false);
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  
  // Single timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<number>(0);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMedia = currentStory?.media?.[viewState.currentMediaIndex];
  const isVideo = currentMedia?.type === 'video';
  const STORY_DURATION = 5000; // 5 seconds
  const UPDATE_INTERVAL = 50; // Update every 50ms for smooth progress

  // Clear timer utility - memoized to prevent recreation
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start timer - memoized with stable dependencies
  const startTimer = useCallback(() => {
    console.log('🚀 Starting timer for:', currentStory?.barracaName);
    
    clearTimer();
    progressRef.current = 0;
    
    timerRef.current = setInterval(() => {
      progressRef.current += UPDATE_INTERVAL;
      const progress = Math.min((progressRef.current / STORY_DURATION) * 100, 100);
      
      updateProgress(progress);
      
      if (progress >= 100) {
        console.log('✅ Timer complete - advancing');
        clearTimer();
        
        if (currentMedia) {
          markMediaAsViewed(currentMedia.id);
        }
        
        // Small delay to ensure smooth transition
        setTimeout(() => {
          nextMedia();
        }, 100);
      }
    }, UPDATE_INTERVAL);
  }, [clearTimer, updateProgress, currentMedia?.id, markMediaAsViewed, nextMedia, currentStory?.barracaName]);

  // Media loading handlers
  const handleMediaLoad = useCallback(() => {
    console.log('📷 Media loaded:', currentMedia?.url);
    setIsMediaReady(true);
    setLoadError(false);
  }, [currentMedia?.url]);

  const handleMediaError = useCallback(() => {
    console.error('❌ Media error:', currentMedia?.url);
    setIsMediaReady(false);
    setLoadError(true);
  }, [currentMedia?.url]);

  // Touch handlers
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

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
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

  // Click to pause/play
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Only center clicks toggle play/pause
    if (clickX > width / 3 && clickX < (width * 2) / 3) {
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
  }, [isStoryViewerOpen, viewState.isPlaying, viewState.isPaused]); // Removed function dependencies

  // Reset when media changes
  useEffect(() => {
    console.log('🔄 Media changed, resetting...');
    clearTimer();
    setIsMediaReady(false);
    setLoadError(false);
    resetProgress();
    progressRef.current = 0;
  }, [currentMedia?.id]); // Removed function dependencies to prevent infinite loops

  // MAIN TIMER LOGIC - DEAD SIMPLE
  useEffect(() => {
    const shouldStart = isStoryViewerOpen && 
                      currentMedia && 
                      isMediaReady && 
                      viewState.isPlaying && 
                      !viewState.isPaused && 
                      !loadError;

    console.log('🎯 Timer decision:', {
      open: isStoryViewerOpen,
      hasMedia: !!currentMedia,
      ready: isMediaReady,
      playing: viewState.isPlaying,
      paused: viewState.isPaused,
      error: loadError,
      shouldStart,
      hasTimer: !!timerRef.current
    });

    if (shouldStart && !timerRef.current) {
      console.log('▶️ Starting timer now!');
      startTimer();
    } else if (!shouldStart && timerRef.current) {
      console.log('⏸️ Stopping timer');
      clearTimer();
    }

    return clearTimer;
  }, [
    isStoryViewerOpen,
    currentMedia?.id,
    isMediaReady,
    viewState.isPlaying,
    viewState.isPaused,
    loadError
    // Removed startTimer and clearTimer from dependencies to prevent infinite loops
  ]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && isStoryViewerOpen) {
      markStoryAsViewed(currentStory.id);
    }
  }, [currentStory?.id, isStoryViewerOpen]); // Removed markStoryAsViewed from dependencies

  // Cleanup - simplified to prevent dependency issues
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []); // No dependencies needed for cleanup

  if (!isStoryViewerOpen || !currentStory || !currentMedia) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999999] bg-black">
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
          {/* Pause/Play */}
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

          {/* Mute (videos only) */}
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

          {/* Close */}
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
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading */}
        {!isMediaReady && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Error */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <div className="text-center">
              <p className="text-lg mb-2" data-lingo-skip>Failed to load</p>
              <button
                onClick={nextMedia}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
                data-lingo-skip
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Media */}
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

      {/* Debug Panel (Development Only) */}
      {import.meta.env.DEV && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/90 text-white p-3 rounded text-xs font-mono space-y-1 max-w-xs">
          <div className="text-yellow-400 font-bold" data-lingo-skip>DEBUG PANEL</div>
          <div data-lingo-skip>Progress: {Math.round(viewState.progress)}%</div>
          <div data-lingo-skip>Media Ready: {isMediaReady ? '✅' : '❌'}</div>
          <div data-lingo-skip>Playing: {viewState.isPlaying ? '▶️' : '⏸️'}</div>
          <div data-lingo-skip>Paused: {viewState.isPaused ? '⏸️' : '▶️'}</div>
          <div data-lingo-skip>Timer Active: {timerRef.current ? '🟢' : '🔴'}</div>
          <div data-lingo-skip>Load Error: {loadError ? '❌' : '✅'}</div>
          <div data-lingo-skip>Media: {viewState.currentMediaIndex + 1}/{currentStory?.media.length}</div>
          <div className="pt-2 border-t border-gray-600">
            <button 
              onClick={() => {
                console.log('🔧 Force starting timer');
                startTimer();
              }}
              className="bg-blue-600 px-2 py-1 rounded text-xs mr-2"
              data-lingo-skip
            >
              Force Start
            </button>
            <button 
              onClick={() => {
                console.log('🔧 Force next media');
                nextMedia();
              }}
              className="bg-green-600 px-2 py-1 rounded text-xs"
              data-lingo-skip
            >
              Force Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;