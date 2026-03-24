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
  /** Optional URL to a profile/headshot image */
  profileImage?: string;
  featuredWork: InstagramEmbed[];
}

/**
 * Photographer & videographer profiles for the /videography showcase page.
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
    id: 'vincent-wilson',
    name: 'Vincent Wilson',
    role: 'Photographer & Videographer',
    bio: 'Vincent captures the raw, sun-soaked energy of Rio\'s beach scene — from lazy afternoons at the barracas to golden-hour sessions on the sand. His lens finds the moments that make the Carioca coast unforgettable.',
    instagramHandle: 'vincentwilsonvisuals', // ← update with real handle
    profileImage: undefined,
    featuredWork: [
      { shortcode: 'DSvfzr1jsvu', type: 'post' },
      { shortcode: 'C_3vEjwJZ1S', type: 'post' },
      { shortcode: 'C-5-0FtsgRI', type: 'post' },
      { shortcode: 'C2THVQApwX8', type: 'post' },
    ],
  },
  {
    id: 'marty',
    name: 'Marty',
    role: 'Videographer',
    bio: 'Marty\'s work is all about movement and mood. His videos bring the rhythm of Rio to life — the waves, the crowd, the music, the heat. Every frame tells a story you can almost feel.',
    instagramHandle: 'marty', // ← update with real handle
    profileImage: undefined,
    featuredWork: [
      { shortcode: 'DWOf53SjeEi', type: 'reel' },
      { shortcode: 'DWRJU7UDW5v', type: 'reel', orientation: 'landscape' },
      { shortcode: 'DWGwCv-BtlZ', type: 'reel', orientation: 'landscape' },
      { shortcode: 'DVlRu0jjarF', type: 'reel' },
    ],
  },
  {
    id: 'sean',
    name: 'Sean',
    role: 'Videographer',
    bio: 'Sean has a gift for stillness within motion — finding the decisive moment where light, subject, and emotion align perfectly. His videography from the Rio beach scene is striking, intimate, and real.',
    instagramHandle: 'sean', // ← update with real handle
    profileImage: undefined,
    featuredWork: [
      { shortcode: 'DSsX4xlkdK1', type: 'reel' },
      { shortcode: 'C1mOX8Zu5ya', type: 'reel' },
      { shortcode: 'CopcC4uoJ9v', type: 'reel' },
      { shortcode: 'DTikgNFgIvi', type: 'reel' },
    ],
  },
];
