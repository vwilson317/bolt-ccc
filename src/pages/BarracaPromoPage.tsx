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
import { MessageCircle, Instagram, Clock } from 'lucide-react';
import BarracaPromotion from '../components/BarracaPromotion';
import { getBarracaPromoBySlug } from '../data/barracaPromos';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../services/posthogAnalyticsService';

const BarracaPromoPage: React.FC = () => {
  const { barracaSlug } = useParams<{ barracaSlug: string }>();
  const barraca = barracaSlug ? getBarracaPromoBySlug(barracaSlug) : undefined;
  const location = useLocation();

  // null = still loading from DB, boolean = resolved
  const [isActive, setIsActive] = useState<boolean | null>(null);

  useEffect(() => {
    if (!barraca) return;

    supabase
      .from('barraca_promos')
      .select('active')
      .eq('id', barraca.id)
      .maybeSingle()
      .then(({ data }) => {
        // DB row wins; fall back to static config when no row exists yet
        setIsActive(data ? (data as { active: boolean }).active : barraca.active);
      })
      .catch(() => {
        // Network / Supabase error → fall back to static config
        setIsActive(barraca.active);
      });
  }, [barraca]);

  if (!barraca) return <Navigate to="/" replace />;

  // ------------------------------------------------------------------
  // Loading state — avoid flash of wrong content
  // ------------------------------------------------------------------
  if (isActive === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-28 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin" />
          <p className="text-sm">Loading promo…</p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Not active — coming-soon / paused
  // ------------------------------------------------------------------
  if (!isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-28 pb-16">
        <div className="mx-auto max-w-md px-4 text-center">
          <div
            className={`mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-${barraca.badgeFromColor} to-${barraca.badgeToColor} flex items-center justify-center shadow-xl`}
          >
            <Clock className="h-12 w-12 text-white" />
          </div>

          <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-700 mb-4">
            Coming Soon
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {barraca.name}'s Barraca Pass
          </h1>

          <p className="text-gray-600 mb-8">
            We're teaming up with{' '}
            <span className="font-semibold">@{barraca.instagramHandle}</span> on an
            exclusive follower discount for Carioca Coastal Club members. Follow them
            now so you're ready when the promo launches.
          </p>

          <a
            href={barraca.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-${barraca.badgeFromColor} to-${barraca.badgeToColor} px-6 py-3 font-semibold text-white shadow-md hover:opacity-90 transition-opacity`}
          >
            <Instagram className="h-5 w-5" strokeWidth={1.5} />
            Follow @{barraca.instagramHandle}
          </a>

          <p className="mt-6 text-sm text-gray-400">
            Discount code will be revealed at launch. Stay tuned!
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Active promo
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white pt-28 pb-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {barraca.name}'s Barraca Promo
          </h1>
          <p className="text-gray-600 mb-5">
            Follow{' '}
            <span className="font-semibold">@{barraca.instagramHandle}</span> and
            claim your reusable supporter discount at {barraca.barracaLocation}.
          </p>

          {barraca.whatsappUrl && (
            <a
              href={barraca.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent('barraca_promo_whatsapp_clicked', {
                  promo_id: barraca.id,
                  page_path: location.pathname,
                  full_path: `${location.pathname}${location.search}`,
                })
              }
              className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-semibold text-white hover:bg-green-600 transition-colors shadow-md"
            >
              <MessageCircle className="h-5 w-5" />
              Join the WhatsApp community
            </a>
          )}
        </div>

        <BarracaPromotion barraca={barraca} promoSource={`${barraca.slug}_promo_page`} />
      </div>
    </div>
  );
};

export default BarracaPromoPage;
