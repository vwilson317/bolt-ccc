import { BarracaEvent, EventPhoto } from '../types';

// Sample event photos with Cloudflare URLs (these would be real URLs in production)
const createEventPhoto = (id: string, filename: string, isHighlight: boolean = false, caption?: string): EventPhoto => ({
  id,
  url: `https://imagedelivery.net/your-account-hash/${filename}/public`, // Cloudflare Images URL format
  isHighlight,
  caption,
  timestamp: new Date()
});

// Sample events for testing
export const sampleEvents: BarracaEvent[] = [
  {
    id: 'event-1',
    title: 'Summer Beach Party 2024',
    date: new Date('2024-01-15'),
    description: 'An amazing beach party with live music, great food, and unforgettable moments under the stars.',
    photos: [
      createEventPhoto('photo-1', 'beach-party-1', true, 'Live DJ performance on the beach'),
      createEventPhoto('photo-2', 'beach-party-2', true, 'Guests enjoying cocktails at sunset'),
      createEventPhoto('photo-3', 'beach-party-3', false, 'Beach volleyball tournament'),
      createEventPhoto('photo-4', 'beach-party-4', true, 'Fire show performance'),
      createEventPhoto('photo-5', 'beach-party-5', false, 'Group photo of all attendees'),
      createEventPhoto('photo-6', 'beach-party-6', false, 'Food station with local delicacies'),
    ],
    highlightPhotos: [],
    isActive: true,
    createdAt: new Date('2024-01-16')
  },
  {
    id: 'event-2',
    title: 'Carnival Celebration',
    date: new Date('2024-02-10'),
    description: 'Traditional Brazilian carnival celebration with samba music, colorful costumes, and authentic cuisine.',
    photos: [
      createEventPhoto('photo-7', 'carnival-1', true, 'Samba dancers in colorful costumes'),
      createEventPhoto('photo-8', 'carnival-2', true, 'Traditional carnival masks and decorations'),
      createEventPhoto('photo-9', 'carnival-3', false, 'Live samba band performance'),
      createEventPhoto('photo-10', 'carnival-4', true, 'Guests in carnival costumes'),
      createEventPhoto('photo-11', 'carnival-5', false, 'Traditional Brazilian food buffet'),
    ],
    highlightPhotos: [],
    isActive: true,
    createdAt: new Date('2024-02-11')
  },
  {
    id: 'event-3',
    title: 'Sunset Yoga Session',
    date: new Date('2024-03-20'),
    description: 'Peaceful yoga session on the beach during golden hour, perfect for relaxation and mindfulness.',
    photos: [
      createEventPhoto('photo-12', 'yoga-1', true, 'Yoga instructor leading the session'),
      createEventPhoto('photo-13', 'yoga-2', true, 'Participants in warrior pose at sunset'),
      createEventPhoto('photo-14', 'yoga-3', false, 'Meditation circle on the sand'),
      createEventPhoto('photo-15', 'yoga-4', true, 'Beautiful sunset backdrop during practice'),
    ],
    highlightPhotos: [],
    isActive: true,
    createdAt: new Date('2024-03-21')
  },
  {
    id: 'event-4',
    title: 'Seafood Festival',
    date: new Date('2024-04-05'),
    description: 'A culinary celebration featuring the finest fresh seafood and local specialties from the region.',
    photos: [
      createEventPhoto('photo-16', 'seafood-1', true, 'Fresh seafood display'),
      createEventPhoto('photo-17', 'seafood-2', true, 'Chef preparing grilled fish'),
      createEventPhoto('photo-18', 'seafood-3', false, 'Guests enjoying the seafood buffet'),
      createEventPhoto('photo-19', 'seafood-4', false, 'Local fishermen presenting their catch'),
      createEventPhoto('photo-20', 'seafood-5', true, 'Signature seafood paella'),
    ],
    highlightPhotos: [],
    isActive: true,
    createdAt: new Date('2024-04-06')
  }
];

// Process events to populate highlightPhotos
sampleEvents.forEach(event => {
  event.highlightPhotos = event.photos.filter(photo => photo.isHighlight);
});

// Function to get sample events for a specific barraca
export const getSampleEventsForBarraca = (barracaId: string): BarracaEvent[] => {
  // For testing, assign different events to different barracas
  const eventAssignments: Record<string, string[]> = {
    // You can map specific barraca IDs to specific events
    'default': ['event-1', 'event-2', 'event-3', 'event-4']
  };

  const assignedEventIds = eventAssignments[barracaId] || eventAssignments['default'];
  return sampleEvents.filter(event => assignedEventIds.includes(event.id));
};

export default sampleEvents;