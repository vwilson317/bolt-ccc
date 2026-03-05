/**
 * CoastalClubPassPage — dedicated sign-up page for the CCC All-Access Pass.
 *
 * Prototype/test: shows R$30/month pricing but performs NO real payment processing.
 * Clicking the CTA simply unlocks the CCC badge locally.
 *
 * A/B test: 50% of visitors see "Assinar por R$30/mês" as the primary CTA,
 * the other 50% see "Não sei" — both unlock the badge identically.
 */
import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  MapPin,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { BARRACA_PROMOS } from '../data/barracaPromos';
import {
  CCC_PASS_ID,
  CCC_PASS_STORAGE_KEY,
  CCC_PASS_IDENTIFIER_KEY,
} from '../data/cccPass';
import { useBadgeContext } from '../contexts/BadgeContext';
import { trackEvent } from '../services/posthogAnalyticsService';
import SEOHead from '../components/SEOHead';
import { CCC_WHATSAPP_URL } from '../data/barracaPromos';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Maps a Tailwind colour name (e.g. "emerald-500") to a CSS hex value. */
function twColorToHex(name: string): string {
  const map: Record<string, string> = {
    'emerald-500': '#10b981',
    'teal-500': '#14b8a6',
    'yellow-500': '#eab308',
    'amber-600': '#d97706',
    'zinc-400': '#a1a1aa',
    'zinc-600': '#52525b',
    'slate-400': '#94a3b8',
    'slate-600': '#475569',
    'blue-500': '#3b82f6',
    'indigo-600': '#4f46e5',
    'orange-500': '#f97316',
    'red-600': '#dc2626',
    'purple-500': '#a855f7',
    'violet-600': '#7c3aed',
    'green-500': '#22c55e',
    'lime-500': '#84cc16',
    'emerald-700': '#047857',
    'rose-500': '#f43f5e',
    'rose-600': '#e11d48',
    'pink-500': '#ec4899',
    'pink-600': '#db2777',
  };
  return map[name] ?? '#6b7280';
}

