import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, Ticket, Gift, Waves, Star, Music, ChevronDown, ArrowRight } from 'lucide-react';
import { trackEvent, trackPageView, trackCTAClick } from '../services/posthogAnalyticsService';
import SEOHead from '../components/SEOHead';

// ── Hardcoded sakura petals (stable across renders) ──────────────
const PETALS = [
  { left: '5%',  dur: '7s',  delay: '0s',   size: 18, opacity: 0.75 },
  { left: '12%', dur: '9s',  delay: '1.5s', size: 14, opacity: 0.6  },
  { left: '22%', dur: '6s',  delay: '3s',   size: 22, opacity: 0.8  },
  { left: '31%', dur: '8s',  delay: '0.8s', size: 16, opacity: 0.65 },
  { left: '40%', dur: '7.5s',delay: '4.2s', size: 20, opacity: 0.7  },
  { left: '52%', dur: '9.5s',delay: '2.1s', size: 13, opacity: 0.55 },
  { left: '61%', dur: '6.5s',delay: '5s',   size: 18, opacity: 0.72 },
  { left: '70%', dur: '8.5s',delay: '1.1s', size: 24, opacity: 0.8  },
  { left: '78%', dur: '7s',  delay: '3.6s', size: 15, opacity: 0.6  },
  { left: '87%', dur: '9s',  delay: '0.4s', size: 19, opacity: 0.75 },
  { left: '93%', dur: '6s',  delay: '6s',   size: 12, opacity: 0.5  },
  { left: '8%',  dur: '8s',  delay: '7s',   size: 16, opacity: 0.65 },
  { left: '47%', dur: '7.5s',delay: '8.5s', size: 21, opacity: 0.7  },
  { left: '66%', dur: '9.5s',delay: '2.8s', size: 14, opacity: 0.58 },
  { left: '84%', dur: '6.8s',delay: '4.5s', size: 17, opacity: 0.68 },
];

// ── Torii gate SVG ────────────────────────────────────────────────
const ToriiGate = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Top kasagi beam */}
    <rect x="5"  y="20" width="190" height="14" rx="2" fill="currentColor" />
    {/* Second nuki beam */}
    <rect x="20" y="46" width="160" height="10" rx="2" fill="currentColor" />
    {/* Left pillar */}
    <rect x="32" y="46" width="16" height="114" rx="3" fill="currentColor" />
    {/* Right pillar */}
    <rect x="152" y="46" width="16" height="114" rx="3" fill="currentColor" />
    {/* Kasagi curved ends (left) */}
    <path d="M5 20 Q0 20 0 26 L0 34 Q0 40 8 40 L20 40" stroke="currentColor" strokeWidth="3" fill="none" />
    {/* Kasagi curved ends (right) */}
    <path d="M195 20 Q200 20 200 26 L200 34 Q200 40 192 40 L180 40" stroke="currentColor" strokeWidth="3" fill="none" />
    {/* Shimagi (small decorative top) */}
    <rect x="90" y="8" width="20" height="14" rx="1" fill="currentColor" opacity="0.6" />
  </svg>
);

