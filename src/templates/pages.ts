import { marked } from "marked";
import { site } from "../config.ts";
import type { Page, Post } from "../content.ts";
import { html, raw, type SafeHtml } from "../html.ts";
import { layout, postMeta, type RenderContext } from "./layout.ts";

/** Markdown is trusted repository content, so raw HTML inside it is passed through. */
function markdown(source: string): SafeHtml {
  return raw(marked.parse(source, { async: false }));
}

export const postPath = (post: Post): string => `/posts/${post.slug}/${post.language === "ru" ? "ru/" : ""}`;
export const pagePath = (page: Page): string => `/${page.slug}/`;

const draftBadge = (item: Post | Page) => (item.draft ? html` <span>Draft</span>` : "");

function versions(post: Post, posts: Post[]): Post[] {
  return posts.filter((item) => item.slug === post.slug).sort((a, b) => a.language.localeCompare(b.language));
}

function languageLinks(post: Post, posts: Post[]): SafeHtml | string {
  const translations = versions(post, posts);
  if (translations.length < 2) return "";
  return html`<p class="meta">${translations.map((item) => html`<a href="${postPath(item)}" hreflang="${item.language}" lang="${item.language}">${item.language === "en" ? "English" : "Русский"}</a>`)}</p>`;
}

export function homePage(posts: Post[], ctx: RenderContext): string {
  const preferred = new Map<string, Post>();
  for (const post of posts) {
    if (!preferred.has(post.slug) || post.language === "en") preferred.set(post.slug, post);
  }
  const entries = [...preferred.values()].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const rows = entries.map(
    (post) => html`
      <article class="post">
        ${postMeta(post)}
        <h2 lang="${post.language}"><a href="${postPath(post)}">${post.title}</a>${draftBadge(post)}</h2>
        <p lang="${post.language}">${post.description}</p>
        ${languageLinks(post, posts)}
      </article>`,
  );

  const body = html`
    <section class="intro">
      <p class="eyebrow">A PERSONAL NOTEBOOK</p>
      <h1>${site.author}<span class="dot">.</span></h1>
      <p class="lede">Notes on software, systems,<br class="desktop"> and making knowledge useful.</p>
      <p class="intro-note">A software engineer thinking out loud about architecture,<br class="desktop"> .NET, TypeScript, and AI-assisted engineering.</p>
    </section>
    <section aria-label="Recent writing">
      <div class="section-label"><span>WRITING</span><span>${String(entries.length).padStart(2, "0")} NOTES</span></div>
      ${posts.length ? rows : html`<p>No published notes yet.</p>`}
    </section>`;

  return layout({ title: site.author, description: site.description, path: "/" }, body, ctx);
}

export function postPage(post: Post, ctx: RenderContext, posts: Post[] = [post]): string {
  const body = html`
    <a class="back" href="/">← All writing</a>
    <article class="reading">
      ${postMeta(post)}
      ${languageLinks(post, posts)}
      <h1>${post.title}</h1>
      <p class="article-description">${post.description}</p>
      <div class="prose">${markdown(post.body)}</div>
      <div class="article-end">Thanks for reading.<br><a href="/">← Back to the notebook</a></div>
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
    <h1>Nothing here. Yet.</h1>
    <p>The page may have moved.</p>
    <a href="/">← Back to writing</a>`;

  return layout(
    { title: "Page not found", description: "This page could not be found.", path: "/404.html" },
    body,
    ctx,
  );
}
