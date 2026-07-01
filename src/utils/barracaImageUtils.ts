import type { Barraca } from '../types';
import { BARRACA_PROMOS } from '../data/barracaPromos';

const normalize = (value?: string): string =>
  (value || '').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9]/g, '');

const findPromoLogo = (barraca: Barraca): string | undefined => {
  const byInstagram = normalize(barraca.contact?.instagram);
  const byName = normalize(barraca.name);
  const byNumber = normalize(barraca.barracaNumber);

  return BARRACA_PROMOS.find((promo) => {
    const promoHandle = normalize(promo.instagramHandle);
    const promoName = normalize(promo.name);
    const promoSlug = normalize(promo.slug);

    return (
      (byInstagram && byInstagram === promoHandle) ||
      (byName && (byName.includes(promoName) || promoName.includes(byName))) ||
      (byNumber && promoSlug.includes(byNumber))
    );
  })?.logoPath;
};

export const getBarracaPrimaryImage = (barraca: Barraca): string => {
  const firstPhoto = barraca.photos.horizontal[0] || barraca.photos.vertical[0];
  if (firstPhoto) return firstPhoto;

  const promoLogo = findPromoLogo(barraca);
  if (promoLogo) return promoLogo;

  return '/under-construction.png';
};
