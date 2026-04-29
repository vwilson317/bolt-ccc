/**
 * /confirm-ticket?token=<CONFIRMATION_TOKEN>
 *
 * Self-service badge-claim page. After paying via PIX (or any method),
 * the attendee clicks this link to:
 *   1. Confirm their purchase in the database
 *   2. Unlock the host barraca's loyalty badge in localStorage
 *
 * Works for any barraca hosting an event — the server determines which
 * loyalty card to credit based on the ticket's promo_id field.
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Ticket, Star, ExternalLink } from 'lucide-react';
import { useBadgeContext } from '../contexts/BadgeContext';
import { getBarracaPromoById } from '../data/barracaPromos';

type Status = 'loading' | 'success' | 'already' | 'error';

interface ClaimResult {
  ticket: {
    fullName: string;
    tier: string;
    quantity: number;
    paymentStatus: string;
  };
  badge: {
    promoId: string;
    storageKey: string;
    identifierStorageKey: string;
    identifier: string;
  };
  alreadyClaimed: boolean;
}

const TIER_LABELS: Record<string, string> = {
  general:  'General Admission',
  guest:    "Ryan's Guest",
  vip:      "Ryan's VIP",
  promoter: 'Promoter',
};

export default function EventTicketConfirmPage() {
  const [status, setStatus]     = useState<Status>('loading');
  const [result, setResult]     = useState<ClaimResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const { unlockBadge }         = useBadgeContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token') || '';

    if (!token) {
      setStatus('error');
      setErrorMsg('No confirmation token found in the link. Please use the link from your ticket registration.');
      return;
    }

    fetch(`/.netlify/functions/claim-event-badge?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then((data: any) => {
        if (!data.success) throw new Error(data.error || 'Claim failed');

        const claim = data as { success: boolean } & ClaimResult;
        setResult(claim);

        // Unlock the badge in localStorage so the FAB appears immediately
        localStorage.setItem(claim.badge.storageKey, 'true');
        if (claim.badge.identifier) {
          localStorage.setItem(claim.badge.identifierStorageKey, claim.badge.identifier);
        }
        unlockBadge(claim.badge.promoId);

        setStatus(claim.alreadyClaimed ? 'already' : 'success');
      })
      .catch((err: any) => {
        setStatus('error');
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
      });
  }, [unlockBadge]);

  const barraca = result ? getBarracaPromoById(result.badge.promoId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* ── Loading ─────────────────────────────────────── */}
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
            <p className="text-white/60 text-sm">Confirming your ticket…</p>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────── */}
        {status === 'error' && (
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="h-1 bg-red-500" />
            <div className="p-8 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <div>
                <p className="text-white font-bold text-xl mb-2">Link not found</p>
                <p className="text-white/50 text-sm leading-relaxed">{errorMsg}</p>
              </div>
              <a
                href="/ryans-party-ticket"
                className="block w-full py-3 rounded-2xl font-bold text-sm text-center text-slate-900 transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                Look up my ticket instead
              </a>
            </div>
          </div>
        )}

        {/* ── Success ─────────────────────────────────────── */}
        {(status === 'success' || status === 'already') && result && (
          <div className="space-y-4">

            {/* Confirmation card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,191,36,0.3)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #f59e0b, #fcd34d, #f59e0b)' }} />
              <div className="p-8 text-center space-y-5">

                {status === 'success' ? (
                  <>
                    <div className="text-5xl">🎉</div>
                    <div>
                      <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">Badge unlocked</p>
                      <p className="text-white font-display font-black text-2xl">You're confirmed!</p>
                      <p className="text-white/50 text-sm mt-1">
                        {result.ticket.paymentStatus === 'confirmed'
                          ? 'Payment confirmed. See you at the party!'
                          : "PIX received — we'll verify and confirm shortly."}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <div>
                      <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1">Already claimed</p>
                      <p className="text-white font-display font-black text-2xl">Badge already linked</p>
                      <p className="text-white/50 text-sm mt-1">Your loyalty card was already updated. All good!</p>
                    </div>
                  </>
                )}

                {/* Ticket summary */}
                <div className="rounded-2xl px-5 py-4 text-left space-y-2" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <p className="text-amber-200/50 text-xs uppercase tracking-widest font-semibold">Your ticket</p>
                  <p className="text-white font-bold">{result.ticket.fullName}</p>
                  <p className="text-amber-300 text-sm">
                    {TIER_LABELS[result.ticket.tier] ?? result.ticket.tier}
                    {result.ticket.quantity > 1 && ` × ${result.ticket.quantity}`}
                    {' · '} May 1, 2026
                  </p>
                  <p className="text-white/40 text-xs">📍 Escritório Carioca · Barraca 120, Ipanema</p>
                </div>

                {/* Badge credit info */}
                {barraca && (
                  <div className="rounded-2xl px-5 py-4 text-left space-y-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <p className="text-white/60 text-xs uppercase tracking-widest font-semibold">Loyalty card updated</p>
                    </div>
                    <p className="text-white font-semibold text-sm">{barraca.name}</p>
                    <p className="text-white/40 text-xs">
                      Your event attendance has been added to this barraca's loyalty card. The badge is now active in your CCC wallet.
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* CTAs */}
            <a
              href="/ryans-party-ticket"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-display font-black text-lg text-slate-900 transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              <Ticket className="w-5 h-5" />
              View my ticket badge
            </a>

            <a
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Back to Carioca Coastal Club
            </a>

          </div>
        )}

      </div>
    </div>
  );
}
