import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Story, StoryViewState, FeatureFlags } from '../types';
import { getActiveStories } from '../data/storyData';

interface StoryContextType {
  stories: Story[];
  viewState: StoryViewState;
  featureFlags: FeatureFlags;
  isStoryViewerOpen: boolean;
  currentStory: Story | null;
  openStoryViewer: (storyId: string) => void;
  closeStoryViewer: () => void;
  nextStory: () => void;
  previousStory: () => void;
  nextMedia: () => void;
  previousMedia: () => void;
  pauseStory: () => void;
  resumeStory: () => void;
  markStoryAsViewed: (storyId: string) => void;
  markMediaAsViewed: (mediaId: string) => void;
  updateProgress: (progress: number) => void;
  resetProgress: () => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const useStory = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};

interface StoryProviderProps {
  children: ReactNode;
}

export const StoryProvider: React.FC<StoryProviderProps> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  
  const [featureFlags] = useState<FeatureFlags>({
    enableStoryBanner: true,
    enableChairReservation: true,
    enablePushNotifications: false,
    customCtaButtons: true, // Enable configurable CTA buttons
  });

  const [viewState, setViewState] = useState<StoryViewState>({
    currentStoryIndex: 0,
    currentMediaIndex: 0,
    isPlaying: false,
    isPaused: false,
    progress: 0,
    viewedStories: new Set(),
    viewedMedia: new Set(),
  });

  // Load stories on mount
  useEffect(() => {
    const activeStories = getActiveStories();
    setStories(activeStories);
  }, []);

  // Load viewed stories from localStorage with error handling
  useEffect(() => {
    try {
      const savedViewedStories = localStorage.getItem('ccc_viewedStories');
      const savedViewedMedia = localStorage.getItem('ccc_viewedMedia');
      
      if (savedViewedStories) {
        const parsed = JSON.parse(savedViewedStories);
        if (Array.isArray(parsed)) {
          setViewState(prev => ({
            ...prev,
            viewedStories: new Set(parsed)
          }));
        }
      }

      if (savedViewedMedia) {
        const parsed = JSON.parse(savedViewedMedia);
        if (Array.isArray(parsed)) {
          setViewState(prev => ({
            ...prev,
            viewedMedia: new Set(parsed)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading viewed stories from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('ccc_viewedStories');
      localStorage.removeItem('ccc_viewedMedia');
    }
  }, []);

  // Save viewed stories to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('ccc_viewedStories', JSON.stringify([...viewState.viewedStories]));
    } catch (error) {
      console.error('Error saving viewed stories to localStorage:', error);
    }
  }, [viewState.viewedStories]);

  useEffect(() => {
    try {
      localStorage.setItem('ccc_viewedMedia', JSON.stringify([...viewState.viewedMedia]));
    } catch (error) {
      console.error('Error saving viewed media to localStorage:', error);
    }
  }, [viewState.viewedMedia]);

  const openStoryViewer = (storyId: string) => {
    const storyIndex = stories.findIndex(story => story.id === storyId);
    if (storyIndex !== -1) {
      setCurrentStory(stories[storyIndex]);
      setViewState(prev => ({
        ...prev,
        currentStoryIndex: storyIndex,
        currentMediaIndex: 0,
        isPlaying: true,
        isPaused: false,
        progress: 0,
      }));
      setIsStoryViewerOpen(true);
    }
  };

  const closeStoryViewer = () => {
    setIsStoryViewerOpen(false);
    setCurrentStory(null);
    setViewState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      progress: 0,
    }));
  };

  const nextStory = () => {
    const nextIndex = viewState.currentStoryIndex + 1;
    if (nextIndex < stories.length) {
      setCurrentStory(stories[nextIndex]);
      setViewState(prev => ({
        ...prev,
        currentStoryIndex: nextIndex,
        currentMediaIndex: 0,
        progress: 0,
      }));
    } else {
      closeStoryViewer();
    }
  };

  const previousStory = () => {
    const prevIndex = viewState.currentStoryIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStory(stories[prevIndex]);
      setViewState(prev => ({
        ...prev,
        currentStoryIndex: prevIndex,
        currentMediaIndex: 0,
        progress: 0,
      }));
    }
  };

  const nextMedia = () => {
    if (!currentStory) return;
    
    const nextMediaIndex = viewState.currentMediaIndex + 1;
    if (nextMediaIndex < currentStory.media.length) {
      setViewState(prev => ({
        ...prev,
        currentMediaIndex: nextMediaIndex,
        progress: 0,
      }));
    } else {
      nextStory();
    }
  };

  const previousMedia = () => {
    if (viewState.currentMediaIndex > 0) {
      setViewState(prev => ({
        ...prev,
        currentMediaIndex: prev.currentMediaIndex - 1,
        progress: 0,
      }));
    } else {
      previousStory();
    }
  };

  const pauseStory = () => {
    setViewState(prev => ({
      ...prev,
      isPaused: true,
      isPlaying: false,
    }));
  };

  const resumeStory = () => {
    setViewState(prev => ({
      ...prev,
      isPaused: false,
      isPlaying: true,
    }));
  };

  const markStoryAsViewed = (storyId: string) => {
    setViewState(prev => ({
      ...prev,
      viewedStories: new Set([...prev.viewedStories, storyId])
    }));
    
    // Update the story in the stories array
    setStories(prev => prev.map(story => 
      story.id === storyId ? { ...story, isViewed: true } : story
    ));
  };

  const markMediaAsViewed = (mediaId: string) => {
    setViewState(prev => ({
      ...prev,
      viewedMedia: new Set([...prev.viewedMedia, mediaId])
    }));
  };

  const updateProgress = (progress: number) => {
    setViewState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress))
    }));
  };

  const resetProgress = () => {
    setViewState(prev => ({
      ...prev,
      progress: 0
    }));
  };

  const value: StoryContextType = {
    stories,
    viewState,
    featureFlags,
    isStoryViewerOpen,
    currentStory,
    openStoryViewer,
    closeStoryViewer,
    nextStory,
    previousStory,
    nextMedia,
    previousMedia,
    pauseStory,
    resumeStory,
    markStoryAsViewed,
    markMediaAsViewed,
    updateProgress,
    resetProgress,
  };

  return (
    <StoryContext.Provider value={value}>
      {children}
    </StoryContext.Provider>
  );
};