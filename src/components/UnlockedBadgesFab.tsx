/**
 * UnlockedBadgesFab — global floating action button that shows all
 * badges the user has unlocked across every barraca promo, plus the
 * CCC All-Access Pass if active.
 *
 * • 0 badges unlocked → renders nothing
 * • 1 badge          → single FAB → badge lightbox with code + wallet action
 * • 2+ badges        → stacked FAB with count chip → badge tray → individual lightbox
 *
 * The CCC All-Access Pass badge always appears first in the tray.
 *
 * The FAB is draggable horizontally along the bottom of the screen and
 * defaults to the right side. It pulses to indicate it is clickable.
 */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Award, CheckCircle2, Sparkles, Wallet, X, Ticket } from 'lucide-react';
import { BARRACA_PROMOS, type BarracaPromoConfig } from '../data/barracaPromos';
import { CCC_PASS_CONFIG, CCC_PASS_ID } from '../data/cccPass';
import { useBadgeContext } from '../contexts/BadgeContext';
import { trackEvent } from '../services/posthogAnalyticsService';

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function detectIOSChrome(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /CriOS/i.test(navigator.userAgent);
}

// ---------------------------------------------------------------------------
// CCC All-Access Pass lightbox
// ---------------------------------------------------------------------------
interface CCCPassLightboxProps {
  onClose: () => void;
}

const BADGE_DISPLAY_LIMIT = 5;

const CCCPassLightbox: React.FC<CCCPassLightboxProps> = ({ onClose }) => {
  const activeBarracas = BARRACA_PROMOS.filter((b) => b.active);
  const [showAll, setShowAll] = useState(false);

  const visibleBarracas = showAll ? activeBarracas : activeBarracas.slice(0, BADGE_DISPLAY_LIMIT);
  const hiddenCount = activeBarracas.length - BADGE_DISPLAY_LIMIT;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-6 w-full max-w-sm rounded-3xl p-8 text-white shadow-2xl text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ec4899 0%, #e11d48 100%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/10 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/40">
            <Award className="h-14 w-14 text-white" strokeWidth={1.5} />
          </div>

          <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="mr-1.5 h-3 w-3" />
            PASSE ALL-ACCESS
          </div>

          <p className="text-2xl font-black mb-1">Carioca Coastal Club</p>
          <p className="text-sm opacity-75 mb-5">
            Passe ativo em {activeBarracas.length} barracas parceiras
          </p>

          <div className="rounded-2xl bg-white/15 px-4 py-4 text-left">
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-3">
              Barracas incluídas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visibleBarracas.map((b) => (
                <span
                  key={b.id}
                  className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold"
                >
                  {b.name}
                </span>
              ))}
            </div>
            {!showAll && hiddenCount > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="mt-3 text-xs font-semibold opacity-80 hover:opacity-100 underline underline-offset-2 transition-opacity"
              >
                +{hiddenCount} mais
              </button>
            )}
          </div>

          <p className="mt-5 text-xs opacity-40">Toque fora para fechar</p>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Single-badge lightbox (per-barraca promos)
// ---------------------------------------------------------------------------
interface BadgeLightboxProps {
  barraca: BarracaPromoConfig;
  onClose: () => void;
}

const TIER_DISPLAY: Record<string, string> = {
  general:    'General Admission',
  guest:      "Ryan's Guest",
  vip:        "VIP",
  promoter:   'Promoter',
  early_bird: 'Early Bird',
};

interface EventTicketMeta { eventName: string; eventDate: string; tier: string; quantity: number; }

