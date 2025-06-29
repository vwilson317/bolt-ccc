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
  
  // 🚫 STORIES FEATURE DISABLED
  const [featureFlags] = useState<FeatureFlags>({
    enableStoryBanner: false, // ← Disabled
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

  // Load stories on mount (only if feature is enabled)
  useEffect(() => {
    if (!featureFlags.enableStoryBanner) {
      console.log('📚 Stories feature disabled - not loading stories');
      setStories([]);
      return;
    }

    try {
      const activeStories = getActiveStories();
      console.log('📚 Loading stories:', activeStories.length);
      setStories(activeStories);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    }
  }, [featureFlags.enableStoryBanner]);

  // Load/save viewed stories from localStorage
  useEffect(() => {
    if (!featureFlags.enableStoryBanner) return;

    try {
      const saved = localStorage.getItem('ccc_viewedStories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setViewState(prev => ({
            ...prev,
            viewedStories: new Set(parsed)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading viewed stories:', error);
    }
  }, [featureFlags.enableStoryBanner]);

  useEffect(() => {
    if (!featureFlags.enableStoryBanner) return;

    try {
      localStorage.setItem('ccc_viewedStories', JSON.stringify([...viewState.viewedStories]));
    } catch (error) {
      console.error('Error saving viewed stories:', error);
    }
  }, [viewState.viewedStories, featureFlags.enableStoryBanner]);

  const openStoryViewer = (storyId: string) => {
    if (!featureFlags.enableStoryBanner) {
      console.log('📚 Stories feature disabled - cannot open viewer');
      return;
    }

    console.log('🎬 Opening story:', storyId);
    
    const storyIndex = stories.findIndex(story => story.id === storyId);
    if (storyIndex === -1) {
      console.error('Story not found:', storyId);
      return;
    }

    const story = stories[storyIndex];
    console.log('📖 Story found:', story.barracaName, 'with', story.media.length, 'media');
    
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
  };

  const closeStoryViewer = () => {
    console.log('❌ Closing story viewer');
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
    console.log('⏭️ Next story');
    const nextIndex = viewState.currentStoryIndex + 1;
    if (nextIndex < stories.length) {
      const nextStory = stories[nextIndex];
      setCurrentStory(nextStory);
      setViewState(prev => ({
        ...prev,
        currentStoryIndex: nextIndex,
        currentMediaIndex: 0,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      }));
    } else {
      closeStoryViewer();
    }
  };

  const previousStory = () => {
    console.log('⏮️ Previous story');
    const prevIndex = viewState.currentStoryIndex - 1;
    if (prevIndex >= 0) {
      const prevStory = stories[prevIndex];
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
    if (!currentStory) return;
    
    console.log('⏭️ Next media:', viewState.currentMediaIndex + 1, '/', currentStory.media.length);
    
    const nextMediaIndex = viewState.currentMediaIndex + 1;
    if (nextMediaIndex < currentStory.media.length) {
      setViewState(prev => ({
        ...prev,
        currentMediaIndex: nextMediaIndex,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      }));
    } else {
      nextStory();
    }
  };

  const previousMedia = () => {
    console.log('⏮️ Previous media');
    
    if (viewState.currentMediaIndex > 0) {
      setViewState(prev => ({
        ...prev,
        currentMediaIndex: prev.currentMediaIndex - 1,
        progress: 0,
        isPlaying: true,
        isPaused: false,
      }));
    } else {
      previousStory();
    }
  };

  const pauseStory = () => {
    console.log('⏸️ Pause story');
    setViewState(prev => ({
      ...prev,
      isPaused: true,
      isPlaying: false,
    }));
  };

  const resumeStory = () => {
    console.log('▶️ Resume story');
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