// ── Wave divider ──────────────────────────────────────────────────
const WaveDivider = ({ flip = false }: { flip?: boolean }) => (
  <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''}`}>
    <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-12">
      <path
        d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1350,15 1440,30 L1440,60 L0,60 Z"
        fill="rgba(196,30,58,0.08)"
      />
      <path
        d="M0,40 C240,10 480,60 720,40 C960,20 1200,55 1440,40 L1440,60 L0,60 Z"
        fill="rgba(255,107,53,0.06)"
      />
    </svg>
  </div>
);

export default function RyanFarewellParty() {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const params  = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const success   = params.get('success') === 'true';
  const cancelled = params.get('cancelled') === 'true';

  // ── PostHog: page view ────────────────────────────────────────
  useEffect(() => {
    trackPageView('/ryans-farewell-party', "Ryan's Farewell Party — さようなら、ライアン！");
    trackEvent('event_landing_page_viewed', {
      event_name: 'ryans_farewell_party',
      event_date: '2026-05-03',
      category: 'Event',
    });

    if (success) {
      trackEvent('ticket_purchase_success', {
        event_name: 'ryans_farewell_party',
        category: 'Event',
      });
    }
    if (cancelled) {
      trackEvent('ticket_purchase_cancelled', {
        event_name: 'ryans_farewell_party',
        category: 'Event',
      });
    }
  }, []);

  // ── Stripe checkout ───────────────────────────────────────────
  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    trackCTAClick('ticket_purchase', 'Get Your Ticket', '/ryans-farewell-party');
    trackEvent('ticket_purchase_clicked', {
      event_name: 'ryans_farewell_party',
      category: 'Event',
    });

    try {
      const res = await fetch('/.netlify/functions/create-stripe-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Could not create checkout session');
      }

      trackEvent('ticket_purchase_started', {
        event_name: 'ryans_farewell_party',
        category: 'Event',
      });

      // Instagram WebView safe navigation (see CLAUDE.md)
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Sayonara Ryan — Beach Farewell Party · May 3, 2026"
        description="Join us at Ipanema Beach for Ryan's farewell party before he heads to Tokyo! Sunday May 3, 2026. R$100 includes chair, umbrella & welcome drink."
      />

      {/* ── Falling sakura petals ───────────────────────────── */}
      {PETALS.map((p, i) => (
        <div
          key={i}
          className="sakura-petal"
          style={{
            left: p.left,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: p.dur,
            animationDelay: p.delay,
          }}
        >
          🌸
        </div>
      ))}

      <div className="min-h-screen text-white relative overflow-x-hidden" style={{ background: '#05050f' }}>

        {/* ── Background colour blobs ─────────────────────── */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Sunset glow — bottom */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, rgba(255,107,53,0.18) 0%, transparent 70%)' }}
          />
          {/* Cherry blossom — top right */}
          <div
            className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full blur-[100px]"
            style={{ background: 'radial-gradient(ellipse, rgba(255,105,180,0.12) 0%, transparent 70%)' }}
          />
          {/* Torii crimson — left centre */}
          <div
            className="absolute top-1/3 -left-20 w-[500px] h-[500px] rounded-full blur-[120px]"
            style={{ background: 'radial-gradient(ellipse, rgba(196,30,58,0.1) 0%, transparent 70%)' }}
          />
        </div>

        {/* ══════════════ HERO ══════════════════════════════ */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-8 pb-16">

          {/* Torii gate background silhouette */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <ToriiGate className="w-full max-w-3xl text-red-600" />
          </div>

          {/* Japanese subtitle */}
          <div
            className="mb-3 animate-fade-in"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            <span
              className="text-xs font-bold tracking-[0.35em] uppercase px-4 py-1.5 rounded-full border"
              style={{ color: '#ff69b4', borderColor: 'rgba(255,105,180,0.35)', background: 'rgba(255,105,180,0.08)' }}
            >
              さようなら ✈ 東京へ
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="text-center font-display font-black leading-none mb-4 animate-slide-up-fade"
            style={{ animationDelay: '0.25s', opacity: 0 }}
          >
            <span
              className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl"
              style={{
                background: 'linear-gradient(135deg, #ff6b35 0%, #ff69b4 40%, #c41e3a 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Sayonara,
            </span>
            <span
              className="block text-6xl sm:text-8xl md:text-9xl lg:text-[10rem]"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #ffd700 60%, #ff9f43 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ryan!
            </span>
          </h1>

          {/* Japanese main title */}
          <p
            className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-6 text-center animate-slide-up-fade"
            style={{ color: 'rgba(255,105,180,0.85)', animationDelay: '0.4s', opacity: 0 }}
          >
            さようなら、ライアン！🌸
          </p>

          {/* Tagline */}
          <p
            className="text-base sm:text-lg md:text-xl text-center max-w-2xl mb-10 animate-slide-up-fade"
            style={{ color: 'rgba(255,255,255,0.6)', animationDelay: '0.55s', opacity: 0 }}
          >
            Before you conquer Tokyo, we send you off in true Rio style —<br className="hidden sm:block" />
            sun, sand, and way too many caipirinhas. 🍹
          </p>

          {/* Date pill */}
          <div
            className="flex items-center gap-3 mb-10 px-6 py-3 rounded-2xl border animate-slide-up-fade"
            style={{
              background: 'rgba(196,30,58,0.12)',
              borderColor: 'rgba(196,30,58,0.4)',
              animationDelay: '0.65s',
              opacity: 0,
            }}
          >
            <Calendar className="w-5 h-5 flex-shrink-0" style={{ color: '#c41e3a' }} />
            <span className="text-sm sm:text-base font-semibold tracking-wide">
              Sunday, May 3, 2026 &nbsp;·&nbsp; Ipanema Beach, Rio de Janeiro
            </span>
          </div>

          {/* CTA */}
          {!success && (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="group relative px-10 py-4 rounded-2xl font-display font-black text-lg sm:text-xl text-white transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse-glow animate-slide-up-fade disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #c41e3a 0%, #ff6b35 100%)',
                animationDelay: '0.8s',
                opacity: 0,
              }}
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    Get Your Ticket &nbsp;·&nbsp; チケットを取得
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          )}

          {error && (
            <p className="mt-4 text-red-400 text-sm text-center max-w-sm">{error}</p>
          )}

          {/* Success state */}
          {success && (
            <div
              className="mt-4 px-8 py-5 rounded-2xl border text-center max-w-md"
              style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.35)' }}
            >
              <p className="text-green-400 font-display font-bold text-xl mb-1">🎉 You're in! お疲れ様！</p>
              <p className="text-white/70 text-sm">
                Ticket confirmed! See you at Ipanema on May 3. 🌸🏖️
              </p>
            </div>
          )}

          {/* Cancelled state */}
          {cancelled && (
            <div
              className="mt-4 px-8 py-5 rounded-2xl border text-center max-w-md"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <p className="text-red-400 font-display font-bold text-lg mb-1">Payment cancelled</p>
              <p className="text-white/60 text-sm">No worries — click above whenever you're ready!</p>
            </div>
          )}

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float opacity-50">
            <ChevronDown className="w-6 h-6" />
          </div>
        </section>

        {/* ══════════════ RIO → TOKYO BANNER ═══════════════ */}
        <WaveDivider />
        <section
          className="relative z-10 py-12 px-4"
          style={{ background: 'rgba(196,30,58,0.06)' }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">

              {/* Rio side */}
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-5xl sm:text-6xl animate-float" style={{ animationDelay: '0s' }}>🌊</span>
                <p className="font-display font-black text-2xl sm:text-3xl" style={{ color: '#ff6b35' }}>Rio</p>
                <p className="text-xs tracking-widest uppercase opacity-50">de Janeiro</p>
              </div>

              {/* Arrow with plane */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="h-px w-8 sm:w-16" style={{ background: 'rgba(255,105,180,0.3)' }} />
                <span className="text-3xl sm:text-4xl animate-float" style={{ animationDelay: '0.4s' }}>✈️</span>
                <div className="h-px w-8 sm:w-16" style={{ background: 'rgba(255,105,180,0.3)' }} />
              </div>

              {/* Tokyo side */}
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-5xl sm:text-6xl animate-float" style={{ animationDelay: '0.8s' }}>⛩️</span>
                <p className="font-display font-black text-2xl sm:text-3xl" style={{ color: '#ff69b4' }}>Tokyo</p>
                <p className="text-xs tracking-widest uppercase opacity-50">東京</p>
              </div>
            </div>

            <p className="text-center mt-8 text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Ryan is trading beach sunsets for neon skylines — so we're throwing him the best sendoff the Zona Sul has ever seen.
            </p>
          </div>
        </section>
        <WaveDivider flip />

        {/* ══════════════ EVENT DETAILS ═════════════════════ */}
        <section className="relative z-10 py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: '#ff69b4' }}>
                イベント詳細 · Event Details
              </p>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white">The Big Night</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: <Calendar className="w-7 h-7" />,
                  label: '日付 · Date',
                  value: 'Sunday, May 3',
                  sub: '2026',
                  color: '#c41e3a',
                },
                {
                  icon: <Clock className="w-7 h-7" />,
                  label: '時間 · Time',
                  value: '2:00 PM',
                  sub: 'until sunset 🌅',
                  color: '#ff6b35',
                },
                {
                  icon: <MapPin className="w-7 h-7" />,
                  label: '場所 · Location',
                  value: 'Ipanema Beach',
                  sub: 'Rio de Janeiro',
                  color: '#ff69b4',
                },
                {
                  icon: <Music className="w-7 h-7" />,
                  label: 'ドレスコード · Vibe',
                  value: 'Beach + Tokyo',
                  sub: 'your best look',
                  color: '#ffd700',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border transition-transform hover:-translate-y-1 duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: `${card.color}33`,
                  }}
                >
                  <div
                    className="mb-4 p-3 rounded-xl"
                    style={{ background: `${card.color}18`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <p className="text-xs font-semibold tracking-widest uppercase opacity-50 mb-1">{card.label}</p>
                  <p className="font-display font-black text-xl text-white">{card.value}</p>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ WHAT'S INCLUDED ══════════════════ */}
        <section
          className="relative z-10 py-20 px-4"
          style={{ background: 'rgba(255,105,180,0.04)' }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3" style={{ color: '#ff6b35' }}>
                含まれるもの · What's Included
              </p>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white">Your ticket covers</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  emoji: '🏖️',
                  title: 'Beach Chair + Umbrella',
                  titleJP: 'ビーチチェア＋パラソル',
                  desc: 'Reserved beach chair and umbrella rental for the whole afternoon. Your spot is waiting.',
                  color: '#ff6b35',
                },
                {
                  emoji: '🍹',
                  title: 'Welcome Drink',
                  titleJP: 'ウェルカムドリンク',
                  desc: 'One welcome drink of your choice — caipirinha, cerveja, or whatever calls your name.',
                  color: '#ff69b4',
                },
                {
                  emoji: '🌸',
                  title: 'Epic Send-Off Vibes',
                  titleJP: '最高の雰囲気',
                  desc: "Sun, music, friends, and the warmth of a community cheering Ryan on to his next adventure.",
                  color: '#ffd700',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative p-7 rounded-2xl border overflow-hidden group transition-transform hover:-translate-y-2 duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: `${item.color}30`,
                  }}
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${item.color}14, transparent 70%)` }}
                  />

                  <span className="text-5xl mb-5 block animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                    {item.emoji}
                  </span>
                  <h3 className="font-display font-black text-xl text-white mb-1">{item.title}</h3>
                  <p className="text-xs mb-3 font-medium" style={{ color: item.color }}>{item.titleJP}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ ABOUT RYAN ════════════════════════ */}
        <section className="relative z-10 py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">

            {/* Decorative torii */}
            <div className="flex justify-center mb-8 opacity-30">
              <ToriiGate className="w-24 text-red-500" />
            </div>

            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ color: '#c41e3a' }}>
              ライアンへ · For Ryan
            </p>

            <blockquote
              className="font-display font-black text-2xl sm:text-3xl md:text-4xl leading-snug mb-8"
              style={{
                background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.7))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              "You came for the beach. You stayed for the people.<br />
              Now you take both with you to Tokyo."
            </blockquote>

            {/* Japanese haiku-style */}
            <div
              className="inline-block px-8 py-5 rounded-2xl border mb-8"
              style={{ background: 'rgba(196,30,58,0.08)', borderColor: 'rgba(196,30,58,0.25)' }}
            >
              <p className="font-display text-lg sm:text-xl leading-relaxed" style={{ color: 'rgba(255,105,180,0.9)' }}>
                波の音、覚えてね<br />
                <span className="text-sm opacity-70 font-normal">remember the sound of the waves</span>
              </p>
            </div>

            <p className="text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Ryan has been a part of the Carioca Coastal Club family, living the true carioca life —
              surf, sun, and saudade. As he heads to Japan for his next chapter, we celebrate the
              friendships, memories, and yes, the legendary beach days.
            </p>
          </div>
        </section>

        {/* ══════════════ TICKET / RSVP ═════════════════════ */}
        <section
          className="relative z-10 py-24 px-4"
          style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(196,30,58,0.08) 50%, transparent 100%)' }}
        >
          <div className="max-w-lg mx-auto">

            {/* Card */}
            <div
              className="relative rounded-3xl overflow-hidden border p-8 sm:p-10 text-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(196,30,58,0.4)',
                boxShadow: '0 0 60px rgba(196,30,58,0.15), 0 0 120px rgba(255,105,180,0.08)',
              }}
            >
              {/* Top gradient stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1 animate-gradient-shift"
                style={{ background: 'linear-gradient(90deg, #c41e3a, #ff6b35, #ff69b4, #c41e3a)' }}
              />

              <div className="mb-2">
                <span
                  className="text-xs font-bold tracking-[0.3em] uppercase px-3 py-1 rounded-full"
                  style={{ background: 'rgba(196,30,58,0.2)', color: '#ff69b4' }}
                >
                  🎫 RSVP · チケット
                </span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-4 mb-2">
                Secure Your Spot
              </h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                席を確保する · Limited spots available
              </p>

              {/* Price */}
              <div className="flex items-center justify-center gap-4 mb-3">
                <div>
                  <span
                    className="font-display font-black text-6xl sm:text-7xl"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700, #ff9f43)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    R$100
                  </span>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>≈ $20 USD</p>
                </div>
              </div>

              {/* Includes list */}
              <div className="space-y-2 mb-8 text-sm">
                {[
                  '🏖️  Beach chair + umbrella rental',
                  '🍹  Welcome drink of your choice',
                  '🌸  A Rio farewell for the ages',
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-center gap-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {!success ? (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-display font-black text-lg text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #c41e3a 0%, #ff6b35 100%)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing…
                    </span>
                  ) : (
                    'Get My Ticket — チケットを購入'
                  )}
                </button>
              ) : (
                <div className="py-4 rounded-2xl text-center" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <p className="text-green-400 font-display font-bold text-lg">✓ Ticket Confirmed!</p>
                  <p className="text-white/50 text-sm mt-1">See you May 3 🌸</p>
                </div>
              )}

              {error && (
                <p className="mt-4 text-red-400 text-sm">{error}</p>
              )}

              <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Secure payment via Stripe · 安全なお支払い
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════ STAR RATING / HYPE ══════════════ */}
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" style={{ color: '#ffd700' }} />
              ))}
            </div>
            <p className="text-lg sm:text-xl font-display font-bold text-white mb-2">
              "This is going to be legendary." 伝説になる。
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>— Everyone who knows Ryan</p>
          </div>
        </section>

        {/* ══════════════ FOOTER ════════════════════════════ */}
        <footer
          className="relative z-10 py-12 px-4 text-center border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex justify-center gap-3 mb-4 text-3xl">
            <span className="animate-float" style={{ animationDelay: '0s' }}>🌊</span>
            <span className="animate-float" style={{ animationDelay: '0.3s' }}>🌸</span>
            <span className="animate-float" style={{ animationDelay: '0.6s' }}>⛩️</span>
            <span className="animate-float" style={{ animationDelay: '0.9s' }}>🌊</span>
          </div>
          <p className="font-display font-black text-xl text-white mb-2">
            またね、ライアン！
          </p>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
            See you at the beach before Tokyo calls. 🍹
          </p>
          <div className="flex items-center justify-center gap-3">
            <Waves className="w-4 h-4" style={{ color: '#ff6b35' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Carioca Coastal Club · Rio de Janeiro
            </span>
            <Waves className="w-4 h-4" style={{ color: '#ff69b4' }} />
          </div>
          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.15)' }}>
            © 2026 Carioca Coastal Club. All rights reserved.
          </p>
        </footer>

      </div>
    </>
  );
}
