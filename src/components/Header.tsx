import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-700 bg-clip-text text-transparent">
                Carioca Coastal Club
              </h1>
              <p className="text-xs text-orange-500 -mt-1">Barraca Loyalty Program</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-orange-600 border-b-2 border-orange-600 pb-1' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/discover"
              className={`font-medium transition-colors duration-200 ${
                isActive('/discover') 
                  ? 'text-orange-600 border-b-2 border-orange-600 pb-1' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              {t('nav.discover')}
            </Link>
            <Link
              to="/about"
              className={`font-medium transition-colors duration-200 ${
                isActive('/about') 
                  ? 'text-orange-600 border-b-2 border-orange-600 pb-1' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/admin"
              className={`font-medium transition-colors duration-200 ${
                isActive('/admin') 
                  ? 'text-orange-600 border-b-2 border-orange-600 pb-1' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              {t('nav.admin')}
            </Link>
          </nav>

          {/* Language Selector, Bolt Badge & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Bolt Badge */}
            <div className="hidden sm:flex items-center space-x-2">
              <img 
                src="/white_circle_360x360.png" 
                alt="Bolt" 
                className="h-6 w-6 opacity-60 hover:opacity-100 transition-opacity"
              />
              <span className="text-xs text-gray-500 opacity-60 hover:opacity-100 transition-opacity">
                Built with Bolt
              </span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 uppercase">
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
                        i18n.language === lang.code ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/') ? 'text-orange-600' : 'text-gray-700'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/discover"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/discover') ? 'text-orange-600' : 'text-gray-700'
                }`}
              >
                {t('nav.discover')}
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/about') ? 'text-orange-600' : 'text-gray-700'
                }`}
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium transition-colors duration-200 ${
                  isActive('/admin') ? 'text-orange-600' : 'text-gray-700'
                }`}
              >
                {t('nav.admin')}
              </Link>
              
              {/* Mobile Bolt Badge */}
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <img 
                  src="/white_circle_360x360.png" 
                  alt="Bolt" 
                  className="h-6 w-6 opacity-60"
                />
                <span className="text-xs text-gray-500 opacity-60">
                  Built with Bolt
                </span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;