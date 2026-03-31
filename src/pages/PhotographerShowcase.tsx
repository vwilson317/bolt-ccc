import React, { useState } from 'react';
import { Instagram, Camera, Film, ExternalLink, User } from 'lucide-react';
import { photographers, Photographer, InstagramEmbed } from '../data/photographerData';
import { openInstagramLink } from '../utils/ctaButtonUtils';
import SEOHead from '../components/SEOHead';

// ─── Placeholder reel card shown when shortcode is clearly unset ─────────────

const PLACEHOLDER_PATTERN = /^REEL_SHORTCODE_\d+$/;

const PlaceholderCard: React.FC<{ handle: string }> = ({ handle }) => (
  <div className="flex-shrink-0 w-64 h-[455px] rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex flex-col items-center justify-center text-center p-6 gap-3">
    <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
      <Film className="w-7 h-7 text-gray-400" />
    </div>
    <p className="text-gray-400 text-sm">Coming soon</p>
    <button
      onClick={() => openInstagramLink(handle)}
      className="mt-2 text-xs text-beach-400 hover:text-beach-300 flex items-center gap-1 transition-colors"
    >
      <Instagram className="w-3 h-3" />
      View on Instagram
    </button>
  </div>
);

// ─── Single embed (post or reel, portrait or landscape) ──────────────────────

const EmbedCard: React.FC<{ item: InstagramEmbed; handle: string }> = ({ item, handle }) => {
  const [loadError, setLoadError] = useState(false);

  if (PLACEHOLDER_PATTERN.test(item.shortcode) || !item.shortcode || loadError) {
    return <PlaceholderCard handle={handle} />;
  }

  const basePath = item.type === 'post' ? 'p' : 'reel';
  const src = `https://www.instagram.com/${basePath}/${item.shortcode}/embed/`;

  // Landscape reels get a wider frame; posts and portrait reels use standard portrait sizing.
  const isLandscape = item.orientation === 'landscape';
  const frameWidth = isLandscape ? 480 : 320;
  const frameHeight = isLandscape ? 270 : 455;
  const containerClass = isLandscape
    ? 'flex-shrink-0 w-[480px] rounded-2xl overflow-hidden shadow-lg border border-gray-700 bg-black'
    : 'flex-shrink-0 w-80 rounded-2xl overflow-hidden shadow-lg border border-gray-700 bg-black';

  return (
    <div className={containerClass}>
      <iframe
        src={src}
        width={frameWidth}
        height={frameHeight}
        frameBorder="0"
        scrolling="no"
        allowTransparency
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        title={item.caption || `Instagram ${item.type} by @${handle}`}
        onError={() => setLoadError(true)}
        className="w-full"
      />
    </div>
  );
};

// ─── Individual photographer section ────────────────────────────────────────

const PhotographerSection: React.FC<{ photographer: Photographer; index: number }> = ({
  photographer,
  index,
}) => {
  const isEven = index % 2 === 0;

  return (
    <section
      id={photographer.id}
      className="py-16 md:py-24 border-b border-gray-800 last:border-b-0"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header — alternates left/right on desktop */}
        <div
          className={`flex flex-col gap-8 md:gap-12 mb-12 ${
            isEven ? 'md:flex-row' : 'md:flex-row-reverse'
          } items-start`}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {photographer.profileImage ? (
              <img
                src={photographer.profileImage}
                alt={photographer.name}
                className="w-28 h-28 md:w-40 md:h-40 rounded-full object-cover border-4 border-beach-500 shadow-xl shadow-beach-900/30"
              />
            ) : (
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-beach-600 to-ocean-700 border-4 border-beach-500 shadow-xl shadow-beach-900/30 flex items-center justify-center">
                <User className="w-14 h-14 text-white/60" />
              </div>
            )}
          </div>

          {/* Bio + CTA */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-beach-900/60 text-beach-300 text-xs font-semibold tracking-wide uppercase mb-3 border border-beach-700/40">
              {photographer.role.includes('Video') ? (
                <Film className="w-3 h-3" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
              {photographer.role}
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
              {photographer.name}
            </h2>

            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
              {photographer.bio}
            </p>

            <button
              onClick={() => openInstagramLink(photographer.instagramHandle)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-beach-500 to-beach-600 hover:from-beach-400 hover:to-beach-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-beach-900/40 active:scale-95"
            >
              <Instagram className="w-4 h-4" />
              @{photographer.instagramHandle}
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>

        {/* Work grid — horizontal scroll on mobile */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            Featured Work
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:flex-wrap md:overflow-x-visible md:pb-0">
            {photographer.featuredWork.map((item) => (
              <div key={item.shortcode} className="snap-start">
                <EmbedCard item={item} handle={photographer.instagramHandle} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

const PhotographerShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SEOHead
        title="Content Professionals – Carioca Coastal Club"
        description="Meet the content professionals behind Carioca Coastal Club. Discover the creators capturing Rio's vibrant beach culture through stunning reels and photography."
        image="/logo-sq.jpeg"
        type="website"
      />

      {/* ── Hero ── */}
      <div className="relative pt-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-32 -left-32 w-96 h-96 bg-beach-600/20 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-0 right-0 w-80 h-80 bg-ocean-600/15 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-beach-500/60" />
            <span className="text-beach-400 text-xs font-bold uppercase tracking-widest">
              Carioca Coastal Club
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-beach-500/60" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white text-center font-display leading-tight mb-4">
            Content{' '}
            <span className="bg-gradient-to-r from-beach-400 to-beach-300 bg-clip-text text-transparent">
              Professionals
            </span>
          </h1>

          <p className="text-center text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            The creators behind the lens — capturing the energy, beauty, and soul of Rio's
            beach culture, one frame at a time.
          </p>

          {/* Quick-nav chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {photographers.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="px-4 py-2 rounded-full border border-gray-700 text-gray-300 text-sm font-medium hover:border-beach-500 hover:text-beach-300 transition-colors duration-200"
              >
                {p.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Photographer sections ── */}
      <div className="border-t border-gray-800">
        {photographers.map((photographer, index) => (
          <PhotographerSection
            key={photographer.id}
            photographer={photographer}
            index={index}
          />
        ))}
      </div>

      {/* ── Footer CTA ── */}
      <div className="border-t border-gray-800 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Camera className="w-10 h-10 text-beach-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3 font-display">
            Want your work featured?
          </h2>
          <p className="text-gray-400 mb-6">
            If you're a photographer or videographer shooting Rio's beach scene, reach out —
            we'd love to showcase your work.
          </p>
          <button
            onClick={() => openInstagramLink('cariocacoastalclub')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-beach-500 text-beach-300 hover:bg-beach-500/10 transition-colors duration-200 font-semibold text-sm"
          >
            <Instagram className="w-4 h-4" />
            Message us on Instagram
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotographerShowcase;
