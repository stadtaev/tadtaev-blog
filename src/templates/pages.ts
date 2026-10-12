import { marked } from "marked";
import { defaultLanguage, languages, site } from "../config.ts";
import type { Page, Post } from "../content.ts";
import { html, raw, type SafeHtml } from "../html.ts";
import { layout, postMeta, type RenderContext } from "./layout.ts";

/** Markdown is trusted repository content, so raw HTML inside it is passed through. */
function markdown(source: string): SafeHtml {
  return raw(marked.parse(source, { async: false }));
}

export const postPath = (post: Post): string => `/posts/${post.slug}/${post.language === "ru" ? "ru/" : ""}`;
export const pagePath = (page: Page): string => `/${page.slug}/`;

const ui = languages[defaultLanguage].strings;

const draftBadge = (item: Post | Page) => (item.draft ? html` <span>${ui.draft}</span>` : "");

/** Joins lines with a line break that only shows on wide screens. */
const desktopLines = (lines: readonly string[]) =>
  lines.map((line, i) => (i === 0 ? line : html`<br class="desktop"> ${line}`));

function versions(post: Post, posts: Post[]): Post[] {
  return posts.filter((item) => item.slug === post.slug).sort((a, b) => a.language.localeCompare(b.language));
}

function languageLinks(post: Post, posts: Post[]): SafeHtml | string {
  const translations = versions(post, posts);
  if (translations.length < 2) return "";
  return html`<p class="meta">${translations.map((item) => html`<a href="${postPath(item)}" hreflang="${item.language}" lang="${item.language}">${languages[item.language].label}</a>`)}</p>`;
}

export function homePage(posts: Post[], ctx: RenderContext): string {
  const preferred = new Map<string, Post>();
  for (const post of posts) {
    if (!preferred.has(post.slug) || post.language === defaultLanguage) preferred.set(post.slug, post);
  }
  const entries = [...preferred.values()].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const rows = entries.map(
    (post) => html`
      <article class="post">
        ${postMeta(post, defaultLanguage)}
        <h2 lang="${post.language}"><a href="${postPath(post)}">${post.title}</a>${draftBadge(post)}</h2>
        <p lang="${post.language}">${post.description}</p>
        ${languageLinks(post, posts)}
      </article>`,
  );

  const body = html`
    <section class="intro">
      <p class="eyebrow">${site.home.eyebrow}</p>
      <h1>${site.author}<span class="dot">.</span></h1>
      <p class="lede">${desktopLines(site.home.lede)}</p>
      <p class="intro-note">${desktopLines(site.home.note)}</p>
    </section>
    <section aria-label="Recent writing">
      <div class="section-label"><span>${ui.writingLabel}</span><span>${String(entries.length).padStart(2, "0")} ${ui.notesLabel}</span></div>
      ${posts.length ? rows : html`<p>${ui.noNotes}</p>`}
    </section>`;

  return layout({ title: site.author, description: site.description, path: "/" }, body, ctx);
}

export function postPage(post: Post, ctx: RenderContext, posts: Post[] = [post]): string {
  const strings = languages[post.language].strings;
  const body = html`
    <a class="back" href="/">${strings.allWriting}</a>
    <article class="reading">
      ${postMeta(post, post.language)}
      ${languageLinks(post, posts)}
      <h1>${post.title}</h1>
      <p class="article-description">${post.description}</p>
      <div class="prose">${markdown(post.body)}</div>
      <div class="article-end">${strings.thanks}<br><a href="/">${strings.backToNotebook}</a></div>
    </article>`;

  return layout(
    {
      title: post.title,
      description: post.description,
      path: postPath(post),
      language: post.language,
      alternates: versions(post, posts).map((item) => ({ language: item.language, path: postPath(item) })),
    },
    body,
    ctx,
  );
}

export function contentPage(page: Page, ctx: RenderContext): string {
  const body = html`
    ${page.eyebrow ? html`<p class="eyebrow">${page.eyebrow}</p>` : ""}
    <h1>${page.heading ?? page.title}<span class="dot">.</span>${draftBadge(page)}</h1>
    <div class="prose about">${markdown(page.body)}</div>`;

  return layout({ title: page.title, description: page.description, path: pagePath(page) }, body, ctx);
}

export function notFoundPage(ctx: RenderContext): string {
  const body = html`
    <h1>${ui.notFoundHeading}</h1>
    <p>${ui.notFoundText}</p>
    <a href="/">${ui.notFoundBack}</a>`;

  return layout({ title: ui.notFoundTitle, description: ui.notFoundDescription, path: "/404.html" }, body, ctx);
}
