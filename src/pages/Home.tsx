import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Smartphone, Shield, Zap, Users, Calendar, Bell, Gift } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import BarracaGrid from '../components/BarracaGrid';
import EmailSubscription from '../components/EmailSubscription';
import StoryCarousel from '../components/StoryCarousel';
import UniqueVisitorCounter from '../components/UniqueVisitorCounter';
import { useApp } from '../contexts/AppContext';
import { useStory } from '../contexts/StoryContext';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { barracas } = useApp();
  const { featureFlags } = useStory();

  const loyaltyFeatures = [
    {
      icon: Calendar,
      title: 'Chair Reservations',
      description: 'Reserve your favorite spot at participating barracas - never worry about finding a chair again'
    },
    {
      icon: Bell,
      title: 'Real-time Updates',
      description: 'Get instant notifications when your favorite barraca opens, closes, or has special offers'
    },
    {
      icon: Gift,
      title: 'Exclusive Member Perks',
      description: 'Access special discounts, priority service, and member-only events at partner barracas'
    },
    {
      icon: MapPin,
      title: 'Personalized Recommendations',
      description: 'Discover new barracas based on your preferences and get insider tips from locals'
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

  return (
    <>
      {/* Story Carousel - Only show if feature is enabled */}
      {featureFlags.enableStoryBanner && <StoryCarousel />}
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Your Beach, Your Way
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of loyal customers who use Carioca Coastal Club to stay connected with their favorite barracas
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/discover"
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-sky-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center"
            >
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button 
              onClick={scrollToSignup}
              className="bg-white text-sky-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 border-2 border-sky-200 shadow-lg"
            >
              {t('hero.earlyAccess')}
            </button>
          </div>

          {/* Quick Stats with Unique Visitor Counter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600 mb-2">{barracas.length}+</div>
              <div className="text-sm text-gray-600">Partner Barracas</div>
            </div>
            <UniqueVisitorCounter />
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Availability Updates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600 mb-2">12</div>
              <div className="text-sm text-gray-600">Neighborhoods</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Barracas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Member Barracas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              These barracas are loved by our community - check if your favorite is open and reserve your spot
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              View All Partner Barracas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <BarracaGrid barracas={barracas.slice(0, 4)} />
        </div>
      </section>

      {/* Loyalty Program Features */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Join Carioca Coastal Club?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              More than just finding barracas - we're your connection to Rio's beach culture
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loyaltyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-r from-sky-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-sky-600 group-hover:to-blue-700 transform group-hover:scale-110 transition-all duration-200 shadow-lg">
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
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <Users className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Exclusive Member Benefits
            </h2>
            <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
              Reserve chairs, get availability updates, discover new spots, and enjoy special offers from your favorite barracas
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">Chair</div>
                <div className="text-yellow-100 text-sm">Reservations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">Priority</div>
                <div className="text-yellow-100 text-sm">Service</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">Availability</div>
                <div className="text-yellow-100 text-sm">Updates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">Special</div>
                <div className="text-yellow-100 text-sm">Offers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Subscription */}
      <section id="loyalty-signup" className="py-16 bg-gradient-to-r from-sky-500 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join the Club Today
          </h2>
          <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
            Start enjoying member benefits at your favorite barracas. Get updates, reserve chairs, and never miss out on the perfect beach day.
          </p>
          <EmailSubscription />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg">
                  <Waves className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Carioca Coastal Club</h3>
                  <p className="text-gray-400 text-sm">Beach Loyalty Program</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Connecting Rio's beach lovers with their favorite barracas through chair reservations, 
                real-time updates, and exclusive member benefits.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  📱
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">WhatsApp</span>
                  💬
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/discover" className="text-gray-300 hover:text-white transition-colors">Find Barracas</Link></li>
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#loyalty-signup" className="text-gray-300 hover:text-white transition-colors">Join Club</a></li>
                <li><Link to="/admin" className="text-gray-300 hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-300">
                <li>📧 hello@cariocacoastal.com</li>
                <li>📱 +55 21 99999-0000</li>
                <li>📍 Rio de Janeiro, RJ</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Carioca Coastal Club. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Built with</span>
              <img 
                src="/bolt-logo.png" 
                alt="Bolt" 
                className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-gray-400 text-sm opacity-60 hover:opacity-100 transition-opacity">Bolt</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;