// Runs after `vite build`. Bakes real, crawlable HTML for /blog and every
// /blog/:slug into dist/ (not just meta tags — see generate-flow-static-html
// for that pattern) since search engines need the actual post content, not
// just a client-rendered shell. main.tsx uses createRoot (not hydrateRoot),
// so this is plain replace-on-load, not hydration — no mismatch risk.
// Also emits dist/sitemap.xml and dist/rss.xml from the same post list.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBlogPosts } from './lib/blogContent.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const siteOrigin = 'https://cariocacoastalclub.com';
const brandName = 'Alva';
const defaultOgImage = '/logo-sq.jpeg';

const posts = loadBlogPosts(path.join(rootDir, 'content', 'blog'));
const whatsappUrl = 'https://chat.whatsapp.com/FVLJK8eqKzUKY7oUfnymD5?mode=gi_t';
const parentBrandName = 'Carioca Coastal Club';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso, lang) {
  return new Date(iso).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) {
    throw new Error(`generate-blog-static-html: expected to find ${regex} in the HTML template`);
  }
  return html.replace(regex, replacement);
}

/** Swaps the shared <head> tags (title/description/OG/Twitter/canonical) — same approach as generate-flow-static-html.mjs. */
function applyHeadTags(baseHtml, { title, description, image, url }) {
  let html = baseHtml;
  const fullImage = image.startsWith('http') ? image : `${siteOrigin}${image}`;

  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = replaceTag(html, /<meta name="description"\s+content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = replaceTag(html, /<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="article" />`);
  html = replaceTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  html = replaceTag(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${fullImage}" />`);
  // Blog post images have unknown real dimensions (unlike the default 500x500
  // site image these tags were written for), so drop the hint rather than lie.
  html = replaceTag(html, /\s*<meta property="og:image:width" content="[^"]*" \/>/, '');
  html = replaceTag(html, /\s*<meta property="og:image:height" content="[^"]*" \/>/, '');
  html = replaceTag(html, /<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${escapeHtml(title)}" />`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  html = replaceTag(html, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${fullImage}" />`);
  html = replaceTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  return html;
}

function injectRoot(baseHtml, innerHtml, extraHead = '') {
  let html = replaceTag(baseHtml, /<div id="root"><\/div>/, `<div id="root">${innerHtml}</div>`);
  if (extraHead) {
    html = html.replace('</head>', `${extraHead}\n</head>`);
  }
  return html;
}

/** Mirrors src/components/alva/SiteHeader.tsx's "full" variant. */
function renderSiteHeader(activeIsBlog) {
  return `
      <header class="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <a href="/" class="flex-shrink-0"><img src="/logo-text-pink.png" alt="${parentBrandName}" class="h-8 w-auto sm:h-9" /></a>
        <nav class="hidden items-center gap-8 text-sm font-semibold sm:flex">
          <a href="/" class="transition-colors hover:text-beach-600 ${activeIsBlog ? 'text-sand-800' : 'text-beach-600'}">Home</a>
          <a href="/blog" class="transition-colors hover:text-beach-600 ${activeIsBlog ? 'text-beach-600' : 'text-sand-800'}">Blog</a>
        </nav>
        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-beach-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-beach-500/30">
          <span class="hidden sm:inline">Join us on WhatsApp</span>
        </a>
      </header>`;
}

function renderBlogIndexHtml() {
  const items = posts
    .map(
      (post) => `
        <li class="flex">
          <a href="/blog/${post.slug}" class="group flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-lg">
            ${
              post.image
                ? `<div class="aspect-[16/10] w-full overflow-hidden bg-sand-100"><img src="${post.image}" alt="" loading="lazy" decoding="async" class="h-full w-full object-cover" /></div>`
                : ''
            }
            <div class="flex flex-1 flex-col gap-2 p-6">
              <time datetime="${post.dateISO}" class="text-xs font-semibold uppercase tracking-widest text-beach-600">${formatDate(post.dateISO, post.lang)}</time>
              <h2 class="font-display text-lg font-bold text-sand-900">${escapeHtml(post.title)}</h2>
              <p class="line-clamp-2 text-sm leading-relaxed text-sand-600">${escapeHtml(post.description)}</p>
              <span class="mt-2 text-sm font-semibold text-beach-600 group-hover:underline">Read More</span>
            </div>
          </a>
        </li>`
    )
    .join('\n');

  return `
    <div class="min-h-screen bg-gradient-to-b from-sunset-200 via-beach-100 to-sand-50 font-sans text-sand-800">
      <div class="relative overflow-hidden">
        ${renderSiteHeader(true)}
        <div class="relative mx-auto max-w-2xl px-6 pb-10 pt-4 text-center sm:pb-14">
          <h1 class="font-display text-4xl font-extrabold tracking-tight text-beach-600 sm:text-5xl">Diário da ${brandName}</h1>
          <p class="mx-auto mt-3 max-w-xl text-sand-700">Milestones, pilots, and learnings — building ${brandName} in public.</p>
        </div>
      </div>
      <main class="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
        <ul class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">${items}</ul>
      </main>
      <footer class="border-t border-sand-200 bg-white/60 px-6 py-10 text-center">
        <a href="/" class="text-sm font-semibold text-beach-600 hover:underline">← Back to Home</a>
        <p class="mt-6 text-xs text-sand-400">&copy; ${new Date().getFullYear()} ${brandName}. ${parentBrandName}. Rio de Janeiro.</p>
      </footer>
    </div>`;
}

function renderBlogPostHtml(post) {
  return `
    <div class="min-h-screen bg-sand-50 font-sans text-sand-800">
      <div class="bg-gradient-to-b from-sunset-200 via-beach-100 to-sand-50">
        ${renderSiteHeader(true)}
        <header class="px-6 pb-10 text-center sm:pb-14">
          <a href="/blog" class="text-xs font-semibold uppercase tracking-widest text-beach-600">← Diário da ${brandName}</a>
          <h1 class="mx-auto mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-sand-900 sm:text-4xl">${escapeHtml(post.title)}</h1>
          <time datetime="${post.dateISO}" class="mt-3 block text-sm text-sand-600">${formatDate(post.dateISO, post.lang)}</time>
        </header>
      </div>
      <main class="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        ${post.image ? `<img src="${post.image}" alt="" loading="eager" decoding="async" class="w-full rounded-2xl" />` : ''}
        <article class="alva-prose">${post.contentHtml}</article>
      </main>
    </div>`;
}

function jsonLdScript(post, url) {
  const image = post.image ? `${siteOrigin}${post.image}` : `${siteOrigin}${defaultOgImage}`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    inLanguage: post.lang,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: brandName },
    publisher: { '@type': 'Organization', name: brandName },
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function generateSitemap() {
  const urls = [
    { loc: `${siteOrigin}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${siteOrigin}/blog`, changefreq: 'weekly', priority: '0.8' },
    ...posts.map((post) => ({
      loc: `${siteOrigin}/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: post.dateISO.slice(0, 10),
    })),
    { loc: `${siteOrigin}/projects/flow`, changefreq: 'weekly', priority: '0.5' },
    { loc: `${siteOrigin}/projects/flow/cities`, changefreq: 'monthly', priority: '0.4' },
    { loc: `${siteOrigin}/projects/flow/events`, changefreq: 'weekly', priority: '0.5' },
  ];

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function generateRss() {
  const items = posts
    .map(
      (post) => `  <item>
    <title>${escapeHtml(post.title)}</title>
    <link>${siteOrigin}/blog/${post.slug}</link>
    <guid>${siteOrigin}/blog/${post.slug}</guid>
    <description>${escapeHtml(post.description)}</description>
    <pubDate>${new Date(post.dateISO).toUTCString()}</pubDate>
  </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Diário da ${brandName}</title>
  <link>${siteOrigin}/blog</link>
  <description>Milestones, pilots, and learnings — building ${brandName} in public.</description>
  <language>en</language>
${items}
</channel>
</rss>
`;
}

function main() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`generate-blog-static-html: ${indexPath} not found — run vite build first`);
  }
  const baseHtml = fs.readFileSync(indexPath, 'utf8');

  // /blog index
  const blogIndexHead = applyHeadTags(baseHtml, {
    title: `Diário da ${brandName} — ${brandName}`,
    description: `Diário da ${brandName} — a build-in-public journal of ${brandName}'s milestones, pilots, and learnings, mostly in photos.`,
    image: defaultOgImage,
    url: `${siteOrigin}/blog`,
  });
  const blogIndexHtml = injectRoot(blogIndexHead, renderBlogIndexHtml());
  const blogIndexDir = path.join(distDir, 'blog');
  fs.mkdirSync(blogIndexDir, { recursive: true });
  fs.writeFileSync(path.join(blogIndexDir, 'index.html'), blogIndexHtml);
  console.log('✅ Generated static HTML for /blog');

  // /blog/:slug
  for (const post of posts) {
    const url = `${siteOrigin}/blog/${post.slug}`;
    let html = applyHeadTags(baseHtml, {
      title: `${post.title} — ${brandName}`,
      description: post.description,
      image: post.image || defaultOgImage,
      url,
    });
    html = html.replace(/<html lang="en">/, `<html lang="${post.lang}">`);
    html = injectRoot(html, renderBlogPostHtml(post), jsonLdScript(post, url));
    const postDir = path.join(distDir, 'blog', post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), html);
    console.log(`✅ Generated static HTML for /blog/${post.slug}`);
  }

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), generateSitemap());
  console.log('✅ Generated sitemap.xml');

  fs.writeFileSync(path.join(distDir, 'rss.xml'), generateRss());
  console.log('✅ Generated rss.xml');
}

main();