function readEventTicket(storageKey: string): EventTicketMeta | null {
  try {
    const raw = localStorage.getItem(`${storageKey}_ticket`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const BadgeLightbox: React.FC<BadgeLightboxProps> = ({ barraca, onClose }) => {
  const [walletMessage, setWalletMessage] = useState('');
  const eventTicket = readEventTicket(barraca.storageKey);
  const isIOS = detectIOS();

  const handleWallet = async () => {
    trackEvent('barraca_promo_fab_wallet_clicked', { barraca_promo_id: barraca.id });

    if (isIOS) {
      const url = `/.netlify/functions/generate-pkpass?barracaPromoId=${encodeURIComponent(barraca.id)}`;
      if (detectIOSChrome()) {
        window.open(url, '_blank', 'noopener');
      } else {
        window.location.href = url;
      }
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
        className="relative mx-6 w-full max-w-sm rounded-3xl p-8 text-white shadow-2xl text-center"
        style={{ backgroundColor: barraca.passBackgroundRgb }}
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
          {eventTicket ? (
            <Ticket className="h-14 w-14 text-white" strokeWidth={1.5} />
          ) : (
            <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={1.5} />
          )}
        </div>

        <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="mr-1.5 h-3 w-3" />
          {eventTicket ? 'EVENT TICKET' : 'VERIFIED SUPPORTER'}
        </div>

        <p className="text-lg font-bold mb-1">{barraca.name}</p>

        {/* Event ticket info — shown when badge was claimed via ticket purchase */}
        {eventTicket ? (
          <>
            <div className="my-4 rounded-2xl bg-white/20 px-5 py-4 text-left space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">🎉 {eventTicket.eventName}</p>
              <p className="text-sm font-bold opacity-90">
                {new Date(eventTicket.eventDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-sm opacity-80">
                {TIER_DISPLAY[eventTicket.tier] ?? eventTicket.tier}
                {eventTicket.quantity > 1 && ` · ${eventTicket.quantity} tickets`}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-3">
              <p className="text-xs opacity-60 mb-0.5">Discount Code</p>
              <p className="text-2xl font-black tracking-wider">{barraca.discountCode}</p>
            </div>
          </>
        ) : (
          <>
            <div className="my-5 rounded-2xl bg-white/20 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
                Discount Code
              </p>
              <p className="text-5xl font-black tracking-wider">{barraca.discountCode}</p>
            </div>
            <p className="text-sm opacity-80">
              Show this code at {barraca.name}'s barraca in {barraca.barracaLocation}.
            </p>
          </>
        )}

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
                className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: b.passBackgroundRgb }}
              >
                {b.id === CCC_PASS_ID ? (
                  <Award className="h-4 w-4 text-white" />
                ) : (
                  <Sparkles className="h-4 w-4 text-white" />
                )}
              </span>
              <div className="min-w-0">
                {b.id === CCC_PASS_ID ? (
                  <>
                    <p className="font-semibold text-gray-900 truncate">Carioca Coastal Club</p>
                    <p className="text-sm text-gray-500">Passe All-Access</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900 truncate">@{b.instagramHandle}</p>
                    <p className="text-sm text-gray-500 font-mono">{b.discountCode}</p>
                  </>
                )}
              </div>
              <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500 flex-shrink-0" />
            </button>
          </li>
        ))}
      </ul>

      <div className="px-6 py-4 bg-gray-50">
        <p className="text-xs text-gray-400 text-center">
          Tap a badge to view your pass
        </p>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
const FAB_SIZE = 56; // h-14 w-14 = 56px
const FAB_BOTTOM = 20;

const UnlockedBadgesFab: React.FC = () => {
  const { unlockedIds } = useBadgeContext();
  const [trayOpen, setTrayOpen] = useState(false);
  const [activeLightbox, setActiveLightbox] = useState<BarracaPromoConfig | null>(null);
  const [cccPassOpen, setCCCPassOpen] = useState(false);

  // Draggable position — defaults to right side
  const [posX, setPosX] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth - FAB_SIZE - FAB_BOTTOM : 20
  );
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);
  const posStartX = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    posStartX.current = posX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > 4) {
      hasDragged.current = true;
    }
    const maxX = window.innerWidth - FAB_SIZE - FAB_BOTTOM;
    const newX = Math.max(FAB_BOTTOM, Math.min(maxX, posStartX.current + deltaX));
    setPosX(newX);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const hasCCCPass = unlockedIds.has(CCC_PASS_ID);
  const unlockedBarracas = BARRACA_PROMOS.filter((b) => unlockedIds.has(b.id));

  // CCC pass always comes first
  const allBadges: BarracaPromoConfig[] = [
    ...(hasCCCPass ? [CCC_PASS_CONFIG] : []),
    ...unlockedBarracas,
  ];

  if (allBadges.length === 0) return null;

  const openBadge = (barraca: BarracaPromoConfig) => {
    setTrayOpen(false);
    if (barraca.id === CCC_PASS_ID) {
      setCCCPassOpen(true);
      trackEvent('ccc_pass_fab_badge_opened', {});
    } else {
      setActiveLightbox(barraca);
      trackEvent('barraca_promo_fab_badge_opened', { barraca_promo_id: barraca.id });
    }
  };

  const handleFabClick = () => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    if (allBadges.length === 1) {
      openBadge(allBadges[0]);
    } else {
      setTrayOpen(true);
      trackEvent('barraca_promo_fab_tray_opened', { count: allBadges.length });
    }
  };

  const primary = allBadges[0];

  return createPortal(
    <>
      {/* FAB — draggable along the bottom, defaults to right side */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleFabClick}
        style={{ left: posX, bottom: FAB_BOTTOM, backgroundColor: primary.passBackgroundRgb }}
        className="fixed z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer active:cursor-grabbing select-none touch-none"
        aria-label="Show your badges"
        title="Tap to view your badges"
      >
        {/* Pulse ring animation */}
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-40 pointer-events-none"
          style={{ backgroundColor: primary.passBackgroundRgb }}
        />
        {primary.id === CCC_PASS_ID ? (
          <Award className="h-6 w-6 text-white relative z-10" />
        ) : (
          <Sparkles className="h-6 w-6 text-white relative z-10" />
        )}
        {allBadges.length > 1 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-gray-800 shadow z-10">
            {allBadges.length}
          </span>
        )}
      </button>

      {trayOpen && (
        <BadgeTray
          barracas={allBadges}
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

      {cccPassOpen && (
        <CCCPassLightbox onClose={() => setCCCPassOpen(false)} />
      )}
    </>,
    document.body,
  );
};

export default UnlockedBadgesFab;
