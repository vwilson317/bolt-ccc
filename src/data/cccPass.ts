/**
 * Carioca Coastal Club All-Access Pass configuration.
 *
 * This is a premium subscription badge (prototype/test — no real payment
 * processing) that covers all partner barracas. It is rendered separately
 * from the per-barraca promos and always appears first in the badge tray.
 */
import type { BarracaPromoConfig } from './barracaPromos';

export const CCC_PASS_ID = 'ccc-all-access-pass';
export const CCC_PASS_SLUG = 'coastal-club-pass';
export const CCC_PASS_STORAGE_KEY = 'ccc_coastal_club_pass_active';
export const CCC_PASS_IDENTIFIER_KEY = 'ccc_coastal_club_pass_identifier';

/**
 * Virtual BarracaPromoConfig for the CCC All-Access Pass badge.
 * Used in the FAB tray and lightbox alongside individual barraca badges.
 */
export const CCC_PASS_CONFIG: BarracaPromoConfig = {
  id: CCC_PASS_ID,
  slug: CCC_PASS_SLUG,
  name: 'Coastal Club Pass',
  instagramHandle: 'cariocacoastalclub',
  instagramUrl: 'https://instagram.com/cariocacoastalclub',
  discountCode: 'CCC',
  barracaLocation: 'Todas as barracas parceiras · Rio de Janeiro',
  badgeFromColor: 'pink-500',
  badgeToColor: 'rose-600',
  passBackgroundRgb: 'rgb(236,72,153)',
  active: true,
  storageKey: CCC_PASS_STORAGE_KEY,
  identifierStorageKey: CCC_PASS_IDENTIFIER_KEY,
};
