import React, { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import { trackEvent } from '../services/posthogAnalyticsService';

const LANGUAGE_EXCHANGE_WHATSAPP_URL =
  'https://chat.whatsapp.com/IbCoAHeqcQiFpT2rYgA88g?mode=gi_t';

const getQueryParam = (param: string): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  const value = new URLSearchParams(window.location.search).get(param);
  return value || undefined;
};

const LanguageExchangeFunnel: React.FC = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    trackEvent('language_exchange_funnel_viewed', {
      page: 'language_exchange_funnel',
      category: 'Language Exchange',
      source: 'instagram',
      locale: i18n.language,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '/language-exchange',
      page_search: typeof window !== 'undefined' ? window.location.search : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      utm_source: getQueryParam('utm_source'),
      utm_medium: getQueryParam('utm_medium'),
      utm_campaign: getQueryParam('utm_campaign'),
    });
  }, [i18n.language]);

  const handleJoinClick = () => {
    trackEvent('language_exchange_whatsapp_clicked', {
      page: 'language_exchange_funnel',
      category: 'Language Exchange',
      source: 'instagram',
      locale: i18n.language,
      target_url: LANGUAGE_EXCHANGE_WHATSAPP_URL,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '/language-exchange',
      utm_source: getQueryParam('utm_source'),
      utm_medium: getQueryParam('utm_medium'),
      utm_campaign: getQueryParam('utm_campaign'),
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <SEOHead
        title={t('languageExchangeFunnel.seo.title')}
        description={t('languageExchangeFunnel.seo.description')}
        image="https://cariocacoastalclub.com/group-v-1-logo.jpg"
        url="https://cariocacoastalclub.com/lg-ex"
        type="website"
        siteName="Carioca Coastal Club"
        locale="en_US"
        twitterCard="summary_large_image"
      />

      <main className="min-h-screen flex items-center justify-center px-6">
        <section className="w-full max-w-sm text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-beach-600">
            {t('languageExchangeFunnel.eyebrow')}
          </p>
          <h1 className="text-3xl font-bold leading-tight">{t('languageExchangeFunnel.title')}</h1>
          <p className="text-base text-gray-600 leading-relaxed">{t('languageExchangeFunnel.description')}</p>

          <a
            href={LANGUAGE_EXCHANGE_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoinClick}
            className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            {t('languageExchangeFunnel.cta')}
          </a>
        </section>
      </main>
    </div>
  );
};

export default LanguageExchangeFunnel;
