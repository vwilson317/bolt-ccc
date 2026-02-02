import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollAnimation';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [heroHeight, setHeroHeight] = useState(0);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isScrolled, scrollY } = useScrollPosition();

  // Calculate hero height on mount and resize
  useEffect(() => {
    const calculateHeroHeight = () => {
      const heroElement = document.querySelector('[data-hero-carousel]');
      if (heroElement) {
        setHeroHeight(heroElement.clientHeight);
      } else {
        // Fallback to viewport height if hero element not found
        setHeroHeight(window.innerHeight * 0.7); // 70vh as fallback
      }
    };

    calculateHeroHeight();
    window.addEventListener('resize', calculateHeroHeight);
    return () => window.removeEventListener('resize', calculateHeroHeight);
  }, []);

  // Check if we're on pages that should always have a solid header
  const isLoginPage = location.pathname === '/admin';
  const isBarracaDetailPage = location.pathname.startsWith('/barraca/');
  const isAboutPage = location.pathname === '/about';
  const isHomePage = location.pathname === '/';
  const isRegisterPage = location.pathname === '/register';
  const isPhotosPage = location.pathname === '/photos';
  const isPhotosDetailPage = location.pathname.startsWith('/photos/');
  const isDiscoverPage = location.pathname === '/discover';
  const isRegisterBarracaPage = location.pathname === '/registration' || location.pathname.startsWith('/registration/');
  
  // On home page and about page, only show solid header when header bottom border reaches end of hero
  const headerHeight = 64; // h-16 = 64px
  const useSolidHeader = isLoginPage || isBarracaDetailPage || isMenuOpen || isRegisterPage || isPhotosPage || isPhotosDetailPage  ||
  isDiscoverPage || isRegisterBarracaPage ||
    ((isHomePage || isAboutPage) ? scrollY + headerHeight > heroHeight : isScrolled);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLanguageOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-[999999] transition-all duration-300 ${
      useSolidHeader
        ? 'bg-white/95 backdrop-blur-sm border-b border-beach-100 shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="flex items-center">
              <img
                src={
                  useSolidHeader ? "/logo-icon-color.png" : "/logo-icon-white.png"
                }
                alt="Carioca Coastal Club Icon Logo"
                className="h-12 w-12 min-w-12 max-w-12 object-contain transition-all duration-300"
              />
              <img
                src={useSolidHeader ? "/logo-text-pink.png" : "/logo-text.png"}
                alt="Carioca Coastal Club"
                className="h-10 object-contain transition-all duration-300"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? useSolidHeader
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : useSolidHeader
                    ? 'text-gray-700 hover:text-beach-600'
                    : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.home')}
            </Link>
            {/*
                        <Link
              to="/discover"
              className={`font-medium transition-colors duration-200 ${
                isActive('/discover') 
                  ? useSolidHeader
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : useSolidHeader
                    ? 'text-gray-700 hover:text-beach-600'
                    : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.discover')}
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors duration-200 ${
                isActive('/about') 
                  ? useSolidHeader
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : useSolidHeader
                    ? 'text-gray-700 hover:text-beach-600'
                    : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/register"
              className={`font-medium transition-colors duration-200 ${
                isActive('/register') 
                  ? useSolidHeader
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : useSolidHeader
                    ? 'text-gray-700 hover:text-beach-600'
                    : 'text-white/90 hover:text-white'
              }`}
            >
              Register Barraca
            </Link>
            */}
            <Link
              to="/photos"
              className={`font-medium transition-colors duration-200 ${
                isActive('/photos') 
                  ? useSolidHeader
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : useSolidHeader
                    ? 'text-gray-700 hover:text-beach-600'
                    : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.photos', 'Photos')}
            </Link>

          </nav>

          {/* Language Selector & Mobile Menu */}
          <div className="flex items-center space-x-4 relative z-[1000000]">

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                  useSolidHeader ? 'hover:bg-gray-100' : 'hover:bg-white/20'
                }`}
              >
                <Globe className={`h-4 w-4 transition-colors duration-300 ${
                  useSolidHeader ? 'text-gray-600' : 'text-white'
                }`} />
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  useSolidHeader ? 'text-gray-700' : 'text-white'
                } uppercase`}>
                  {i18n.language}
                </span>
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[1000000]">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                        i18n.language === lang.code ? 'bg-beach-50 text-beach-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                useSolidHeader ? 'hover:bg-gray-100' : 'hover:bg-white/20'
              }`}
            >
              {isMenuOpen ? (
                <X className={`h-6 w-6 transition-colors duration-300 ${
                  useSolidHeader ? 'text-gray-600' : 'text-white'
                }`} />
              ) : (
                <Menu className={`h-6 w-6 transition-colors duration-300 ${
                  useSolidHeader ? 'text-gray-600' : 'text-white'
                }`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden border-t py-4 transition-colors duration-300 z-[1000000] ${
            useSolidHeader
              ? 'border-gray-200 bg-white' 
              : 'border-white/20 bg-black/20 backdrop-blur-sm'
          }`}>
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? useSolidHeader ? 'text-beach-600' : 'text-white'
                    : useSolidHeader ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/discover"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/discover') 
                    ? useSolidHeader ? 'text-beach-600' : 'text-white'
                    : useSolidHeader ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t('nav.discover')}
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/about') 
                    ? useSolidHeader ? 'text-beach-600' : 'text-white'
                    : useSolidHeader ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/register') 
                    ? useSolidHeader ? 'text-beach-600' : 'text-white'
                    : useSolidHeader ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                Register Barraca
              </Link>
              <Link
                to="/photos"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/photos') 
                    ? useSolidHeader ? 'text-beach-600' : 'text-white'
                    : useSolidHeader ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t('nav.photos', 'Photos')}
              </Link>

              
              {/* Mobile Bolt Badge - Temporarily disabled */}
              {/* <div className={`pt-4 border-t transition-colors duration-300 ${
                isScrolled || isAdminLoginPage || isBarracaDetailPage || isMenuOpen ? 'border-gray-200' : 'border-white/20'
              }`}>
                <a 
                  href="https://bolt.new/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <img 
                    src="/white_circle_360x360.png" 
                    alt="Bolt" 
                    className="h-6 w-6"
                  />
                  <span className={`text-xs transition-colors duration-300 ${
                    isScrolled || isAdminLoginPage || isBarracaDetailPage || isMenuOpen ? 'text-gray-500' : 'text-white/70'
                  }`} data-lingo-skip>
                    Built with Bolt
                  </span>
                </a>
              </div> */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;