function barracaGradient(fromColor: string, toColor: string): React.CSSProperties {
  return {
    background: `linear-gradient(to bottom right, ${twColorToHex(fromColor)}, ${twColorToHex(toColor)})`,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ActivePassView: React.FC<{ activeBarracas: typeof BARRACA_PROMOS }> = ({
  activeBarracas,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-28 pb-16">
    <div className="mx-auto max-w-lg px-4">
      {/* Badge */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full shadow-2xl ring-8 ring-pink-100"
          style={{ background: 'linear-gradient(to bottom right, #ec4899, #e11d48)' }}>
          <Award className="h-16 w-16 text-white" strokeWidth={1.5} />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-1.5 text-sm font-bold text-pink-700 mb-4">
          <CheckCircle2 className="h-4 w-4" />
          PASSE ATIVO
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Carioca Coastal Club</h1>
        <p className="text-gray-500 mb-8">
          Seu passe all-access está ativo! Aproveite descontos em todas as barracas parceiras.
        </p>
      </div>

      {/* Partner list */}
      <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
          Barracas incluídas
        </p>
        <div className="space-y-3">
          {activeBarracas.map((b) => (
            <div key={b.id} className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-full flex-shrink-0 flex items-center justify-center shadow"
                style={barracaGradient(b.badgeFromColor, b.badgeToColor)}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 leading-tight">{b.name}</p>
                <p className="text-xs text-gray-400">{b.barracaLocation}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-gray-400">
        Seu badge aparece no botão flutuante no canto inferior direito ↘
      </p>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const CoastalClubPassPage: React.FC = () => {
  const { unlockBadge, unlockedIds } = useBadgeContext();
  const hasPass = unlockedIds.has(CCC_PASS_ID);

  const [identifier, setIdentifier] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(CCC_PASS_IDENTIFIER_KEY) ?? '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // A/B test variant picked once at mount
  const abVariant = useMemo<'subscribe' | 'dunno'>(
    () => (Math.random() < 0.5 ? 'subscribe' : 'dunno'),
    [],
  );

  const activeBarracas = BARRACA_PROMOS.filter((b) => b.active);
  const allBarracas = BARRACA_PROMOS;

  const handleSignUp = () => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      setError('Por favor, insira seu e-mail ou telefone para continuar.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // No real payment — just activate the badge locally
    window.localStorage.setItem(CCC_PASS_STORAGE_KEY, 'true');
    window.localStorage.setItem(CCC_PASS_IDENTIFIER_KEY, trimmed);
    unlockBadge(CCC_PASS_ID);

    trackEvent('ccc_pass_signup_completed', {
      ab_variant: abVariant,
    });

    setIsSubmitting(false);
  };

  const seoTitle = 'Carioca Coastal Club Pass — Passe All-Access · R$30/mês';
  const seoDescription =
    `Acesso ilimitado a ${activeBarracas.length} barracas parceiras no Rio de Janeiro por apenas R$30 por mês. Badge exclusivo do Carioca Coastal Club.`;

  if (hasPass) {
    return (
      <>
        <SEOHead title={seoTitle} description={seoDescription} />
        <ActivePassView activeBarracas={activeBarracas} />
      </>
    );
  }

  return (
    <>
      <SEOHead title={seoTitle} description={seoDescription} />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-28 pb-24"
        style={{ background: 'linear-gradient(135deg, #ec4899 0%, #e11d48 60%, #be185d 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-lg px-4 text-center text-white">
          {/* Badge icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 shadow-xl">
            <Award className="h-11 w-11 text-white" strokeWidth={1.5} />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold uppercase tracking-widest mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            PASSE ALL-ACCESS
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight">
            Carioca<br />Coastal Club
          </h1>
          <p className="text-lg font-medium opacity-90 mb-2">
            Acesso total a todas as barracas parceiras
          </p>
          <div className="flex items-center justify-center gap-2 opacity-75 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{activeBarracas.length} barracas ativas · Rio de Janeiro</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="bg-gradient-to-b from-pink-50 via-white to-white pb-20">
        <div className="mx-auto max-w-lg px-4">

          {/* Pricing + Sign-up card (overlaps hero) */}
          <div className="-mt-10 rounded-3xl bg-white shadow-2xl border border-pink-100 p-8 mb-8">
            {/* Price */}
            <div className="text-center mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl font-bold text-gray-400">R$</span>
                <span className="text-7xl font-black text-gray-900 leading-none">30</span>
                <span className="text-xl text-gray-400 self-end mb-1">/mês</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Passe All-Inclusive · Cancele quando quiser</p>
            </div>

            {/* Benefits */}
            <ul className="space-y-3 mb-8">
              {[
                `Desconto exclusivo em ${activeBarracas.length} barracas parceiras`,
                'Badge digital do Carioca Coastal Club',
                'Válido durante toda a temporada',
                'Comunidade WhatsApp com outros membros',
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-pink-100 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-pink-600" />
                  </div>
                  <span className="text-gray-700 text-sm">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* Sign-up form */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Seu e-mail ou telefone
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                placeholder="email@exemplo.com ou (21) 99999-9999"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100 transition-colors"
              />

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <X className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </p>
              )}

              <button
                onClick={handleSignUp}
                disabled={isSubmitting}
                className="w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #ec4899, #e11d48)' }}
              >
                {isSubmitting
                  ? 'Ativando…'
                  : abVariant === 'subscribe'
                  ? 'Assinar por R$30/mês'
                  : 'Não sei'}
              </button>

              <p className="text-center text-xs text-gray-400">
                Teste sem compromisso · Nenhuma cobrança será feita agora
              </p>
            </div>
          </div>

          {/* Social proof */}
          <div className="rounded-2xl bg-pink-50 border border-pink-100 p-5 mb-8 text-center">
            <div className="flex justify-center gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-pink-400 text-pink-400" />
              ))}
            </div>
            <p className="text-sm font-medium text-gray-700">
              "A melhor forma de curtir o verão carioca."
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-400">
              <Users className="h-3.5 w-3.5" />
              <span>Comunidade CCC</span>
            </div>
          </div>

          {/* Partner barracas */}
          <div className="mb-8">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-pink-500" />
              Barracas incluídas no passe
            </h2>

            <div className="space-y-3">
              {allBarracas.map((b) => (
                <div
                  key={b.id}
                  className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-opacity ${
                    b.active ? 'border-gray-100' : 'border-gray-100 opacity-55'
                  }`}
                >
                  <div
                    className="flex-shrink-0 h-11 w-11 rounded-full flex items-center justify-center shadow"
                    style={barracaGradient(b.badgeFromColor, b.badgeToColor)}
                  >
                    <Sparkles className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 leading-tight">{b.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{b.barracaLocation}</p>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      b.active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {b.active ? 'Ativo' : 'Em breve'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <button
              onClick={handleSignUp}
              disabled={isSubmitting}
              className="w-full rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-60"
              style={{ background: 'linear-gradient(to right, #ec4899, #e11d48)' }}
            >
              {abVariant === 'subscribe' ? 'Assinar por R$30/mês' : 'Não sei'}
            </button>
            <p className="text-xs text-gray-400 mt-3">
              Teste sem compromisso · Nenhuma cobrança será feita agora
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoastalClubPassPage;
