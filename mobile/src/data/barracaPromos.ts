/**
 * Mirrors src/data/barracaPromos.ts from the web app.
 * Keep in sync when adding new barracas.
 */
export interface BarracaPromoConfig {
  id: string;
  slug: string;
  name: string;
  instagramHandle: string;
  discountCode: string;
  barracaLocation: string;
  badgeFromColor: string;
  badgeToColor: string;
  passBackgroundRgb: string;
  active: boolean;
}

export const BARRACA_PROMOS: BarracaPromoConfig[] = [
  {
    id: 'barraca155-follow',
    slug: 'barraca155',
    name: 'Barraca 100%',
    instagramHandle: 'barraca155',
    discountCode: 'B155',
    barracaLocation: 'Posto 5, Copacabana',
    badgeFromColor: 'orange-500',
    badgeToColor: 'teal-500',
    passBackgroundRgb: 'rgb(249,115,22)',
    active: true,
  },
  {
    id: 'thais-follow',
    slug: 'thai82',
    name: 'Thais',
    instagramHandle: 'thai.82ipanema',
    discountCode: 'TY82',
    barracaLocation: 'Ipanema, Rio de Janeiro',
    badgeFromColor: 'emerald-500',
    badgeToColor: 'teal-500',
    passBackgroundRgb: 'rgb(16,185,129)',
    active: true,
  },
  {
    id: 'marcinho33-follow',
    slug: 'marcinho33',
    name: 'Marcinho',
    instagramHandle: 'barracadomarcinho',
    discountCode: 'MARC33',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'yellow-500',
    badgeToColor: 'amber-600',
    passBackgroundRgb: 'rgb(234,179,8)',
    active: true,
  },
  {
    id: 'miriam53-follow',
    slug: 'miriam53',
    name: 'Miriam 53',
    instagramHandle: 'barraca_rj_53',
    discountCode: 'RJ53',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'zinc-400',
    badgeToColor: 'zinc-600',
    passBackgroundRgb: 'rgb(113,113,122)',
    active: true,
  },
  {
    id: 'nino101-follow',
    slug: 'nino101',
    name: 'Nino',
    instagramHandle: 'nino101',
    discountCode: 'NINO101',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'slate-400',
    badgeToColor: 'slate-600',
    passBackgroundRgb: 'rgb(100,116,139)',
    active: true,
  },
  {
    id: 'escritorio120-follow',
    slug: 'escritorio120',
    name: 'Escritório Carioca',
    instagramHandle: 'escritoriocarioca',
    discountCode: 'EC120',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'blue-500',
    badgeToColor: 'indigo-600',
    passBackgroundRgb: 'rgb(59,130,246)',
    active: true,
  },
  {
    id: 'joseantonio7-follow',
    slug: 'joseantonio7',
    name: 'José Antonio',
    instagramHandle: 'barracadojoseantonio07',
    discountCode: 'JA7',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'orange-500',
    badgeToColor: 'red-600',
    passBackgroundRgb: 'rgb(249,115,22)',
    active: true,
  },
  {
    id: 'jota86x-follow',
    slug: 'jota86x',
    name: "Jota's Tent",
    instagramHandle: 'barracadojota86x',
    discountCode: 'JOTA86',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'purple-500',
    badgeToColor: 'violet-600',
    passBackgroundRgb: 'rgb(168,85,247)',
    active: true,
  },
  {
    id: 'hulk202-follow',
    slug: 'hulk202',
    name: 'Hulk',
    instagramHandle: 'hulkposto13',
    discountCode: 'HULK202',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'green-500',
    badgeToColor: 'lime-500',
    passBackgroundRgb: 'rgb(34,197,94)',
    active: true,
  },
  {
    id: 'ecologica26-follow',
    slug: 'ecologica26',
    name: 'Ecológica 26',
    instagramHandle: 'barracaecologica26',
    discountCode: 'ECO26',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'green-500',
    badgeToColor: 'emerald-700',
    passBackgroundRgb: 'rgb(34,197,94)',
    active: true,
  },
  {
    id: 'negao85-follow',
    slug: 'negao85',
    name: 'Negão & Diogo',
    instagramHandle: 'barracadonegaoo85',
    discountCode: 'NEG85',
    barracaLocation: 'Rio de Janeiro',
    badgeFromColor: 'rose-500',
    badgeToColor: 'pink-600',
    passBackgroundRgb: 'rgb(244,63,94)',
    active: true,
  },
];

export const getPromoBySlug = (slug: string) =>
  BARRACA_PROMOS.find((p) => p.slug === slug);

export const getPromoById = (id: string) =>
  BARRACA_PROMOS.find((p) => p.id === id);
