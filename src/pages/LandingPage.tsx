import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Sun, Coffee, Users } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { trackCTAClick } from '../services/posthogAnalyticsService';
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

const BRAND_NAME = 'Alva';

// Reusing the existing Carioca Coastal Club community WhatsApp group as a
// placeholder contact channel until Alva has its own group/number.
const WHATSAPP_URL = 'https://chat.whatsapp.com/FVLJK8eqKzUKY7oUfnymD5?mode=gi_t';
const INSTAGRAM_URL = 'https://www.instagram.com/'; // [TODO: replace with @alva Instagram profile URL]
const INSTAGRAM_HANDLE = '[TODO: @alva.handle]';

/**
 * Instagram's in-app browser blocks window.open() silently (pages fail to
 * load with no error), so any external link must navigate via
 * window.location.href instead. See CLAUDE.md → Instagram WebView Constraints.
 */
const openExternalLink = (url: string): void => {
  const isInstagramBrowser = /Instagram/.test(navigator.userAgent);
  if (isInstagramBrowser) {
    window.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/** Tracks every outbound CTA click in PostHog before navigating. */
const handleCTAClick = (ctaType: string, ctaText: string, url: string): void => {
  trackCTAClick(ctaType, ctaText, '/');
  openExternalLink(url);
};

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lang: SupportedLanguage) => {
    trackCTAClick('language_switch', lang, '/');
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-sand-50 font-sans text-sand-800">
      <SEOHead
        title={`${BRAND_NAME} — Sunrise Beach Recovery, Rio de Janeiro`}
        description="Alva is a morning beach pop-up in Rio de Janeiro — coffee, coconuts, and a free chair on the sand for the sunrise fitness and paddle crowd."
        siteName={BRAND_NAME}
      />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sunset-200 via-beach-100 to-sand-50" />
        <div
          className="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-sunset-300/60 blur-3xl sm:h-96 sm:w-96"
          aria-hidden="true"
        />
        <div
          className="absolute top-10 right-10 h-16 w-16 rounded-full bg-sunset-400 shadow-[0_0_60px_20px_rgba(250,204,21,0.35)] sm:h-24 sm:w-24"
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 pb-24 text-center sm:pt-28 sm:pb-32">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-beach-600">
            <Sun className="h-3.5 w-3.5" />
            {t('badge')}
          </span>
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-sand-900 sm:text-6xl">
            {BRAND_NAME}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-sand-600 sm:text-xl">
            [TODO: one-line tagline — e.g. Sunrise, coffee, and recovery on the sand.]
          </p>
          <button
            type="button"
            onClick={() => handleCTAClick('hero_whatsapp', 'Join us on WhatsApp', WHATSAPP_URL)}
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-beach-500 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-beach-500/30 transition-transform active:scale-95 sm:hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            {t('cta')}
          </button>
        </div>
      </header>

      {/* What it is */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-20">
        <h2 className="font-display text-2xl font-bold text-sand-900 sm:text-3xl">{t('whatItIs.heading')}</h2>
        <p className="mt-4 text-base leading-relaxed text-sand-600 sm:text-lg">{t('whatItIs.body')}</p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-beach-50 text-beach-500">
              <Sun className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-sand-700">{t('whatItIs.chip1')}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-beach-50 text-beach-500">
              <Coffee className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-sand-700">{t('whatItIs.chip2')}</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-beach-50 text-beach-500">
              <Users className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-sand-700">{t('whatItIs.chip3')}</p>
          </div>
        </div>
      </section>

      {/* When & where */}
      <section className="bg-white/60 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-sand-900 sm:text-3xl">{t('whenWhere.heading')}</h2>
          <div className="mt-6 inline-flex flex-col gap-3 rounded-2xl border border-sand-200 bg-white px-8 py-6 text-left shadow-sm">
            <p className="text-base text-sand-700">
              <span className="font-semibold text-sand-900">{t('whenWhere.schedule')}</span>
              <br />
              [TODO: confirm start time] · {t('whenWhere.route')}
            </p>
            <p className="text-sm text-sand-400">[TODO: exact chair location / meeting point]</p>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-20">
        <h2 className="font-display text-2xl font-bold text-sand-900 sm:text-3xl">{t('follow.heading')}</h2>
        <p className="mt-4 text-base text-sand-600">{t('follow.body')}</p>
        <button
          type="button"
          onClick={() => handleCTAClick('instagram_follow', 'Follow on Instagram', INSTAGRAM_URL)}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-beach-500 px-6 py-3 text-sm font-semibold text-beach-600 transition-colors hover:bg-beach-50"
        >
          <InstagramGlyph className="h-4 w-4" />
          {INSTAGRAM_HANDLE}
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-sand-200 px-6 py-10 text-center">
        <p className="font-display text-lg font-bold text-sand-800">{BRAND_NAME}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-sand-500">
          <button
            type="button"
            onClick={() => handleCTAClick('footer_whatsapp', 'WhatsApp', WHATSAPP_URL)}
            className="inline-flex items-center gap-1.5 hover:text-beach-600"
          >
            <MessageCircle className="h-4 w-4" />
            {t('footer.whatsapp')}
          </button>
          <button
            type="button"
            onClick={() => handleCTAClick('footer_instagram', 'Instagram', INSTAGRAM_URL)}
            className="inline-flex items-center gap-1.5 hover:text-beach-600"
          >
            <InstagramGlyph className="h-4 w-4" />
            {t('footer.instagram')}
          </button>
          <Link to="/blog" className="inline-flex items-center gap-1.5 hover:text-beach-600">
            {t('footer.blog')}
          </Link>
        </div>

        {/* Language switcher */}
        <div className="mt-6 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-widest text-sand-400">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => changeLanguage(lang)}
              aria-current={i18n.resolvedLanguage === lang}
              className={`transition-colors hover:text-beach-600 ${
                i18n.resolvedLanguage === lang ? 'text-beach-600' : ''
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-sand-400">
          &copy; {new Date().getFullYear()} {BRAND_NAME}. {t('footer.location')}.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
