import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import { BarracaEvent } from '../types';

interface EventStoryViewerProps {
  event: BarracaEvent;
  isOpen: boolean;
  onClose: () => void;
}

const EventStoryViewer: React.FC<EventStoryViewerProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const PHOTO_DURATION = 4000; // 4 seconds per photo
  const UPDATE_INTERVAL = 50; // Update progress every 50ms

  const currentPhoto = event.photos[currentPhotoIndex];

  // Clear timer utility
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start progress timer
  const startTimer = useCallback(() => {
    clearTimer();
    progressRef.current = 0;
    
    timerRef.current = setInterval(() => {
      progressRef.current += UPDATE_INTERVAL;
      const newProgress = Math.min((progressRef.current / PHOTO_DURATION) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearTimer();
        setTimeout(() => {
          nextPhoto();
        }, 100);
      }
    }, UPDATE_INTERVAL);
  }, []);

  // Navigation functions
  const nextPhoto = useCallback(() => {
    if (currentPhotoIndex < event.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
      setProgress(0);
      progressRef.current = 0;
    } else {
      onClose();
    }
  }, [currentPhotoIndex, event.photos.length, onClose]);

  const previousPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
      setProgress(0);
      progressRef.current = 0;
    }
  }, [currentPhotoIndex]);

  // Touch handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    containerRef.current?.setAttribute('data-touch-start', `${touch.clientX},${touch.clientY}`);
    setIsPaused(true);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchStart = containerRef.current?.getAttribute('data-touch-start');
    if (!touchStart) {
      setIsPaused(false);
      return;
    }

    const [startX, startY] = touchStart.split(',').map(Number);
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // Vertical swipe to close
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 100) {
      onClose();
      return;
    }

    // Horizontal swipe to navigate
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        previousPhoto();
      } else {
        nextPhoto();
      }
    }

    setIsPaused(false);
    containerRef.current?.removeAttribute('data-touch-start');
  }, [previousPhoto, nextPhoto, onClose]);

  // Click to pause/resume
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Left third - previous photo
    if (clickX < width / 3) {
      previousPhoto();
    }
    // Right third - next photo
    else if (clickX > (width * 2) / 3) {
      nextPhoto();
    }
    // Center third - toggle pause
    else {
      setIsPaused(prev => !prev);
    }
  }, [previousPhoto, nextPhoto]);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          previousPhoto();
          break;
        case 'ArrowRight':
          nextPhoto();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previousPhoto, nextPhoto, onClose]);

  // Timer management
  useEffect(() => {
    if (isOpen && !isPaused && currentPhoto) {
      startTimer();
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isOpen, isPaused, currentPhotoIndex, startTimer, clearTimer]);

  // Reset when photo changes
  useEffect(() => {
    setProgress(0);
    progressRef.current = 0;
    setShowInfo(false);
  }, [currentPhotoIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isOpen || !currentPhoto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex space-x-1 p-2">
        {event.photos.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-beach-400 via-beach-500 to-ocean-600 transition-all duration-100 ease-linear rounded-full"
              style={{
                width: index < currentPhotoIndex 
                  ? '100%' 
                  : index === currentPhotoIndex 
                    ? `${progress}%` 
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
              src={event.highlightPhotos[0]?.url || currentPhoto.url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{event.title}</h3>
            <div className="flex items-center text-xs text-white/70">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(event.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Info Toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/20"
          >
            <Info className="h-4 w-4 text-white" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors border border-white/20"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Photo Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption || `${event.title} photo ${currentPhotoIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation Arrows (Desktop) */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
          {currentPhotoIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousPhoto();
              }}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors pointer-events-auto"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
          )}
          
          {currentPhotoIndex < event.photos.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors pointer-events-auto ml-auto"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Photo Info */}
      {currentPhoto.caption && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p className="text-white text-sm leading-relaxed max-w-2xl">
            {currentPhoto.caption}
          </p>
        </div>
      )}

      {/* Event Info Overlay */}
      {showInfo && (
        <div className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {event.title}
              </h3>
              <div className="flex items-center justify-center text-gray-600 mb-4">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.description && (
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {event.description}
                </p>
              )}
              <div className="text-sm text-gray-500">
                Photo {currentPhotoIndex + 1} of {event.photos.length}
              </div>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 w-full bg-beach-500 text-white py-2 px-4 rounded-lg hover:bg-beach-600 transition-colors"
            >
              Continue Viewing
            </button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !showInfo && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/20">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
          </div>
        </div>
      )}

      {/* Mobile Swipe Hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 md:hidden">
        <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs">
          Swipe left/right • Swipe down to close
        </div>
      </div>
    </div>
  );
};

export default EventStoryViewer;