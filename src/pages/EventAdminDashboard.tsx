import React, { useEffect, useState, useCallback } from 'react';
import { Users, Ticket, DollarSign, TrendingUp, TrendingDown, Download, Plus, RefreshCw, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Trash2, Eye, EyeOff } from 'lucide-react';
import SEOHead from '../components/SEOHead';

// ── Types ─────────────────────────────────────────────────────────
interface Summary {
  totalConfirmed: number;
  totalPending: number;
  ticketCap: number;
  remaining: number;
  byTier: Record<string, number>;
  totalRevenueBrl: number;
  totalCostsBrl: number;
  profitLossBrl: number;
}
interface Costs {
  band: number; dj: number; bundlePerHead: number;
  promoLocal: number; promoInstagram: number; promoCommissions: number; bundleTotal: number;
}
interface Promoter { id: string; name: string; code: string; commissionRate: number; isActive: boolean; ticketsSold: number; totalCommission: number; }
interface PromoCode { code: string; type: 'guest' | 'vip'; isActive: boolean; }
interface GuestEntry { id: string; fullName: string; whatsapp: string; email: string | null; cpf: string | null; tier: string; quantity: number; promoCode: string | null; promoterName: string | null; paymentMethod: string; paymentStatus: string; createdAt: string; }
interface AdminData { summary: Summary; costs: Costs; promoters: Promoter[]; promoCodes: PromoCode[]; guestList: GuestEntry[]; config: Record<string, string>; }

const TIER_COLORS: Record<string, string> = {
  general:  'text-amber-300',
  guest:    'text-emerald-300',
  vip:      'text-rose-300',
  promoter: 'text-sky-300',
};
const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-emerald-400',
  pending:   'text-amber-400',
  failed:    'text-red-400',
  refunded:  'text-gray-400',
};

const ADMIN_KEY_STORAGE = 'ryan_party_admin_key';

