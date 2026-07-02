import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEOHead from '../components/SEOHead';
import SiteHeader from '../components/alva/SiteHeader';
import { BRAND_NAME } from '../lib/alva';
import { blogPosts } from '../content/blogPosts.generated';

const SITE_ORIGIN = 'https://cariocacoastalclub.com';
const DEFAULT_OG_IMAGE = '/logo-sq.jpeg';

const formatDate = (iso: string, lang: string) =>
  new Date(iso).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-sunset-200 via-beach-100 to-sand-50 font-sans text-sand-800">
        <SEOHead title={`Not found — ${BRAND_NAME}`} description="This post doesn't exist." />
        <SiteHeader variant="full" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-display text-2xl font-bold text-sand-900">[TODO: post not found]</p>
          <Link to="/blog" className="text-beach-600 underline underline-offset-2">
            ← Back to Diário da Alva
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `${SITE_ORIGIN}/blog/${post.slug}`;
  const ogImage = post.image || DEFAULT_OG_IMAGE;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image ? `${SITE_ORIGIN}${post.image}` : `${SITE_ORIGIN}${DEFAULT_OG_IMAGE}`,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    inLanguage: post.lang,
    url: canonicalUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    author: { '@type': 'Organization', name: BRAND_NAME },
    publisher: { '@type': 'Organization', name: BRAND_NAME },
  };

  return (
    <div className="min-h-screen bg-sand-50 font-sans text-sand-800">
      <SEOHead
        title={`${post.title} — ${BRAND_NAME}`}
        description={post.description}
        image={ogImage}
        url={canonicalUrl}
        type="article"
        siteName={BRAND_NAME}
        locale={post.lang === 'pt' ? 'pt_BR' : 'en_US'}
      />
      <Helmet>
        <html lang={post.lang} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="bg-gradient-to-b from-sunset-200 via-beach-100 to-sand-50">
        <SiteHeader variant="full" />
        <header className="px-6 pb-10 text-center sm:pb-14">
          <Link to="/blog" className="text-xs font-semibold uppercase tracking-widest text-beach-600">
            ← Diário da {BRAND_NAME}
          </Link>
          <h1 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-sand-900 sm:text-4xl">
            {post.title}
          </h1>
          <time dateTime={post.dateISO} className="mt-3 block text-sm text-sand-600">
            {formatDate(post.dateISO, post.lang)}
          </time>
        </header>
      </div>

      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        {post.image && (
          <img
            src={post.image}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full rounded-2xl"
          />
        )}
        <article className="alva-prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </main>
    </div>
  );
};

export default BlogPost;
