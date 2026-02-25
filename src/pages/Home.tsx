import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Calendar, Bell, Gift, Instagram, CheckCircle2, Sparkles } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import RegistrationMarquee from '../components/RegistrationMarquee';
import BarracaGrid from '../components/BarracaGrid';
import EmailSubscriptionSection from '../components/EmailSubscriptionSection';
import StoryCarousel from '../components/StoryCarousel';
import UniqueVisitorCounter from '../components/UniqueVisitorCounter';
import SEOHead from '../components/SEOHead';
import { useApp } from '../contexts/AppContext';
import { useStory } from '../contexts/StoryContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { trackEvent } from '../services/posthogAnalyticsService';
import { PromoClaimService } from '../services/promoClaimService';

const THAIS_PROMO_QUERY_VALUE = 'thais-follow';
const THAIS_PROMO_STORAGE_KEY = 'ccc_thais_follow_badge_unlocked';
const THAIS_PROMO_IDENTIFIER_STORAGE_KEY = 'ccc_thais_follow_identifier';
const THAIS_INSTAGRAM_URL = 'https://instagram.com/thai.82ipanema';
const THAIS_INSTAGRAM_HANDLE = 'thai.82ipanema';
const THAIS_PROMO_SOURCE = 'home_instagram_section';
const THAIS_DISCOUNT_CODE = 'TY82';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { barracas } = useApp();
  const { featureFlags } = useStory();
  const [hasClickedThaisFollow, setHasClickedThaisFollow] = useState(false);
  const [hasUnlockedThaisBadge, setHasUnlockedThaisBadge] = useState(false);
  const [promoIdentifierInput, setPromoIdentifierInput] = useState('');
  const [claimErrorMessage, setClaimErrorMessage] = useState('');
  const [claimSuccessMessage, setClaimSuccessMessage] = useState('');
  const [isClaimSubmitting, setIsClaimSubmitting] = useState(false);
  const [restoredIdentifier, setRestoredIdentifier] = useState('');
  const projectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/projects/carioca-coastal-club`
      : 'https://cariocacoastalclub.com/projects/carioca-coastal-club';
  const isThaisPromoActive = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('promo') === THAIS_PROMO_QUERY_VALUE;
  }, [location.search]);
  const thaisPromoTrackingContext = useMemo(() => ({
    promo_id: THAIS_PROMO_QUERY_VALUE,
    promo_source: THAIS_PROMO_SOURCE,
    instagram_handle: THAIS_INSTAGRAM_HANDLE,
    page_path: location.pathname,
    full_path: `${location.pathname}${location.search}`
  }), [location.pathname, location.search]);
  const promoT = (key: string) => t(`home.promo.${key}`);

  // Scroll animations
  const ctaAnimation = useScrollAnimation('slideUp');
  const statsAnimation = useScrollAnimation('fadeInScale');
  const featuredAnimation = useScrollAnimation('slideUp');
  const featuresAnimation = useScrollAnimation('slideUpStagger');
  const benefitsAnimation = useScrollAnimation('zoomIn');
  const instagramAnimation = useScrollAnimation('slideUp');
  const signupAnimation = useScrollAnimation('fadeInScale');
  


  const loyaltyFeatures = [
    {
      icon: Calendar,
      title: t('home.features.chairReservations.title'),
      description: t('home.features.chairReservations.description')
    },
    {
      icon: Bell,
      title: t('home.features.realTimeUpdates.title'),
      description: t('home.features.realTimeUpdates.description')
    },
    {
      icon: Gift,
      title: t('home.features.exclusivePerks.title'),
      description: t('home.features.exclusivePerks.description')
    },
    {
      icon: MapPin,
      title: t('home.features.personalizedRecommendations.title'),
      description: t('home.features.personalizedRecommendations.description')
    }
  ];

  const scrollToSignup = () => {
    const signupSection = document.getElementById('loyalty-signup');
    if (signupSection) {
      signupSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const scrollToElementWithOffset = (elementId: string, offset = 96) => {
    const element = document.getElementById(elementId);
    if (!element) {
      return false;
    }

    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(0, elementTop - offset);
    window.scrollTo({
      top: targetTop,
      behavior: 'smooth'
    });
    return true;
  };

  const scrollToInstagram = () => {
    const didScrollToPromoCard = scrollToElementWithOffset('ty-promo-offer');
    if (!didScrollToPromoCard) {
      scrollToElementWithOffset('instagram-cta');
    }
  };

  useEffect(() => {
    if (!isThaisPromoActive || typeof window === 'undefined') {
      return;
    }

    const isUnlocked = window.localStorage.getItem(THAIS_PROMO_STORAGE_KEY) === 'true';
    const savedIdentifier = window.localStorage.getItem(THAIS_PROMO_IDENTIFIER_STORAGE_KEY) || '';
    setHasUnlockedThaisBadge(isUnlocked);
    setHasClickedThaisFollow(isUnlocked);
    if (savedIdentifier) {
      setPromoIdentifierInput(savedIdentifier);
    }

    trackEvent('promo_landing_viewed', {
      ...thaisPromoTrackingContext,
      badge_previously_unlocked: isUnlocked,
      has_saved_identifier: !!savedIdentifier,
      validation_model: 'follow_plus_identifier'
    });

    if (!savedIdentifier) {
      return;
    }

    let isActive = true;
    (async () => {
      const existingClaim = await PromoClaimService.findByIdentifier(
        THAIS_PROMO_QUERY_VALUE,
        savedIdentifier
      );

      if (!isActive || !existingClaim?.badge_unlocked) {
        return;
      }

      setHasUnlockedThaisBadge(true);
      setHasClickedThaisFollow(true);
      setRestoredIdentifier(existingClaim.identifier_value);
      window.localStorage.setItem(THAIS_PROMO_STORAGE_KEY, 'true');

      await PromoClaimService.markLastClaimed(THAIS_PROMO_QUERY_VALUE, savedIdentifier);

      trackEvent('thais_claim_restored', {
        ...thaisPromoTrackingContext,
        restore_source: 'auto_lookup',
        identifier_type: existingClaim.identifier_type
      });
    })();

    return () => {
      isActive = false;
    };
  }, [isThaisPromoActive, thaisPromoTrackingContext]);

  useEffect(() => {
    if (!isThaisPromoActive || typeof window === 'undefined') {
      return;
    }

    let ticks = 0;
    const maxTicks = 14;
    const intervalMs = 220;

    const alignScrollToPromo = () => {
      const didScrollToPromoCard = scrollToElementWithOffset('ty-promo-offer');
      if (!didScrollToPromoCard) {
        scrollToElementWithOffset('instagram-cta');
      }

      ticks += 1;
      if (ticks >= maxTicks) {
        window.clearInterval(intervalId);
      }
    };

    const intervalId = window.setInterval(alignScrollToPromo, intervalMs);
    const initialTimeoutId = window.setTimeout(alignScrollToPromo, 120);
    window.addEventListener('load', alignScrollToPromo);

    return () => {
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener('load', alignScrollToPromo);
    };
  }, [isThaisPromoActive]);

  const handleThaisFollowClick = () => {
    setHasClickedThaisFollow(true);
    window.open(THAIS_INSTAGRAM_URL, '_blank', 'noopener,noreferrer');

    if (window.gtag) {
      window.gtag('event', 'thais_instagram_clicked', {
        event_category: 'Social',
        event_label: 'Thais Promo'
      });
    }

    trackEvent('thais_instagram_clicked', {
      ...thaisPromoTrackingContext,
      badge_already_unlocked: hasUnlockedThaisBadge
    });
  };

  const handleClaimDiscountPass = async () => {
    setClaimErrorMessage('');
    setClaimSuccessMessage('');

    const normalized = PromoClaimService.normalizeIdentifier(promoIdentifierInput);
    if (!normalized) {
      setClaimErrorMessage(promoT('messages.invalidIdentifier'));
      trackEvent('thais_claim_invalid_identifier', {
        ...thaisPromoTrackingContext
      });
      return;
    }

    setIsClaimSubmitting(true);
    trackEvent('thais_claim_identifier_submitted', {
      ...thaisPromoTrackingContext,
      identifier_type: normalized.type
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
          ...thaisPromoTrackingContext,
          restore_source: 'manual_lookup',
          identifier_type: existingClaim.identifier_type
        });

        setClaimSuccessMessage(promoT('messages.restored'));
        return;
      }

      if (!hasClickedThaisFollow) {
        trackEvent('thais_badge_unlock_blocked', {
          ...thaisPromoTrackingContext,
          block_reason: 'follow_step_not_completed',
          identifier_type: normalized.type
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
            promo_source: THAIS_PROMO_SOURCE,
            instagram_handle: THAIS_INSTAGRAM_HANDLE
          }
        }
      );

      if (!claimResult.claim?.badge_unlocked) {
        // Keep the user flow moving even if persistence is unavailable.
        setHasUnlockedThaisBadge(true);
        window.localStorage.setItem(THAIS_PROMO_STORAGE_KEY, 'true');
        window.localStorage.setItem(THAIS_PROMO_IDENTIFIER_STORAGE_KEY, promoIdentifierInput.trim());
        setClaimSuccessMessage(promoT('messages.claimedFallback'));
        trackEvent('thais_claim_local_fallback', {
          ...thaisPromoTrackingContext,
          identifier_type: normalized.type
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
          event_label: 'Thais Supporter Badge'
        });
      }

      trackEvent('thais_claim_created', {
        ...thaisPromoTrackingContext,
        identifier_type: claimResult.claim.identifier_type,
        was_existing: claimResult.wasExisting
      });

      trackEvent('thais_badge_unlocked', {
        ...thaisPromoTrackingContext,
        identifier_type: claimResult.claim.identifier_type,
        unlock_status: claimResult.wasExisting ? 'existing_record_unlocked' : 'new_unlock'
      });

      setClaimSuccessMessage(promoT('messages.claimed'));
    } catch (error) {
      console.error('Error claiming discount pass:', error);
      setClaimErrorMessage(promoT('messages.genericError'));
    } finally {
      setIsClaimSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {isThaisPromoActive && hasUnlockedThaisBadge && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="rounded-2xl border border-emerald-300/70 bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  {promoT('sticky.badgeLabel')}
                </div>
                <p className="mt-2 text-sm font-semibold">{promoT('sticky.activeTitle')}</p>
                <p className="text-xs text-emerald-50">{promoT('sticky.activeDescription')}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            </div>
            <button
              onClick={scrollToInstagram}
              className="mt-3 w-full rounded-lg bg-white text-emerald-700 px-3 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              {promoT('sticky.openDetails')}
            </button>
          </div>
        </div>
      )}
      <SEOHead
        title="Carioca Coastal Club Project - Loyalty Program & Beach Barraca Directory"
        description="Project #1: Carioca Coastal Club, a loyalty program and beach barraca directory in Rio de Janeiro with real-time weather and status updates."
        image="https://cariocacoastalclub.com/group-v-1-logo.jpg"
        url={projectUrl}
        type="website"
        siteName="Carioca Coastal Club"
        locale="en_US"
        twitterCard="summary_large_image"
      />
      {/* Story Carousel - Only show if feature is enabled */}
      {featureFlags.enableStoryBanner && <StoryCarousel />}
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Weather Marquee - Temporarily disabled, keep pink separator */}
      {/* <WeatherMarquee colorScheme="white" useDefaultBorders={false} className="border-t-4 border-pink-500" /> */}
      <div className="sticky top-16 z-30 border-t-4 border-pink-500" />

      {isThaisPromoActive && (
        <section className="bg-gradient-to-r from-amber-100 via-rose-50 to-white border-y border-amber-200 relative z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm md:text-base text-gray-900 font-medium">
                {promoT('banner.activeMessage')} <span className="font-bold">@{THAIS_INSTAGRAM_HANDLE}</span>.
              </p>
              <button
                onClick={scrollToInstagram}
                className="inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                {promoT('banner.openOffer')}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section ref={ctaAnimation.ref} className={`py-16 bg-gradient-to-b from-beach-50 to-white relative z-10 ${ctaAnimation.animationClasses}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('home.yourBarraca')}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('home.joinThousands')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/discover"
              className="bg-gradient-to-r from-beach-500 to-beach-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-beach-600 hover:to-beach-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button 
              onClick={scrollToSignup}
              className="bg-white text-beach-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 border-2 border-beach-200 shadow-lg"
            >
              {t('hero.earlyAccess')}
            </button>
            <button 
              onClick={scrollToInstagram}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              <Instagram className="mr-2 h-5 w-5" />
              {t('home.instagram.ctaButton')}
            </button>
          </div>

          {/* Quick Stats with Unique Visitor Counter */}
          <div ref={statsAnimation.ref} className={`grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 ${statsAnimation.animationClasses}`}>
            <div className="text-center">
                              <div className="text-3xl font-bold text-beach-600 mb-2">{barracas.length}<span data-lingo-skip>+</span></div>
              <div className="text-sm text-gray-600"><span data-lingo-skip>{t('home.stats.partnerBarracas') || 'Partner Barracas'}</span></div>
            </div>
            <UniqueVisitorCounter />
            <div className="text-center">
                              <div className="text-3xl font-bold text-beach-600 mb-2" data-lingo-skip>24/7</div>
              <div className="text-sm text-gray-600" data-lingo-skip>{t('home.stats.availabilityUpdates') || 'Availability Updates'}</div>
            </div>
            <div className="text-center">
                              <div className="text-3xl font-bold text-beach-600 mb-2" data-lingo-skip>12</div>
              <div className="text-sm text-gray-600" data-lingo-skip>{t('home.stats.neighborhoods') || 'Neighborhoods'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Barracas */}
      <section ref={featuredAnimation.ref} className={`py-16 bg-white relative z-10 ${featuredAnimation.animationClasses}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.popularBarracas')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              {t('home.popularDescription')}
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-beach-500 to-beach-600 text-white font-semibold rounded-xl hover:from-beach-600 hover:to-beach-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {t('home.viewAllPartners')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <BarracaGrid barracas={barracas.slice(0, 12)} />
        </div>
      </section>

      {/* Loyalty Program Features */}
      <section ref={featuresAnimation.ref} className={`py-16 bg-gradient-to-b from-gray-50 to-white relative z-10 ${featuresAnimation.animationClasses}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.whyJoin')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.whyJoinDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loyaltyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className={`text-center group stagger-${index + 1}`}>
                  <div className="bg-gradient-to-r from-beach-500 to-beach-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-beach-600 group-hover:to-beach-700 transform group-hover:scale-110 transition-all duration-200 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Member Benefits */}
      <section ref={benefitsAnimation.ref} className={`py-16 bg-white relative z-10 ${benefitsAnimation.animationClasses}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 border border-sand-100 shadow-md">
            <Users className="h-16 w-16 text-beach-500 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.exclusiveBenefits')}
            </h2>
            <p className="text-xl text-sand-600 mb-8 max-w-2xl mx-auto">
              {t('home.exclusiveDescription')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-beach-600 mb-1">{t('home.memberBenefits.chair')}</div>
                <div className="text-sand-600 text-sm">{t('home.memberBenefits.reservations')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-beach-600 mb-1">{t('home.memberBenefits.priority')}</div>
                <div className="text-sand-600 text-sm">{t('home.memberBenefits.service')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-beach-600 mb-1">{t('home.memberBenefits.availability')}</div>
                <div className="text-sand-600 text-sm">{t('home.memberBenefits.updates')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-beach-600 mb-1">{t('home.memberBenefits.special')}</div>
                <div className="text-sand-600 text-sm">{t('home.memberBenefits.offers')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram CTA Section */}
      <section id="instagram-cta" ref={instagramAnimation.ref} className={`py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 relative z-10 ${instagramAnimation.animationClasses}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-pink-100">
            {isThaisPromoActive && (
              <div id="ty-promo-offer" className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-rose-50 p-6 text-left shadow-sm">
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
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.instagram.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('home.instagram.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="https://instagram.com/Carioca_Coastal_Club"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
                onClick={() => {
                  // Track Instagram follow click
                  if (window.gtag) {
                    window.gtag('event', 'instagram_follow_clicked', {
                      event_category: 'Social',
                      event_label: 'Home Page CTA'
                    });
                  }
                }}
              >
                <Instagram className="mr-2 h-5 w-5" strokeWidth={1.5} />
                {t('home.instagram.followButton')}
              </a>
              <button 
                onClick={scrollToSignup}
                className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 border-2 border-gray-200 shadow-lg"
              >
                {t('hero.earlyAccess')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/60 rounded-xl p-4">
                <div className="text-2xl font-bold text-pink-600 mb-1">📸</div>
                <div className="text-sm text-gray-600">{t('home.instagram.benefits.photos')}</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">🎯</div>
                <div className="text-sm text-gray-600">{t('home.instagram.benefits.updates')}</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">💎</div>
                <div className="text-sm text-gray-600">{t('home.instagram.benefits.exclusive')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Subscription */}
      <EmailSubscriptionSection
        id="loyalty-signup"
        title={t('home.joinToday')}
        description={t('home.joinDescription')}
        animationRef={signupAnimation.ref}
        animationClasses={signupAnimation.animationClasses}
      />

      {/* Registration Marquee */}
      {/* <RegistrationMarquee /> */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-beach-400" data-lingo-skip>Carioca Coastal Club</h3>
                <p className="text-gray-400 text-sm" data-lingo-skip>Barraca Loyalty Program</p>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                {t('home.footer.description')}
              </p> 
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('home.footer.quickLinks')}</h4>
              <ul className="space-y-2">
                <li><Link to="/discover" className="text-gray-300 hover:text-white transition-colors">{t('nav.discover')}</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">{t('nav.about')}</Link></li>
                <li><a href="#loyalty-signup" className="text-gray-300 hover:text-white transition-colors">{t('email.subscribe')}</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t('home.footer.contact')}</h4>
              <ul className="space-y-2 text-gray-300">
                <li><span data-lingo-skip>CariocaCoastalClub@gmail.com</span></li>
                <li>
                  <a 
                    href="https://instagram.com/Carioca_Coastal_Club"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                    onClick={() => {
                      // Track Instagram contact click
                      if (window.gtag) {
                        window.gtag('event', 'instagram_contact_clicked', {
                          event_category: 'Social',
                          event_label: 'Footer Contact'
                        });
                      }
                    }}
                  >
                    <span data-lingo-skip>Ig: @Carioca_Coastal_Club</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('home.footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
