// Legacy CCC i18n bootstrap — not imported by the live app anymore (see
// ./landing.ts for the lightweight setup the current site uses). Kept as-is,
// unimported, for the archived Carioca Coastal Club pages in
// src/_deprecated, which still call useTranslation() against these keys and
// would need this re-wired if ever reinstated.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ja from './locales/ja.json';

const resources = {
  en: { translation: en },
  pt: { translation: pt },
  es: { translation: es },
  fr: { translation: fr },
  ja: { translation: ja },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;