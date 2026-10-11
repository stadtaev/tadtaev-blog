import { marked } from "marked";
import { site } from "../config.ts";
import type { Page, Post } from "../content.ts";
import { html, raw, type SafeHtml } from "../html.ts";
import { layout, postMeta, type RenderContext } from "./layout.ts";

/** Markdown is trusted repository content, so raw HTML inside it is passed through. */
function markdown(source: string): SafeHtml {
  return raw(marked.parse(source, { async: false }));
}

export const postPath = (post: Post): string => `/posts/${post.slug}/`;
export const pagePath = (page: Page): string => `/${page.slug}/`;

const draftBadge = (item: Post | Page) => (item.draft ? html` <span>Draft</span>` : "");

export function homePage(posts: Post[], ctx: RenderContext): string {
  const rows = posts.map(
    (post) => html`
      <article class="post">
        ${postMeta(post)}
        <h2><a href="${postPath(post)}">${post.title}</a>${draftBadge(post)}</h2>
        <p>${post.description}</p>
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
      <div class="section-label"><span>WRITING</span><span>${String(posts.length).padStart(2, "0")} NOTES</span></div>
      ${posts.length ? rows : html`<p>No published notes yet.</p>`}
    </section>`;

  return layout({ title: site.author, description: site.description, path: "/" }, body, ctx);
}

export function postPage(post: Post, ctx: RenderContext): string {
  const body = html`
    <a class="back" href="/">← All writing</a>
    <article class="reading">
      ${postMeta(post)}
      <h1>${post.title}</h1>
      <p class="article-description">${post.description}</p>
      <div class="prose">${markdown(post.body)}</div>
      <div class="article-end">Thanks for reading.<br><a href="/">← Back to the notebook</a></div>
    </article>`;

  return layout({ title: post.title, description: post.description, path: postPath(post) }, body, ctx);
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
