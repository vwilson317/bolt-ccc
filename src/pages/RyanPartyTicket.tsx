import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Ticket, MapPin, Calendar, Search, Loader2, AlertCircle, CheckCircle2, Music } from 'lucide-react';
import SEOHead from '../components/SEOHead';

// Use anon key — only confirmed tickets are public (see RLS policy)
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL_PROD || '';
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY_PROD || '';
const supabase     = supabaseUrl ? createClient(supabaseUrl, supabaseAnon) : null;

interface TicketData {
  id: string;
  full_name: string;
  tier: string;
  quantity: number;
  payment_status: string;
  promo_code: string | null;
  promoter_id: string | null;
}

interface PromoterName { id: string; name: string; }

const TIER_LABEL: Record<string, string> = {
  general:  'General Public',
  guest:    "Ryan's Guest",
  vip:      "Ryan's VIP",
  promoter: 'Promoter',
};
const TIER_COLOR: Record<string, string> = {
  general:  'from-amber-500 to-yellow-400',
  guest:    'from-emerald-500 to-teal-400',
  vip:      'from-rose-500 to-pink-400',
  promoter: 'from-sky-500 to-blue-400',
};
const TIER_BADGE_BG: Record<string, string> = {
  general:  'bg-amber-400/15 text-amber-300 border-amber-400/30',
  guest:    'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
  vip:      'bg-rose-400/15 text-rose-300 border-rose-400/30',
  promoter: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
};

