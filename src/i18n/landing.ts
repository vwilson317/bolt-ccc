// Lightweight i18n setup for the live Alva site (landing page + language
// switcher). Deliberately separate from ./index.ts (the old, much larger
// CCC resource bundles) — the new site only needs a handful of short keys
// per language, not ~50KB of unused legacy translation data per locale.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/landing/en.json';
import pt from './locales/landing/pt.json';
import es from './locales/landing/es.json';
import fr from './locales/landing/fr.json';

export const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      es: { translation: es },
      fr: { translation: fr },
    },
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
