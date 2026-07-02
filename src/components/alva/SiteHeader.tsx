import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { WHATSAPP_URL, handleCTAClick } from '../../lib/alva';

interface SiteHeaderProps {
  /** 'minimal' — just the wordmark (used on the landing page hero).
   *  'full' — wordmark + Home/Blog nav + WhatsApp CTA (used on blog pages). */
  variant?: 'minimal' | 'full';
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ variant = 'minimal' }) => {
  const location = useLocation();
  const isBlog = location.pathname.startsWith('/blog');

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Link to="/" className="flex-shrink-0">
        <img src="/logo-text-pink.png" alt="Carioca Coastal Club" className="h-8 w-auto sm:h-9" />
      </Link>

      {variant === 'full' && (
        <>
          <nav className="hidden items-center gap-8 text-sm font-semibold sm:flex">
            <Link
              to="/"
              className={`transition-colors hover:text-beach-600 ${!isBlog ? 'text-beach-600' : 'text-sand-800'}`}
            >
              Home
            </Link>
            <Link
              to="/blog"
              className={`transition-colors hover:text-beach-600 ${isBlog ? 'text-beach-600' : 'text-sand-800'}`}
            >
              Blog
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => handleCTAClick('header_whatsapp', 'Join us on WhatsApp', location.pathname, WHATSAPP_URL)}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-beach-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-beach-500/30 transition-transform active:scale-95 sm:hover:scale-105"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Join us on WhatsApp</span>
          </button>
        </>
      )}
    </header>
  );
};

export default SiteHeader;