export default function RyanPartyTicket() {
  const [identifier, setIdentifier] = useState('');
  const [tickets,    setTickets]    = useState<TicketData[]>([]);
  const [promoters,  setPromoters]  = useState<PromoterName[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [searched,   setSearched]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handleLookup = async () => {
    const raw = identifier.trim();
    if (!raw || !supabase) return;
    setLoading(true); setError(null); setSearched(false);

    try {
      // Normalize: remove non-digits for CPF/phone search
      const digits = raw.replace(/\D/g, '');
      const isEmail = raw.includes('@');

      let query = supabase
        .from('event_tickets')
        .select('id, full_name, tier, quantity, payment_status, promo_code, promoter_id')
        .eq('payment_status', 'confirmed');

      if (isEmail) {
        query = query.eq('email', raw.toLowerCase());
      } else if (digits.length === 11) {
        // CPF
        query = query.eq('cpf', digits);
      } else {
        // WhatsApp — try both raw and digits
        query = query.or(`whatsapp.eq.${raw},whatsapp.eq.${digits},whatsapp.eq.+${digits}`);
      }

      const { data, error: dbErr } = await query;
      if (dbErr) throw dbErr;

      const found = (data || []) as TicketData[];
      setTickets(found);

      // Fetch promoter names if needed
      const pIds = [...new Set(found.filter(t => t.promoter_id).map(t => t.promoter_id!))];
      if (pIds.length > 0) {
        const { data: pData } = await supabase
          .from('event_promoters')
          .select('id, name')
          .in('id', pIds);
        setPromoters((pData || []) as PromoterName[]);
      }
    } catch (e: any) {
      setError(e.message || 'Lookup failed');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const promoterName = (id: string | null) =>
    id ? (promoters.find(p => p.id === id)?.name ?? null) : null;

  return (
    <>
      <SEOHead
        title="Your Ticket Badge — Ryan's Going Away Party"
        description="Look up your entry badge for Ryan's Going Away Party. May 3, 2026 · 120 Escritócarioca, Ipanema."
      />

      <div className="min-h-screen pt-16" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a2f 55%, #0f172a 100%)' }}>
        <div className="max-w-md mx-auto px-4 py-14">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 40px rgba(245,158,11,0.4)' }}>
              <Ticket className="w-8 h-8 text-slate-900" />
            </div>
            <p className="text-amber-400 text-xs font-bold tracking-[0.3em] uppercase mb-2">Entry Badge</p>
            <h1 className="text-white font-display font-black text-3xl sm:text-4xl mb-2">Your Ticket</h1>
            <p className="text-white/40 text-sm">Enter CPF, WhatsApp, or email to look up your badge</p>
          </div>

          {/* Search */}
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="flex gap-2">
              <input
                type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                placeholder="CPF, WhatsApp, or email"
                className="flex-1 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:ring-2 focus:ring-amber-400/40"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <button onClick={handleLookup} disabled={loading || !identifier.trim()}
                className="px-4 py-3 rounded-xl font-bold text-slate-900 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', minWidth: 52 }}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl p-4 mb-4 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {searched && tickets.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">No confirmed ticket found for that identifier.</p>
              <p className="text-white/25 text-xs mt-2">Check the CPF/WhatsApp/email you used at checkout, or contact Ryan.</p>
            </div>
          )}

          {/* Ticket badges */}
          <div className="space-y-5">
            {tickets.map(ticket => {
              const tier      = ticket.tier || 'general';
              const pName     = promoterName(ticket.promoter_id);
              const gradClass = TIER_COLOR[tier] || TIER_COLOR.general;
              const badgeClass = TIER_BADGE_BG[tier] || TIER_BADGE_BG.general;

              return (
                <div key={ticket.id} className="rounded-3xl overflow-hidden shadow-2xl"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)' }}>

                  {/* Gradient header stripe */}
                  <div className={`bg-gradient-to-r ${gradClass} p-5 relative overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/8" />

                    <div className="relative">
                      <p className="text-black/60 text-xs font-bold uppercase tracking-[0.2em] mb-1">Entry Badge</p>
                      <p className="text-black font-display font-black text-2xl leading-tight">
                        Ryan's Going<br />Away Party
                      </p>
                      <p className="text-black/70 text-sm font-semibold mt-1">さようなら、ライアン！</p>
                    </div>
                  </div>

                  {/* Dashed divider (ticket tear line) */}
                  <div className="relative flex items-center px-5 py-0">
                    <div className="absolute -left-3 w-6 h-6 rounded-full" style={{ background: '#0f172a' }} />
                    <div className="flex-1 border-t-2 border-dashed border-white/10 mx-3" />
                    <div className="absolute -right-3 w-6 h-6 rounded-full" style={{ background: '#0f172a' }} />
                  </div>

                  {/* Ticket body */}
                  <div className="px-5 py-5 space-y-4">

                    {/* Name + tier */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-widest mb-0.5">Attendee</p>
                        <p className="text-white font-display font-black text-xl leading-tight">{ticket.full_name}</p>
                        {ticket.quantity > 1 && <p className="text-white/40 text-xs mt-0.5">× {ticket.quantity} guests</p>}
                      </div>
                      <span className={`flex-shrink-0 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${badgeClass}`}>
                        {TIER_LABEL[tier] || tier}
                      </span>
                    </div>

                    {/* Entitlements */}
                    <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-2">Includes</p>
                      {['🪑  Beach chair + umbrella', '🍹  Welcome drink of your choice'].map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <p className="text-white/70 text-sm">{item}</p>
                        </div>
                      ))}
                    </div>

                    {/* Event info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/30 text-xs">Date</p>
                          <p className="text-white text-sm font-semibold">Sunday, May 3</p>
                          <p className="text-white/40 text-xs">2026 · 2PM+</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/30 text-xs">Venue</p>
                          <p className="text-white text-sm font-semibold">120 Escritócarioca</p>
                          <p className="text-white/40 text-xs">Ipanema Beach</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Music className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white/30 text-xs">Entertainment</p>
                        <p className="text-white text-sm">Live jazz band (3 hrs) · DJ Lavinia Aune</p>
                      </div>
                    </div>

                    {/* Promoter attribution */}
                    {pName && (
                      <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                        <p className="text-white/40 text-xs">Referred by</p>
                        <p className="text-amber-400 text-xs font-semibold">{pName}</p>
                      </div>
                    )}

                    {/* Ticket ID (small) */}
                    <p className="text-white/15 text-xs text-center font-mono">{ticket.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {tickets.length > 0 && (
            <p className="text-center text-white/20 text-xs mt-8">
              Show this badge at the door on May 3 · またね！🌴
            </p>
          )}
        </div>
      </div>
    </>
  );
}
