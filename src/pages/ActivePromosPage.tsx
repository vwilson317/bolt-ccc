/**
 * ActivePromosPage — lists every currently-active barraca promo badge.
 * Accessible at /loyalty/promos.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, MapPin, Sparkles } from 'lucide-react';
import { BARRACA_PROMOS } from '../data/barracaPromos';
import SEOHead from '../components/SEOHead';

function barracaGradientStyle(from: string, to: string): React.CSSProperties {
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
  const f = map[from] ?? '#6b7280';
  const t = map[to] ?? '#6b7280';
  return { background: `linear-gradient(to bottom right, ${f}, ${t})` };
}

const ActivePromosPage: React.FC = () => {
  const activePromos = BARRACA_PROMOS.filter((b) => b.active);

  return (
    <>
      <SEOHead
        title="Active Promo Badges · Carioca Coastal Club"
        description={`${activePromos.length} active barraca promo badges available now in Rio de Janeiro.`}
      />

      {/* Header */}
      <div
        className="pt-28 pb-16 text-center text-white"
        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 60%, #e11d48 100%)' }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
          <Gift className="h-9 w-9 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-black mb-2">Active Promo Badges</h1>
        <p className="text-white/80 text-sm">
          {activePromos.length} barraca{activePromos.length !== 1 ? 's' : ''} with live discounts
        </p>
      </div>

      {/* List */}
      <div className="bg-gradient-to-b from-amber-50 via-white to-white min-h-screen pb-20">
        <div className="mx-auto max-w-lg px-4 -mt-6">
          {activePromos.length === 0 ? (
            <div className="rounded-3xl bg-white shadow-sm border border-gray-100 p-10 text-center text-gray-400 mt-6">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No active promos right now.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activePromos.map((b) => (
                <Link
                  key={b.id}
                  to={`/loyalty/${b.slug}`}
                  className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center shadow"
                    style={barracaGradientStyle(b.badgeFromColor, b.badgeToColor)}
                  >
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 leading-tight">{b.name}</p>
                    <p className="text-sm text-gray-500">@{b.instagramHandle}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {b.barracaLocation}
                    </div>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-bold">
                    Active
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              to="/loyalty/coastal-club-pass"
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition-transform"
              style={{ background: 'linear-gradient(to right, #ec4899, #e11d48)' }}
            >
              <Gift className="h-4 w-4" />
              Get the All-Access Pass
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivePromosPage;
