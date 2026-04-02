import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Copy, CheckCircle2, Ticket, DollarSign, Share2, Loader2, AlertCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';

interface PromoterData {
  promoter: { name: string; code: string; commissionPerTicket: number };
  ticketsSold: number;
  totalCommission: number;
  shareMessage: string;
}

export default function PromoterDashboard() {
  const { code: urlCode } = useParams<{ code: string }>();
  const [searchParams]    = useSearchParams();
  const code              = (urlCode || searchParams.get('code') || '').toUpperCase();

  const [data,    setData]    = useState<PromoterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!code) { setError('No promo code provided'); setLoading(false); return; }
    fetch(`/.netlify/functions/get-promoter-stats?code=${encodeURIComponent(code)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setError(e.message || 'Could not load promoter data'))
      .finally(() => setLoading(false));
  }, [code]);

  const copyShareMessage = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.shareMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <>
      <SEOHead
        title={data ? `${data.promoter.name}'s Dashboard — Ryan's Party` : "Promoter Dashboard — Ryan's Party"}
        description="Track your ticket sales and commission for Ryan's Going Away Party."
      />

      <div className="min-h-screen pt-16" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a2f 60%, #0f172a 100%)' }}>
        <div className="max-w-lg mx-auto px-4 py-16">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400 mb-3">Promoter Portal</p>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
              {data ? `Hey, ${data.promoter.name.split(' ')[0]}! 👋` : "Ryan's Party"}
            </h1>
            <p className="text-white/50 text-sm">Your promo code dashboard</p>
          </div>

          {loading && (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-white/40 text-sm">Loading your stats…</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-300 font-semibold">{error}</p>
              <p className="text-red-400/60 text-sm mt-2">Check the URL or contact Ryan.</p>
            </div>
          )}

          {data && (
            <div className="space-y-4">

              {/* Promo code badge */}
              <div className="rounded-3xl p-6 text-center" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)' }}>
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Your Promo Code</p>
                <p className="font-display font-black text-5xl text-amber-400 tracking-wider mb-2">{data.promoter.code}</p>
                <p className="text-white/40 text-xs">Share this code — buyers enter it at checkout</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Ticket className="w-5 h-5 text-amber-400 mb-3" />
                  <p className="text-3xl font-display font-black text-white">{data.ticketsSold}</p>
                  <p className="text-white/40 text-sm mt-1">Tickets Sold</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <DollarSign className="w-5 h-5 text-emerald-400 mb-3" />
                  <p className="text-3xl font-display font-black text-white">R${data.totalCommission}</p>
                  <p className="text-white/40 text-sm mt-1">Commission Earned</p>
                </div>
              </div>

              {/* Commission rate */}
              <div className="rounded-2xl px-5 py-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white/50 text-sm">Rate per ticket</p>
                <p className="text-emerald-400 font-bold">R${data.promoter.commissionPerTicket} cash</p>
              </div>

              {/* Event info */}
              <div className="rounded-2xl px-5 py-4 space-y-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-amber-400 font-bold text-sm">Ryan's Going Away Party</p>
                <p className="text-white/50 text-xs">📅 Sunday, May 3, 2026 · 2PM onwards</p>
                <p className="text-white/50 text-xs">📍 120 Escritócarioca, Ipanema Beach</p>
                <p className="text-white/50 text-xs">🎟️ General ticket: R$200 · You enter free</p>
              </div>

              {/* Share button */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Share with friends</p>
                <pre className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap font-sans bg-black/20 rounded-xl p-3">{data.shareMessage}</pre>
                <button onClick={copyShareMessage}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: copied ? 'rgba(52,211,153,0.15)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: copied ? '#34d399' : '#0f172a', border: copied ? '1px solid rgba(52,211,153,0.3)' : 'none' }}>
                  {copied ? <><CheckCircle2 className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy Message</>}
                </button>
              </div>

              <p className="text-center text-white/20 text-xs pt-4">Commissions are paid in cash on the day of the event.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
