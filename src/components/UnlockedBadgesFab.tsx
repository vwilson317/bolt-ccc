/**
 * UnlockedBadgesFab — global floating action button that shows all
 * badges the user has unlocked across every barraca promo.
 *
 * • 0 badges unlocked → renders nothing
 * • 1 badge          → single teal FAB → badge lightbox with code + wallet action
 * • 2+ badges        → stacked FAB with count chip → badge tray → individual lightbox
 */
import React, { useState } from 'react';
import { CheckCircle2, Sparkles, Wallet, X } from 'lucide-react';
import { BARRACA_PROMOS, type BarracaPromoConfig } from '../data/barracaPromos';
import { useBadgeContext } from '../contexts/BadgeContext';
import { trackEvent } from '../services/posthogAnalyticsService';

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// ---------------------------------------------------------------------------
// Single-badge lightbox
// ---------------------------------------------------------------------------
interface BadgeLightboxProps {
  barraca: BarracaPromoConfig;
  onClose: () => void;
}

const BadgeLightbox: React.FC<BadgeLightboxProps> = ({ barraca, onClose }) => {
  const [walletMessage, setWalletMessage] = useState('');
  const isIOS = detectIOS();

  const handleWallet = async () => {
    trackEvent('barraca_promo_fab_wallet_clicked', { barraca_promo_id: barraca.id });

    if (isIOS) {
      const url = `/.netlify/functions/generate-pkpass?barracaPromoId=${encodeURIComponent(barraca.id)}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `${barraca.discountCode}.pkpass`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setWalletMessage('Opening Apple Wallet…');
      setTimeout(() => setWalletMessage(''), 4000);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${barraca.name}'s Barraca Discount`,
          text: `Use code ${barraca.discountCode} at @${barraca.instagramHandle}`,
        });
        setWalletMessage('Shared!');
        setTimeout(() => setWalletMessage(''), 3000);
        return;
      } catch {
        // fall through
      }
    }

    try {
      await navigator.clipboard.writeText(barraca.discountCode);
      setWalletMessage('Code copied!');
    } catch {
      setWalletMessage('Code copied!');
    }
    setTimeout(() => setWalletMessage(''), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative mx-6 w-full max-w-sm rounded-3xl bg-gradient-to-br from-${barraca.badgeFromColor} to-${barraca.badgeToColor} p-8 text-white shadow-2xl text-center`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/40">
          <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={1.5} />
        </div>

        <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="mr-1.5 h-3 w-3" />
          VERIFIED SUPPORTER
        </div>

        <p className="text-lg font-bold mb-1">@{barraca.instagramHandle}</p>

        <div className="my-5 rounded-2xl bg-white/20 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
            Discount Code
          </p>
          <p className="text-5xl font-black tracking-wider">{barraca.discountCode}</p>
        </div>

        <p className="text-sm opacity-80">
          Show this code at {barraca.name}'s barraca in {barraca.barracaLocation}.
        </p>

        <button
          onClick={handleWallet}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors"
        >
          <Wallet className="h-4 w-4" />
          {isIOS ? 'Add to Apple Wallet' : 'Copy / Share Code'}
        </button>

        {walletMessage && (
          <p className="mt-2 text-xs font-medium opacity-80">{walletMessage}</p>
        )}

        <p className="mt-4 text-xs opacity-40">Tap outside to dismiss</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Badge tray — shown when multiple badges are unlocked
// ---------------------------------------------------------------------------
interface BadgeTrayProps {
  barracas: BarracaPromoConfig[];
  onSelectBarraca: (barraca: BarracaPromoConfig) => void;
  onClose: () => void;
}

const BadgeTray: React.FC<BadgeTrayProps> = ({ barracas, onSelectBarraca, onClose }) => (
  <div
    className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="mb-24 mx-4 w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Your Badges
          </p>
          <p className="text-lg font-bold text-gray-900">
            {barracas.length} Active Passes
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <ul className="divide-y divide-gray-100">
        {barracas.map((b) => (
          <li key={b.id}>
            <button
              onClick={() => onSelectBarraca(b)}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
            >
              <span
                className={`flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-${b.badgeFromColor} to-${b.badgeToColor} flex items-center justify-center`}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">@{b.instagramHandle}</p>
                <p className="text-sm text-gray-500 font-mono">{b.discountCode}</p>
              </div>
              <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500 flex-shrink-0" />
            </button>
          </li>
        ))}
      </ul>

      <div className="px-6 py-4 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">
          Tap a badge to view your discount code
        </p>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
const UnlockedBadgesFab: React.FC = () => {
  const { unlockedIds } = useBadgeContext();
  const [trayOpen, setTrayOpen] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState<BarracaPromoConfig | null>(null);

  const unlockedBarracas = BARRACA_PROMOS.filter((b) => unlockedIds.has(b.id));

  if (unlockedBarracas.length === 0) return null;

  const openBadge = (barraca: BarracaPromoConfig) => {
    setTrayOpen(false);
    setActiveLightbox(barraca);
    trackEvent('barraca_promo_fab_badge_opened', { barraca_promo_id: barraca.id });
  };

  const handleFabClick = () => {
    if (unlockedBarracas.length === 1) {
      openBadge(unlockedBarracas[0]);
    } else {
      setTrayOpen(true);
      trackEvent('barraca_promo_fab_tray_opened', { count: unlockedBarracas.length });
    }
  };

  const primary = unlockedBarracas[0];

  return (
    <>
      {/* FAB */}
      <button
        onClick={handleFabClick}
        className={`fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-${primary.badgeFromColor} to-${primary.badgeToColor} shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
        aria-label="Show your barraca discount badges"
      >
        <Sparkles className="h-6 w-6 text-white" />
        {unlockedBarracas.length > 1 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-gray-800 shadow">
            {unlockedBarracas.length}
          </span>
        )}
      </button>

      {trayOpen && (
        <BadgeTray
          barracas={unlockedBarracas}
          onSelectBarraca={openBadge}
          onClose={() => setTrayOpen(false)}
        />
      )}

      {activeLightbox && (
        <BadgeLightbox
          barraca={activeLightbox}
          onClose={() => setActiveLightbox(null)}
        />
      )}
    </>
  );
};

export default UnlockedBadgesFab;
