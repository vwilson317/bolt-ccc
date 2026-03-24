export interface InstagramReel {
  /** The shortcode from the Instagram reel URL, e.g. https://www.instagram.com/reel/ABC123/ → "ABC123" */
  shortcode: string;
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
  /** 2–3 featured Instagram Reels to embed on the page */
  featuredReels: InstagramReel[];
}

/**
 * Photographer & videographer profiles for the /videography showcase page.
 *
 * To update a reel: grab the shortcode from the Instagram reel URL.
 *   Example URL: https://www.instagram.com/reel/DGzAbCdEfGh/
 *   Shortcode:   DGzAbCdEfGh
 *
 * To update an Instagram handle: change `instagramHandle` (without the @).
 * To add a profile photo: set `profileImage` to a Cloudflare R2 URL or `/public` path.
 */
export const photographers: Photographer[] = [
  {
    id: 'vincent-wilson',
    name: 'Vincent Wilson',
    role: 'Photographer & Videographer',
    bio: 'Vincent captures the raw, sun-soaked energy of Rio\'s beach scene — from lazy afternoons at the barracas to golden-hour sessions on the sand. His lens finds the moments that make the Carioca coast unforgettable.',
    instagramHandle: 'vincentwilsonvisuals', // ← update with real handle
    profileImage: undefined, // ← add a Cloudflare R2 URL or /public path
    featuredReels: [
      { shortcode: 'REEL_SHORTCODE_1', caption: 'Beach vibes' },   // ← replace with real shortcode
      { shortcode: 'REEL_SHORTCODE_2', caption: 'Sunset session' }, // ← replace with real shortcode
      { shortcode: 'REEL_SHORTCODE_3', caption: 'Ocean views' },    // ← replace with real shortcode
    ],
  },
  {
    id: 'marty',
    name: 'Marty',
    role: 'Videographer',
    bio: 'Marty\'s work is all about movement and mood. His videos bring the rhythm of Rio to life — the waves, the crowd, the music, the heat. Every frame tells a story you can almost feel.',
    instagramHandle: 'marty', // ← update with real handle
    profileImage: undefined,
    featuredReels: [
      { shortcode: 'REEL_SHORTCODE_4', caption: 'Rio rhythm' },
      { shortcode: 'REEL_SHORTCODE_5', caption: 'Wave series' },
      { shortcode: 'REEL_SHORTCODE_6', caption: 'Night vibes' },
    ],
  },
  {
    id: 'sean',
    name: 'Sean',
    role: 'Photographer',
    bio: 'Sean has a gift for stillness within motion — finding the decisive moment where light, subject, and emotion align perfectly. His photography from the Rio beach scene is striking, intimate, and real.',
    instagramHandle: 'sean', // ← update with real handle
    profileImage: undefined,
    featuredReels: [
      { shortcode: 'REEL_SHORTCODE_7', caption: 'Golden hour' },
      { shortcode: 'REEL_SHORTCODE_8', caption: 'Beach portraits' },
      { shortcode: 'REEL_SHORTCODE_9', caption: 'Coastline' },
    ],
  },
];
