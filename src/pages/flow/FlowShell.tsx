import React from 'react';
import { Link } from 'react-router-dom';
import FlowIcon from './FlowIcon';
import { flowComingSoon, openFlowCommunityWhatsApp } from './flowUtils';
import './flow.css';

interface FlowShellProps {
  /** Which top-level section is currently active, for nav highlighting */
  active: 'home' | 'events' | 'cities';
  children: React.ReactNode;
}

const desktopNavLinkClasses = (isActive: boolean) =>
  `text-sm font-bold tracking-wide pb-1 transition-colors ${
    isActive
      ? 'text-flow-primary border-b-2 border-flow-primary'
      : 'text-flow-secondary hover:text-flow-primary'
  }`;

const mobileNavItemClasses = (isActive: boolean) =>
  `flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1.5 rounded-full transition-transform active:scale-90 ${
    isActive ? 'bg-flow-primary-container text-flow-on-primary-container' : 'text-flow-secondary'
  }`;

/**
 * Shared chrome (header, footer, mobile bottom nav) for every page under
 * /projects/flow. Keeping this in one place means the three FLOW pages —
 * ported from separate desktop/mobile mockups — feel like one connected
 * mini-app instead of three disconnected static screens.
 */
const FlowShell: React.FC<FlowShellProps> = ({ active, children }) => {
  const exploreActive = active === 'home' || active === 'cities';

  return (
    <div className="font-flow-body min-h-screen flex flex-col bg-flow-background text-flow-on-background">
      {/* Desktop top app bar */}
      <header className="hidden md:block sticky top-0 z-40 bg-flow-surface border-b border-flow-outline-variant">
        <div className="flex justify-between items-center w-full px-10 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link
              to="/projects/flow"
              className="font-flow-headline text-2xl font-extrabold text-flow-primary tracking-tighter"
            >
              FLOW. community
            </Link>
            <nav className="flex gap-6">
              <Link to="/projects/flow" className={desktopNavLinkClasses(active === 'home')}>
                Dashboard
              </Link>
              <Link to="/projects/flow/events" className={desktopNavLinkClasses(active === 'events')}>
                Events
              </Link>
              <button onClick={flowComingSoon('Groups')} className={desktopNavLinkClasses(false)}>
                Groups
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/projects/flow/cities" className="flex items-center text-flow-primary gap-0.5">
              <FlowIcon name="location_on" />
              <span className="font-bold text-sm tracking-wide">Rio de Janeiro</span>
            </Link>
            <button
              onClick={flowComingSoon('Language selector')}
              className="flex items-center gap-1 text-flow-secondary hover:text-flow-primary transition-colors"
            >
              <FlowIcon name="language" />
              <span className="font-bold text-sm tracking-wide">EN</span>
            </button>
            <button
              onClick={flowComingSoon('Account')}
              className="text-flow-secondary hover:text-flow-primary transition-colors"
            >
              <FlowIcon name="account_circle" className="text-2xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile top app bar */}
      <header className="md:hidden sticky top-0 z-40 bg-flow-surface/90 backdrop-blur-md border-b border-flow-outline-variant">
        <div className="flex justify-between items-center px-4 h-16">
          <Link
            to="/projects/flow/cities"
            className="flex items-center gap-1.5 text-flow-primary active:scale-95 transition-transform"
          >
            <FlowIcon name="location_on" />
            <span className="font-bold text-xs tracking-wide">RIO DE JANEIRO</span>
            <FlowIcon name="expand_more" className="text-sm" />
          </Link>
          <span className="font-flow-headline text-xl font-extrabold text-flow-primary tracking-tight">
            FLOW
          </span>
          <button
            onClick={flowComingSoon('Language selector')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-flow-surface-container-high transition-colors active:scale-95"
          >
            <FlowIcon name="language" className="text-flow-primary" />
          </button>
        </div>
      </header>

      <main className="flex-grow pb-24 md:pb-0">{children}</main>

      {/* Footer */}
      <footer className="bg-flow-surface-container-low border-t border-flow-outline-variant mt-16">
        <div className="w-full px-4 md:px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <div className="space-y-2 flex flex-col items-center md:items-start">
            <span className="font-flow-headline text-2xl font-bold text-flow-primary">FLOW. community</span>
            <p className="text-xs text-flow-secondary">© 2026 FLOW. community. All rights reserved.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <button
              onClick={openFlowCommunityWhatsApp}
              className="text-xs text-flow-on-surface-variant hover:text-flow-primary transition-all"
            >
              Join WhatsApp
            </button>
            <button
              onClick={flowComingSoon('Community guidelines')}
              className="text-xs text-flow-on-surface-variant hover:text-flow-primary transition-all"
            >
              Community Guidelines
            </button>
            <button
              onClick={flowComingSoon('Privacy policy')}
              className="text-xs text-flow-on-surface-variant hover:text-flow-primary transition-all"
            >
              Privacy Policy
            </button>
            <button
              onClick={flowComingSoon('Contact')}
              className="text-xs text-flow-on-surface-variant hover:text-flow-primary transition-all"
            >
              Contact
            </button>
          </nav>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="flow-safe-bottom md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-2 bg-flow-surface border-t border-flow-outline-variant shadow-lg z-40 rounded-t-xl">
        <Link to="/projects/flow" className={mobileNavItemClasses(exploreActive)}>
          <FlowIcon name="explore" filled={exploreActive} />
          <span className="text-[10px] font-bold">Explore</span>
        </Link>
        <Link to="/projects/flow/events" className={mobileNavItemClasses(active === 'events')}>
          <FlowIcon name="confirmation_number" filled={active === 'events'} />
          <span className="text-[10px] font-bold">Events</span>
        </Link>
        <button onClick={flowComingSoon('Bookings')} className={mobileNavItemClasses(false)}>
          <FlowIcon name="calendar_month" />
          <span className="text-[10px] font-bold">Bookings</span>
        </button>
        <button onClick={flowComingSoon('Profile')} className={mobileNavItemClasses(false)}>
          <FlowIcon name="person" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default FlowShell;
