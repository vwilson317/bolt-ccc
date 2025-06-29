import { Story, StoryMedia } from '../types';

export const mockStoryMedia: StoryMedia[] = [
  {
    id: 'media-1',
    type: 'image',
    url: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
    caption: 'Fresh catch of the day! 🐟',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'media-2',
    type: 'image',
    url: 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg',
    caption: 'Perfect sunset vibes 🌅',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    id: 'media-3',
    type: 'image',
    url: 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg',
    caption: 'Tropical smoothie special today! 🥤',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  }
];

export const mockStories: Story[] = [
  {
    id: 'story-1',
    barracaId: '1',
    barracaName: 'Barraca do Zeca',
    media: [
      {
        id: 'media-1-1',
        type: 'image',
        url: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg',
        caption: 'Fresh seafood just arrived! 🦐🐟',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        id: 'media-1-2',
        type: 'image',
        url: 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg',
        caption: 'Beautiful sunset from our deck 🌅',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      }
    ],
    isViewed: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago - most recent
    expiresAt: new Date(Date.now() + 23.5 * 60 * 60 * 1000),
  },
  {
    id: 'story-2',
    barracaId: '2',
    barracaName: 'Sol e Mar',
    media: [
      {
        id: 'media-2-1',
        type: 'image',
        url: 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg',
        caption: 'New tropical smoothie menu! 🥤🌺',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
      {
        id: 'media-2-2',
        type: 'image',
        url: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg',
        caption: 'Yoga class starting at 6 PM 🧘‍♀️',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: 'media-2-3',
        type: 'image',
        url: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg',
        caption: 'Happy hour special drinks! 🍹',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      }
    ],
    isViewed: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago - second most recent
    expiresAt: new Date(Date.now() + 23.25 * 60 * 60 * 1000),
  },
  {
    id: 'story-3',
    barracaId: '3',
    barracaName: 'Carioca Vibes',
    media: [
      {
        id: 'media-3-1',
        type: 'image',
        url: 'https://images.pexels.com/photos/1379636/pexels-photo-1379636.jpeg',
        caption: 'VIP cabana setup for tonight 🏖️✨',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
      }
    ],
    isViewed: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago - third most recent
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000),
  },
  {
    id: 'story-4',
    barracaId: '4',
    barracaName: 'Praia Zen',
    media: [
      {
        id: 'media-4-1',
        type: 'image',
        url: 'https://images.pexels.com/photos/1078981/pexels-photo-1078981.jpeg',
        caption: 'Morning meditation session 🧘‍♂️🌊',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        id: 'media-4-2',
        type: 'image',
        url: 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg',
        caption: 'Healthy lunch bowls ready! 🥗',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      }
    ],
    isViewed: true, // This one is already viewed - should appear at the end
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago - oldest
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
  },
  {
    id: 'story-5',
    barracaId: '6',
    barracaName: 'Leme Paradise',
    media: [
      {
        id: 'media-5-1',
        type: 'image',
        url: 'https://images.pexels.com/photos/1415131/pexels-photo-1415131.jpeg',
        caption: 'Family fun day at the beach! 👨‍👩‍👧‍👦🏖️',
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      }
    ],
    isViewed: false,
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    expiresAt: new Date(Date.now() + 22.5 * 60 * 60 * 1000),
  }
];

// Filter out expired stories
export const getActiveStories = (): Story[] => {
  const now = new Date();
  return mockStories.filter(story => story.expiresAt > now);
};

// Get stories for a specific barraca
export const getStoriesForBarraca = (barracaId: string): Story[] => {
  return getActiveStories().filter(story => story.barracaId === barracaId);
};

// Check if a barraca has active stories
export const hasActiveStories = (barracaId: string): boolean => {
  return getStoriesForBarraca(barracaId).length > 0;
};