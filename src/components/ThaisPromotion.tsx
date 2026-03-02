import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Gift, Instagram, CheckCircle2, Sparkles, X } from 'lucide-react';
import { trackEvent } from '../services/posthogAnalyticsService';
import { PromoClaimService } from '../services/promoClaimService';

const THAIS_PROMO_QUERY_VALUE = 'thais-follow';
const THAIS_PROMO_STORAGE_KEY = 'ccc_thais_follow_badge_unlocked';
const THAIS_PROMO_IDENTIFIER_STORAGE_KEY = 'ccc_thais_follow_identifier';
const THAIS_INSTAGRAM_URL = 'https://instagram.com/thai.82ipanema';
const THAIS_INSTAGRAM_HANDLE = 'thai.82ipanema';
const THAIS_DISCOUNT_CODE = 'TY82';

interface ThaisPromotionProps {
  promoSource?: string;
}

const ThaisPromotion: React.FC<ThaisPromotionProps> = ({
  promoSource = 'home_instagram_section',
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [hasClickedThaisFollow, setHasClickedThaisFollow] = useState(false);
  const [hasUnlockedThaisBadge, setHasUnlockedThaisBadge] = useState(false);
  const [promoIdentifierInput, setPromoIdentifierInput] = useState('');
  const [claimErrorMessage, setClaimErrorMessage] = useState('');
  const [claimSuccessMessage, setClaimSuccessMessage] = useState('');
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [restoredIdentifier, setRestoredIdentifier] = useState('');
  const [isBadgeFabExpanded, setIsBadgeFabExpanded] = useState(false);

  const trackingContext = useMemo(() => ({
    promo_id: THAIS_PROMO_QUERY_VALUE,
    promo_source: promoSource,
    instagram_handle: THAIS_INSTAGRAM_HANDLE,
    page_path: location.pathname,
    full_path: `${location.pathname}${location.search}`,
  }), [promoSource, location.pathname, location.search]);

  const promoT = (key: string) => t(`home.promo.${key}`);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isUnlocked = window.localStorage.getItem(THAIS_PROMO_STORAGE_KEY) === 'true';
    const savedIdentifier = window.localStorage.getItem(THAIS_PROMO_IDENTIFIER_STORAGE_KEY) || '';
    setHasUnlockedThaisBadge(isUnlocked);
    setHasClickedThaisFollow(isUnlocked);
    if (savedIdentifier) {
      setPromoIdentifierInput(savedIdentifier);
    }

    trackEvent('promo_landing_viewed', {
      ...trackingContext,
      badge_previously_unlocked: isUnlocked,
      has_saved_identifier: !!savedIdentifier,
      validation_model: 'follow_plus_identifier',
    });

    if (!savedIdentifier) return;

    let isActive = true;
    (async () => {
      const existingClaim = await PromoClaimService.findByIdentifier(
        THAIS_PROMO_QUERY_VALUE,
        savedIdentifier
      );

      if (!isActive || !existingClaim?.badge_unlocked) return;

      setHasUnlockedThaisBadge(true);
      setHasClickedThaisFollow(true);
      setRestoredIdentifier(existingClaim.identifier_value);
      window.localStorage.setItem(THAIS_PROMO_STORAGE_KEY, 'true');

      await PromoClaimService.markLastClaimed(THAIS_PROMO_QUERY_VALUE, savedIdentifier);

      trackEvent('thais_claim_restored', {
        ...trackingContext,
        restore_source: 'auto_lookup',
        identifier_type: existingClaim.identifier_type,
      });
    })();

    return () => {
      isActive = false;
    };
  // trackingContext is stable per mount; run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThaisFollowClick = () => {
    setHasClickedThaisFollow(true);
    window.open(THAIS_INSTAGRAM_URL, '_blank', 'noopener,noreferrer');

    if (window.gtag) {
      window.gtag('event', 'thais_instagram_clicked', {
        event_category: 'Social',
        event_label: 'Thais Promo',
      });
    }

    trackEvent('thais_instagram_clicked', {
      ...trackingContext,
      badge_already_unlocked: hasUnlockedThaisBadge,
    });
  };

  const handleClaimDiscountPass = async () => {
    setClaimErrorMessage('');
    setClaimSuccessMessage('');

    const normalized = PromoClaimService.normalizeIdentifier(promoIdentifierInput);
    if (!normalized) {
      setClaimErrorMessage(promoT('messages.invalidIdentifier'));
      trackEvent('thais_claim_invalid_identifier', { ...trackingContext });
      return;
    }

    setIsClaimSubmitting(true);
    trackEvent('thais_claim_identifier_submitted', {
      ...trackingContext,
      identifier_type: normalized.type,
    });

    try {
      const existingClaim = await PromoClaimService.findByIdentifier(
        THAIS_PROMO_QUERY_VALUE,
        promoIdentifierInput
      );

      if (existingClaim?.badge_unlocked) {
        await PromoClaimService.markLastClaimed(THAIS_PROMO_QUERY_VALUE, promoIdentifierInput);
        setHasUnlockedThaisBadge(true);
        setHasClickedThaisFollow(true);
        setPromoIdentifierInput(existingClaim.identifier_value);
        setRestoredIdentifier(existingClaim.identifier_value);
        window.localStorage.setItem(THAIS_PROMO_STORAGE_KEY, 'true');
        window.localStorage.setItem(THAIS_PROMO_IDENTIFIER_STORAGE_KEY, existingClaim.identifier_value);

        trackEvent('thais_claim_restored', {
          ...trackingContext,
          restore_source: 'manual_lookup',
          identifier_type: existingClaim.identifier_type,
        });

        setClaimSuccessMessage(promoT('messages.restored'));
        return;
      }

      if (!hasClickedThaisFollow) {
        trackEvent('thais_badge_unlock_blocked', {
          ...trackingContext,
          block_reason: 'follow_step_not_completed',
          identifier_type: normalized.type,
        });
        setClaimErrorMessage(promoT('messages.followFirst'));
        return;
      }

      const claimResult = await PromoClaimService.claimOrRestore(
        THAIS_PROMO_QUERY_VALUE,
        promoIdentifierInput,
        {
          followConfirmed: true,
          unlockBadge: true,
          metadata: {
            promo_source: promoSource,
            instagram_handle: THAIS_INSTAGRAM_HANDLE,
          },
        }
      );

      if (!claimResult.claim?.badge_unlocked) {
        setHasUnlockedThaisBadge(true);
        window.localStorage.setItem(THAIS_PROMO_STORAGE_KEY, 'true');
        window.localStorage.setItem(THAIS_PROMO_IDENTIFIER_STORAGE_KEY, promoIdentifierInput.trim());
        setClaimSuccessMessage(promoT('messages.claimedFallback'));
        trackEvent('thais_claim_local_fallback', {
          ...trackingContext,
          identifier_type: normalized.type,
        });
        return;
      }

      setHasUnlockedThaisBadge(true);
      setPromoIdentifierInput(claimResult.claim.identifier_value);
      window.localStorage.setItem(THAIS_PROMO_STORAGE_KEY, 'true');
      window.localStorage.setItem(THAIS_PROMO_IDENTIFIER_STORAGE_KEY, claimResult.claim.identifier_value);

      if (window.gtag) {
        window.gtag('event', 'thais_badge_unlocked', {
          event_category: 'Promo',
          event_label: 'Thais Supporter Badge',
        });
      }

      trackEvent('thais_claim_created', {
        ...trackingContext,
        identifier_type: claimResult.claim.identifier_type,
        was_existing: claimResult.wasExisting,
      });

      trackEvent('thais_badge_unlocked', {
        ...trackingContext,
        identifier_type: claimResult.claim.identifier_type,
        unlock_status: claimResult.wasExisting ? 'existing_record_unlocked' : 'new_unlock',
      });

      setClaimSuccessMessage(promoT('messages.claimed'));
    } catch (error) {
      console.error('Error claiming discount pass:', error);
      setClaimErrorMessage(promoT('messages.genericError'));
      trackEvent('thais_claim_error', {
        ...trackingContext,
        error_message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  return (
    <>
      {/* Discreet FAB + full-screen lightbox */}
      {hasUnlockedThaisBadge && (
        <>
          <button
            onClick={() => setIsBadgeFabExpanded(true)}
            className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            aria-label="Show verified badge"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </button>

          {isBadgeFabExpanded && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsBadgeFabExpanded(false)}
            >
              <div
                className="relative mx-6 w-full max-w-sm rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-8 text-white shadow-2xl text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsBadgeFabExpanded(false)}
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
                  {promoT('card.verifiedLabel')}
                </div>

                <p className="text-lg font-bold mb-1">@{THAIS_INSTAGRAM_HANDLE}</p>

                <div className="my-5 rounded-2xl bg-white/20 px-6 py-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100 mb-1">Discount Code</p>
                  <p className="text-5xl font-black tracking-wider">{THAIS_DISCOUNT_CODE}</p>
                </div>

                <p className="text-sm text-emerald-100">{promoT('sticky.activeDescription')}</p>
                <p className="mt-6 text-xs text-white/50">Tap outside to dismiss</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Promo card */}
      <div id="ty-promo-offer" className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-rose-50 p-6 text-left shadow-sm">
        <div className="mb-4 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
          <Gift className="mr-2 h-4 w-4" />
          {promoT('card.badge')}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {promoT('card.title')}
        </h3>
        <p className="mt-2 text-gray-700">
          {promoT('card.descriptionPrefix')} <span className="font-semibold">@{THAIS_INSTAGRAM_HANDLE}</span> {promoT('card.descriptionSuffix')}
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={handleThaisFollowClick}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg flex items-center justify-center"
          >
            <Instagram className="mr-2 h-5 w-5" strokeWidth={1.5} />
            {promoT('card.step1Button')}
          </button>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              {promoT('card.step2Label')}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={promoIdentifierInput}
                onChange={(event) => setPromoIdentifierInput(event.target.value)}
                placeholder={promoT('card.identifierPlaceholder')}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
              <button
                onClick={handleClaimDiscountPass}
                disabled={isClaimSubmitting}
                className="bg-white text-gray-800 px-6 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isClaimSubmitting ? promoT('card.saving') : promoT('card.claimButton')}
              </button>
            </div>
            {claimErrorMessage && (
              <p className="mt-2 text-sm font-medium text-red-600">{claimErrorMessage}</p>
            )}
            {claimSuccessMessage && (
              <p className="mt-2 text-sm font-medium text-emerald-700">{claimSuccessMessage}</p>
            )}
          </div>
        </div>
        {restoredIdentifier && (
          <p className="mt-3 text-sm text-emerald-700">
            {promoT('card.restoredUsing')} <span className="font-semibold">{restoredIdentifier}</span>
          </p>
        )}
        <div className="mt-3 text-xs text-gray-500">
          {promoT('card.note')}
        </div>
        {hasUnlockedThaisBadge && (
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
                  {promoT('card.unlockedDescription')} <span className="font-semibold">{THAIS_DISCOUNT_CODE}</span>.
                </p>
              </div>
              <div className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-white text-sm font-semibold shadow-lg">
                @{THAIS_INSTAGRAM_HANDLE}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ThaisPromotion;
