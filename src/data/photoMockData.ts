import { PhotoDate, PhotoGalleryData } from '../services/photoService';

export const mockPhotoDates: PhotoDate[] = [
  {
    id: '2025-08-24',
    date: '2025-08-24',
    title: 'Ad Campaign Day 2',
    photoCount: 45,
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    description: 'Advertising campaign for Aug 23rd, 2025. Employeed people on the beach to promote new instagram account.',
    location: 'Ipanema Beach, Rio de Janeiro'
  },
  {
    id: '2025-08-23',
    date: '2025-08-23',
    title: 'Ad Campaign Day 1',
    photoCount: 45,
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    description: 'Advertising campaign for Aug 23rd, 2025. Employeed people on the beach to promote new instagram account.',
    location: 'Ipanema Beach, Rio de Janeiro'
  },
  {
    id: '2025-08-24',
    date: '2025-08-24',
    title: 'Launch Party',
    photoCount: 45,
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    description: 'Advertising campaign for Aug 23rd, 2025. Employeed people on the beach to promote new instagram account.',
    location: 'Ipanema Beach, Rio de Janeiro'
  }
];

export const mockPhotoGalleries: Record<string, PhotoGalleryData> = {
  '2025-08-23': {
    id: '2025-08-23',
    date: '2025-08-23',
    title: 'Ad Campaign Aug 23rd, 2025',
    description: 'Advertising campaign for Aug 23rd, 2025. Employeed people on the beach to promote new instagram account.',
    location: 'Barraca Ana, Ipanema Beach & Barraca Uruguay, Ipanema Beach, Rio de Janeiro',
    archiveUrl: 'https://photos.app.goo.gl/D6Ky1BJYpxLAfvHB9',
    photos: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
        title: 'Sunset at the Beach',
        description: 'Beautiful sunset during our New Year celebration',
        location: 'Copacabana Beach',
        timestamp: '2024-01-15T18:30:00Z',
        width: 800,
        height: 600
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=1600&fit=crop',
        title: 'Beach Gathering',
        description: 'Friends enjoying the beach atmosphere',
        location: 'Copacabana Beach',
        timestamp: '2024-01-15T19:15:00Z',
        width: 800,
        height: 600
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=1600&fit=crop',
        title: 'Ocean View',
        description: 'Stunning ocean view from our spot',
        location: 'Copacabana Beach',
        timestamp: '2024-01-15T20:00:00Z',
        width: 800,
        height: 600
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=1600&fit=crop',
        title: 'Beach Activities',
        description: 'Various beach activities and games',
        location: 'Copacabana Beach',
        timestamp: '2024-01-15T21:30:00Z',
        width: 800,
        height: 600
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
        title: 'Night Beach Scene',
        description: 'The beach at night with city lights',
        location: 'Copacabana Beach',
        timestamp: '2024-01-15T22:45:00Z',
        width: 800,
        height: 600
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=1600&fit=crop',
        title: 'Group Photo',
        description: 'Group photo with all participants',
        location: 'Copacabana Beach',
        timestamp: '2024-01-15T23:00:00Z',
        width: 800,
        height: 600
      }
    ]
  },
  '2025-08-24': {
    id: '2025-08-24',
    date: '2025-08-24',
    title: 'Launch Party',
    description: 'Advertising campaign for Aug 23rd, 2025. Employeed people on the beach to promote new instagram account.',
    location: 'Barraca 181, Leblon Beach, Rio de Janeiro & Barraca Nema, Ipanema Beach, Rio de Janeiro',
    archiveUrl: 'https://photos.google.com/share/AF1QipM_2025_08_24',
    photos: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
        width: 800,
        height: 600
      }
    ]
  },
  '2025-08-25': {
    id: '2025-08-25',
    date: '2025-08-25',
    title: 'Launch Party',
    description: 'The offical launch party for the new website.',
    location: 'Barraca 80 Uruguay, Ipanema Beach, Rio de Janeiro',
    archiveUrl: 'https://photos.app.goo.gl/D6Ky1BJYpxLAfvHB9', //real
    photos: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
        width: 800,
        height: 600
      }
    ]
  }
};
