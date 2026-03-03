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

export const BARRACA_PROMOS: BarracaPromoConfig[] = [
  {
    id: 'thais-follow',
    slug: 'thai82',
    name: 'Thais',
    instagramHandle: 'thai.82ipanema',
    instagramUrl: 'https://instagram.com/thai.82ipanema',
    discountCode: 'TY82',
    barracaLocation: 'Ipanema, Rio de Janeiro',
    whatsappUrl: 'https://chat.whatsapp.com/FVLJK8eqKzUKY7oUfnymD5?mode=gi_t',
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
    instagramHandle: 'marcinho33',
    instagramUrl: 'https://instagram.com/marcinho33',
    discountCode: 'MARC33',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'yellow-500',
    badgeToColor: 'amber-600',
    passBackgroundRgb: 'rgb(234,179,8)',
    active: false,
    storageKey: 'ccc_badge_marcinho33-follow',
    identifierStorageKey: 'ccc_identifier_marcinho33-follow',
  },
  {
    id: 'nino101-follow',
    slug: 'nino101',
    name: 'Nino',
    instagramHandle: 'nino101',
    instagramUrl: 'https://instagram.com/nino101',
    discountCode: 'NINO101',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'slate-400',
    badgeToColor: 'slate-600',
    passBackgroundRgb: 'rgb(100,116,139)',
    active: false,
    storageKey: 'ccc_badge_nino101-follow',
    identifierStorageKey: 'ccc_identifier_nino101-follow',
  },
];

export const getBarracaPromoBySlug = (slug: string): BarracaPromoConfig | undefined =>
  BARRACA_PROMOS.find((b) => b.slug === slug);

export const getBarracaPromoById = (id: string): BarracaPromoConfig | undefined =>
  BARRACA_PROMOS.find((b) => b.id === id);
