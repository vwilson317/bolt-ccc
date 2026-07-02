import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { blogPosts } from '../content/blogPosts.generated';

const BRAND_NAME = 'Alva';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

const BlogIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-sand-50 font-sans text-sand-800">
      <SEOHead
        title={`Diário da Alva — ${BRAND_NAME}`}
        description="Diário da Alva — a build-in-public journal of Alva's milestones, pilots, and learnings, mostly in photos."
        siteName={BRAND_NAME}
      />

      <header className="border-b border-sand-200 bg-gradient-to-b from-sunset-100 to-sand-50 px-6 py-10 text-center sm:py-14">
        <Link to="/" className="font-display text-sm font-bold uppercase tracking-widest text-beach-600">
          {BRAND_NAME}
        </Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-sand-900 sm:text-4xl">
          Diário da Alva
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sand-600">
          Milestones, pilots, and learnings — building Alva in public.
        </p>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        {blogPosts.length === 0 ? (
          <p className="text-center text-sand-500">[TODO: no posts yet]</p>
        ) : (
          <ul className="flex flex-col gap-8">
            {blogPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row"
                >
                  {post.image && (
                    <div className="aspect-[16/9] w-full flex-shrink-0 overflow-hidden bg-sand-100 sm:aspect-square sm:w-48">
                      <img
                        src={post.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-center gap-2 p-6">
                    <time dateTime={post.dateISO} className="text-xs font-semibold uppercase tracking-widest text-beach-600">
                      {formatDate(post.dateISO)}
                    </time>
                    <h2 className="font-display text-xl font-bold text-sand-900 group-hover:text-beach-600">
                      {post.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-sand-600">{post.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default BlogIndex;
