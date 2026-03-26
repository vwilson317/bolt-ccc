export interface InstagramEmbed {
  /** Shortcode from the URL: instagram.com/p/ABC123/ or instagram.com/reel/ABC123/ → "ABC123" */
  shortcode: string;
  /** "post" for /p/ URLs, "reel" for /reel/ URLs */
  type: 'post' | 'reel';
  /** "landscape" for horizontal reels — renders the embed wider */
  orientation?: 'portrait' | 'landscape';
  caption?: string;
}

export interface Photographer {
  id: string;
  name: string;
  role: string;
  bio: string;
  instagramHandle: string;
  instagramUrl?: string;
  whatsappPhone?: string;
  whatsappMessage?: string;
  /** Optional URL to a profile/headshot image */
  profileImage?: string;
  featuredWork: InstagramEmbed[];
}

/**
 * Photographer & videographer profiles for the /content-professionals showcase page.
 *
 * To add/swap content:
 *   - instagramHandle: handle without @
 *   - shortcode: the path segment after /p/ or /reel/ in the Instagram URL
 *   - type: "post" for /p/ links, "reel" for /reel/ links
 *   - orientation: add "landscape" for horizontal reels (renders wider iframe)
 *   - profileImage: Cloudflare R2 URL or /public path for a headshot
 */
export const photographers: Photographer[] = [
  {
    id: 'marty',
    name: 'Marty',
    role: 'Videographer',
    bio: 'Marty\'s work is all about movement and mood. His videos bring the rhythm of Rio to life — the waves, the crowd, the music, the heat. Every frame tells a story you can almost feel.',
    instagramHandle: '1marty_mcfly',
    instagramUrl: 'https://www.instagram.com/1marty_mcfly?igsh=MTd0N3RkZmZqNXprMw==',
    whatsappPhone: '+55 21 96019-2625',
    whatsappMessage: 'Hi Marty! I’d love to discuss a content project.',
    profileImage: undefined,
    featuredWork: [
      { shortcode: 'DWOf53SjeEi', type: 'reel' },
      { shortcode: 'DWRJU7UDW5v', type: 'reel', orientation: 'landscape' },
      { shortcode: 'DWGwCv-BtlZ', type: 'reel', orientation: 'landscape' },
      { shortcode: 'DVlRu0jjarF', type: 'reel' },
    ],
  },
  {
    id: 'gabriel-verissimo',
    name: 'Gabriel Veríssimo',
    role: 'Photographer',
    bio: 'Gabriel is a humble visual storyteller with a calm, observant style. His photography captures authentic beach moments with warmth, detail, and natural light.',
    instagramHandle: 'gabrielverissimo_',
    whatsappPhone: '+55 21 96019-2625',
    whatsappMessage: 'Hi Marty! This lead is for Gabriel Veríssimo. I’d love to discuss a shoot.',
    profileImage: undefined,
    featuredWork: [
      { shortcode: 'DWOf53SjeEi', type: 'reel' },
      { shortcode: 'DWRJU7UDW5v', type: 'reel', orientation: 'landscape' },
      { shortcode: 'DSsX4xlkdK1', type: 'reel' },
      { shortcode: 'C1mOX8Zu5ya', type: 'reel' },
    ],
  },
  {
    id: 'sean',
    name: 'Sean',
    role: 'Videographer',
    bio: 'Sean has a gift for stillness within motion — finding the decisive moment where light, subject, and emotion align perfectly. His videography from the Rio beach scene is striking, intimate, and real.',
    instagramHandle: 'brazil_by_sean',
    instagramUrl: 'https://www.instagram.com/brazil_by_sean?igsh=aHl2OWY2M3dhZGQx',
    whatsappPhone: '+55 21 96765-4022',
    whatsappMessage: 'Hi Sean! I’d love to discuss a content project.',
    profileImage: undefined,
    featuredWork: [
      { shortcode: 'DSsX4xlkdK1', type: 'reel' },
      { shortcode: 'C1mOX8Zu5ya', type: 'reel' },
      { shortcode: 'CopcC4uoJ9v', type: 'reel' },
      { shortcode: 'DTikgNFgIvi', type: 'reel' },
    ],
  },
  {
    id: 'vincent-wilson',
    name: 'Vincent Wilson',
    role: 'Photographer & Videographer',
    bio: 'Vincent captures the raw, sun-soaked energy of Rio\'s beach scene — from lazy afternoons at the barracas to golden-hour sessions on the sand. His lens finds the moments that make the Carioca coast unforgettable.',
    instagramHandle: 'bodybyburgers_photography',
    instagramUrl: 'https://www.instagram.com/bodybyburgers_photography?igsh=MWN5Mzh5bGdnZ2xlbw==',
    whatsappPhone: '+16789826138',
    whatsappMessage: 'Hi Vincent! I’d love to discuss a content project.',
    profileImage: undefined,
    featuredWork: [
      { shortcode: 'DSvfzr1jsvu', type: 'post' },
      { shortcode: 'C_3vEjwJZ1S', type: 'post' },
      { shortcode: 'C-5-0FtsgRI', type: 'post' },
      { shortcode: 'C2THVQApwX8', type: 'post' },
    ],
  },
];