export default function EventAdminDashboard() {
  const [adminKey, setAdminKey]   = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || '');
  const [keyInput, setKeyInput]   = useState('');
  const [authed,   setAuthed]     = useState(false);

  const [data,    setData]    = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [tab,     setTab]     = useState<'overview' | 'promoters' | 'codes' | 'guests'>('overview');

  // New promoter form
  const [newPName,   setNewPName]   = useState('');
  const [newPCode,   setNewPCode]   = useState('');
  const [newPComm,   setNewPComm]   = useState('25');
  const [newPLoading, setNewPLoading] = useState(false);
  const [newPMsg,    setNewPMsg]    = useState<{ ok: boolean; text: string } | null>(null);

  // New promo code form
  const [newCCode,    setNewCCode]    = useState('');
  const [newCType,    setNewCType]    = useState<'guest' | 'vip'>('guest');
  const [newCLoading, setNewCLoading] = useState(false);
  const [newCMsg,     setNewCMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  // Config editing
  const [editingConfig, setEditingConfig] = useState<Record<string, string>>({});
  const [configSaving,  setConfigSaving]  = useState<string | null>(null);

  const [confirmTicketId,    setConfirmTicketId]    = useState<string | null>(null);
  const [confirmingTicket,   setConfirmingTicket]   = useState(false);

  const fetchData = useCallback(async (key: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/.netlify/functions/get-event-admin-data', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (res.status === 401) throw new Error('Invalid admin key');
      if (!res.ok) throw new Error('Server error');
      const d = await res.json();
      setData(d);
      setEditingConfig({ ...d.config });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem(ADMIN_KEY_STORAGE, keyInput.trim());
    setAdminKey(keyInput.trim());
    setAuthed(true);
    fetchData(keyInput.trim());
  };

  useEffect(() => {
    if (adminKey) { setAuthed(true); fetchData(adminKey); }
  }, []);

  const post = async (body: object) => {
    const res = await fetch('/.netlify/functions/get-event-admin-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Request failed'); }
    return res.json();
  };

  const handleCreatePromoter = async () => {
    if (!newPName.trim() || !newPCode.trim()) return;
    setNewPLoading(true); setNewPMsg(null);
    try {
      await post({ action: 'create_promoter', name: newPName.trim(), code: newPCode.trim().toUpperCase(), commissionRate: parseInt(newPComm) || 25 });
      setNewPMsg({ ok: true, text: 'Promoter created!' });
      setNewPName(''); setNewPCode('');
      fetchData(adminKey);
    } catch (e: any) { setNewPMsg({ ok: false, text: e.message }); }
    finally { setNewPLoading(false); }
  };

  const handleTogglePromoter = async (id: string, isActive: boolean) => {
    try { await post({ action: 'toggle_promoter', id, isActive: !isActive }); fetchData(adminKey); }
    catch (e: any) { alert(e.message); }
  };

  const handleCreateCode = async () => {
    if (!newCCode.trim()) return;
    setNewCLoading(true); setNewCMsg(null);
    try {
      await post({ action: 'create_promo_code', code: newCCode.trim().toUpperCase(), type: newCType });
      setNewCMsg({ ok: true, text: 'Code created!' });
      setNewCCode('');
      fetchData(adminKey);
    } catch (e: any) { setNewCMsg({ ok: false, text: e.message }); }
    finally { setNewCLoading(false); }
  };

  const handleDeleteCode = async (code: string) => {
    if (!confirm(`Deactivate code ${code}?`)) return;
    try { await post({ action: 'delete_promo_code', code }); fetchData(adminKey); }
    catch (e: any) { alert(e.message); }
  };

  const handleSaveConfig = async (key: string) => {
    setConfigSaving(key);
    try {
      await post({ action: 'update_config', key, value: editingConfig[key] });
      fetchData(adminKey);
    } catch (e: any) { alert(e.message); }
    finally { setConfigSaving(null); }
  };

  const handleConfirmTicket = async (id: string) => {
    setConfirmingTicket(true);
    try {
      const res = await fetch('/.netlify/functions/confirm-ticket-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ ticketId: id }),
      });
      if (!res.ok) throw new Error('Confirmation failed');
      setConfirmTicketId(null);
      fetchData(adminKey);
    } catch (e: any) { alert(e.message); }
    finally { setConfirmingTicket(false); }
  };

  const exportCSV = () => {
    if (!data) return;
    const headers = ['Name', 'WhatsApp', 'Email', 'CPF', 'Tier', 'Qty', 'Promo Code', 'Promoter', 'Payment', 'Status', 'Date'];
    const rows = data.guestList.map(g => [
      g.fullName, g.whatsapp, g.email || '', g.cpf || '',
      g.tier, g.quantity, g.promoCode || '', g.promoterName || '',
      g.paymentMethod, g.paymentStatus, new Date(g.createdAt).toLocaleString('pt-BR'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'ryans-party-guests.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Login screen ─────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a2f 60%, #0f172a 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-amber-400 font-bold text-xs tracking-widest uppercase mb-2">Event Admin</p>
          <h1 className="text-white font-display font-black text-3xl">Ryan's Party</h1>
        </div>
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <input
            type="password" placeholder="Admin key" value={keyInput} onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-amber-400/50"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
          <button onClick={handleLogin}
            className="w-full py-3 rounded-xl font-bold text-slate-900 text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  const s   = data?.summary;
  const usd = (brl: number) => `$${(brl / 530).toFixed(0)}`;

  return (
    <>
      <SEOHead title="Admin — Ryan's Going Away Party" description="Event admin dashboard" />
      <div className="min-h-screen pt-16" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a2f 80%, #0f172a 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">Admin Dashboard</p>
              <h1 className="text-white font-display font-black text-2xl sm:text-3xl">Ryan's Going Away Party</h1>
            </div>
            <button onClick={() => fetchData(adminKey)} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/60 text-sm hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {error && (
            <div className="rounded-xl p-4 mb-6 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {loading && !data && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          )}

          {data && (
            <>
              {/* ── Summary cards ─────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: <Ticket className="w-4 h-4 text-amber-400" />, label: 'Sold', value: `${s!.totalConfirmed}`, sub: `${s!.totalPending} pending · cap ${s!.ticketCap}` },
                  { icon: <DollarSign className="w-4 h-4 text-emerald-400" />, label: 'Revenue', value: `R$${(s!.totalRevenueBrl / 100).toLocaleString('pt-BR')}`, sub: `≈ ${usd(s!.totalRevenueBrl / 100)}` },
                  { icon: <TrendingDown className="w-4 h-4 text-rose-400" />, label: 'Costs', value: `R$${s!.totalCostsBrl.toLocaleString('pt-BR')}`, sub: `≈ ${usd(s!.totalCostsBrl)}` },
                  {
                    icon: s!.profitLossBrl >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />,
                    label: 'P&L',
                    value: `${s!.profitLossBrl >= 0 ? '+' : ''}R$${s!.profitLossBrl.toLocaleString('pt-BR')}`,
                    sub: `≈ ${s!.profitLossBrl >= 0 ? '+' : ''}${usd(s!.profitLossBrl)}`,
                    highlight: s!.profitLossBrl >= 0 ? 'text-emerald-300' : 'text-red-300',
                  },
                ].map((c, i) => (
                  <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="mb-2">{c.icon}</div>
                    <p className={`font-display font-black text-xl leading-none ${(c as any).highlight || 'text-white'}`}>{c.value}</p>
                    <p className="text-white/40 text-xs mt-1">{c.label}</p>
                    <p className="text-white/25 text-xs">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* Tickets by tier */}
              <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Tickets by Tier</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['general', 'guest', 'vip', 'promoter'].map(tier => (
                    <div key={tier} className="text-center">
                      <p className={`font-display font-black text-2xl ${TIER_COLORS[tier] || 'text-white'}`}>{s!.byTier[tier] || 0}</p>
                      <p className="text-white/30 text-xs capitalize">{tier === 'general' ? 'General' : tier === 'guest' ? "Ryan's Guest" : tier === 'vip' ? "Ryan's VIP" : 'Promoter'}</p>
                    </div>
                  ))}
                </div>
                {/* Capacity bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/30 mb-1">
                    <span>{s!.totalConfirmed} sold</span>
                    <span>{s!.remaining} remaining of {s!.ticketCap}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (s!.totalConfirmed / s!.ticketCap) * 100)}%`, background: 'linear-gradient(90deg, #f59e0b, #d97706)' }} />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['overview', 'promoters', 'codes', 'guests'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${tab === t ? 'text-slate-900' : 'text-white/40 hover:text-white/70'}`}
                    style={tab === t ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)' } : {}}>
                    {t}
                  </button>
                ))}
              </div>

              {/* ── OVERVIEW: Costs breakdown ──────────────────────── */}
              {tab === 'overview' && (
                <div className="space-y-4">
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">Cost Breakdown</p>
                    {[
                      { label: 'Band (3 hrs)', key: 'cost_band_brl', val: data.costs.band },
                      { label: 'DJ', key: 'cost_dj_brl', val: data.costs.dj },
                      { label: 'Bundle per person', key: 'cost_bundle_per_person_brl', val: data.costs.bundlePerHead },
                      { label: 'Promo spend (local)', key: 'cost_promo_local_brl', val: data.costs.promoLocal },
                      { label: 'Promo spend (Instagram)', key: 'cost_promo_instagram_brl', val: data.costs.promoInstagram },
                    ].map(item => (
                      <div key={item.key} className="flex items-center gap-2 mb-2">
                        <span className="text-white/60 text-sm flex-1">{item.label}</span>
                        <input
                          type="number" value={editingConfig[item.key] ?? item.val}
                          onChange={e => setEditingConfig(c => ({ ...c, [item.key]: e.target.value }))}
                          className="w-24 rounded-lg px-2 py-1 text-white text-sm text-right outline-none"
                          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                        />
                        <button onClick={() => handleSaveConfig(item.key)} disabled={configSaving === item.key}
                          className="text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 px-2 py-1">
                          {configSaving === item.key ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                        </button>
                      </div>
                    ))}
                    <div className="border-t border-white/10 mt-3 pt-3 space-y-1 text-sm">
                      <div className="flex justify-between text-white/40">
                        <span>Bundle total ({s!.totalConfirmed} × R${data.costs.bundlePerHead})</span>
                        <span>R${data.costs.bundleTotal}</span>
                      </div>
                      <div className="flex justify-between text-white/40">
                        <span>Promoter commissions</span>
                        <span>R${data.costs.promoCommissions}</span>
                      </div>
                      <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2 mt-2">
                        <span>Total costs</span>
                        <span>R${s!.totalCostsBrl.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket cap config */}
                  <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex-1">
                      <p className="text-white/60 text-sm">Ticket Cap</p>
                      <p className="text-white/30 text-xs">Raise if demand exceeds expectations</p>
                    </div>
                    <input type="number" value={editingConfig['ticket_cap'] ?? s!.ticketCap}
                      onChange={e => setEditingConfig(c => ({ ...c, ticket_cap: e.target.value }))}
                      className="w-20 rounded-lg px-2 py-1 text-white text-sm text-right outline-none"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                    <button onClick={() => handleSaveConfig('ticket_cap')} disabled={configSaving === 'ticket_cap'}
                      className="text-xs text-amber-400 hover:text-amber-300 px-2 py-1">
                      {configSaving === 'ticket_cap' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── PROMOTERS ──────────────────────────────────────── */}
              {tab === 'promoters' && (
                <div className="space-y-4">
                  {/* Create promoter form */}
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <p className="text-amber-400/80 text-xs uppercase tracking-widest font-semibold mb-4">Add Promoter</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                      <input placeholder="Full name" value={newPName} onChange={e => setNewPName(e.target.value)}
                        className="rounded-xl px-3 py-2 text-white text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                      <input placeholder="Code (e.g. JOÃO10)" value={newPCode} onChange={e => setNewPCode(e.target.value.toUpperCase())}
                        className="rounded-xl px-3 py-2 text-white text-sm outline-none uppercase"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                      <input placeholder="Commission (BRL)" type="number" value={newPComm} onChange={e => setNewPComm(e.target.value)}
                        className="rounded-xl px-3 py-2 text-white text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                    <button onClick={handleCreatePromoter} disabled={newPLoading || !newPName.trim() || !newPCode.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-900 font-bold text-sm disabled:opacity-40 transition-all hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                      {newPLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Promoter
                    </button>
                    {newPMsg && <p className={`text-xs mt-2 ${newPMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{newPMsg.text}</p>}
                  </div>

                  {/* Promoter list */}
                  <div className="space-y-2">
                    {data.promoters.length === 0 && <p className="text-white/30 text-sm text-center py-4">No promoters yet.</p>}
                    {data.promoters.map(p => (
                      <div key={p.id} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', opacity: p.isActive ? 1 : 0.5 }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-semibold text-sm">{p.name}</p>
                            <span className="text-amber-400 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded-full">{p.code}</span>
                          </div>
                          <p className="text-white/40 text-xs mt-0.5">{p.ticketsSold} sold · R${p.totalCommission} commission owed · R${p.commissionRate}/ticket</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`/promoter/${p.code}`} target="_blank" rel="noopener noreferrer"
                            className="text-white/30 hover:text-white/60 transition-colors p-1">
                            <Eye className="w-4 h-4" />
                          </a>
                          <button onClick={() => handleTogglePromoter(p.id, p.isActive)}
                            className="text-white/30 hover:text-white/60 transition-colors p-1">
                            {p.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── PROMO CODES ────────────────────────────────────── */}
              {tab === 'codes' && (
                <div className="space-y-4">
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <p className="text-amber-400/80 text-xs uppercase tracking-widest font-semibold mb-4">Add Guest / VIP Code</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input placeholder="Code (e.g. RYAN-GUEST)" value={newCCode} onChange={e => setNewCCode(e.target.value.toUpperCase())}
                        className="rounded-xl px-3 py-2 text-white text-sm outline-none uppercase"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }} />
                      <select value={newCType} onChange={e => setNewCType(e.target.value as 'guest' | 'vip')}
                        className="rounded-xl px-3 py-2 text-white text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <option value="guest">Guest — R$150</option>
                        <option value="vip">VIP — Free</option>
                      </select>
                    </div>
                    <button onClick={handleCreateCode} disabled={newCLoading || !newCCode.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-900 font-bold text-sm disabled:opacity-40 transition-all hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                      {newCLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Code
                    </button>
                    {newCMsg && <p className={`text-xs mt-2 ${newCMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{newCMsg.text}</p>}
                  </div>
                  <div className="space-y-2">
                    {data.promoCodes.length === 0 && <p className="text-white/30 text-sm text-center py-4">No codes yet.</p>}
                    {data.promoCodes.map(c => (
                      <div key={c.code} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', opacity: c.isActive ? 1 : 0.4 }}>
                        <p className="text-amber-400 font-bold text-sm flex-1">{c.code}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.type === 'vip' ? 'text-rose-300 bg-rose-400/10' : 'text-emerald-300 bg-emerald-400/10'}`}>
                          {c.type === 'vip' ? 'VIP · FREE' : 'Guest · R$150'}
                        </span>
                        {c.isActive && (
                          <button onClick={() => handleDeleteCode(c.code)} className="text-red-400/50 hover:text-red-400 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── GUEST LIST ─────────────────────────────────────── */}
              {tab === 'guests' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button onClick={exportCSV}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-900 font-bold text-sm transition-all hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>
                  {data.guestList.length === 0 && <p className="text-white/30 text-sm text-center py-8">No tickets yet.</p>}
                  {data.guestList.map(g => (
                    <div key={g.id} className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white font-semibold text-sm">{g.fullName}</p>
                            <span className={`text-xs font-semibold capitalize ${TIER_COLORS[g.tier] || 'text-white/60'}`}>{g.tier}</span>
                            {g.quantity > 1 && <span className="text-white/30 text-xs">×{g.quantity}</span>}
                          </div>
                          <p className="text-white/40 text-xs mt-0.5">{g.whatsapp}{g.email ? ` · ${g.email}` : ''}</p>
                          {g.promoterName && <p className="text-amber-400/60 text-xs">via {g.promoterName} ({g.promoCode})</p>}
                          {g.promoCode && !g.promoterName && <p className="text-emerald-400/60 text-xs">code: {g.promoCode}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs font-semibold ${STATUS_COLORS[g.paymentStatus] || 'text-white/40'}`}>
                            {g.paymentStatus}
                          </span>
                          <p className="text-white/20 text-xs">{g.paymentMethod}</p>
                          {g.paymentStatus === 'pending' && (
                            <button onClick={() => setConfirmTicketId(g.id)}
                              className="mt-1 text-xs text-amber-400 hover:text-amber-300 underline">
                              Confirm
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Confirm PIX modal */}
          {confirmTicketId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
              <div className="rounded-2xl p-6 w-full max-w-sm space-y-4" style={{ background: '#1e293b', border: '1px solid rgba(251,191,36,0.3)' }}>
                <p className="text-white font-bold text-lg">Confirm PIX Payment?</p>
                <p className="text-white/50 text-sm">This will mark the ticket as confirmed and the attendee will receive entry.</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmTicketId(null)} className="flex-1 py-2 rounded-xl text-white/60 text-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                  <button onClick={() => handleConfirmTicket(confirmTicketId)} disabled={confirmingTicket}
                    className="flex-1 py-2 rounded-xl text-slate-900 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    {confirmingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
