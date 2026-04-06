import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, Ticket, Waves, Star, Music, ChevronDown, Copy, CheckCircle2, MessageCircle, ExternalLink, Instagram } from 'lucide-react';
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

const PIX_KEY     = '+5521990532728';
const PIX_DISPLAY = '(21) 99053-2728';
const WA_NUMBER   = '5521990532728';

export default function RyanFarewellParty() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [payTab, setPayTab]     = useState<'pix' | 'card'>('pix');
  const [pixCopied, setPixCopied] = useState(false);
  const [ticketTier, setTicketTier] = useState<'normal' | 'vip'>('normal');

  const params    = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const success   = params.get('success') === 'true';
  const cancelled = params.get('cancelled') === 'true';

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

  // PostHog
  useEffect(() => {
    trackPageView('/ryans-farewell-party', "Ryan's Farewell Party");
    trackEvent('event_landing_page_viewed', { event_name: 'ryans_farewell_party', event_date: '2026-05-03', category: 'Event' });
    if (success)   trackEvent('ticket_purchase_success',   { event_name: 'ryans_farewell_party', category: 'Event' });
    if (cancelled) trackEvent('ticket_purchase_cancelled', { event_name: 'ryans_farewell_party', category: 'Event' });
  }, []);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    });
    trackEvent('pix_key_copied', { event_name: 'ryans_farewell_party', category: 'Event' });
  };

  const openLink = (url: string) => {
    const isIG = /Instagram/.test(navigator.userAgent);
    if (isIG) window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppReceipt = () => {
    trackEvent('whatsapp_receipt_clicked', { event_name: 'ryans_farewell_party', ticket_tier: ticketTier, category: 'Event' });
    const amount = ticketTier === 'vip' ? 'R$200' : 'R$100';
    const tierLabel = ticketTier === 'vip' ? 'VIP Premium' : '';
    const msg = encodeURIComponent(`Oi! Acabei de pagar ${amount} via PIX para o Farewell Party do Ryan (3 de maio)${tierLabel ? ` — ingresso ${tierLabel}` : ''}. Segue o comprovante 👇`);
    openLink(`https://wa.me/${WA_NUMBER}?text=${msg}`);
  };

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError(null);
    trackCTAClick('ticket_purchase', 'Pay by Card', '/ryans-farewell-party');
    try {
      const res  = await fetch('/.netlify/functions/create-stripe-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketTier }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout');
      trackEvent('ticket_purchase_started', { event_name: 'ryans_farewell_party', category: 'Event' });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Sayonara Ryan: Beach Farewell Party · May 3, 2026"
        description="Join us at Ipanema Beach (Posto 10) for Ryan's farewell party before he heads to Tokyo! Sunday May 3, 2026. R$100 includes chair, umbrella & welcome drink."
      />

      {/* Subtle sakura petals */}
      {PETALS.map((p, i) => (
        <div key={i} className="sakura-petal" style={{ left: p.left, fontSize: `${p.size}px`, opacity: p.opacity, animationDuration: p.dur, animationDelay: p.delay }}>
          🌸
        </div>
      ))}

      <div className="min-h-screen bg-white text-gray-900">

        {/* ══════════════ HERO ════════════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
          {/* Hero photo */}
          <img
            src="/ryan-farewell-hero.jpg"
            alt="Sayonara Ryan — Beach Farewell Party"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Bottom gradient for text readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.88) 100%)' }} />

          {/* Content pinned to bottom */}
          <div className="relative flex flex-col justify-end h-full px-4 pb-12 pt-24" style={{ minHeight: '85vh' }}>
            <div className="max-w-2xl mx-auto w-full text-center text-white">

              {/* Date pill */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-semibold mb-6 border border-white/30">
                <Calendar className="w-4 h-4" />
                Sunday, May 3, 2026 · Ipanema Beach, Posto 10
              </div>

              {/* Countdown */}
              <div className="flex justify-center gap-6 sm:gap-10 mb-6">
                {[
                  { val: timeLeft.days,    label: 'Days' },
                  { val: timeLeft.hours,   label: 'Hours' },
                  { val: timeLeft.minutes, label: 'Min' },
                  { val: timeLeft.seconds, label: 'Sec' },
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
                🔥 38 people are going
              </div>

              <div>
                <a
                  href="#rsvp"
                  className="inline-flex items-center gap-2 bg-white text-beach-700 font-display font-black px-8 py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  <Ticket className="w-5 h-5" />
                  Get Your Ticket · チケット
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ EVENT DETAILS ════════════════════════ */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-beach-500 text-center mb-2">イベント詳細</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-gray-900 mb-10">The Big Day</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Calendar className="w-6 h-6" />, label: 'Date', value: 'Sunday, May 3', sub: '2026', color: 'beach' },
                { icon: <Clock className="w-6 h-6" />,    label: 'Time', value: '2:00 PM', sub: 'until sunset 🌅', color: 'sunset' },
                {
                  icon: <MapPin className="w-6 h-6" />,
                  label: 'Location',
                  value: 'Posto 10',
                  sub: 'Tap for directions 📍',
                  color: 'ocean',
                  href: 'https://maps.google.com/?q=Posto+10+Ipanema+Rio+de+Janeiro',
                },
                { icon: <Music className="w-6 h-6" />,    label: 'Vibe', value: 'Beach + Tokyo', sub: 'your best look ✨', color: 'beach' },
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
            <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-gray-900 mb-10">Venue & Entertainment</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Venue */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-beach-500 mb-3">📍 Venue</p>
                <h3 className="font-display font-black text-xl text-gray-900 mb-1">Barraca 120</h3>
                <p className="text-beach-600 font-semibold text-sm mb-3">Escritório Carioca</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Ipanema Beach, Posto 10. Our favourite barraca and the perfect backdrop for the best sendoff in Zona Sul history.
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
                <p className="text-xs font-bold uppercase tracking-widest text-sunset-500 mb-3">🎧 Live DJ</p>
                <h3 className="font-display font-black text-xl text-gray-900 mb-1">Lavinia Aune</h3>
                <p className="text-sunset-600 font-semibold text-sm mb-3">Live set · Sunset session</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  She'll be spinning from the afternoon into sunset. The perfect soundtrack for a legendary farewell on the sand.
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
            <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-gray-900 mb-10">Your ticket covers</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { emoji: '🏖️', title: 'Beach Chair + Umbrella', sub: 'ビーチチェア＋パラソル', desc: 'Reserved spot for the whole afternoon. Your seat is waiting.' },
                { emoji: '🍹', title: 'Welcome Drink',          sub: 'ウェルカムドリンク',    desc: 'One drink of your choice: caipirinha, cerveja, whatever calls your name.' },
                { emoji: '🌸', title: 'Epic Send-Off Vibes',    sub: '最高の雰囲気',          desc: 'Sun, music, friends, and a community cheering Ryan on to his next adventure.' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200">
                  <span className="text-4xl block mb-4 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>{item.emoji}</span>
                  <h3 className="font-display font-black text-gray-900 text-lg mb-1">{item.title}</h3>
                  <p className="text-xs text-beach-500 font-semibold mb-2">{item.sub}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ FOR RYAN ══════════════════════════════ */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-beach-500 mb-4">ライアンへ · For Ryan</p>
            <blockquote className="font-display font-black text-2xl sm:text-3xl text-gray-900 leading-snug mb-6">
              "You came for the beach.<br />You stayed for the people.<br />
              <span className="text-beach-500">Now you take both to Tokyo."</span>
            </blockquote>
            <div className="inline-block bg-beach-50 border border-beach-100 rounded-2xl px-8 py-5 mb-6">
              <p className="text-beach-700 font-display text-lg leading-relaxed">
                波の音、覚えてね
                <span className="block text-sm text-beach-400 font-normal mt-1">remember the sound of the waves</span>
              </p>
            </div>
            <p className="text-gray-500 text-base leading-relaxed">
              Ryan has been part of the Carioca Coastal Club family, living the true carioca life of surf, sun, and saudade.
              As he heads to Japan, we celebrate the friendships, memories, and legendary beach days.
            </p>
          </div>
        </section>

        {/* ══════════════ TICKET / RSVP ═════════════════════════ */}
        <section id="rsvp" className="py-16 px-4 bg-gray-50">
          <div className="max-w-md mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-beach-500 text-center mb-2">🎫 RSVP · チケット</p>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-gray-900 mb-2">Secure Your Spot</h2>
            <p className="text-center text-gray-500 text-sm mb-8">席を確保する · Limited spots available</p>

            {/* Ticket card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
              {/* Top stripe */}
              <div className="h-1.5 animate-gradient-shift" style={{ background: 'linear-gradient(90deg, #ec4899, #eab308, #0ea5e9, #ec4899)' }} />

              <div className="p-8">
                {/* Tier selector */}
                <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
                  <button
                    onClick={() => setTicketTier('normal')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${ticketTier === 'normal' ? 'bg-beach-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    🎫 General
                  </button>
                  <button
                    onClick={() => setTicketTier('vip')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${ticketTier === 'vip' ? 'bg-beach-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                  >
                    ⭐ VIP Premium
                  </button>
                </div>

                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-gray-400">R$</span>
                    <span className="font-display font-black text-7xl text-gray-900 leading-none">{ticketTier === 'vip' ? '200' : '100'}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {ticketTier === 'vip' ? '≈ $40 USD · per person' : '≈ $20 USD · per person'}
                  </p>
                  {ticketTier === 'vip' && (
                    <p className="text-xs font-semibold text-beach-500 mt-1 uppercase tracking-wide">Preferred seating · right by the DJ</p>
                  )}
                </div>

                {/* Includes */}
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  {(ticketTier === 'vip'
                    ? ['🏖️  Beach chair + umbrella', '🎶  Preferred seating — right by the DJ', '🍹  Welcome drink of your choice', '🌸  A Rio farewell for the ages']
                    : ['🏖️  Beach chair + umbrella rental', '🍹  Welcome drink of your choice', '🌸  A Rio farewell for the ages']
                  ).map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-beach-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {!success ? (
                  <>
                    {/* Tab switcher */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
                      {(['pix', 'card'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setPayTab(t)}
                          className={`flex-1 py-2.5 text-sm font-bold transition-colors ${payTab === t ? 'bg-beach-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          {t === 'pix' ? '⚡ PIX (BR)' : '💳 Credit Card'}
                        </button>
                      ))}
                    </div>

                    {/* PIX tab */}
                    {payTab === 'pix' && (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <div className="rounded-2xl border-2 border-beach-100 p-4 bg-white shadow-inner">
                            <QRCodeSVG value={PIX_KEY} size={160} fgColor="#be185d" bgColor="#ffffff" level="M" />
                          </div>
                        </div>
                        <button
                          onClick={handleCopyPix}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-beach-50 hover:border-beach-200 transition-colors text-sm"
                        >
                          <span className="font-mono text-gray-700 tracking-wide">{PIX_DISPLAY}</span>
                          <span className="flex items-center gap-1.5 font-semibold text-beach-600">
                            {pixCopied ? <><CheckCircle2 className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy key</>}
                          </span>
                        </button>
                        <button
                          onClick={handleWhatsAppReceipt}
                          className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                          style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
                        >
                          <MessageCircle className="w-5 h-5" />
                          Send Receipt on WhatsApp
                        </button>
                        <p className="text-xs text-center text-gray-400">Pay {ticketTier === 'vip' ? 'R$200' : 'R$100'} PIX → screenshot receipt → tap button above</p>
                      </div>
                    )}

                    {/* Card tab */}
                    {payTab === 'card' && (
                      <div className="space-y-3">
                        <button
                          onClick={handleStripeCheckout}
                          disabled={loading}
                          className="w-full py-4 rounded-2xl font-display font-black text-lg text-white bg-beach-500 hover:bg-beach-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                              Redirecting…
                            </span>
                          ) : `Pay R$${ticketTier === 'vip' ? '200' : '100'} by Card`}
                        </button>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <p className="text-xs text-center text-gray-400">Secure checkout via Stripe</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-4 rounded-2xl text-center bg-green-50 border border-green-200">
                    <p className="text-green-700 font-display font-bold text-lg">🎉 You're in!</p>
                    <p className="text-green-600 text-sm mt-1">See you at Ipanema on May 3 🌸</p>
                  </div>
                )}

                {cancelled && !success && (
                  <p className="mt-3 text-sm text-center text-gray-400">Payment cancelled. Tap above whenever you're ready.</p>
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
                const msg = encodeURIComponent(`🌸 Ryan's Farewell Party, May 3, Ipanema Posto 10! Tickets: ${window.location.origin}/ryans-farewell-party`);
                openLink(`https://wa.me/?text=${msg}`);
                trackEvent('event_shared', { method: 'whatsapp', category: 'Event' });
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Tell a friend
            </button>
            <a
              href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Ryan%27s+Farewell+Party&dates=20260503T170000Z/20260503T230000Z&details=Farewell+party+at+Ipanema+Beach+Posto+10+-+R%24100+includes+chair%2C+umbrella+%26+welcome+drink&location=Posto+10+Ipanema+Rio+de+Janeiro"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('add_to_calendar_clicked', { category: 'Event' })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border border-beach-200 text-beach-600 bg-beach-50 hover:bg-beach-100 transition-colors"
            >
              <Calendar className="w-4 h-4" /> Add to Calendar
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
          <p className="text-sm text-gray-400 mb-6">See you at the beach before Tokyo calls. 🍹</p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
            <Waves className="w-4 h-4 text-beach-300" />
            <span>Carioca Coastal Club · Rio de Janeiro</span>
            <Waves className="w-4 h-4 text-beach-300" />
          </div>
          <p className="mt-3 text-xs text-gray-300">© 2026 Carioca Coastal Club. All rights reserved.</p>
        </footer>

      </div>
    </>
  );
}
