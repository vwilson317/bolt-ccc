import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollAnimation';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isScrolled } = useScrollPosition();

  // Check if we're on the admin login page
  const isAdminLoginPage = location.pathname === '/admin';

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLanguageOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || isAdminLoginPage
        ? 'bg-white/95 backdrop-blur-sm border-b border-beach-100 shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-center">
              <h1 className={`text-xl font-bold bg-gradient-to-r from-beach-600 to-beach-700 bg-clip-text text-transparent transition-colors duration-300 ${
                isScrolled || isAdminLoginPage ? '' : 'text-white drop-shadow-lg'
              }`} data-lingo-skip>
                Carioca Coastal Club
              </h1>
              <p className={`text-xs transition-colors duration-300 ${
                isScrolled || isAdminLoginPage ? 'text-beach-500' : 'text-beach-200'
              } -mt-1`} data-lingo-skip>Barraca Loyalty Program</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? isScrolled || isAdminLoginPage
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : isScrolled || isAdminLoginPage
                    ? 'text-gray-700 hover:text-beach-600'
                    : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/discover"
              className={`font-medium transition-colors duration-200 ${
                isActive('/discover') 
                  ? isScrolled || isAdminLoginPage
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : isScrolled || isAdminLoginPage
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
                  ? isScrolled || isAdminLoginPage
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : isScrolled || isAdminLoginPage
                    ? 'text-gray-700 hover:text-beach-600'
                    : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/admin"
              className={`font-medium transition-colors duration-200 ${
                isActive('/admin') 
                  ? isScrolled || isAdminLoginPage
                    ? 'text-beach-600 border-b-2 border-beach-600 pb-1' 
                    : 'text-white border-b-2 border-white pb-1'
                  : isScrolled || isAdminLoginPage
                    ? 'text-gray-700 hover:text-beach-600'
                    : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.admin')}
            </Link>
          </nav>

          {/* Language Selector, Bolt Badge & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Bolt Badge */}
            <div className="hidden sm:flex items-center space-x-2">
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
                  isScrolled || isAdminLoginPage ? 'text-gray-500' : 'text-white/70'
                }`} data-lingo-skip>
                  Built with Bolt
                </span>
              </a>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                  isScrolled || isAdminLoginPage
                    ? 'hover:bg-gray-100' 
                    : 'hover:bg-white/20'
                }`}
              >
                <Globe className={`h-4 w-4 transition-colors duration-300 ${
                  isScrolled || isAdminLoginPage ? 'text-gray-600' : 'text-white'
                }`} />
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isScrolled || isAdminLoginPage ? 'text-gray-700' : 'text-white'
                } uppercase`}>
                  {i18n.language}
                </span>
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
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
                isScrolled || isAdminLoginPage
                  ? 'hover:bg-gray-100' 
                  : 'hover:bg-white/20'
              }`}
            >
              {isMenuOpen ? (
                <X className={`h-6 w-6 transition-colors duration-300 ${
                  isScrolled || isAdminLoginPage ? 'text-gray-600' : 'text-white'
                }`} />
              ) : (
                <Menu className={`h-6 w-6 transition-colors duration-300 ${
                  isScrolled || isAdminLoginPage ? 'text-gray-600' : 'text-white'
                }`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden border-t py-4 transition-colors duration-300 ${
            isScrolled || isAdminLoginPage
              ? 'border-gray-200 bg-white' 
              : 'border-white/20 bg-black/20 backdrop-blur-sm'
          }`}>
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? isScrolled || isAdminLoginPage ? 'text-beach-600' : 'text-white'
                    : isScrolled || isAdminLoginPage ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/discover"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/discover') 
                    ? isScrolled || isAdminLoginPage ? 'text-beach-600' : 'text-white'
                    : isScrolled || isAdminLoginPage ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t('nav.discover')}
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/about') 
                    ? isScrolled || isAdminLoginPage ? 'text-beach-600' : 'text-white'
                    : isScrolled || isAdminLoginPage ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/admin') 
                    ? isScrolled || isAdminLoginPage ? 'text-beach-600' : 'text-white'
                    : isScrolled || isAdminLoginPage ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {t('nav.admin')}
              </Link>
              
              {/* Mobile Bolt Badge */}
              <div className={`pt-4 border-t transition-colors duration-300 ${
                isScrolled || isAdminLoginPage ? 'border-gray-200' : 'border-white/20'
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
                    isScrolled || isAdminLoginPage ? 'text-gray-500' : 'text-white/70'
                  }`} data-lingo-skip>
                    Built with Bolt
                  </span>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;