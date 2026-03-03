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
// iOS detection — works for Safari and Chrome-on-iOS (both handle .pkpass)
// ---------------------------------------------------------------------------
function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
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
  const { unlockBadge } = useBadgeContext();

  const [hasClickedFollow, setHasClickedFollow] = useState(false);
  const [hasBadge, setHasBadge] = useState(false);
  const [identifierInput, setIdentifierInput] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restoredIdentifier, setRestoredIdentifier] = useState('');
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
  // Initialise from localStorage + auto-restore from DB
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isUnlocked = window.localStorage.getItem(barraca.storageKey) === 'true';
    const savedId = window.localStorage.getItem(barraca.identifierStorageKey) || '';
    // Session flag: survives page refresh but NOT a new browser session.
    // Separate key per barraca so following Thais doesn't count for Marcinho, etc.
    const followedThisSession =
      window.sessionStorage.getItem(`ccc_follow_session_${barraca.id}`) === 'true';

    setHasBadge(isUnlocked);
    setHasClickedFollow(isUnlocked || followedThisSession);
    if (savedId) setIdentifierInput(savedId);

    trackEvent('barraca_promo_viewed', {
      ...trackCtx,
      badge_previously_unlocked: isUnlocked,
      has_saved_identifier: !!savedId,
    });

    if (!savedId) return;

    let active = true;
    (async () => {
      const claim = await PromoClaimService.findByIdentifier(barraca.id, savedId);
      if (!active || !claim?.badge_unlocked) return;

      setHasBadge(true);
      setHasClickedFollow(true);
      setRestoredIdentifier(claim.identifier_value);
      window.localStorage.setItem(barraca.storageKey, 'true');
      unlockBadge(barraca.id);

      await PromoClaimService.markLastClaimed(barraca.id, savedId);
      trackEvent('barraca_promo_claim_restored', {
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
  // Step 1: Follow Instagram
  // ---------------------------------------------------------------------------
  const handleFollowClick = () => {
    setHasClickedFollow(true);
    window.sessionStorage.setItem(`ccc_follow_session_${barraca.id}`, 'true');
    window.open(barraca.instagramUrl, '_blank', 'noopener,noreferrer');
    trackEvent('barraca_promo_instagram_clicked', {
      ...trackCtx,
      badge_already_unlocked: hasBadge,
    });
  };

  // ---------------------------------------------------------------------------
  // Step 2: Claim / restore badge
  // ---------------------------------------------------------------------------
  const handleClaim = async () => {
    setClaimError('');
    setClaimSuccess('');

    const normalized = PromoClaimService.normalizeIdentifier(identifierInput);
    if (!normalized) {
      setClaimError(promoT('messages.invalidIdentifier'));
      trackEvent('barraca_promo_invalid_identifier', trackCtx);
      return;
    }

    setIsSubmitting(true);
    trackEvent('barraca_promo_identifier_submitted', {
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
        trackEvent('barraca_promo_claim_restored', {
          ...trackCtx,
          restore_source: 'manual_lookup',
          identifier_type: existing.identifier_type,
        });
        return;
      }

      if (!hasClickedFollow) {
        setClaimError(
          promoT('messages.followFirst', { instagramHandle: barraca.instagramHandle }),
        );
        trackEvent('barraca_promo_badge_blocked', {
          ...trackCtx,
          block_reason: 'follow_step_not_completed',
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
        trackEvent('barraca_promo_claim_local_fallback', trackCtx);
        return;
      }

      _persistBadge(result.claim.identifier_value);
      setClaimSuccess(promoT('messages.claimed'));
      trackEvent('barraca_promo_badge_unlocked', {
        ...trackCtx,
        identifier_type: result.claim.identifier_type,
        unlock_status: result.wasExisting ? 'existing_record_unlocked' : 'new_unlock',
      });
    } catch (err) {
      console.error('Error claiming barraca promo badge:', err);
      setClaimError(promoT('messages.genericError'));
      trackEvent('barraca_promo_claim_error', {
        ...trackCtx,
        error_message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const _persistBadge = (identifierValue: string) => {
    setHasBadge(true);
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
    trackEvent('barraca_promo_wallet_clicked', {
      ...trackCtx,
      promo_code: barraca.discountCode,
      platform: isIOS ? 'ios' : 'other',
    });

    if (isIOS) {
      const url = `/.netlify/functions/generate-pkpass?barracaPromoId=${encodeURIComponent(barraca.id)}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `${barraca.discountCode}.pkpass`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setWalletMessage(promoT('messages.walletIOS'));
      trackEvent('barraca_promo_wallet_ios_triggered', trackCtx);
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
        trackEvent('barraca_promo_wallet_shared', trackCtx);
        setTimeout(() => setWalletMessage(''), 3000);
        return;
      } catch {
        // fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(barraca.discountCode);
      setWalletMessage(promoT('messages.walletCopied'));
      trackEvent('barraca_promo_wallet_code_copied', trackCtx);
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

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Step 1 */}
        <button
          onClick={handleFollowClick}
          className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center justify-center"
        >
          <Instagram className="mr-2 h-5 w-5" strokeWidth={1.5} />
          {promoT('card.step1Button')}
        </button>

        {/* Step 2 */}
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            {promoT('card.step2Label')}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={identifierInput}
              onChange={(e) => setIdentifierInput(e.target.value)}
              placeholder={promoT('card.identifierPlaceholder')}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
            <button
              onClick={handleClaim}
              disabled={isSubmitting}
              className="bg-white text-gray-800 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? promoT('card.saving') : promoT('card.claimButton')}
            </button>
          </div>

          {claimError && (
            <p className="mt-2 text-sm font-medium text-red-600">{claimError}</p>
          )}
          {claimSuccess && (
            <p className="mt-2 text-sm font-medium text-emerald-700">{claimSuccess}</p>
          )}
        </div>
      </div>

      {restoredIdentifier && (
        <p className="mt-3 text-sm text-emerald-700">
          {promoT('card.restoredUsing')}{' '}
          <span className="font-semibold">{restoredIdentifier}</span>
        </p>
      )}

      <div className="mt-3 text-xs text-gray-500">{promoT('card.note')}</div>

      {/* Unlocked badge panel */}
      {hasBadge && (
        <div className="mt-5 relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-md">
          <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-teal-200/40 blur-2xl" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-300 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {promoT('card.verifiedLabel')}
              </div>
              <div className="mt-2 flex items-center text-emerald-900 font-bold text-lg">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                {promoT('card.unlockedTitle')}
              </div>
              <p className="mt-1 text-sm text-emerald-800">
                {promoT('card.unlockedDescription')}{' '}
                <span className="font-semibold">{barraca.discountCode}</span>.
              </p>
            </div>
            <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-white text-sm font-semibold shadow-lg">
              @{barraca.instagramHandle}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleAddToWallet}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              {walletButtonLabel}
            </button>
          </div>

          {walletMessage && (
            <p className="mt-2 text-sm font-medium text-emerald-700">{walletMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BarracaPromotion;
