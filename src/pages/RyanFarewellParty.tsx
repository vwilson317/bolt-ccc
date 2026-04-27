import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Clock, Ticket, Waves, Music, Copy, CheckCircle2, MessageCircle, ExternalLink, Instagram, Tag, User, Phone, CreditCard, AlertCircle, ChevronRight, Loader2, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { trackEvent, trackPageView, trackCTAClick } from '../services/posthogAnalyticsService';
import SEOHead from '../components/SEOHead';

// ── Sakura petals (subtle on white) ───────────────────────────────
const PETALS = [
  { left: '5%',  dur: '7s',  delay: '0s',   size: 16, opacity: 0.35 },
  { left: '14%', dur: '9s',  delay: '1.5s', size: 12, opacity: 0.25 },
  { left: '23%', dur: '6s',  delay: '3s',   size: 18, opacity: 0.3  },
  { left: '33%', dur: '8s',  delay: '0.8s', size: 14, opacity: 0.28 },
  { left: '44%', dur: '7.5s',delay: '4.2s', size: 16, opacity: 0.3  },
  { left: '55%', dur: '9.5s',delay: '2.1s', size: 11, opacity: 0.22 },
  { left: '64%', dur: '6.5s',delay: '5s',   size: 15, opacity: 0.3  },
  { left: '73%', dur: '8.5s',delay: '1.1s', size: 20, opacity: 0.32 },
  { left: '82%', dur: '7s',  delay: '3.6s', size: 13, opacity: 0.25 },
  { left: '91%', dur: '9s',  delay: '0.4s', size: 16, opacity: 0.28 },
];

const PIX_KEY     = '155.438.587-36';
const PIX_DISPLAY = '155.438.587-36';
const PIX_NAME    = 'Ryan Ferrari de Castro Pires';
const WA_NUMBER   = '5521990532728';

// ── Tier config ────────────────────────────────────────────────────
type Tier = 'general' | 'guest' | 'vip';
interface TierInfo {
  tier: Tier;
  priceBrl: number;    // centavos
  label: string;
  badge: string;
  promoterName?: string;
  promoterId?: string;
  promoType?: 'promoter' | 'guest' | 'vip';
}
const DEFAULT_TIER: TierInfo = { tier: 'general', priceBrl: 10000, label: 'General Public', badge: 'R$100' };

type CheckoutStep = 'form' | 'payment' | 'confirming' | 'success';

