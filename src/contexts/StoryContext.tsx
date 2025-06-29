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
    customCtaButtons: true,
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
    try {
      const activeStories = getActiveStories();
      console.log('Loading stories:', activeStories);
      setStories(activeStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    }
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
    console.log('Opening story viewer for:', storyId);
    console.log('Available stories:', stories.map(s => ({ id: s.id, name: s.barracaName })));
    
    const storyIndex = stories.findIndex(story => story.id === storyId);
    console.log('Found story at index:', storyIndex);
    
    if (storyIndex !== -1) {
      const story = stories[storyIndex];
      console.log('Opening story:', story);
      
      setCurrentStory(story);
      setViewState(prev => ({
        ...prev,
        currentStoryIndex: storyIndex,
        currentMediaIndex: 0,
        isPlaying: true,
        isPaused: false,
        progress: 0,
      }));
      setIsStoryViewerOpen(true);
      
      // Mark story as viewed immediately
      markStoryAsViewed(storyId);
    } else {
      console.error('Story not found:', storyId);
    }
  };

  const closeStoryViewer = () => {
    console.log('Closing story viewer');
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
    console.log('Moving to next story');
    const nextIndex = viewState.currentStoryIndex + 1;
    if (nextIndex < stories.length) {
      const nextStory = stories[nextIndex];
      console.log('Next story:', nextStory);
      
      setCurrentStory(nextStory);
      setViewState(prev => ({
        ...prev,
        currentStoryIndex: nextIndex,
        currentMediaIndex: 0,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      }));
      
      // Mark new story as viewed
      markStoryAsViewed(nextStory.id);
    } else {
      console.log('No more stories, closing viewer');
      closeStoryViewer();
    }
  };

  const previousStory = () => {
    console.log('Moving to previous story');
    const prevIndex = viewState.currentStoryIndex - 1;
    if (prevIndex >= 0) {
      const prevStory = stories[prevIndex];
      console.log('Previous story:', prevStory);
      
      setCurrentStory(prevStory);
      setViewState(prev => ({
        ...prev,
        currentStoryIndex: prevIndex,
        currentMediaIndex: 0,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      }));
    }
  };

  const nextMedia = () => {
    if (!currentStory) {
      console.log('No current story for next media');
      return;
    }
    
    console.log('Moving to next media. Current index:', viewState.currentMediaIndex, 'Total media:', currentStory.media.length);
    
    const nextMediaIndex = viewState.currentMediaIndex + 1;
    if (nextMediaIndex < currentStory.media.length) {
      console.log('Moving to media index:', nextMediaIndex);
      setViewState(prev => ({
        ...prev,
        currentMediaIndex: nextMediaIndex,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      }));
      
      // Mark current media as viewed
      const currentMedia = currentStory.media[viewState.currentMediaIndex];
      if (currentMedia) {
        markMediaAsViewed(currentMedia.id);
      }
    } else {
      console.log('No more media, moving to next story');
      // Mark current media as viewed before moving to next story
      const currentMedia = currentStory.media[viewState.currentMediaIndex];
      if (currentMedia) {
        markMediaAsViewed(currentMedia.id);
      }
      nextStory();
    }
  };

  const previousMedia = () => {
    console.log('Moving to previous media. Current index:', viewState.currentMediaIndex);
    
    if (viewState.currentMediaIndex > 0) {
      const prevMediaIndex = viewState.currentMediaIndex - 1;
      console.log('Moving to media index:', prevMediaIndex);
      setViewState(prev => ({
        ...prev,
        currentMediaIndex: prevMediaIndex,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      }));
    } else {
      console.log('At first media, moving to previous story');
      previousStory();
    }
  };

  const pauseStory = () => {
    console.log('Pausing story');
    setViewState(prev => ({
      ...prev,
      isPaused: true,
      isPlaying: false,
    }));
  };

  const resumeStory = () => {
    console.log('Resuming story');
    setViewState(prev => ({
      ...prev,
      isPaused: false,
      isPlaying: true,
    }));
  };

  const markStoryAsViewed = (storyId: string) => {
    console.log('Marking story as viewed:', storyId);
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
    console.log('Marking media as viewed:', mediaId);
    setViewState(prev => ({
      ...prev,
      viewedMedia: new Set([...prev.viewedMedia, mediaId])
    }));
  };

  const updateProgress = (progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    setViewState(prev => ({
      ...prev,
      progress: clampedProgress
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