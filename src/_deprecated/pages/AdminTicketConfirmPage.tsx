/**
 * /admin-confirm?token=<ADMIN_TOKEN>
 *
 * Mobile-friendly page for the event owner to review and confirm a PIX
 * payment.  Linked from the attendee's WhatsApp receipt message.
 * No login needed — the admin_token is the secret.
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, User, Phone, CreditCard, Ticket, Clock } from 'lucide-react';

interface TicketDetails {
  id: string;
  fullName: string;
  whatsapp: string;
  cpf: string | null;
  email: string | null;
  tier: string;
  tierLabel: string;
  quantity: number;
  pricePaidBrl: number;
  paymentMethod: string;
  paymentStatus: string;
  promoCode: string | null;
  createdAt: string;
}

type PageState = 'loading' | 'ready' | 'confirming' | 'confirmed' | 'already' | 'error';

function formatBrl(centavos: number) {
  return centavos === 0 ? 'Free' : `R$${(centavos / 100).toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminTicketConfirmPage() {
  const [state, setState]   = useState<PageState>('loading');
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [errMsg, setErrMsg] = useState('');

  const token = new URLSearchParams(window.location.search).get('token') || '';

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrMsg('No token in URL. Use the link from the WhatsApp receipt.');
      return;
    }

    fetch(`/.netlify/functions/admin-confirm-ticket?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then((data: any) => {
        if (data.error) throw new Error(data.error);
        setTicket(data.ticket);
        setState(data.ticket.paymentStatus === 'confirmed' ? 'already' : 'ready');
      })
      .catch((e: any) => { setState('error'); setErrMsg(e.message || 'Failed to load ticket'); });
  }, [token]);

  const handleConfirm = async () => {
    setState('confirming');
    try {
      const res  = await fetch(`/.netlify/functions/admin-confirm-ticket?token=${encodeURIComponent(token)}`, { method: 'POST' });
      const data = await res.json();
      if (data.error === 'Payment already confirmed') { setState('already'); return; }
      if (!data.success) throw new Error(data.error || 'Confirmation failed');
      setState('confirmed');
    } catch (e: any) {
      setState('error');
      setErrMsg(e.message || 'Confirmation failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-4">

        <div className="text-center mb-6">
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Admin · Ryan's Party</p>
          <h1 className="text-white font-bold text-xl mt-1">PIX Confirmation</h1>
        </div>

        {/* Loading */}
        {state === 'loading' && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading ticket…</p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="rounded-2xl p-6 space-y-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-red-300 text-center text-sm">{errMsg}</p>
          </div>
        )}

        {/* Ticket details */}
        {ticket && state !== 'error' && (
          <>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="h-1" style={{ background: ticket.paymentStatus === 'confirmed' ? 'linear-gradient(90deg,#34d399,#10b981)' : 'linear-gradient(90deg,#f59e0b,#fcd34d)' }} />
              <div className="p-5 space-y-4">

                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Attendee</p>
                    <p className="text-white font-semibold">{ticket.fullName}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Contact</p>
                    <p className="text-white text-sm font-mono">{ticket.whatsapp}</p>
                    {ticket.cpf && <p className="text-slate-400 text-xs font-mono">CPF {ticket.cpf}</p>}
                  </div>
                </div>

                {/* Ticket */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Ticket</p>
                    <p className="text-white text-sm">{ticket.tierLabel}{ticket.quantity > 1 ? ` × ${ticket.quantity}` : ''}</p>
                    {ticket.promoCode && <p className="text-amber-400 text-xs font-mono">{ticket.promoCode}</p>}
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Amount · {ticket.paymentMethod?.toUpperCase()}</p>
                    <p className="text-amber-300 font-bold">{formatBrl(ticket.pricePaidBrl * (ticket.quantity ?? 1))}</p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Registered</p>
                    <p className="text-white text-sm">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Action */}
            {(state === 'ready' || state === 'confirming') && (
              <button
                onClick={handleConfirm}
                disabled={state === 'confirming'}
                className="w-full py-4 rounded-2xl font-bold text-slate-900 text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }}
              >
                {state === 'confirming'
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Confirming…</>
                  : <><CheckCircle2 className="w-5 h-5" /> Confirm PIX payment</>
                }
              </button>
            )}

            {(state === 'confirmed') && (
              <div className="rounded-2xl p-5 text-center space-y-2" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-emerald-300 font-bold">Payment confirmed!</p>
                <p className="text-slate-400 text-sm">{ticket.fullName}'s ticket is now active.</p>
              </div>
            )}

            {(state === 'already') && (
              <div className="rounded-2xl p-5 text-center space-y-2" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                <p className="text-emerald-300 font-semibold">Already confirmed</p>
                <p className="text-slate-400 text-sm">This payment was confirmed earlier.</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
