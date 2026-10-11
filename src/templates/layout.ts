import { site } from "../config.ts";
import { html, type SafeHtml } from "../html.ts";

export type PageMeta = {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/posts/my-note/". */
  path: string;
};

export type NavItem = { href: string; label: string };

export type RenderContext = {
  origin: string;
  /** Links shown in the header after "Writing", built from pages that set `nav`. */
  nav: NavItem[];
};

function navLink(href: string, label: string, currentPath: string): SafeHtml {
  const current = currentPath === href ? html` aria-current="page"` : "";
  return html`<a href="${href}"${current}>${label}</a>`;
}

export function layout(meta: PageMeta, body: SafeHtml, { origin, nav }: RenderContext): string {
  const url = origin + meta.path;
  const fullTitle = meta.title === site.author ? meta.title : `${meta.title} — ${site.author}`;
  const ogType = meta.path.startsWith("/posts/") ? "article" : "website";

  return html`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${fullTitle}</title>
    <meta name="description" content="${meta.description}">
    <meta name="color-scheme" content="light dark">
    <link rel="canonical" href="${url}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:type" content="${ogType}">
    <meta property="og:url" content="${url}">
    <link rel="stylesheet" href="/style.css">
    <link rel="alternate" type="application/rss+xml" title="${site.author}" href="/feed.xml">
  </head>
  <body>
    <div class="shell">
      <header>
        <a class="wordmark" href="/">tadtaev<span>.dev</span></a>
        <nav aria-label="Main">
          ${navLink("/", "Writing", meta.path)}
          ${nav.map((item) => navLink(item.href, item.label, meta.path))}
          <a href="/feed.xml">RSS <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <main id="main">${body}</main>
      <footer>
        <span>© ${new Date().getUTCFullYear()} ${site.author}</span>
        <span>Thoughtfully built. Simply written.</span>
      </footer>
    </div>
  </body>
</html>
`.value;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const formatDate = (isoDate: string): string => dateFormat.format(new Date(`${isoDate}T12:00:00Z`));

export function postMeta(post: { date: string; minutes: number }): SafeHtml {
  return html`<div class="meta"><time datetime="${post.date}">${formatDate(post.date)}</time><span>${post.minutes} min read</span></div>`;
}
