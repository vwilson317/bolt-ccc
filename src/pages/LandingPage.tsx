import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Sun, Coffee, Armchair } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SiteHeader from '../components/alva/SiteHeader';
import WaveDivider from '../components/alva/WaveDivider';
import { trackCTAClick } from '../services/posthogAnalyticsService';
import { BRAND_NAME, PARENT_BRAND_NAME, WHATSAPP_URL, INSTAGRAM_URL, INSTAGRAM_HANDLE, handleCTAClick } from '../lib/alva';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/landing';

// lucide-react dropped brand/logo icons (Instagram included), so this is a
// small inline replacement instead of pulling in a new icon dependency.
const InstagramGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: SupportedLanguage) => {
    trackCTAClick('language_switch', lang, '/');
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-sand-100 font-sans text-sand-800">
      <SEOHead
        title={`${BRAND_NAME} — Sunrise Beach Recovery, Rio de Janeiro`}
        description="Alva is a morning beach pop-up in Rio de Janeiro — coffee, coconuts, and a free chair on the sand for the sunrise fitness and paddle crowd."
        siteName={BRAND_NAME}
      />

      {/* Hero — full-bleed sunrise gradient */}
      <div className="relative overflow-hidden bg-gradient-to-b from-beach-300 via-sunset-400 to-sunset-200">
        <div
          className="pointer-events-none absolute -right-16 top-8 h-40 w-40 rounded-full bg-sunset-300/70 blur-3xl sm:h-64 sm:w-64"
          aria-hidden="true"
        />

        <SiteHeader variant="minimal" />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-28 pt-8 text-center sm:pb-36">
          <h1 className="font-display text-6xl font-extrabold tracking-tight text-beach-600 drop-shadow-sm sm:text-7xl">
            {BRAND_NAME}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-sand-900 sm:text-xl">{t('tagline')}</p>
          <button
            type="button"
            onClick={() => handleCTAClick('hero_whatsapp', 'Join us on WhatsApp', '/', WHATSAPP_URL)}
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-beach-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-beach-600/30 transition-transform active:scale-95 sm:hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            {t('cta')}
          </button>
        </div>

        <WaveDivider className="absolute -bottom-px left-0 h-16 w-full text-sand-100 sm:h-24" />
      </div>

      <div className="bg-sand-100">
        {/* What it is */}
        <section className="mx-auto max-w-2xl px-6 pt-4 pb-16 text-center sm:pb-20">
          <h2 className="font-display text-2xl font-bold text-sand-900 sm:text-3xl">{t('whatItIs.heading')}</h2>
          <p className="mt-4 text-base leading-relaxed text-sand-600 sm:text-lg">{t('whatItIs.body')}</p>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3">
              <Sun className="h-10 w-10 text-beach-500" strokeWidth={1.5} />
              <p className="text-sm font-medium text-sand-700">{t('whatItIs.chip1')}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Coffee className="h-10 w-10 text-beach-500" strokeWidth={1.5} />
              <p className="text-sm font-medium text-sand-700">{t('whatItIs.chip2')}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Armchair className="h-10 w-10 text-beach-500" strokeWidth={1.5} />
              <p className="text-sm font-medium text-sand-700">{t('whatItIs.chip3')}</p>
            </div>
          </div>
        </section>

        {/* When & where */}
        <section className="px-6 pb-16 sm:pb-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-sand-900 sm:text-3xl">{t('whenWhere.heading')}</h2>
            <div className="mt-6 inline-flex flex-col gap-2 rounded-2xl bg-white px-8 py-6 text-center shadow-md">
              <p className="font-display text-lg font-bold text-sand-900">{t('whenWhere.schedule')}</p>
              <p className="text-sm text-sand-600">
                [TODO: confirm start time] · {t('whenWhere.route')}
              </p>
              <p className="text-xs text-sand-400">[TODO: exact chair location / meeting point]</p>
            </div>
          </div>
        </section>

        {/* Instagram */}
        <section className="mx-auto max-w-2xl px-6 pb-16 text-center sm:pb-20">
          <h2 className="font-display text-2xl font-bold text-sand-900 sm:text-3xl">{t('follow.heading')}</h2>
          <p className="mt-4 text-base text-sand-600">{t('follow.body')}</p>
          <button
            type="button"
            onClick={() => handleCTAClick('instagram_follow', 'Follow on Instagram', '/', INSTAGRAM_URL)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-beach-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-beach-500/30 transition-transform active:scale-95 sm:hover:scale-105"
          >
            <InstagramGlyph className="h-4 w-4" />
            {INSTAGRAM_HANDLE}
          </button>
        </section>

        {/* Footer */}
        <footer className="border-t border-sand-200 px-6 py-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-sand-700">
            <button
              type="button"
              onClick={() => handleCTAClick('footer_whatsapp', 'WhatsApp', '/', WHATSAPP_URL)}
              className="px-2 hover:text-beach-600"
            >
              {t('footer.whatsapp')}
            </button>
            <span className="text-sand-300">·</span>
            <button
              type="button"
              onClick={() => handleCTAClick('footer_instagram', 'Instagram', '/', INSTAGRAM_URL)}
              className="px-2 hover:text-beach-600"
            >
              {t('footer.instagram')}
            </button>
            <span className="text-sand-300">·</span>
            <Link to="/blog" className="px-2 hover:text-beach-600">
              {t('footer.blog')}
            </Link>
            <span className="text-sand-300">·</span>
            <span className="px-2">
              {t('footer.language')}:{' '}
              {SUPPORTED_LANGUAGES.map((lang, i) => (
                <React.Fragment key={lang}>
                  {i > 0 && ' '}
                  <button
                    type="button"
                    onClick={() => changeLanguage(lang)}
                    aria-current={i18n.resolvedLanguage === lang}
                    className={`font-semibold uppercase transition-colors hover:text-beach-600 ${
                      i18n.resolvedLanguage === lang ? 'text-beach-600' : 'text-sand-500'
                    }`}
                  >
                    {lang}
                  </button>
                </React.Fragment>
              ))}
            </span>
          </div>

          <p className="mt-4 text-xs text-sand-400">
            &copy; {new Date().getFullYear()} {BRAND_NAME}. {PARENT_BRAND_NAME}. {t('footer.location')}.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
