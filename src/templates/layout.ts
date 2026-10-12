import { defaultLanguage, languages, site, type Language } from "../config.ts";
import { html, type SafeHtml } from "../html.ts";

export type PageMeta = {
  title: string;
  description: string;
  /** Site-relative path, e.g. "/posts/my-note/". */
  path: string;
  language?: Language;
  alternates?: { language: Language; path: string }[];
};

export type NavItem = { href: string; label: string };

export type RenderContext = {
  origin: string;
  /** Links shown in the header after "Writing", built from pages that set `nav`. */
  nav: NavItem[];
  /** Copyright year in the footer; from the content, so rebuilding unchanged content gives the same output. */
  year: number;
};

function navLink(href: string, label: string, currentPath: string): SafeHtml {
  const current = currentPath === href ? html` aria-current="page"` : "";
  return html`<a href="${href}"${current}>${label}</a>`;
}

export function layout(meta: PageMeta, body: SafeHtml, { origin, nav, year }: RenderContext): string {
  const url = origin + meta.path;
  const fullTitle = meta.title === site.author ? meta.title : `${meta.title} — ${site.author}`;
  const ogType = meta.path.startsWith("/posts/") ? "article" : "website";

  return html`<!doctype html>
<html lang="${meta.language ?? defaultLanguage}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${fullTitle}</title>
    <meta name="description" content="${meta.description}">
    <meta name="color-scheme" content="light dark">
    <link rel="canonical" href="${url}">
    ${meta.alternates?.map((item) => html`<link rel="alternate" hreflang="${item.language}" href="${origin + item.path}">`)}
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
        <a class="wordmark" href="/">${site.wordmark.name}<span>${site.wordmark.suffix}</span></a>
        <nav aria-label="Main">
          ${navLink("/", languages[defaultLanguage].strings.writing, meta.path)}
          ${nav.map((item) => navLink(item.href, item.label, meta.path))}
          <a href="/feed.xml">RSS <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <main id="main">${body}</main>
      <footer>
        <span>© ${year} ${site.author}</span>
        <span>${site.tagline}</span>
      </footer>
    </div>
  </body>
</html>
`.value;
}

const dateFormats = Object.fromEntries(
  Object.entries(languages).map(([language, { locale }]) => [
    language,
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
  ]),
) as Record<Language, Intl.DateTimeFormat>;

const formatDate = (isoDate: string, language: Language): string =>
  dateFormats[language].format(new Date(`${isoDate}T12:00:00Z`));

/** Date and reading time, in `language` (the language of the page they appear on). */
export function postMeta(post: { date: string; minutes: number }, language: Language): SafeHtml {
  return html`<div class="meta"><time datetime="${post.date}">${formatDate(post.date, language)}</time><span>${post.minutes} ${languages[language].strings.minRead}</span></div>`;
}
