import { PhotoDate, PhotoGalleryData, Location } from '../services/photoService';

export const mockPhotoDates: PhotoDate[] = [
  {
    id: '2025-08-24',
    date: '2025-08-24',
    title: 'Ad Campaign Day 2',
    photoCount: 210,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/gallery/2025-08-24/IMG_4133.jpg',
    description: 'Second day of our ad campaign. The kids joined us in games most of the day because the weather wasn\'t great. They did really good work, and we all had fun, which is what matters most.',
    location: [
      { name: 'Barraca Da Ana #56', barracaId: '7e150f39-daa0-4190-98b6-5e551b264240' },
      { name: 'Barraca Uruguay #80', barracaId: 'af17c0e3-fe61-4ecd-9e35-dfdde641819e' }
    ]
  },
  {
    id: '2025-08-23',
    date: '2025-08-23',
    title: 'Ad Campaign Day 1',
    photoCount: 1000,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/gallery/2025-08-23/IMG_3035.jpg',
    description: 'Advertising campaign for Aug 23rd, 2025. In addition to pushing advertising on IG, we decided to see if the kids selling things on the beach could help us. We gave them a QR code and asked people to go to our site, then follow us. It was a huge success!',
    location: [
      { name: 'Rainha Do Leblon #181', barracaId: '4b415c52-0475-490d-90a7-b38dcefa7bc7' },
      { name: 'Barraca do Nem #145', barracaId: 'c9425204-d298-4db8-a2cc-17aef5f1e546' }
    ],
  },
  {
    id: '2025-07-27',
    date: '2025-07-27',
    title: 'Launch Party',
    photoCount: 454,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/launch-party/IMG_2350-2.jpg',
    description: 'The official launch party. We had a really great turnout. We\'re grateful to have met so many unique, kind people.',
    location: [
      { name: 'Barraca Uruguay #80', barracaId: 'af17c0e3-fe61-4ecd-9e35-dfdde641819e' }
    ],
  }
];

export const mockPhotoGalleries: Record<string, PhotoGalleryData> = {
  '2025-08-23': {
    id: '2025-08-23',
    date: '2025-08-23',
    title: 'Ad Campaign Day 1',
    description: 'Advertising campaign for Aug 23rd, 2025. Employeed people on the beach to promote new instagram account.',
    location: [
      { name: 'Barraca Da Ana #56', barracaId: '7e150f39-daa0-4190-98b6-5e551b264240' },
      { name: 'Barraca Uruguay #80', barracaId: 'af17c0e3-fe61-4ecd-9e35-dfdde641819e' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/Wx6ZJqL39iqYkWiQ8',
    photos: [
      {
        id: '1',
        url: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/2025-08-23/IMG_3035.jpg',
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
    title: 'Ad Campaign Day 2',
    description: 'Advertising campaign for Aug 23rd, 2025. Employeed people on the beach to promote new instagram account.',
    location: [
      { name: 'Rainha Do Leblon #181', barracaId: 'mock-1' },
      { name: 'Barraca do Nem 145', barracaId: 'mock-2' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/98qmCtiVyE5Hbqoz7',
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
    location: [
      { name: 'Barraca Uruguay #80', barracaId: 'mock-1' }
    ],
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
