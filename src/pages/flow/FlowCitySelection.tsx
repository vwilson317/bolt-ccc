import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEOHead';
import FlowShell from './FlowShell';
import FlowIcon from './FlowIcon';
import { flowComingSoon } from './flowUtils';

const RIO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCxq-Sf7tJFFROVQShVMZodTo-ivQptf0XIpKB5i-o_GR1xAC4CKox9LhKJIWWw34bwEWpXGJf1r4HG-f_WrMCXFejIOLdpxpTUdTSXKuHm-7MWb63_M4vVNK0_gR_ys19tG5JY-nrBk0P65zTy9nYUusBb9IBjAKJUakhlfsX7tuyANUbuSHGqLPG-u0L1JeztZW4OO4YaPbs9CTM3VkTnvoYkD4h22jLiBpn0L2MnIAHPPYpG14Oxrp_6m7DvlerKnfNVbirRvdk';

const COMING_SOON_CITIES = [
  { name: 'São Paulo', tagline: 'The concrete jungle is waking up.', icon: 'location_city' },
  { name: 'Lisbon', tagline: 'Bringing the flow to the Seven Hills.', icon: 'sailing' },
];

const ADVANTAGES = [
  {
    icon: 'auto_awesome',
    title: 'Curated Experiences',
    text: 'No noise. Only high-quality events and gatherings that actually matter.',
  },
  {
    icon: 'diversity_3',
    title: 'Vetted Network',
    text: 'Connect with a community of professionals and creatives who value growth.',
  },
  {
    icon: 'explore',
    title: 'City Insights',
    text: 'Unlock the best kept secrets and hidden gems in your local neighborhood.',
  },
];

const FlowCitySelection: React.FC = () => {
  return (
    <FlowShell active="cities">
      <SEOHead
        title="FLOW. community | Join Your City"
        description="Select a city to explore curated experiences and connect with a vetted local community."
      />
      <div className="px-4 md:px-10 py-12 max-w-7xl mx-auto">
        <section className="w-full text-center mb-12 md:mb-16">
          <h1 className="text-[28px] md:text-[32px] leading-[36px] md:leading-[40px] font-bold tracking-[-0.01em] mb-4">
            Where energy meets belonging.
          </h1>
          <p className="text-lg leading-7 text-flow-secondary max-w-2xl mx-auto">
            Join a vibrant collective of creators, thinkers, and explorers. Discover curated events and
            meaningful connections in your city.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-5xl mx-auto">
          {/* Active city: Rio de Janeiro */}
          <Link
            to="/projects/flow"
            className="md:col-span-8 group relative overflow-hidden rounded-2xl bg-white border border-flow-outline-variant shadow-[0px_4px_20px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1 block"
          >
            <div className="relative h-64 md:h-[400px] w-full overflow-hidden">
              <div
                className="bg-cover bg-center w-full h-full transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${RIO_IMAGE}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-4 right-4 bg-flow-primary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ACTIVE NOW
              </div>
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-[32px] leading-[40px] font-bold mb-1">Rio de Janeiro</h2>
                <p className="flex items-center gap-2 opacity-90">
                  <FlowIcon name="groups" />
                  2,400+ members flowing
                </p>
              </div>
            </div>
            <div className="p-6 flex justify-between items-center bg-white border-t border-flow-outline-variant/50">
              <span className="text-flow-primary font-bold uppercase tracking-widest text-xs">
                Enter Community
              </span>
              <FlowIcon
                name="arrow_forward"
                className="text-flow-primary transition-transform group-hover:translate-x-2"
              />
            </div>
          </Link>

          {/* Coming soon cities */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {COMING_SOON_CITIES.map((city) => (
              <div
                key={city.name}
                className="flex-1 rounded-2xl bg-flow-surface-container-high border border-flow-outline-variant p-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[22px] leading-7 font-bold">{city.name}</h3>
                    <span className="bg-flow-secondary-container/50 text-flow-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                      SOON
                    </span>
                  </div>
                  <p className="text-flow-secondary text-sm">{city.tagline}</p>
                </div>
                <div className="mt-8">
                  <button
                    onClick={flowComingSoon(`${city.name} notifications`)}
                    className="w-full py-2.5 border-2 border-flow-primary/30 text-flow-primary font-bold text-sm rounded-xl hover:bg-flow-primary hover:text-white transition-all"
                  >
                    Notify Me
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FLOW advantage section */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 w-full pb-8">
          {ADVANTAGES.map((a) => (
            <div key={a.title} className="flex flex-col items-center text-center px-4">
              <div className="w-14 h-14 bg-flow-primary/10 rounded-full flex items-center justify-center mb-6">
                <FlowIcon name={a.icon} className="text-flow-primary text-3xl" />
              </div>
              <h4 className="text-xl font-bold mb-3">{a.title}</h4>
              <p className="text-flow-secondary">{a.text}</p>
            </div>
          ))}
        </div>
      </div>
    </FlowShell>
  );
};

export default FlowCitySelection;
