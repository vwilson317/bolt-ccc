// Shared markdown-loading logic for the blog build pipeline. Used by both
// scripts/build-blog-content.mjs (pre-build: generates the data module the
// React app imports for in-app navigation) and
// scripts/generate-blog-static-html.mjs (post-build: bakes the same content
// into real static HTML files for crawlers/SEO) so the two never drift.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

export function loadBlogPosts(contentDir) {
  if (!fs.existsSync(contentDir)) return [];

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'));

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf8');
    const { data, content } = matter(raw);

    if (!data.title || !data.date || !data.description) {
      throw new Error(
        `Blog post "${file}" is missing required frontmatter (title, date, description).`
      );
    }

    const date = new Date(data.date);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Blog post "${file}" has an invalid date: ${data.date}`);
    }

    return {
      slug,
      title: String(data.title),
      dateISO: date.toISOString(),
      description: String(data.description),
      image: data.image ? String(data.image) : null,
      lang: data.lang === 'pt' ? 'pt' : 'en',
      contentHtml: marked.parse(content).toString(),
    };
  });

  posts.sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  return posts;
}
