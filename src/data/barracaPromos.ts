/**
 * Barraca promo registry — every partner barraca that runs a CCC follower promo.
 * Add new barracas here; the rest of the UI is driven off this config.
 */
export interface BarracaPromoConfig {
  /** Unique ID used as `promo_id` in the DB (must be URL-safe) */
  id: string;
  /** URL slug, e.g. /thai82 */
  slug: string;
  /** Human-readable display name */
  name: string;
  /** Instagram handle without @ */
  instagramHandle: string;
  instagramUrl: string;
  /** Discount code shown on the badge */
  discountCode: string;
  /** Human-readable barraca location */
  barracaLocation: string;
  /** Optional WhatsApp community link shown on the promo page */
  whatsappUrl?: string;
  /** Optional path to a barraca logo/image shown at the top of the promo page (relative to /public) */
  logoPath?: string;
  /** When true the logo fills the full width of its container instead of rendering as a circle */
  logoFull?: boolean;

  // --- Appearance ---
  /** Tailwind `from-*` colour used in badge gradient */
  badgeFromColor: string;
  /** Tailwind `to-*` colour used in badge gradient */
  badgeToColor: string;
  /** CSS rgb() string used in the Apple Wallet PKPass (e.g. 'rgb(16,185,129)') */
  passBackgroundRgb: string;

  // --- Status ---
  /** If false the promo page shows a "coming soon" teaser instead of the full flow */
  active: boolean;

  // --- localStorage keys (kept explicit for backward compatibility) ---
  storageKey: string;
  identifierStorageKey: string;
}

/** Shared CCC community WhatsApp group link used across all promo pages */
export const CCC_WHATSAPP_URL = 'https://chat.whatsapp.com/FVLJK8eqKzUKY7oUfnymD5?mode=gi_t';

