/**
 * BarracaPromoPage — one generic page that serves every barraca's promo.
 *
 * Active status hierarchy (highest priority first):
 *   1. Supabase `barraca_promos` table  ← admin can toggle without a redeploy
 *   2. Static `active` field in barracaPromos.ts  ← fallback default
 *
 * States:
 *   loading          → brief skeleton while Supabase is checked
 *   active = true    → full BarracaPromotion claim flow
 *   active = false   → coming-soon / paused teaser (same UI; admin controls which)
 */
import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Instagram, Clock } from 'lucide-react';
import BarracaPromotion from '../components/BarracaPromotion';
import SEOHead from '../components/SEOHead';
import { getBarracaPromoBySlug } from '../data/barracaPromos';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../services/posthogAnalyticsService';

const BarracaPromoPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const barraca = slug ? getBarracaPromoBySlug(slug) : undefined;
  const location = useLocation();
  const { t } = useTranslation();

  // null = still loading from DB, boolean = resolved
  const [isActive, setIsActive] = useState<boolean | null>(null);

  // Fire page-viewed immediately on mount so bounces are never missed,
  // and page-left on unmount with time spent. Runs once per barraca slug.
  useEffect(() => {
    if (!barraca) return;
    const enteredAt = Date.now();

    trackEvent(`${barraca.id}_promo_page_viewed`, {
      promo_id: barraca.id,
      promo_name: barraca.name,
      promo_slug: barraca.slug,
      instagram_handle: barraca.instagramHandle,
      page_path: location.pathname,
      referrer: typeof document !== 'undefined' ? (document.referrer || null) : null,
    });

    return () => {
      trackEvent(`${barraca.id}_promo_page_left`, {
        promo_id: barraca.id,
        promo_name: barraca.name,
        promo_slug: barraca.slug,
        page_path: location.pathname,
        time_on_page_ms: Date.now() - enteredAt,
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barraca?.id]);

  // Resolve active status from DB; fires a separate event once the result is known.
  useEffect(() => {
    if (!barraca) return;

    supabase
      .from('barraca_promos')
      .select('active')
      .eq('id', barraca.id)
      .maybeSingle()
      .then(({ data }) => {
        // DB row wins; fall back to static config when no row exists yet
        const active = data ? (data as { active: boolean }).active : barraca.active;
        setIsActive(active);
        trackEvent(`${barraca.id}_promo_active_status_resolved`, {
          promo_id: barraca.id,
          promo_name: barraca.name,
          instagram_handle: barraca.instagramHandle,
          is_active: active,
          source: 'db',
          page_path: location.pathname,
        });
      })
      .catch(() => {
        // Network / Supabase error → fall back to static config
        setIsActive(barraca.active);
        trackEvent(`${barraca.id}_promo_active_status_resolved`, {
          promo_id: barraca.id,
          promo_name: barraca.name,
          instagram_handle: barraca.instagramHandle,
          is_active: barraca.active,
          source: 'fallback',
          page_path: location.pathname,
        });
      });
  }, [barraca]);

  if (!barraca) return <Navigate to="/" replace />;

  const pageTitle = `${barraca.name} — Carioca Coastal Club`;
  const pageDescription = `Follow @${barraca.instagramHandle} on Instagram and get your exclusive discount badge at ${barraca.barracaLocation}.`;
  const pageImage = barraca.logoPath ?? '/logo_320x320.png';
  const pageUrl = `https://cariocacoastalclub.com/loyalty/${barraca.slug}`;

  // ------------------------------------------------------------------
  // Loading state — avoid flash of wrong content
  // ------------------------------------------------------------------
  if (isActive === null) {
    return (
      <>
        <SEOHead title={pageTitle} description={pageDescription} image={pageImage} url={pageUrl} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-28 pb-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin" />
            <p className="text-sm">{t('barracaPromoPage.loading')}</p>
          </div>
        </div>
      </>
    );
  }

  // ------------------------------------------------------------------
  // Not active — coming-soon / paused
  // ------------------------------------------------------------------
  if (!isActive) {
    return (
      <>
        <SEOHead title={pageTitle} description={pageDescription} image={pageImage} url={pageUrl} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-28 pb-16">
        <div className="mx-auto max-w-md px-4 text-center">
          {barraca.logoPath ? (
            <img
              src={barraca.logoPath}
              alt={`${barraca.name} logo`}
              className="mx-auto mb-6 h-32 w-32 object-contain"
            />
          ) : (
            <div
              className={`mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-${barraca.badgeFromColor} to-${barraca.badgeToColor} flex items-center justify-center shadow-xl`}
            >
              <Clock className="h-12 w-12 text-white" />
            </div>
          )}

          <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700 mb-4">
            {t('barracaPromoPage.comingSoon')}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t('barracaPromoPage.comingSoonTitle', { name: barraca.name })}
          </h1>

          <p className="text-gray-600 mb-8">
            {t('barracaPromoPage.comingSoonDescription', { instagramHandle: barraca.instagramHandle })}
          </p>

          <a
            href={barraca.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent(`${barraca.id}_promo_instagram_clicked`, {
                promo_id: barraca.id,
                instagram_handle: barraca.instagramHandle,
                context: 'coming_soon',
                page_path: location.pathname,
              })
            }
            className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-${barraca.badgeFromColor} to-${barraca.badgeToColor} px-6 py-3 font-semibold text-white shadow-md hover:opacity-90 transition-opacity`}
          >
            <Instagram className="h-5 w-5" strokeWidth={1.5} />
            {t('barracaPromoPage.comingSoonFollowButton', { instagramHandle: barraca.instagramHandle })}
          </a>

          {barraca.whatsappUrl && (
            <div className="mt-4">
              <a
                href={barraca.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent(`${barraca.id}_promo_whatsapp_clicked`, {
                    promo_id: barraca.id,
                    page_path: location.pathname,
                    full_path: `${location.pathname}${location.search}`,
                  })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 font-semibold text-white hover:bg-green-600 transition-colors shadow-md"
              >
                <MessageCircle className="h-5 w-5" />
                {t('barracaPromoPage.comingSoonWhatsappCta')}
              </a>
            </div>
          )}

          <p className="mt-6 text-sm text-gray-400">
            {t('barracaPromoPage.comingSoonNote')}
          </p>
        </div>
      </div>
      </>
    );
  }

  // ------------------------------------------------------------------
  // Active promo
  // ------------------------------------------------------------------
  return (
    <>
      <SEOHead title={pageTitle} description={pageDescription} image={pageImage} url={pageUrl} />
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white pt-28 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          {barraca.logoPath ? (
            barraca.logoFull ? (
              <img
                src={barraca.logoPath}
                alt={`${barraca.name} logo`}
                className="mb-5 w-full rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <img
                src={barraca.logoPath}
                alt={`${barraca.name} logo`}
                className="mx-auto mb-5 h-36 w-36 object-contain"
              />
            )
          ) : (
            <div
              className={`mx-auto mb-5 h-28 w-28 rounded-full bg-gradient-to-br from-${barraca.badgeFromColor} to-${barraca.badgeToColor} shadow-lg`}
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t('barracaPromoPage.title', { name: barraca.name })}
          </h1>
          <p className="text-gray-600 mb-5">
            {t('barracaPromoPage.intro', { instagramHandle: barraca.instagramHandle, location: barraca.barracaLocation })}
          </p>

          {barraca.whatsappUrl && (
            <a
              href={barraca.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent(`${barraca.id}_promo_whatsapp_clicked`, {
                  promo_id: barraca.id,
                  page_path: location.pathname,
                  full_path: `${location.pathname}${location.search}`,
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600 transition-colors shadow-md"
            >
              <MessageCircle className="h-5 w-5" />
              {t('barracaPromoPage.whatsappCta')}
            </a>
          )}
        </div>

        <BarracaPromotion barraca={barraca} promoSource={`${barraca.slug}_promo_page`} />
      </div>
    </div>
    </>
  );
};

export default BarracaPromoPage;
