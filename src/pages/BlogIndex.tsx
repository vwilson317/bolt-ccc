import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import SiteHeader from '../components/alva/SiteHeader';
import { BRAND_NAME, PARENT_BRAND_NAME, WHATSAPP_URL, INSTAGRAM_URL, handleCTAClick } from '../lib/alva';
import { blogPosts } from '../content/blogPosts.generated';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const BlogIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sunset-200 via-beach-100 to-sand-50 font-sans text-sand-800">
      <SEOHead
        title={`Diário da ${BRAND_NAME} — ${BRAND_NAME}`}
        description="Diário da Alva — a build-in-public journal of Alva's milestones, pilots, and learnings, mostly in photos."
        siteName={BRAND_NAME}
      />

      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sunset-400/60 blur-2xl sm:h-56 sm:w-56"
          aria-hidden="true"
        />
        <SiteHeader variant="full" />

        <div className="relative mx-auto max-w-2xl px-6 pb-10 pt-4 text-center sm:pb-14">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-beach-600 sm:text-5xl">
            Diário da {BRAND_NAME}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sand-700">
            Milestones, pilots, and learnings — building {BRAND_NAME} in public.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
        {blogPosts.length === 0 ? (
          <p className="text-center text-sand-500">[TODO: no posts yet]</p>
        ) : (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <li key={post.slug} className="flex">
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg"
                >
                  {post.image && (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-sand-100">
                      <img
                        src={post.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-6">
                    <time dateTime={post.dateISO} className="text-xs font-semibold uppercase tracking-widest text-beach-600">
                      {formatDate(post.dateISO)}
                    </time>
                    <h2 className="font-display text-lg font-bold text-sand-900">{post.title}</h2>
                    <p className="line-clamp-2 text-sm leading-relaxed text-sand-600">{post.description}</p>
                    <span className="mt-2 text-sm font-semibold text-beach-600 group-hover:underline">Read More</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-sand-200 bg-white/60 px-6 py-10 text-center">
        <Link to="/" className="text-sm font-semibold text-beach-600 hover:underline">
          ← Back to Home
        </Link>
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => handleCTAClick('blog_footer_instagram', 'Instagram', '/blog', INSTAGRAM_URL)}
            aria-label="Instagram"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-beach-300 text-beach-600 transition-colors hover:bg-beach-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleCTAClick('blog_footer_whatsapp', 'WhatsApp', '/blog', WHATSAPP_URL)}
            aria-label="WhatsApp"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-beach-300 text-beach-600 transition-colors hover:bg-beach-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </button>
        </div>
        <p className="mt-6 text-xs text-sand-400">
          &copy; {new Date().getFullYear()} {BRAND_NAME}. {PARENT_BRAND_NAME}. Rio de Janeiro.
        </p>
      </footer>
    </div>
  );
};

export default BlogIndex;
