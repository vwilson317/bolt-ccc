/**
 * BarracaPromotion — generic Instagram-follow → badge → discount-pass flow.
 *
 * Supports every barraca in the promo registry. Pass a BarracaPromoConfig
 * and it handles:
 *  • Instagram follow step
 *  • Identifier claim / restore
 *  • Apple Wallet PKPass download on iOS
 *  • Web Share API / clipboard fallback on other platforms
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Gift, Instagram, CheckCircle2, Sparkles, Wallet } from 'lucide-react';
import { trackEvent } from '../services/posthogAnalyticsService';
import { PromoClaimService } from '../services/promoClaimService';
import { useBadgeContext } from '../contexts/BadgeContext';
import type { BarracaPromoConfig } from '../data/barracaPromos';

// ---------------------------------------------------------------------------
// iOS detection helpers
// ---------------------------------------------------------------------------
function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

// Chrome on iOS uses a WKWebView that does NOT intercept .pkpass via
// window.location.href navigation the way Safari does, so it ends up showing
// a blank page. Detect it so we can open a new tab instead.
function detectIOSChrome(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /CriOS/i.test(navigator.userAgent);
}

// ---------------------------------------------------------------------------
// Per-barraca panel colour scheme (avoids hardcoded emerald/teal for every
// barraca — Tailwind would purge dynamically-assembled class names anyway).
// ---------------------------------------------------------------------------
interface PanelColors {
  bg: string;
  borderColor: string;
  blob1: string;
  blob2: string;
  badgeBorder: string;
  badgeText: string;
  titleColor: string;
  descColor: string;
  handleGradient: string;
  btnBorder: string;
  btnText: string;
  msgColor: string;
}

function getPanelColors(badgeFromColor: string): PanelColors {
  const family = badgeFromColor.split('-')[0];

  const schemes: Record<string, PanelColors> = {
    emerald: {
      bg: 'linear-gradient(to bottom right, #ecfdf5, #ffffff, #f0fdfa)',
      borderColor: 'rgba(167,243,208,0.7)',
      blob1: 'rgba(167,243,208,0.4)',
      blob2: 'rgba(153,246,228,0.4)',
      badgeBorder: '#6ee7b7',
      badgeText: '#047857',
      titleColor: '#022c22',
      descColor: '#065f46',
      handleGradient: 'linear-gradient(to right, #10b981, #14b8a6)',
      btnBorder: '#6ee7b7',
      btnText: '#047857',
      msgColor: '#047857',
    },
    zinc: {
      bg: 'linear-gradient(to bottom right, #fafafa, #ffffff, #f4f4f5)',
      borderColor: 'rgba(228,228,231,0.7)',
      blob1: 'rgba(228,228,231,0.4)',
      blob2: 'rgba(212,212,216,0.4)',
      badgeBorder: '#d4d4d8',
      badgeText: '#3f3f46',
      titleColor: '#18181b',
      descColor: '#27272a',
      handleGradient: 'linear-gradient(to right, #a1a1aa, #52525b)',
      btnBorder: '#d4d4d8',
      btnText: '#3f3f46',
      msgColor: '#3f3f46',
    },
    yellow: {
      bg: 'linear-gradient(to bottom right, #fefce8, #ffffff, #fef9c3)',
      borderColor: 'rgba(254,240,138,0.7)',
      blob1: 'rgba(254,240,138,0.4)',
      blob2: 'rgba(253,230,138,0.4)',
      badgeBorder: '#fcd34d',
      badgeText: '#b45309',
      titleColor: '#451a03',
      descColor: '#78350f',
      handleGradient: 'linear-gradient(to right, #eab308, #d97706)',
      btnBorder: '#fcd34d',
      btnText: '#b45309',
      msgColor: '#b45309',
    },
    slate: {
      bg: 'linear-gradient(to bottom right, #f8fafc, #ffffff, #f1f5f9)',
      borderColor: 'rgba(226,232,240,0.7)',
      blob1: 'rgba(226,232,240,0.4)',
      blob2: 'rgba(203,213,225,0.4)',
      badgeBorder: '#cbd5e1',
      badgeText: '#334155',
      titleColor: '#0f172a',
      descColor: '#1e293b',
      handleGradient: 'linear-gradient(to right, #94a3b8, #475569)',
      btnBorder: '#cbd5e1',
      btnText: '#334155',
      msgColor: '#334155',
    },
  };

  return schemes[family] ?? schemes.emerald;
}

interface BarracaPromotionProps {
  barraca: BarracaPromoConfig;
  promoSource?: string;
}

const BarracaPromotion: React.FC<BarracaPromotionProps> = ({
  barraca,
  promoSource = 'home_instagram_section',
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { unlockBadge, unlockedIds } = useBadgeContext();

  // hasBadge is derived directly from the badge context — the single source of
  // truth — so it is always in sync with the FAB and never needs a separate
  // local state copy.  BadgeContext is itself initialised from localStorage via
  // a lazy useState, so the value is already correct on the very first render.
  const hasBadge = unlockedIds.has(barraca.id);

  const [hasClickedFollow, setHasClickedFollow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return hasBadge;
  });
  const [identifierInput, setIdentifierInput] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(barraca.identifierStorageKey) || '';
  });
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restoredIdentifier, setRestoredIdentifier] = useState(() => {
    if (typeof window === 'undefined') return '';
    const savedId = window.localStorage.getItem(barraca.identifierStorageKey) || '';
    return hasBadge && savedId ? savedId : '';
  });
  const [walletMessage, setWalletMessage] = useState('');
  const [isIOS] = useState(detectIOS);

  const promoT = (key: string, vars?: Record<string, string>) =>
    t(`home.promo.${key}`, vars ?? {});

  const trackCtx = useMemo(
    () => ({
      promo_id: barraca.id,
      promo_source: promoSource,
      instagram_handle: barraca.instagramHandle,
      page_path: location.pathname,
      full_path: `${location.pathname}${location.search}`,
    }),
    [barraca.id, barraca.instagramHandle, promoSource, location.pathname, location.search],
  );

  // ---------------------------------------------------------------------------
  // Analytics + auto-restore badge from DB (initial state already set above
  // via lazy useState initialisers so there is no flash on first render).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isUnlocked = window.localStorage.getItem(barraca.storageKey) === 'true';
    const savedId = window.localStorage.getItem(barraca.identifierStorageKey) || '';

    trackEvent(`${barraca.id}_promo_viewed`, {
      ...trackCtx,
      badge_previously_unlocked: isUnlocked,
      has_saved_identifier: !!savedId,
    });

    // Nothing to look up — badge already confirmed or no saved identifier.
    if (!savedId || isUnlocked) return;

    let active = true;
    (async () => {
      const claim = await PromoClaimService.findByIdentifier(barraca.id, savedId);
      if (!active) return;

      if (!claim?.badge_unlocked) return;

      setHasClickedFollow(true);
      setRestoredIdentifier(claim.identifier_value);
      window.localStorage.setItem(barraca.storageKey, 'true');
      unlockBadge(barraca.id);

      await PromoClaimService.markLastClaimed(barraca.id, savedId);
      trackEvent(`${barraca.id}_promo_claim_restored`, {
        ...trackCtx,
        restore_source: 'auto_lookup',
        identifier_type: claim.identifier_type,
      });
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Combined: Follow Instagram + Claim badge
  // Validates the identifier first, then opens Instagram and submits the claim.
  // On failure the button stays visible so the user can retry.
  // ---------------------------------------------------------------------------
  const handleFollowAndClaim = async () => {
    setClaimError('');
    setClaimSuccess('');

    const normalized = PromoClaimService.normalizeIdentifier(identifierInput);
    if (!normalized) {
      setClaimError(promoT('messages.invalidIdentifier'));
      trackEvent(`${barraca.id}_promo_invalid_identifier`, trackCtx);
      return;
    }

    // Open Instagram immediately so the browser doesn't block the popup.
    window.open(barraca.instagramUrl, '_blank', 'noopener,noreferrer');
    setHasClickedFollow(true);
    trackEvent(`${barraca.id}_promo_instagram_clicked`, {
      ...trackCtx,
      badge_already_unlocked: hasBadge,
    });

    setIsSubmitting(true);
    trackEvent(`${barraca.id}_promo_identifier_submitted`, {
      ...trackCtx,
      identifier_type: normalized.type,
    });

    try {
      const existing = await PromoClaimService.findByIdentifier(barraca.id, identifierInput);

      if (existing?.badge_unlocked) {
        await PromoClaimService.markLastClaimed(barraca.id, identifierInput);
        _persistBadge(existing.identifier_value);
        setRestoredIdentifier(existing.identifier_value);
        setClaimSuccess(promoT('messages.restored'));
        trackEvent(`${barraca.id}_promo_claim_restored`, {
          ...trackCtx,
          restore_source: 'manual_lookup',
          identifier_type: existing.identifier_type,
        });
        return;
      }

      const result = await PromoClaimService.claimOrRestore(barraca.id, identifierInput, {
        followConfirmed: true,
        unlockBadge: true,
        metadata: {
          promo_source: promoSource,
          instagram_handle: barraca.instagramHandle,
        },
      });

      if (!result.claim?.badge_unlocked) {
        _persistBadge(identifierInput.trim());
        setClaimSuccess(promoT('messages.claimedFallback'));
        trackEvent(`${barraca.id}_promo_claim_local_fallback`, trackCtx);
        return;
      }

      _persistBadge(result.claim.identifier_value);
      setClaimSuccess(promoT('messages.claimed'));
      trackEvent(`${barraca.id}_promo_badge_unlocked`, {
        ...trackCtx,
        identifier_type: result.claim.identifier_type,
        unlock_status: result.wasExisting ? 'existing_record_unlocked' : 'new_unlock',
      });
    } catch (err) {
      console.error('Error claiming barraca promo badge:', err);
      setClaimError(promoT('messages.genericError'));
      trackEvent(`${barraca.id}_promo_claim_error`, {
        ...trackCtx,
        error_message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const _persistBadge = (identifierValue: string) => {
    setHasClickedFollow(true);
    setIdentifierInput(identifierValue);
    window.localStorage.setItem(barraca.storageKey, 'true');
    window.localStorage.setItem(barraca.identifierStorageKey, identifierValue);
    unlockBadge(barraca.id);
  };

  // ---------------------------------------------------------------------------
  // Add to Wallet
  //  • iOS → download .pkpass from Netlify function (iOS intercepts & opens Wallet)
  //  • Others → Web Share API or clipboard copy
  // ---------------------------------------------------------------------------
  const handleAddToWallet = async () => {
    trackEvent(`${barraca.id}_promo_wallet_clicked`, {
      ...trackCtx,
      promo_code: barraca.discountCode,
      platform: isIOS ? 'ios' : 'other',
    });

    if (isIOS) {
      const url = `/.netlify/functions/generate-pkpass?barracaPromoId=${encodeURIComponent(barraca.id)}`;
      if (detectIOSChrome()) {
        // Chrome on iOS does not intercept .pkpass via page navigation — it
        // renders a blank page instead. Opening a new tab lets the OS-level
        // MIME handler pick up the response without navigating away.
        window.open(url, '_blank', 'noopener');
      } else {
        // Safari: navigate directly so the OS MIME handler opens Wallet.
        // The <a download> attribute bypasses MIME handling in older Safari.
        window.location.href = url;
      }
      setWalletMessage(promoT('messages.walletIOS'));
      trackEvent(`${barraca.id}_promo_wallet_ios_triggered`, trackCtx);
      setTimeout(() => setWalletMessage(''), 4000);
      return;
    }

    const shareText = `${promoT('card.unlockedDescription')} ${barraca.discountCode}.\n@${barraca.instagramHandle}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: promoT('card.unlockedTitle'),
          text: shareText,
        });
        setWalletMessage(promoT('messages.walletAdded'));
        trackEvent(`${barraca.id}_promo_wallet_shared`, trackCtx);
        setTimeout(() => setWalletMessage(''), 3000);
        return;
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(barraca.discountCode);
      setWalletMessage(promoT('messages.walletCopied'));
      trackEvent(`${barraca.id}_promo_wallet_code_copied`, trackCtx);
    } catch {
      setWalletMessage(promoT('messages.walletCopied'));
    }
    setTimeout(() => setWalletMessage(''), 3000);
  };

  const walletButtonLabel = isIOS
    ? promoT('card.addToAppleWallet')
    : promoT('card.addToWallet');

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div id={`${barraca.slug}-promo-offer`} className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-rose-50 p-6 text-left shadow-sm">
      <div className="mb-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
        <Gift className="mr-2 h-4 w-4" />
        {promoT('card.badge')}
      </div>

      <h3 className="text-2xl font-bold text-gray-900">
        {promoT('card.title', { name: barraca.name })}
      </h3>

      <p className="mt-2 text-gray-700">
        {promoT('card.descriptionPrefix')}{' '}
        <span className="font-semibold">@{barraca.instagramHandle}</span>{' '}
        {promoT('card.descriptionSuffix')}
      </p>

      {/* Input + Instagram button — visible when badge not yet claimed */}
      {!hasBadge && (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            {promoT('card.step2Label')}
          </label>
          <input
            type="text"
            value={identifierInput}
            onChange={(e) => setIdentifierInput(e.target.value)}
            placeholder={promoT('card.identifierPlaceholder')}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
          />
          <p className="mt-2 text-xs text-gray-500">{promoT('card.note')}</p>

          <div className="mt-3">
            <button
              onClick={handleFollowAndClaim}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Instagram className="mr-2 h-5 w-5" strokeWidth={1.5} />
              {isSubmitting ? promoT('card.saving') : promoT('card.step1Button')}
            </button>
          </div>

          {claimError && (
            <p className="mt-3 text-sm font-medium text-red-600">{claimError}</p>
          )}
          {claimSuccess && (
            <p className="mt-3 text-sm font-medium text-emerald-700">{claimSuccess}</p>
          )}
        </div>
      )}

      {/* Unlocked badge panel — colours driven by barraca config */}
      {hasBadge && (() => {
        const pc = getPanelColors(barraca.badgeFromColor);
        return (
          <div
            className="mt-5 relative overflow-hidden rounded-2xl border p-5 shadow-md"
            style={{ background: pc.bg, borderColor: pc.borderColor }}
          >
            <div
              className="absolute -top-10 -right-8 h-28 w-28 rounded-full blur-2xl"
              style={{ background: pc.blob1 }}
            />
            <div
              className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full blur-2xl"
              style={{ background: pc.blob2 }}
            />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div
                  className="inline-flex items-center rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide"
                  style={{ borderColor: pc.badgeBorder, color: pc.badgeText }}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {promoT('card.verifiedLabel')}
                </div>
                <div
                  className="mt-2 flex items-center font-bold text-lg"
                  style={{ color: pc.titleColor }}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  {promoT('card.unlockedTitle')}
                </div>
                <p className="mt-1 text-sm" style={{ color: pc.descColor }}>
                  {promoT('card.unlockedDescription')}{' '}
                  <span className="font-semibold">{barraca.discountCode}</span>.
                </p>
              </div>
              <div
                className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-white text-sm font-semibold shadow-lg"
                style={{ background: pc.handleGradient }}
              >
                @{barraca.instagramHandle}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleAddToWallet}
                className="flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors"
                style={{ borderColor: pc.btnBorder, color: pc.btnText }}
              >
                <Wallet className="h-4 w-4" />
                {walletButtonLabel}
              </button>
            </div>

            {walletMessage && (
              <p className="mt-2 text-sm font-medium" style={{ color: pc.msgColor }}>{walletMessage}</p>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default BarracaPromotion;
