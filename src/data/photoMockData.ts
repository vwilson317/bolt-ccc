import { PhotoDate, PhotoGalleryData } from '../services/photoService';

export const mockPhotoDates: PhotoDate[] = [
  {
    id: '2026-03-21',
    date: '2026-03-21',
    title: 'Dia no Escrito #120',
    photoCount: 0,
    archiveCount: 0,
    thumbnail: undefined,
    description: 'Fotos do dia 21 de março de 2026 no Escrito #120.',
    location: [
      { name: 'Escrito #120', instagram: 'https://www.instagram.com/escritoriocarioca' }
    ]
  },
  {
    id: '2026-03-19',
    date: '2026-03-19',
    title: 'Boat Party com Yacht Bliss Rio',
    photoCount: 0,
    archiveCount: 0,
    thumbnail: undefined,
    description: 'Festa no barco com Yacht Bliss Rio.',
    location: [
      { name: 'Yacht Bliss Rio', instagram: 'https://www.instagram.com/yachtblissrio' }
    ]
  },
  {
    id: '2026-03-15',
    date: '2026-03-15',
    title: 'Dia na Jota 86x',
    photoCount: 0,
    archiveCount: 0,
    thumbnail: undefined,
    description: 'Fotos do dia 15 de março de 2026 na Jota 86x.',
    location: [
      { name: "Jota's Tent #86x", instagram: 'https://www.instagram.com/barracadojota86x' }
    ]
  },
  {
    id: '2026-03-14',
    date: '2026-03-14',
    title: 'Dia na Jota 86x',
    photoCount: 0,
    archiveCount: 0,
    thumbnail: undefined,
    description: 'Fotos do dia 14 de março de 2026 na Jota 86x.',
    location: [
      { name: "Jota's Tent #86x", instagram: 'https://www.instagram.com/barracadojota86x' }
    ]
  },
  {
    id: '2026-03-07',
    date: '2026-03-07',
    title: 'Promo Weekend',
    photoCount: 0,
    archiveCount: 0,
    thumbnail: undefined,
    description: 'Photos from our promotional weekend — Saturday March 7 & Sunday March 8, 2026 at Thai 82 and Jota 86x.',
    location: [
      { name: 'Barraca da Thai #82', barracaId: 'f86c49e6-6c44-4ce8-a455-a981042f4512' },
      { name: "Jota's Tent #86x", instagram: 'https://www.instagram.com/barracadojota86x' }
    ]
  },
  {
    id: '2025-08-24',
    date: '2025-08-24',
    title: 'Dia de Mídia Social com as Crianças das Favelas',
    photoCount: 1, // Fallback count when Cloudflare is not available
    archiveCount: 210,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/gallery/2025-08-24/IMG_4133.jpg',
    description: 'Segundo dia da nossa campanha publicitária. As crianças se juntaram a nós em jogos durante a maior parte do dia porque o tempo não estava muito bom. Elas fizeram um trabalho realmente bom, e todos nos divertimos, que é o que mais importa.',
    location: [
      { name: 'Barraca Da Ana #56', barracaId: '7e150f39-daa0-4190-98b6-5e551b264240' },
      { name: 'Barraca Uruguay #80', barracaId: 'af17c0e3-fe61-4ecd-9e35-dfdde641819e' }
    ]
  },
  {
    id: '2025-08-23',
    date: '2025-08-23',
    title: 'Dia da Praia dos Gringos',
    photoCount: 15, // Fallback count when Cloudflare is not available
    archiveCount: 2500,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/gallery/2025-08-23/IMG_3035.jpg',
    description: 'Campanha publicitária para 23 de agosto de 2025. Além de fazer publicidade no IG, decidimos ver se as crianças vendendo coisas na praia poderiam nos ajudar. Demos a elas um código QR e pedimos às pessoas para irem ao nosso site, depois nos seguirem. Foi um sucesso enorme!',
    location: [
      { name: 'Rainha Do Leblon #181', barracaId: '4b415c52-0475-490d-90a7-b38dcefa7bc7' },
      { name: 'Barraca do Nem #145', barracaId: 'c9425204-d298-4db8-a2cc-17aef5f1e546' }
    ],
  },
  {
    id: '2025-07-27',
    date: '2025-07-27',
    title: 'Festa de Lançamento',
    photoCount: 0, // Fallback count when Cloudflare is not available
    archiveCount: 454,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/launch-party/IMG_2350-2.jpg',
    description: 'A festa de lançamento oficial. Tivemos uma participação realmente ótima. Somos gratos por ter conhecido tantas pessoas únicas e gentis.',
    location: [
      { name: 'Barraca Uruguay #80', barracaId: 'af17c0e3-fe61-4ecd-9e35-dfdde641819e' }
    ],
  },
  {
    id: '2025-09-05',
    date: '2025-09-05',
    title: 'Beer pong na Barraca 82',
    photoCount: 0, // Fallback count when Cloudflare is not available
    archiveCount: 346,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/gallery/2025-09-05/PHOTO-2025-09-06-08-23-44.jpg',
    description: 'Beer pong na praia na barraca 82. Foi muito divertido e o atendimento foi excepcional',
    location: [
      { name: 'Barraca da Thai', barracaId: 'f86c49e6-6c44-4ce8-a455-a981042f4512' }
    ],
  },
  {
    id: '2025-09-20',
    date: '2025-09-20',
    title: 'Beer Pong da Verdade ou Consequencia',
    photoCount: 0, // Fallback count when Cloudflare is not available
    archiveCount: 250,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/gallery/2025-09-20/IMG_5045.jpg',
    description: 'Beer Pong da Verdade ou Consequencia',
    location: [
      { name: 'Barraca Da Paloma', barracaId: 'cebfd650-da94-4f0c-8a8e-317ce2c97dcb' }
    ],
  },
  {
    id: '2025-09-30',
    date: '2025-09-30',
    title: 'Evento de networking para nômades digitais',
    photoCount: 0, // Fallback count when Cloudflare is not available
    archiveCount: 120,
    thumbnail: 'https://pub-db19578f977b43e184c45b5084d7c029.r2.dev/gallery/2025-09-20/IMG_4971.jpg',
    description: 'Evento de networking para nômades digitais',
    location: [
      {name: 'Rufi Bar', instagram: 'https://www.instagram.com/rufi.bar/'}
    ],
  },
];

