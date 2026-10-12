import { site } from "../config.ts";
import type { Post } from "../content.ts";
import { html } from "../html.ts";
import type { RenderContext } from "./layout.ts";
import { postPath } from "./pages.ts";

export function rssFeed(posts: Post[], { origin }: RenderContext): string {
  const items = posts.map(
    (post) => html`
    <item>
      <title>${post.title}</title>
      <link>${origin + postPath(post)}</link>
      <guid>${origin + postPath(post)}</guid>
      <description>${post.description}</description>
      <pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>
    </item>`,
  );

  return html`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${site.author}</title>
    <link>${origin}</link>
    <description>${site.description}</description>${items}
  </channel>
</rss>
`.value;
}

export function sitemap(paths: string[], { origin }: RenderContext): string {
  const urls = paths.map(
    (path) => html`
  <url><loc>${origin + path}</loc></url>`,
  );

  return html`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>
`.value;
}

export function robotsTxt({ origin }: RenderContext): string {
  return `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
}
