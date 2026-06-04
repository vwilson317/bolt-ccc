import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock, Ticket, Waves, Music, Copy, CheckCircle2, MessageCircle, ExternalLink, Instagram } from 'lucide-react';
import { trackEvent, trackPageView, trackCTAClick } from '../services/posthogAnalyticsService';
import SEOHead from '../components/SEOHead';

const PIX_KEY     = '038.914.767-28';
const PIX_DISPLAY = '038.914.767-28';
const WA_NUMBER   = '16789826137';

export default function PartyPromoLanding() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [payTab, setPayTab]     = useState<'pix' | 'card'>('pix');
  const [pixCopied, setPixCopied] = useState(false);

  const params    = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const success   = params.get('success') === 'true';
  const cancelled = params.get('cancelled') === 'true';

  // Countdown to June 7, 2026 1PM BRT
  useEffect(() => {
    const target = new Date('2026-06-07T13:00:00-03:00').getTime();
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
    trackPageView('/beach-party', "Beach Party · Escritório Carioca");
    trackEvent('event_landing_page_viewed', { event_name: 'beach_party_june7', event_date: '2026-06-07', category: 'Event' });
    if (success)   trackEvent('ticket_purchase_success',   { event_name: 'beach_party_june7', category: 'Event' });
    if (cancelled) trackEvent('ticket_purchase_cancelled', { event_name: 'beach_party_june7', category: 'Event' });
  }, []);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    });
    trackEvent('pix_key_copied', { event_name: 'beach_party_june7', category: 'Event' });
  };

  const openLink = (url: string) => {
    const isIG = /Instagram/.test(navigator.userAgent);
    if (isIG) window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppReceipt = () => {
    trackEvent('whatsapp_receipt_clicked', { event_name: 'beach_party_june7', category: 'Event' });
    const msg = encodeURIComponent('Oi! Acabei de pagar R$20 via PIX para o Beach Party no Escritório Carioca (7 de junho). Segue o comprovante 👇');
    openLink(`https://wa.me/${WA_NUMBER}?text=${msg}`);
  };

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError(null);
    trackCTAClick('ticket_purchase', 'Pay by Card', '/beach-party');
    try {
      const res  = await fetch('/.netlify/functions/create-stripe-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout');
      trackEvent('ticket_purchase_started', { event_name: 'beach_party_june7', category: 'Event' });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Beach Party · Escritório Carioca · June 7, 2026"
        description="Beach Party at Barraca 120, Posto 10, Ipanema! Sunday June 7 from 1PM until sunset. Live music & DJ set by @lavinia.aune. $5 entry."
      />

      <div className="min-h-screen bg-white text-gray-900">

        {/* ══════════════ HERO ════════════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ minHeight: '85vh' }}>
          {/* Mobile: flyer image — place beach-party-flyer.jpg in /public */}
          <img
            src="/beach-party-flyer.jpg"
            alt="Beach Party flyer"
            className="absolute inset-0 w-full h-full object-cover object-top sm:hidden"
          />
          {/* Desktop: gradient background */}
          <div
            className="absolute inset-0 hidden sm:block"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 35%, #ec4899 65%, #a855f7 100%)' }}
          />
          {/* Bottom gradient for text readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0.82) 100%)' }} />

          {/* Content pinned to bottom */}
          <div className="relative flex flex-col justify-end h-full px-4 pb-12 pt-24" style={{ minHeight: '85vh' }}>
            <div className="max-w-2xl mx-auto w-full text-center text-white">

              {/* Venue pill */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-semibold mb-4 border border-white/30">
                🌊 Escritório Carioca · Barraca 120 · Posto 10
              </div>

              {/* Title */}
              <h1 className="font-black text-6xl sm:text-7xl mb-2 drop-shadow-lg" style={{ fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: '-1px' }}>
                BEACH<br />PARTY
              </h1>

              {/* Date pill */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-semibold mb-6 border border-white/30">
                <Calendar className="w-4 h-4" />
                Sunday, June 7 · 1PM until Sunset
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
                    <span className="font-black text-3xl sm:text-4xl tabular-nums drop-shadow-lg">
                      {String(val).padStart(2, '0')}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-white/70 mt-1">{label}</span>
                  </div>
                ))}
              </div>

              <div>
                <a
                  href="#rsvp"
                  className="inline-flex items-center gap-2 bg-white text-pink-600 font-black px-8 py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 active:scale-95"
                >
                  <Ticket className="w-5 h-5" />
                  Get Your Ticket · $5
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ EVENT DETAILS ════════════════════════ */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-pink-500 text-center mb-2">Event Details</p>
            <h2 className="font-black text-3xl sm:text-4xl text-center text-gray-900 mb-10">The Big Day</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Calendar className="w-6 h-6" />, label: 'Date', value: 'Sunday, June 7', sub: '2026', color: 'beach' },
                { icon: <Clock className="w-6 h-6" />,    label: 'Time', value: '1:00 PM', sub: 'until sunset 🌅', color: 'sunset' },
                {
                  icon: <MapPin className="w-6 h-6" />,
                  label: 'Location',
                  value: 'Posto 10',
                  sub: 'Tap for directions 📍',
                  color: 'ocean',
                  href: 'https://maps.google.com/?q=Posto+10+Ipanema+Rio+de+Janeiro',
                },
                { icon: <Music className="w-6 h-6" />,    label: 'Vibe', value: 'Live Music + DJ', sub: 'your best look ✨', color: 'beach' },
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
                  <p className="font-black text-gray-900 text-lg">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ VENUE + DJ ════════════════════════════ */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-pink-500 text-center mb-2">Venue &amp; Entertainment</p>
            <h2 className="font-black text-3xl sm:text-4xl text-center text-gray-900 mb-10">Where &amp; Who</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Venue */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-beach-500 mb-3">📍 Venue</p>
                <h3 className="font-black text-xl text-gray-900 mb-1">Barraca 120</h3>
                <p className="text-beach-600 font-semibold text-sm mb-3">Escritório Carioca · Ipanema</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Posto 10, Ipanema Beach. One of the best barracas in Zona Sul — right on the sand with the perfect backdrop for a beach party.
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
                <p className="text-xs font-bold uppercase tracking-widest text-sunset-500 mb-3">🎧 Live Music &amp; DJ Set</p>
                <h3 className="font-black text-xl text-gray-900 mb-1">Lavinia Aune</h3>
                <p className="text-sunset-600 font-semibold text-sm mb-3">Live set · Sunset session</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Spinning from the afternoon all the way into sunset. The perfect soundtrack for a legendary beach party on the sand.
                </p>
                <button
                  onClick={() => {
                    trackEvent('dj_instagram_clicked', { category: 'Event' });
                    openLink('https://www.instagram.com/laviniaaune');
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-sunset-600 hover:text-sunset-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  @lavinia.aune
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ TICKET / RSVP ═════════════════════════ */}
        <section id="rsvp" className="py-16 px-4 bg-gray-50">
          <div className="max-w-md mx-auto">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-pink-500 text-center mb-2">🎫 RSVP</p>
            <h2 className="font-black text-3xl sm:text-4xl text-center text-gray-900 mb-2">Secure Your Spot</h2>
            <p className="text-center text-gray-500 text-sm mb-8">Limited spots available</p>

            {/* Ticket card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
              {/* Top stripe */}
              <div className="h-1.5 animate-gradient-shift" style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316, #ec4899, #f59e0b)' }} />

              <div className="p-8">
                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-gray-400">$</span>
                    <span className="font-black text-7xl text-gray-900 leading-none">5</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">≈ R$25 · per person</p>
                </div>

                {/* Includes */}
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  {['🌊  Beach Party at Barraca 120', '🎵  Live music & DJ set · @lavinia.aune', '🌅  All afternoon until sunset'].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 flex-shrink-0" />
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
                          className={`flex-1 py-2.5 text-sm font-bold transition-colors ${payTab === t ? 'bg-pink-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          {t === 'pix' ? '⚡ PIX (BR)' : '💳 Credit Card'}
                        </button>
                      ))}
                    </div>

                    {/* PIX tab */}
                    {payTab === 'pix' && (
                      <div className="space-y-3">
                        <button
                          onClick={handleCopyPix}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-pink-50 hover:border-pink-200 transition-colors text-sm"
                        >
                          <span className="font-mono text-gray-700 tracking-wide">{PIX_DISPLAY}</span>
                          <span className="flex items-center gap-1.5 font-semibold text-pink-600">
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
                        <p className="text-xs text-center text-gray-400">Pay R$20 PIX → screenshot receipt → tap button above</p>
                      </div>
                    )}

                    {/* Card tab */}
                    {payTab === 'card' && (
                      <div className="space-y-3">
                        <button
                          onClick={handleStripeCheckout}
                          disabled={loading}
                          className="w-full py-4 rounded-2xl font-black text-lg text-white bg-pink-500 hover:bg-pink-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                              Redirecting…
                            </span>
                          ) : 'Pay $5 by Card'}
                        </button>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <p className="text-xs text-center text-gray-400">Secure checkout via Stripe</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-4 rounded-2xl text-center bg-green-50 border border-green-200">
                    <p className="text-green-700 font-black text-lg">🎉 You're in!</p>
                    <p className="text-green-600 text-sm mt-1">See you at Ipanema on June 7 🌊</p>
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
                const msg = encodeURIComponent(`🌊 Beach Party at Escritório Carioca, June 7, Ipanema Posto 10! $5 entry. Tickets: ${window.location.origin}`);
                openLink(`https://wa.me/?text=${msg}`);
                trackEvent('event_shared', { method: 'whatsapp', category: 'Event' });
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Tell a friend
            </button>
            <button
              onClick={() => {
                trackEvent('add_to_calendar_clicked', { category: 'Event' });
                openLink('https://calendar.google.com/calendar/render?action=TEMPLATE&text=Beach+Party+%40+Escrit%C3%B3rio+Carioca&dates=20260607T160000Z/20260607T220000Z&details=Beach+Party+at+Barraca+120%2C+Posto+10+Ipanema+-+%245+entry.+Live+music+%26+DJ+set+by+%40lavinia.aune&location=Posto+10+Ipanema+Rio+de+Janeiro');
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm border border-beach-200 text-beach-600 bg-beach-50 hover:bg-beach-100 transition-colors"
            >
              <Calendar className="w-4 h-4" /> Add to Calendar
            </button>
          </div>
        </section>

        {/* ══════════════ FOOTER ════════════════════════════════ */}
        <footer className="py-12 px-4 text-center border-t border-gray-100 bg-white">
          <div className="flex justify-center gap-3 mb-4 text-3xl">
            <span>🌊</span>
            <span>🏖️</span>
            <span>🎵</span>
            <span>🌅</span>
          </div>
          <p className="font-black text-xl text-gray-900 mb-1">See you at the beach!</p>
          <p className="text-sm text-gray-400 mb-6">Sunday June 7 · Barraca 120 · Posto 10 · Ipanema 🍹</p>
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