export default function RyanFarewellParty() {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [pixCopied, setPixCopied] = useState(false);

  // Checkout state
  const [step, setStep]           = useState<CheckoutStep>('form');
  const [payTab, setPayTab]       = useState<'pix' | 'card'>('pix');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Attendee form
  const params   = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const urlPromo = params.get('promo') || '';
  const [fullName,  setFullName]   = useState('');
  const [whatsapp,  setWhatsapp]   = useState(''); // accepts CPF / phone / email
  const [quantity,  setQuantity]   = useState(1);
  const [promoCode, setPromoCode]  = useState(urlPromo.toUpperCase());
  const [tierInfo,  setTierInfo]   = useState<TierInfo>(DEFAULT_TIER);
  const [promoMsg,  setPromoMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const sessionSuccess = params.get('success') === 'true';
  const sessionId      = params.get('session_id') || '';
  const cancelled      = params.get('cancelled') === 'true';

  // Countdown to May 3 2026 2PM BRT
  useEffect(() => {
    const target = new Date('2026-05-03T14:00:00-03:00').getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // PostHog page view
  useEffect(() => {
    trackPageView('/ryans-farewell-party', "Ryan's Farewell Party");
    trackEvent('event_landing_page_viewed', { event_name: 'ryans_going_away_party', event_date: '2026-05-03', category: 'Event' });
  }, []);

  // Handle Stripe return: record ticket then show success
  useEffect(() => {
    if (!sessionSuccess || !sessionId) return;
    trackEvent('ticket_purchase_success', { event_name: 'ryans_going_away_party', category: 'Event' });
    setLoading(true);
    fetch('/.netlify/functions/record-event-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: 'stripe', sessionId }),
    })
      .then(r => r.json())
      .then(() => { setStep('success'); setLoading(false); })
      .catch(() => { setStep('success'); setLoading(false); });
  }, [sessionSuccess, sessionId]);

  // Pre-fill promo code from URL and auto-validate
  useEffect(() => {
    if (urlPromo) validatePromoCode(urlPromo.toUpperCase());
  }, []);

  const openLink = (url: string) => {
    const isIG = /Instagram/.test(navigator.userAgent);
    if (isIG) window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Validate promo code against API
  const validatePromoCode = async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setTierInfo(DEFAULT_TIER); setPromoMsg(null); return; }
    setValidatingPromo(true);
    try {
      const res  = await fetch('/.netlify/functions/validate-event-promo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (data.valid) {
        setTierInfo({
          tier:        data.tier,
          priceBrl:    data.priceBrl,
          label:       data.type === 'promoter' ? 'General Public' : data.type === 'guest' ? "Ryan's Guest" : "Ryan's VIP",
          badge:       data.priceBrl === 0 ? 'FREE' : `R$${data.priceBrl / 100}`,
          promoterName: data.promoterName,
          promoterId:  data.promoterId,
          promoType:   data.type,
        });
        setPromoMsg({ ok: true, text: data.message || 'Code applied!' });
      } else {
        setTierInfo(DEFAULT_TIER);
        setPromoMsg({ ok: false, text: data.error || 'Invalid code' });
      }
    } catch {
      setTierInfo(DEFAULT_TIER);
      setPromoMsg({ ok: false, text: 'Could not validate code — try again.' });
    } finally {
      setValidatingPromo(false);
    }
  };

  const handlePromoBlur = () => { if (promoCode.trim()) validatePromoCode(promoCode); };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    });
    trackEvent('pix_key_copied', { event_name: 'ryans_going_away_party', category: 'Event' });
  };

  const handleWhatsAppReceipt = () => {
    trackEvent('whatsapp_receipt_clicked', { event_name: 'ryans_going_away_party', category: 'Event' });
    const priceFmt = tierInfo.priceBrl === 0 ? 'R$0 (VIP)' : `R$${tierInfo.priceBrl / 100}`;
    const msg = encodeURIComponent(`Oi! Acabei de pagar ${priceFmt} via PIX para o Going Away Party do Ryan (3 de maio).\nNome: ${fullName}\nSegue o comprovante 👇`);
    openLink(`https://wa.me/${WA_NUMBER}?text=${msg}`);
  };

  // Validate form fields
  const formValid = fullName.trim().length >= 2 && whatsapp.trim().length >= 8;

  const handleContinueToPayment = () => {
    if (!formValid) return;
    // VIP tier → no payment needed
    if (tierInfo.tier === 'vip') {
      handleFreeTicket();
      return;
    }
    setStep('payment');
    setTimeout(() => document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleFreeTicket = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch('/.netlify/functions/record-event-ticket', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'free',
          fullName, whatsapp,
          tier: tierInfo.tier, priceBrl: 0, quantity,
          promoCode: promoCode.trim().toUpperCase() || null,
          promoterId: tierInfo.promoterId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not register ticket');
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handlePixSubmitted = async () => {
    if (!formValid) return;
    setLoading(true); setError(null);
    try {
      const res  = await fetch('/.netlify/functions/record-event-ticket', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'pix',
          fullName, whatsapp,
          tier: tierInfo.tier, priceBrl: tierInfo.priceBrl, quantity,
          promoCode: promoCode.trim().toUpperCase() || null,
          promoterId: tierInfo.promoterId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not record ticket');
      setStep('success');
      trackEvent('ticket_pix_submitted', { event_name: 'ryans_going_away_party', tier: tierInfo.tier, category: 'Event' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const handleStripeCheckout = async () => {
    setLoading(true); setError(null);
    trackCTAClick('ticket_purchase', 'Pay by Card', '/ryans-farewell-party');
    try {
      const res  = await fetch('/.netlify/functions/create-stripe-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName, whatsapp,
          tier: tierInfo.tier, priceBrl: tierInfo.priceBrl, quantity,
          promoCode: promoCode.trim().toUpperCase() || '',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout');
      trackEvent('ticket_purchase_started', { event_name: 'ryans_going_away_party', tier: tierInfo.tier, category: 'Event' });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const totalPriceBrl = (tierInfo.priceBrl * quantity) / 100;
  const isFree        = tierInfo.priceBrl === 0;

  return (
    <>
      <SEOHead
        title={t('ryanParty.seoTitle')}
        description={t('ryanParty.seoDescription')}
      />

      {/* Subtle sakura petals */}
      {PETALS.map((p, i) => (
        <div key={i} className="sakura-petal" style={{ left: p.left, fontSize: `${p.size}px`, opacity: p.opacity, animationDuration: p.dur, animationDelay: p.delay }}>
          🌸
        </div>
      ))}

      <div className="min-h-screen bg-white text-gray-900 pt-16">

        {/* ══════════════ HERO ════════════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
          {/* Desktop: pink gradient background */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-pink-400 via-rose-400 to-pink-600" />
          {/* Mobile: hero photo */}
          <img
            src="/ryan-farewell-hero.jpg"
            alt="Sayonara Ryan — Beach Farewell Party"
            className="md:hidden absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Bottom gradient for text readability (mobile only) */}
          <div className="md:hidden absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.88) 100%)' }} />

          {/* Content pinned to bottom */}
          <div className="relative flex flex-col justify-end h-full px-4 pb-12 pt-24" style={{ minHeight: '85vh' }}>
            <div className="max-w-2xl mx-auto w-full text-center text-white">

              <h1 className="font-display font-black text-4xl sm:text-5xl mb-6 drop-shadow-lg">
                Sayonara Ryan 🌸
              </h1>

              {/* Date pill */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-semibold mb-6 border border-white/30">
                <Calendar className="w-4 h-4" />
                {t('ryanParty.datePill')}
              </div>

              {/* Countdown */}
              <div className="flex justify-center gap-6 sm:gap-10 mb-6">
                {[
                  { val: timeLeft.days,    label: t('ryanParty.days') },
                  { val: timeLeft.hours,   label: t('ryanParty.hours') },
                  { val: timeLeft.minutes, label: t('ryanParty.min') },
                  { val: timeLeft.seconds, label: t('ryanParty.sec') },
                ].map(({ val, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="font-display font-black text-3xl sm:text-4xl tabular-nums drop-shadow-lg">
                      {String(val).padStart(2, '0')}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-white/70 mt-1">{label}</span>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-8 border border-white/20">
                🔥 {t('ryanParty.peopleComing')}
              </div>

              <div>
                <a
                  href="#rsvp"
                  className="inline-flex items-center gap-2 bg-white text-beach-700 font-display font-black px-8 py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  <Ticket className="w-5 h-5" />
                  {t('ryanParty.getTicket')} · チケット
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ EVENT DETAILS ════════════════════════ */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-beach-500 text-center mb-2">イベント詳細</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-gray-900 mb-10">{t('ryanParty.theBigDay')}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Calendar className="w-6 h-6" />, label: t('ryanParty.date'), value: t('ryanParty.sundayMay3'), sub: '2026', color: 'beach' },
                { icon: <Clock className="w-6 h-6" />,    label: t('ryanParty.time'), value: '2:00 PM', sub: t('ryanParty.untilSunset'), color: 'sunset' },
                {
                  icon: <MapPin className="w-6 h-6" />,
                  label: t('ryanParty.location'),
                  value: 'Posto 10',
                  sub: t('ryanParty.tapDirections'),
                  color: 'ocean',
                  href: 'https://maps.google.com/?q=Posto+10+Ipanema+Rio+de+Janeiro',
                },
                { icon: <Music className="w-6 h-6" />,    label: t('ryanParty.vibe'), value: t('ryanParty.beachTokyo'), sub: t('ryanParty.bestLook'), color: 'beach' },
              ].map((card: any, i) => (
                <div
                  key={i}
                  onClick={() => card.href && openLink(card.href)}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${card.href ? 'cursor-pointer' : ''}`}
                >
                  <div className={`mb-3 p-2.5 rounded-xl bg-${card.color}-50 text-${card.color}-500`}>
                    {card.icon}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{card.label}</p>
                  <p className="font-display font-black text-gray-900 text-lg">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ VENUE + DJ ════════════════════════════ */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-beach-500 text-center mb-2">場所とエンタメ</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-gray-900 mb-10">{t('ryanParty.venueAndEntertainment')}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Venue */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-beach-500 mb-3">📍 {t('ryanParty.venue')}</p>
                <h3 className="font-display font-black text-xl text-gray-900 mb-1">Barraca 120</h3>
                <p className="text-beach-600 font-semibold text-sm mb-3">Escritório Carioca</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {t('ryanParty.venueDesc')}
                </p>
                <button
                  onClick={() => {
                    trackEvent('venue_instagram_clicked', { category: 'Event' });
                    openLink('https://www.instagram.com/escritoriocarioca');
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-beach-600 hover:text-beach-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @escritoriocarioca
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* DJ */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-sunset-500 mb-3">🎵 {t('ryanParty.music')}</p>
                <h3 className="font-display font-black text-xl text-gray-900 mb-1">{t('ryanParty.sunsetDJSet')}</h3>
                <p className="text-sunset-600 font-semibold text-sm mb-3">DJ Lavinia Aune</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {t('ryanParty.djDesc')}
                </p>
                <button
                  onClick={() => {
                    trackEvent('dj_instagram_clicked', { category: 'Event' });
                    openLink('https://www.instagram.com/laviniaaune');
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sunset-600 hover:text-sunset-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @laviniaaune
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ WHAT'S INCLUDED ══════════════════════ */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-beach-500 text-center mb-2">含まれるもの</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-gray-900 mb-10">{t('ryanParty.yourTicketCovers')}</h2>

            <div className="flex justify-center gap-4 flex-wrap">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200 max-w-xs w-full">
                <span className="text-5xl block mb-4 animate-float">🪑</span>
                <h3 className="font-display font-black text-gray-900 text-xl mb-1">{t('ryanParty.reservedChair')}</h3>
                <p className="text-xs text-beach-500 font-semibold mb-2">予約席</p>
                <p className="text-sm text-gray-500 leading-relaxed">{t('ryanParty.reservedChairDesc')}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200 max-w-xs w-full">
                <span className="text-5xl block mb-4 animate-float">🍹</span>
                <h3 className="font-display font-black text-gray-900 text-xl mb-1">{t('ryanParty.welcomeDrink')}</h3>
                <p className="text-xs text-beach-500 font-semibold mb-2">ウェルカムドリンク</p>
                <p className="text-sm text-gray-500 leading-relaxed">{t('ryanParty.welcomeDrinkDesc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ FOR RYAN ══════════════════════════════ */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-beach-500 mb-4">ライアンへ · For Ryan</p>
            <blockquote className="font-display font-black text-2xl sm:text-3xl text-gray-900 leading-snug mb-6">
              "{t('ryanParty.quote1')}<br />{t('ryanParty.quote2')}<br />
              <span className="text-beach-500">{t('ryanParty.quote3')}"</span>
            </blockquote>
            <div className="inline-block bg-beach-50 border border-beach-100 rounded-2xl px-8 py-5 mb-6">
              <p className="text-beach-700 font-display text-lg leading-relaxed">
                波の音、覚えてね
                <span className="block text-sm text-beach-400 font-normal mt-1">{t('ryanParty.waveTranslation')}</span>
              </p>
            </div>
            <p className="text-gray-500 text-base leading-relaxed">
              {t('ryanParty.ryanDesc')}
            </p>
            <p className="text-beach-400 text-xs font-semibold uppercase tracking-widest mt-4">収益の一部はライアンの引越しを応援するために</p>
            <p className="text-gray-500 text-sm leading-relaxed mt-1 italic">
              {t('ryanParty.proceedsNote')}
            </p>
          </div>
        </section>

        {/* ══════════════ TICKET / RSVP ═════════════════════════ */}
        <section id="rsvp" className="py-16 px-4" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a2f 60%, #0f172a 100%)' }}>
          <div className="max-w-lg mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 text-center mb-2">🎫 RSVP · チケット</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-white mb-2">{t('ryanParty.secureYourSpot')}</h2>
            <p className="text-center text-amber-200/60 text-sm mb-8">席を確保する · {t('ryanParty.limitedTickets')}</p>


            {/* Main checkout card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,191,36,0.2)', backdropFilter: 'blur(12px)' }}>
              {/* Gold top stripe */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #f59e0b, #fcd34d, #f59e0b)' }} />

              <div className="p-6 sm:p-8">

                {/* ── STEP: FORM ─────────────────────────────────────── */}
                {step === 'form' && (
                  <div className="space-y-5">

                    {/* Active tier display */}
                    <div className="flex items-center justify-between rounded-2xl px-5 py-4" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
                      <div>
                        <p className="text-amber-300 text-xs font-semibold uppercase tracking-widest mb-0.5">{t('ryanParty.yourTicket')}</p>
                        <p className="text-white font-display font-black text-lg">{tierInfo.label}</p>
                        {tierInfo.promoterName && <p className="text-amber-200/70 text-xs mt-0.5">via {tierInfo.promoterName}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-amber-300 font-black text-3xl leading-none">{tierInfo.badge}</p>
                        {tierInfo.priceBrl > 0 && quantity > 1 && (
                          <p className="text-white/40 text-xs mt-1">× {quantity} = R${totalPriceBrl}</p>
                        )}
                        {tierInfo.priceBrl > 0 && (
                          <p className="text-white/30 text-xs">≈ ${(tierInfo.priceBrl / 100 / 5.3).toFixed(0)} USD</p>
                        )}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-amber-200/70 text-xs font-semibold uppercase tracking-widest mb-2">
                        <Users className="w-3 h-3 inline mr-1" />{t('ryanParty.quantity')}
                      </label>
                      <div className="flex items-center gap-3">
                        {[1,2,3,4,5].map(n => (
                          <button key={n} onClick={() => setQuantity(n)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${quantity === n ? 'bg-amber-400 text-slate-900' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full name */}
                    <div>
                      <label className="block text-amber-200/70 text-xs font-semibold uppercase tracking-widest mb-2">
                        <User className="w-3 h-3 inline mr-1" />{t('ryanParty.fullNameLabel')}
                      </label>
                      <input
                        type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder={t('ryanParty.fullNamePlaceholder')}
                        className="w-full rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                    </div>

                    {/* Contact — CPF / WhatsApp / Email — single identifier field */}
                    <div>
                      <label className="block text-amber-200/70 text-xs font-semibold uppercase tracking-widest mb-2">
                        <Phone className="w-3 h-3 inline mr-1" />{t('ryanParty.contactLabel')}
                      </label>
                      <input
                        type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                        placeholder="000.000.000-00 · +55 21 99999 · email"
                        className="w-full rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                      />
                      <p className="text-white/25 text-xs mt-1.5">{t('ryanParty.contactHint')}</p>
                    </div>

                    {/* Promo code — hidden when pre-filled from URL */}
                    {urlPromo && promoMsg?.ok ? (
                      <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-emerald-300 text-sm font-semibold">{promoMsg.text}</p>
                          <p className="text-emerald-400/50 text-xs font-mono">{promoCode}</p>
                        </div>
                      </div>
                    ) : (
                    <div>
                      <label className="block text-amber-200/70 text-xs font-semibold uppercase tracking-widest mb-2">
                        <Tag className="w-3 h-3 inline mr-1" />{t('ryanParty.promoLabel')} <span className="normal-case text-white/30 font-normal">{t('ryanParty.promoOptional')}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text" value={promoCode}
                          onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoMsg(null); setTierInfo(DEFAULT_TIER); }}
                          onBlur={handlePromoBlur}
                          placeholder="e.g. AMIGO"
                          className="w-full rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400/50 transition-all pr-12 uppercase"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                        />
                        {validatingPromo && (
                          <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-amber-400 animate-spin" />
                        )}
                      </div>
                      {promoMsg && (
                        <p className={`text-xs mt-1.5 flex items-center gap-1 ${promoMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                          {promoMsg.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                          {promoMsg.text}
                        </p>
                      )}
                    </div>
                    )}

                    {/* Continue button */}
                    <button
                      onClick={handleContinueToPayment}
                      disabled={!formValid || loading}
                      className="w-full py-4 rounded-2xl font-display font-black text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: formValid ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined, color: formValid ? '#0f172a' : '#9ca3af', border: formValid ? 'none' : '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isFree ? (
                        <><CheckCircle2 className="w-5 h-5" />{t('ryanParty.claimFree')}</>
                      ) : (
                        <>{t('ryanParty.continuePayment')} · {tierInfo.badge}{quantity > 1 ? ` × ${quantity}` : ''} <ChevronRight className="w-5 h-5" /></>
                      )}
                    </button>

                    {!formValid && (
                      <p className="text-xs text-center text-white/30">{t('ryanParty.formRequired')}</p>
                    )}

                    {error && <p className="text-red-400 text-sm text-center flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                  </div>
                )}

                {/* ── STEP: PAYMENT ──────────────────────────────────── */}
                {step === 'payment' && (
                  <div id="payment-section" className="space-y-5">
                    {/* Summary */}
                    <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      <div>
                        <p className="text-white/60 text-xs">{t('ryanParty.ticketFor')}</p>
                        <p className="text-white font-bold text-sm">{fullName}</p>
                        <p className="text-white/40 text-xs">{tierInfo.label}{quantity > 1 ? ` × ${quantity}` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-300 font-black text-2xl">R${totalPriceBrl}</p>
                        <button onClick={() => setStep('form')} className="text-white/30 text-xs hover:text-white/60 underline">{t('ryanParty.editBtn')}</button>
                      </div>
                    </div>

                    {/* Tab switcher */}
                    <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                      {(['pix', 'card'] as const).map(t => (
                        <button key={t} onClick={() => setPayTab(t)}
                          className={`flex-1 py-2.5 text-sm font-bold transition-colors ${payTab === t ? 'text-slate-900' : 'text-white/50 hover:text-white/70'}`}
                          style={payTab === t ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } : { background: 'transparent' }}>
                          {t === 'pix' ? '⚡ PIX (BR)' : '💳 Credit Card'}
                        </button>
                      ))}
                    </div>

                    {/* PIX */}
                    {payTab === 'pix' && (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <div className="rounded-2xl p-4 bg-white shadow-inner">
                            <QRCodeSVG value={PIX_KEY} size={156} fgColor="#0f172a" bgColor="#ffffff" level="M" />
                          </div>
                        </div>
                        <p className="text-center text-white/50 text-xs">{t('ryanParty.sendPixPrefix')} <span className="text-amber-300 font-bold">R${totalPriceBrl}</span> {t('ryanParty.sendPixSuffix')}</p>
                        <button onClick={handleCopyPix}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-sm"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <div className="text-left">
                            <span className="font-mono text-white/70 tracking-wide block">{PIX_DISPLAY}</span>
                            <span className="text-white/35 text-xs">{PIX_NAME}</span>
                          </div>
                          <span className="flex items-center gap-1.5 font-semibold text-amber-400 flex-shrink-0 ml-3">
                            {pixCopied ? <><CheckCircle2 className="w-4 h-4" />{t('ryanParty.copied')}</> : <><Copy className="w-4 h-4" />{t('ryanParty.copy')}</>}
                          </span>
                        </button>
                        <button onClick={handleWhatsAppReceipt}
                          className="w-full py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 text-sm"
                          style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}>
                          <MessageCircle className="w-4 h-4" /> {t('ryanParty.sendReceiptWa')}
                        </button>
                        <button onClick={handlePixSubmitted} disabled={loading}
                          className="w-full py-4 rounded-2xl font-display font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a' }}>
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" />{t('ryanParty.confirmPaid')}</>}
                        </button>
                        <p className="text-xs text-center text-white/30">{t('ryanParty.pixInstructions')}</p>
                      </div>
                    )}

                    {/* Card */}
                    {payTab === 'card' && (
                      <div className="space-y-3">
                        <button onClick={handleStripeCheckout} disabled={loading}
                          className="w-full py-4 rounded-2xl font-display font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f172a' }}>
                          {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : <><CreditCard className="w-5 h-5" />{t('ryanParty.payByCard')} R${totalPriceBrl}</>
                        </button>
                        <p className="text-xs text-center text-white/30">{t('ryanParty.stripeNote')}</p>
                      </div>
                    )}

                    {error && <p className="text-red-400 text-sm text-center flex items-center justify-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
                    {cancelled && <p className="text-white/30 text-xs text-center">{t('ryanParty.paymentCancelled')}</p>}
                  </div>
                )}

                {/* ── STEP: SUCCESS ──────────────────────────────────── */}
                {(step === 'success' || (sessionSuccess && loading === false && step !== 'form' && step !== 'payment')) && (
                  <div className="text-center py-4 space-y-5">
                    <div className="text-6xl animate-bounce">🎉</div>
                    <div>
                      <p className="text-white font-display font-black text-2xl mb-1">{t('ryanParty.youreIn')}</p>
                      <p className="text-amber-200/70 text-sm">
                        {isFree ? t('ryanParty.ticketConfirmed') : t('ryanParty.paymentPending')}
                      </p>
                    </div>
                    <div className="rounded-xl px-4 py-3 text-left space-y-1" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      <p className="text-white/40 text-xs">{t('ryanParty.ticketDetailsLabel')}</p>
                      <p className="text-white font-semibold">{fullName || 'See you there!'}</p>
                      <p className="text-amber-300 text-sm">{tierInfo.label} · May 3, 2026 · 120 Escritócarioca</p>
                    </div>
                    <div className="rounded-xl px-4 py-4 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">{t('ryanParty.badgeIsTicket')}</p>
                      <p className="text-white/40 text-xs leading-relaxed">
                        {t('ryanParty.badgeDesc')}
                      </p>
                      <a href="/ryans-party-ticket"
                        className="block w-full py-3 rounded-xl font-bold text-slate-900 text-sm text-center transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        {t('ryanParty.viewBadge')}
                      </a>
                    </div>
                    <p className="text-white/20 text-xs">{t('ryanParty.seeYouMay3')} · またね！</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ SHARE + CALENDAR ══════════════════════ */}
        <section className="py-8 px-4 bg-gray-50">
          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const msg = encodeURIComponent(`🌴 Ryan's Going Away Party, May 3, Ipanema! Tickets from R$100: ${window.location.origin}/ryans-farewell-party`);
                openLink(`https://wa.me/?text=${msg}`);
                trackEvent('event_shared', { method: 'whatsapp', category: 'Event' });
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> {t('ryanParty.tellFriend')}
            </button>
            <a
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Ryan%27s+Farewell+Party&dates=20260503T170000Z/20260503T230000Z&details=Farewell+party+at+Ipanema+Beach+Posto+10+-+R%24100+includes+entry+%26+welcome+drink&location=Posto+10+Ipanema+Rio+de+Janeiro"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('add_to_calendar_clicked', { category: 'Event' })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border border-beach-200 text-beach-600 bg-beach-50 hover:bg-beach-100 transition-colors"
            >
              <Calendar className="w-4 h-4" /> {t('ryanParty.addToCalendar')}
            </a>
          </div>
        </section>

        {/* ══════════════ FOOTER ════════════════════════════════ */}
        <footer className="py-12 px-4 text-center border-t border-gray-100 bg-white">
          <div className="flex justify-center gap-3 mb-4 text-3xl">
            <span className="animate-float" style={{ animationDelay: '0s' }}>🌊</span>
            <span className="animate-float" style={{ animationDelay: '0.3s' }}>🌸</span>
            <span className="animate-float" style={{ animationDelay: '0.6s' }}>⛩️</span>
            <span className="animate-float" style={{ animationDelay: '0.9s' }}>🌊</span>
          </div>
          <p className="font-display font-black text-xl text-gray-900 mb-1">またね、ライアン！</p>
          <p className="text-sm text-gray-400 mb-6">{t('ryanParty.footerTagline')}</p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
            <Waves className="w-4 h-4 text-beach-300" />
            <span>Carioca Coastal Club · Rio de Janeiro</span>
            <Waves className="w-4 h-4 text-beach-300" />
          </div>
          <p className="mt-3 text-xs text-gray-300">{t('ryanParty.copyright')}</p>
        </footer>

      </div>
    </>
  );
}
