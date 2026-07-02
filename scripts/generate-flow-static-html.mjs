// This SPA has a single index.html, so social/link-preview crawlers (which
// don't execute JS) always see index.html's static <head> tags — the
// react-helmet-async <SEOHead> tags each FLOW. community page sets only
// apply after the JS bundle runs, which crawlers skip. To give FLOW. its
// own link-preview SEO without adopting a full SSR setup, this script runs
// after `vite build` and writes a static HTML variant per FLOW. route with
// FLOW.-specific tags baked in, while the real React app (same bundle)
// still boots and takes over once the page loads in a browser.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const siteOrigin = 'https://cariocacoastalclub.com';

const FLOW_SHARE_IMAGE = '/flow/android-chrome-512x512.png';
const FLOW_SHARE_IMAGE_SIZE = '512';
const FLOW_SITE_NAME = 'FLOW. community';

const flowRoutes = [
  {
    urlPath: '/projects/flow',
    title: 'FLOW. community - Rio de Janeiro',
    description:
      "Your gateway to Rio de Janeiro's most vibrant professional and social community. Curated experiences, events, and connections.",
  },
  {
    urlPath: '/projects/flow/cities',
    title: 'FLOW. community | Join Your City',
    description:
      'Select a city to explore curated experiences and connect with a vetted local community.',
  },
  {
    urlPath: '/projects/flow/events',
    title: 'Events | FLOW. community',
    description: 'Discover tours, meetups, and parties happening this month in Rio de Janeiro.',
  },
];

function replaceTag(html, regex, replacement) {
  if (!regex.test(html)) {
    throw new Error(`generate-flow-static-html: expected to find ${regex} in dist/index.html`);
  }
  return html.replace(regex, replacement);
}

function buildFlowHtml(baseHtml, route) {
  const fullUrl = `${siteOrigin}${route.urlPath}`;
  const fullImage = `${siteOrigin}${FLOW_SHARE_IMAGE}`;
  let html = baseHtml;

  // Favicon / manifest — match the FLOW.-specific icon set the client-side
  // Helmet swap in App.tsx applies once React hydrates.
  html = replaceTag(
    html,
    /<link rel="icon" type="image\/png" href="\/logo-icon-color\.png" \/>/,
    '<link rel="icon" type="image/x-icon" href="/flow/favicon.ico" />\n  ' +
      '<link rel="icon" type="image/png" sizes="32x32" href="/flow/favicon-32x32.png" />\n  ' +
      '<link rel="icon" type="image/png" sizes="16x16" href="/flow/favicon-16x16.png" />'
  );
  html = replaceTag(
    html,
    /<link rel="apple-touch-icon" href="\/logo_320x320\.png" \/>/,
    '<link rel="apple-touch-icon" href="/flow/apple-touch-icon.png" />'
  );
  html = replaceTag(
    html,
    /<link rel="manifest" href="\/manifest\.json" \/>/,
    '<link rel="manifest" href="/flow/site.webmanifest" />'
  );

  html = replaceTag(html, /<title>[^<]*<\/title>/, `<title>${route.title}</title>`);
  html = replaceTag(
    html,
    /<meta name="description"\s+content="[^"]*" \/>/,
    `<meta name="description" content="${route.description}" />`
  );

  html = replaceTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${route.title}" />`);
  html = replaceTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${route.description}" />`);
  html = replaceTag(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${fullImage}" />`);
  html = replaceTag(html, /<meta property="og:image:width" content="[^"]*" \/>/, `<meta property="og:image:width" content="${FLOW_SHARE_IMAGE_SIZE}" />`);
  html = replaceTag(html, /<meta property="og:image:height" content="[^"]*" \/>/, `<meta property="og:image:height" content="${FLOW_SHARE_IMAGE_SIZE}" />`);
  html = replaceTag(html, /<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${route.title}" />`);
  html = replaceTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${fullUrl}" />`);
  html = replaceTag(html, /<meta property="og:site_name" content="[^"]*" \/>/, `<meta property="og:site_name" content="${FLOW_SITE_NAME}" />`);

  html = replaceTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${route.title}" />`);
  html = replaceTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${route.description}" />`);
  html = replaceTag(html, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${fullImage}" />`);

  html = replaceTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${fullUrl}" />`);

  return html;
}

function main() {
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`generate-flow-static-html: ${indexPath} not found — run vite build first`);
  }
  const baseHtml = fs.readFileSync(indexPath, 'utf8');

  for (const route of flowRoutes) {
    const html = buildFlowHtml(baseHtml, route);
    const outDir = path.join(distDir, route.urlPath.replace(/^\//, ''));
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    console.log(`✅ Generated static SEO HTML for ${route.urlPath}`);
  }
}

main();