export const BARRACA_PROMOS: BarracaPromoConfig[] = [
  {
    id: 'thais-follow',
    slug: 'thai82',
    name: 'Thais',
    instagramHandle: 'thai.82ipanema',
    instagramUrl: 'https://instagram.com/thai.82ipanema',
    discountCode: 'TY82',
    barracaLocation: 'Ipanema, Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    logoPath: '/thai82-logo.png',
    badgeFromColor: 'emerald-500',
    badgeToColor: 'teal-500',
    passBackgroundRgb: 'rgb(16,185,129)',
    active: true,
    storageKey: 'ccc_thais_follow_badge_unlocked',
    identifierStorageKey: 'ccc_thais_follow_identifier',
  },
  {
    id: 'marcinho33-follow',
    slug: 'marcinho33',
    name: 'Marcinho',
    instagramHandle: 'barracadomarcinho',
    instagramUrl: 'https://www.instagram.com/barracadomarcinho?igsh=MWJ2dTV5dWs4eTBjYg==',
    discountCode: 'MARC33',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    logoPath: '/marcinho33-logo.png',
    badgeFromColor: 'yellow-500',
    badgeToColor: 'amber-600',
    passBackgroundRgb: 'rgb(234,179,8)',
    active: true,
    storageKey: 'ccc_badge_marcinho33-follow',
    identifierStorageKey: 'ccc_identifier_marcinho33-follow',
  },
  {
    id: 'miriam53-follow',
    slug: 'miriam53',
    name: 'Miriam 53',
    instagramHandle: 'barraca_rj_53',
    instagramUrl: 'https://www.instagram.com/barraca_rj_53?igsh=NXp6dzU3OHk5bWls',
    discountCode: 'RJ53',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    logoPath: '/miriam53-logo.png',
    badgeFromColor: 'zinc-400',
    badgeToColor: 'zinc-600',
    passBackgroundRgb: 'rgb(113,113,122)',
    active: true,
    storageKey: 'ccc_badge_miriam53-follow',
    identifierStorageKey: 'ccc_identifier_miriam53-follow',
  },
  {
    id: 'nino101-follow',
    slug: 'nino101',
    name: 'Nino',
    instagramHandle: 'nino101',
    instagramUrl: 'https://instagram.com/nino101',
    discountCode: 'NINO101',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    badgeFromColor: 'slate-400',
    badgeToColor: 'slate-600',
    passBackgroundRgb: 'rgb(100,116,139)',
    active: true,
    storageKey: 'ccc_badge_nino101-follow',
    identifierStorageKey: 'ccc_identifier_nino101-follow',
  },
  {
    id: 'escritorio120-follow',
    slug: 'escritorio120',
    name: 'Escritório Carioca',
    instagramHandle: 'escritoriocarioca',
    instagramUrl: 'https://instagram.com/escritoriocarioca',
    discountCode: 'EC120',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    logoPath: '/escritorio120-logo.png',
    badgeFromColor: 'blue-500',
    badgeToColor: 'indigo-600',
    passBackgroundRgb: 'rgb(59,130,246)',
    active: true,
    storageKey: 'ccc_badge_escritorio120-follow',
    identifierStorageKey: 'ccc_identifier_escritorio120-follow',
  },
  {
    id: 'joseantonio7-follow',
    slug: 'joseantonio7',
    name: 'José Antonio',
    instagramHandle: 'barracadojoseantonio07',
    instagramUrl: 'https://instagram.com/barracadojoseantonio07',
    discountCode: 'JA7',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    logoPath: '/joseantonio7-logo.PNG',
    badgeFromColor: 'orange-500',
    badgeToColor: 'red-600',
    passBackgroundRgb: 'rgb(249,115,22)',
    active: true,
    storageKey: 'ccc_badge_joseantonio7-follow',
    identifierStorageKey: 'ccc_identifier_joseantonio7-follow',
  },
  {
    id: 'jota86x-follow',
    slug: 'jota86x',
    name: "Jota's Tent",
    instagramHandle: 'barracadojota86x',
    instagramUrl: 'https://www.instagram.com/barracadojota86x?igsh=bTQyaDd0ejBvdGU=',
    discountCode: 'JOTA86',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    logoPath: '/jota86x-logo.PNG',
    badgeFromColor: 'purple-500',
    badgeToColor: 'violet-600',
    passBackgroundRgb: 'rgb(168,85,247)',
    active: true,
    storageKey: 'ccc_badge_jota86x-follow',
    identifierStorageKey: 'ccc_identifier_jota86x-follow',
  },
  {
    id: 'hulk202-follow',
    slug: 'hulk202',
    name: 'Hulk',
    instagramHandle: 'hulkposto13',
    instagramUrl: 'https://instagram.com/hulkposto13',
    discountCode: 'HULK202',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    badgeFromColor: 'green-500',
    badgeToColor: 'lime-500',
    passBackgroundRgb: 'rgb(34,197,94)',
    active: true,
    storageKey: 'ccc_badge_hulk202-follow',
    identifierStorageKey: 'ccc_identifier_hulk202-follow',
  },
  {
    id: 'ecologica26-follow',
    slug: 'ecologica26',
    name: 'Ecológica 26',
    instagramHandle: 'barracaecologica26',
    instagramUrl: 'https://www.instagram.com/barracaecologica26',
    discountCode: 'ECO26',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    logoPath: '/ecologica26-logo.png',
    badgeFromColor: 'green-500',
    badgeToColor: 'emerald-700',
    passBackgroundRgb: 'rgb(34,197,94)',
    active: true,
    storageKey: 'ccc_badge_ecologica26-follow',
    identifierStorageKey: 'ccc_identifier_ecologica26-follow',
  },
  {
    id: 'negao85-follow',
    slug: 'negao85',
    name: 'Negão & Diogo',
    instagramHandle: 'barracadonegaoo85',
    instagramUrl: 'https://instagram.com/barracadonegaoo85',
    discountCode: 'NEG85',
    barracaLocation: 'Rio de Janeiro',
    whatsappUrl: CCC_WHATSAPP_URL,
    logoPath: '/negao85-logo.png',
    badgeFromColor: 'rose-500',
    badgeToColor: 'pink-600',
    passBackgroundRgb: 'rgb(244,63,94)',
    active: true,
    storageKey: 'ccc_badge_negao85-follow',
    identifierStorageKey: 'ccc_identifier_negao85-follow',
  },
];

export const getBarracaPromoBySlug = (slug: string): BarracaPromoConfig | undefined =>
  BARRACA_PROMOS.find((b) => b.slug === slug);

export const getBarracaPromoById = (id: string): BarracaPromoConfig | undefined =>
  BARRACA_PROMOS.find((b) => b.id === id);
