import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import FlowShell from './FlowShell';
import FlowIcon from './FlowIcon';
import { flowComingSoon, openFlowCommunityWhatsApp, FLOW_SHARE_IMAGE, FLOW_SHARE_IMAGE_SIZE } from './flowUtils';
import { experiences, communityEvents } from './flowData';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBrQp06nF04Lp5uSfbMRgL8VtccGZ5t7exR6Nh_Xbbi3tW2st8NFK2Vi8HXH3uNMa3ZQW792QS-NpTGOqIi5RGhYQKX8BI-RSnqjGOI2u3T3RLUPO4fhMgXe2HRqBcPACg0vSl3A7NwazW3_Bj-3uIIGVPFJ4tUWjBv0yp3OOPCgEh-9sgb98hKJcl1rP6JhHS-cf4p-jfFdaXEKMR5Mv8NBMlmbH_Suisxylxdagu5hvODKzRQofMSi4uTO8OlsP8DMMWbxuWA6xw';

const monthLabel = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();

const FlowHome: React.FC = () => {
  const featured = experiences.find((exp) => exp.featured);
  const gridExperiences = experiences.filter((exp) => !exp.featured).slice(0, 2);
  const discoverMore = experiences.filter((exp) => !exp.featured).slice(2);

  return (
    <FlowShell active="home">
      <SEOHead
        title="FLOW. community - Rio de Janeiro"
        description="Your gateway to Rio de Janeiro's most vibrant professional and social community. Curated experiences, events, and connections."
        image={FLOW_SHARE_IMAGE}
        imageWidth={FLOW_SHARE_IMAGE_SIZE}
        imageHeight={FLOW_SHARE_IMAGE_SIZE}
        siteName="FLOW. community"
      />

      {/* Desktop hero */}
      <section className="hidden md:flex relative overflow-hidden rounded-xl mx-10 mt-8 min-h-[300px] flex-col justify-end max-w-7xl md:mx-auto">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-flow-primary/80 to-transparent" />
        </div>
        <div className="relative z-10 text-white space-y-2 p-8 md:p-12">
          <h1 className="font-flow-headline text-[32px] leading-[40px] tracking-[-0.01em] font-bold">
            Welcome to FLOW. Rio
          </h1>
          <p className="text-lg leading-7 max-w-2xl text-white/90">
            Your gateway to the city&apos;s most vibrant professional and social connections. Let&apos;s make
            things happen today.
          </p>
        </div>
      </section>

      {/* Mobile hero */}
      <section className="md:hidden relative h-[70vh] min-h-[480px] w-full overflow-hidden flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-flow-surface via-transparent to-transparent z-10" />
          <img src={HERO_IMAGE} alt="Rio de Janeiro at golden hour" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-20 px-4 pb-10">
          <div className="bg-flow-primary-container/20 backdrop-blur-sm inline-block px-3 py-1 rounded-full mb-4 border border-flow-primary/20">
            <span className="text-flow-primary text-xs font-bold tracking-wider uppercase">
              Live the Extraordinary
            </span>
          </div>
          <h1 className="font-flow-headline text-[28px] leading-[36px] font-bold mb-3">
            Welcome to <span className="text-flow-primary">FLOW. Rio.</span>
          </h1>
          <p className="text-lg leading-7 text-flow-on-surface-variant max-w-[280px] mb-6">
            Discover hand-picked premium experiences in the Marvelous City.
          </p>
          <a
            href="#experiences"
            className="bg-flow-primary text-white font-bold text-sm tracking-wide px-6 py-4 rounded-xl shadow-lg active:scale-95 transition-transform w-full flex justify-between items-center"
          >
            EXPLORE EXPERIENCES
            <FlowIcon name="arrow_forward" />
          </a>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-10 py-10 space-y-12">
        <div id="experiences" className="grid grid-cols-1 md:grid-cols-12 gap-6 scroll-mt-20">
          <section className="md:col-span-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl leading-8 font-bold">Featured Experiences</h2>
              <Link to="/projects/flow/events" className="text-sm font-bold text-flow-primary hover:underline">
                See All
              </Link>
            </div>

            {/* Mobile: horizontal scroll cards */}
            <div className="md:hidden flex overflow-x-auto gap-4 flow-hide-scrollbar snap-x snap-mandatory -mx-4 px-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="flex-none w-[260px] snap-start">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-2 border border-flow-outline-variant/40">
                    <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-flow-surface/90 backdrop-blur px-3 py-1 rounded-full">
                      <span className="text-flow-primary text-xs font-bold">{exp.price}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-white/80 text-[10px] uppercase tracking-wide mb-1">{exp.category}</div>
                      <h3 className="text-white font-bold text-base leading-tight">{exp.title}</h3>
                    </div>
                  </div>
                  <p className="text-flow-on-surface-variant text-sm line-clamp-2">{exp.description}</p>
                </div>
              ))}
            </div>

            {/* Desktop: bento grid */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              {gridExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-xl overflow-hidden flex flex-col border border-flow-outline-variant/50 bg-white/70 backdrop-blur-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.1)]"
                >
                  <div className="h-48 relative overflow-hidden group">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {exp.badge && (
                      <div className="absolute top-4 left-4 bg-flow-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                        {exp.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-2 flex-grow">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-2xl leading-8 font-bold">{exp.title}</h3>
                      <span className="text-flow-primary font-bold whitespace-nowrap">{exp.price}</span>
                    </div>
                    <p className="text-flow-secondary">{exp.description}</p>
                  </div>
                  <div className="p-6 pt-0">
                    <button
                      onClick={flowComingSoon(exp.cta)}
                      className="w-full py-3 bg-flow-primary text-white font-bold rounded-lg hover:opacity-90 transition-colors"
                    >
                      {exp.cta}
                    </button>
                  </div>
                </div>
              ))}
              {featured && (
                <div className="col-span-2 rounded-xl overflow-hidden flex flex-col border border-flow-outline-variant/50 bg-white/70 backdrop-blur-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,0,0,0.1)]">
                  <div className="h-64 relative overflow-hidden">
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
                    {featured.badge && (
                      <div className="absolute top-4 left-4 bg-flow-tertiary text-white px-3 py-1 rounded-full text-xs font-bold">
                        {featured.badge}
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-2 flex-grow">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-2xl leading-8 font-bold">{featured.title}</h3>
                      <span className="text-flow-primary font-bold whitespace-nowrap">{featured.price}</span>
                    </div>
                    <p className="text-flow-secondary">{featured.description}</p>
                  </div>
                  <div className="p-6 pt-0">
                    <button
                      onClick={flowComingSoon(featured.cta)}
                      className="w-full py-3 bg-flow-primary text-white font-bold rounded-lg hover:opacity-90 transition-colors"
                    >
                      {featured.cta}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile: discover more list */}
            <div className="md:hidden space-y-3 pt-2">
              <h3 className="text-lg font-bold">Discover More</h3>
              {discoverMore.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center gap-4 p-4 bg-flow-surface-container-lowest rounded-xl border border-flow-outline-variant/40 shadow-sm"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-none">
                    <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm">{exp.title}</h4>
                    <p className="text-flow-on-surface-variant text-xs">{exp.description}</p>
                  </div>
                  <FlowIcon name="chevron_right" className="text-flow-outline" />
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-6">
            <div className="bg-flow-primary text-white p-8 rounded-xl space-y-4 shadow-lg relative overflow-hidden">
              <div className="w-fit bg-white/20 p-3 rounded-lg">
                <FlowIcon name="chat" className="text-white text-3xl" filled />
              </div>
              <h3 className="text-2xl leading-8 font-bold">Instant Connection</h3>
              <p className="text-white/80">
                Join 500+ Rio locals in our active WhatsApp group for daily updates, last-minute meetups, and
                local tips.
              </p>
              <button
                onClick={openFlowCommunityWhatsApp}
                className="w-full bg-white text-flow-primary font-bold py-4 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                Join our WhatsApp Group
                <FlowIcon name="open_in_new" />
              </button>
            </div>

            <div className="bg-white/70 backdrop-blur-md border border-flow-outline-variant p-8 rounded-xl space-y-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2">
                <FlowIcon name="stars" className="text-flow-primary" />
                <h3 className="text-2xl leading-8 font-bold">Upcoming Week</h3>
              </div>
              <div className="space-y-3">
                {communityEvents.slice(0, 3).map((ev) => (
                  <Link
                    to="/projects/flow/events"
                    key={ev.id}
                    className="flex gap-4 p-3 hover:bg-flow-surface-container-low rounded-lg transition-colors group"
                  >
                    <div className="bg-flow-primary-container text-flow-on-primary-container p-2 rounded h-fit font-bold text-center min-w-[50px]">
                      <div className="text-[10px] uppercase">{monthLabel}</div>
                      <div className="text-xl leading-none">{ev.day}</div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm group-hover:text-flow-primary transition-colors">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-flow-secondary">
                        {ev.time} • {ev.location}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                to="/projects/flow/events"
                className="block text-center py-3 bg-flow-secondary-container text-flow-on-secondary-container font-bold rounded-lg hover:opacity-90 transition-colors"
              >
                Full Calendar
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-2 bg-flow-surface-container rounded-full text-xs font-bold text-flow-secondary flex items-center gap-1">
                <FlowIcon name="group" className="text-sm" />
                1.2k Active Members
              </div>
              <div className="px-4 py-2 bg-flow-surface-container rounded-full text-xs font-bold text-flow-secondary flex items-center gap-1">
                <FlowIcon name="event" className="text-sm" />
                {experiences.length}+ Premium Experiences
              </div>
            </div>
          </aside>
        </div>

        {/* WhatsApp CTA (mobile only — desktop has it in the sidebar) */}
        <section className="md:hidden">
          <div className="bg-flow-primary/5 border border-flow-primary/10 rounded-2xl p-6 flex flex-col gap-4 items-center text-center">
            <div className="w-16 h-16 bg-flow-whatsapp/10 rounded-full flex items-center justify-center">
              <FlowIcon name="chat" className="text-flow-whatsapp text-3xl" filled />
            </div>
            <div>
              <h3 className="text-lg font-bold">Connect with the Community</h3>
              <p className="text-sm text-flow-on-surface-variant mt-1">
                Get real-time updates on secret parties and last-minute tickets.
              </p>
            </div>
            <button
              onClick={openFlowCommunityWhatsApp}
              className="bg-flow-whatsapp text-white font-bold px-8 py-3 rounded-xl w-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Join our WhatsApp Group
            </button>
          </div>
        </section>

        {/* Explore local communities CTA */}
        <section className="bg-white/70 backdrop-blur-md border border-flow-outline-variant rounded-2xl p-8 md:p-12 space-y-6 text-center flex flex-col items-center">
          <span className="text-flow-primary font-bold uppercase tracking-widest text-xs">Explore Local</span>
          <h2 className="text-[28px] md:text-[32px] leading-[36px] md:leading-[40px] font-bold tracking-[-0.01em]">
            Explore Local Communities
          </h2>
          <p className="text-flow-secondary max-w-2xl">
            Join neighborhood-specific groups and discover the best of Rio with fellow members.
          </p>
          <button
            onClick={openFlowCommunityWhatsApp}
            className="bg-flow-primary text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Join WhatsApp Group
            <FlowIcon name="open_in_new" />
          </button>
        </section>
      </div>
    </FlowShell>
  );
};

export default FlowHome;
