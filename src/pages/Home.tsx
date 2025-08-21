import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, Calendar, Bell, Gift, Instagram } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import WeatherMarquee from '../components/WeatherMarquee';
import RegistrationMarquee from '../components/RegistrationMarquee';
import BarracaGrid from '../components/BarracaGrid';
import EmailSubscriptionSection from '../components/EmailSubscriptionSection';
import StoryCarousel from '../components/StoryCarousel';
import UniqueVisitorCounter from '../components/UniqueVisitorCounter';
import { useApp } from '../contexts/AppContext';
import { useStory } from '../contexts/StoryContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { barracas } = useApp();
  const { featureFlags } = useStory();

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

  const scrollToInstagram = () => {
    const instagramSection = document.getElementById('instagram-cta');
    if (instagramSection) {
      instagramSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

    return (
    <div className="relative">
      {/* Story Carousel - Only show if feature is enabled */}
      {featureFlags.enableStoryBanner && <StoryCarousel />}
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Weather Marquee - Home uses white theme with pink top border */}
      <WeatherMarquee colorScheme="white" useDefaultBorders={false} className="border-t-4 border-pink-500" />

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