/**
 * BarracaPromoPage — one generic page that serves every barraca's promo.
 *
 * Active barracas  → full claim flow via BarracaPromotion
 * Inactive barracas → "coming soon" teaser with a follow link
 *
 * Route params: slug comes from :barracaSlug in the router.
 */
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { MessageCircle, Instagram, Clock } from 'lucide-react';
import BarracaPromotion from '../components/BarracaPromotion';
import { getBarracaPromoBySlug } from '../data/barracaPromos';

const BarracaPromoPage: React.FC = () => {
  const { barracaSlug } = useParams<{ barracaSlug: string }>();
  const barraca = barracaSlug ? getBarracaPromoBySlug(barracaSlug) : undefined;

  if (!barraca) return <Navigate to="/" replace />;

  // ------------------------------------------------------------------
  // Coming-soon view
  // ------------------------------------------------------------------
  if (!barraca.active) {
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
  // Active promo view
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
            claim your reusable supporter discount at{' '}
            {barraca.barracaLocation}.
          </p>

          {barraca.whatsappUrl && (
            <a
              href={barraca.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
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