export const mockPhotoGalleries: Record<string, PhotoGalleryData> = {
  '2026-03-21': {
    id: '2026-03-21',
    date: '2026-03-21',
    title: 'Dia no Escrito #120',
    description: 'Fotos do dia 21 de março de 2026 no Escrito #120.',
    location: [
      { name: 'Escrito #120', instagram: 'https://www.instagram.com/escritoriocarioca' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/AJHcgRtbYMMtEo5j6',
    photos: []
  },
  '2026-03-19': {
    id: '2026-03-19',
    date: '2026-03-19',
    title: 'Boat Party com Yacht Bliss Rio',
    description: 'Festa no barco com Yacht Bliss Rio.',
    location: [
      { name: 'Yacht Bliss Rio', instagram: 'https://www.instagram.com/yachtblissrio' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/xMMjm55Pq2ps82B87',
    photos: []
  },
  '2026-03-15': {
    id: '2026-03-15',
    date: '2026-03-15',
    title: 'Dia na Jota 86x',
    description: 'Fotos do dia 15 de março de 2026 na Jota 86x.',
    location: [
      { name: "Jota's Tent #86x", instagram: 'https://www.instagram.com/barracadojota86x' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/ar9byrKQZ2D17vsg6',
    photos: []
  },
  '2026-03-14': {
    id: '2026-03-14',
    date: '2026-03-14',
    title: 'Dia na Jota 86x',
    description: 'Fotos do dia 14 de março de 2026 na Jota 86x.',
    location: [
      { name: "Jota's Tent #86x", instagram: 'https://www.instagram.com/barracadojota86x' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/vSA4P1Dm5wCPYpdQA',
    photos: []
  },
  '2026-03-07': {
    id: '2026-03-07',
    date: '2026-03-07',
    title: 'Promo Weekend',
    description: 'Photos from our promotional weekend — Saturday March 7 & Sunday March 8, 2026 at Thai 82 and Jota 86x.',
    location: [
      { name: 'Barraca da Thai #82', barracaId: 'f86c49e6-6c44-4ce8-a455-a981042f4512' },
      { name: "Jota's Tent #86x", instagram: 'https://www.instagram.com/barracadojota86x' }
    ],
    archiveUrl: 'https://drive.google.com/drive/folders/1UW8NjBoRMUg-PrkoVahaobbEt80GbrWe',
    photos: []
  },
  '2025-08-23': {
    id: '2025-08-23',
    date: '2025-08-23',
    title: 'Dia 1 da Campanha Publicitária',
    description: 'Campanha publicitária para 23 de agosto de 2025. Contratamos pessoas na praia para promover a nova conta do Instagram.',
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
        title: 'Pôr do Sol na Praia',
        description: 'Belíssimo pôr do sol durante nossa celebração de Ano Novo',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-15T18:30:00Z',
        width: 800,
        height: 600
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=1600&fit=crop',
        title: 'Encontro na Praia',
        description: 'Amigos aproveitando a atmosfera da praia',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-15T19:15:00Z',
        width: 800,
        height: 600
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=1600&fit=crop',
        title: 'Vista do Oceano',
        description: 'Vista deslumbrante do oceano do nosso local',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-15T20:00:00Z',
        width: 800,
        height: 600
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=1600&fit=crop',
        title: 'Atividades na Praia',
        description: 'Várias atividades e jogos na praia',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-15T21:30:00Z',
        width: 800,
        height: 600
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
        title: 'Cena Noturna da Praia',
        description: 'A praia à noite com as luzes da cidade',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-15T22:45:00Z',
        width: 800,
        height: 600
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=1600&fit=crop',
        title: 'Foto do Grupo',
        description: 'Foto do grupo com todos os participantes',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-15T23:00:00Z',
        width: 800,
        height: 600
      }
    ]
  },
  '2025-08-24': {
    id: '2025-08-24',
    date: '2025-08-24',
    title: 'Dia 2 da Campanha Publicitária',
    description: 'Campanha publicitária para 24 de agosto de 2025. Contratamos pessoas na praia para promover a nova conta do Instagram.',
    location: [
      { name: 'Barraca Da Ana #56', barracaId: '7e150f39-daa0-4190-98b6-5e551b264240' },
      { name: 'Barraca Uruguay #80', barracaId: 'af17c0e3-fe61-4ecd-9e35-dfdde641819e' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/98qmCtiVyE5Hbqoz7',
    photos: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
        title: 'Atividades com as Crianças',
        description: 'Crianças participando de jogos e atividades',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-16T14:30:00Z',
        width: 800,
        height: 600
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=1600&fit=crop',
        title: 'Trabalho em Equipe',
        description: 'Equipe trabalhando juntos na campanha',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-16T15:15:00Z',
        width: 800,
        height: 600
      }
    ]
  },
  '2025-07-27': {
    id: '2025-07-27',
    date: '2025-07-27',
    title: 'Festa de Lançamento',
    description: 'A festa de lançamento oficial para o novo site.',
    location: [
      { name: 'Barraca Uruguay #80', barracaId: 'af17c0e3-fe61-4ecd-9e35-dfdde641819e' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/D6Ky1BJYpxLAfvHB9',
    photos: [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=1600&fit=crop',
        title: 'Celebração do Lançamento',
        description: 'Momento especial do lançamento oficial',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-17T19:00:00Z',
        width: 800,
        height: 600
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
        urlMobile: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=1600&fit=crop',
        title: 'Convidados Especiais',
        description: 'Convidados especiais na festa de lançamento',
        location: 'Praia de Copacabana',
        timestamp: '2024-01-17T20:30:00Z',
        width: 800,
        height: 600
      }
    ]
  },
  '2025-09-05': {
    id: '2025-09-05',
    date: '2025-09-05',
    title: 'Beer pong na Barraca 82',
    description: 'Beer pong na praia na barraca 82. Foi muito divertido e o atendimento foi excepcional',
    location: [
      { name: 'Barraca da Thai', barracaId: 'f86c49e6-6c44-4ce8-a455-a981042f4512' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/oTdSa9X3pBYzHYyG8',
    photos: [
    ]
  },
  '2025-09-20': {
    id: '2025-09-20',
    date: '2025-09-20',
    title: 'Beer Pong da Verdade ou Consequencia',
    description: 'Beer Pong da Verdade ou Consequencia',
    location: [
      { name: 'Barraca Da Paloma', barracaId: 'cebfd650-da94-4f0c-8a8e-317ce2c97dcb' }
    ],
    archiveUrl: 'https://photos.app.goo.gl/fELs6rUNUdmDGxQz6',
    photos: []
  },
  '2025-09-30': {
    id: '2025-09-30',
    date: '2025-09-30',
    title: 'Evento de networking para nômades digitais',
    description: 'Evento de networking para nômades digitais',
    location: [{name: 'Rufi Bar', instagram: 'https://www.instagram.com/rufi.bar/'}],
    archiveUrl: 'https://photos.app.goo.gl/4tWESkNjkAWZYW8SA',
    photos: []
  }
};
