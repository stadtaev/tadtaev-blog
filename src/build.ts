import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { paths, site } from "./config.ts";
import { loadPages, loadPosts } from "./content.ts";
import { robotsTxt, rssFeed, sitemap } from "./templates/feeds.ts";
import type { RenderContext } from "./templates/layout.ts";
import { contentPage, homePage, notFoundPage, pagePath, postPage, postPath } from "./templates/pages.ts";

export type BuildOptions = {
  outDir?: string;
  origin?: string;
  /** Render draft posts too. Used by the dev server. */
  includeDrafts?: boolean;
};

async function write(file: string, contents: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
}

export async function build({
  outDir = "dist",
  origin = site.defaultOrigin,
  includeDrafts = false,
}: BuildOptions = {}): Promise<{ posts: number; pages: number }> {
  // Load everything before touching outDir, so invalid content leaves the previous build intact.
  const [posts, contentPages] = await Promise.all([
    loadPosts(paths.posts, { includeDrafts }),
    loadPages(paths.pages, { includeDrafts }),
  ]);
  const published = posts.filter((post) => !post.draft);
  const publishedPages = contentPages.filter((page) => !page.draft);
  const ctx: RenderContext = {
    origin: origin.replace(/\/$/, ""),
    nav: contentPages
      .filter((page) => page.nav !== undefined)
      .map((page) => ({ href: pagePath(page), label: page.title })),
    year: Number((published[0]?.date ?? new Date().toISOString()).slice(0, 4)),
  };

  await rm(outDir, { recursive: true, force: true });
  await cp(paths.public, outDir, { recursive: true });

  const files: Record<string, string> = {
    "index.html": homePage(posts, ctx),
    "404.html": notFoundPage(ctx),
    "feed.xml": rssFeed(published, ctx),
    "sitemap.xml": sitemap(["/", ...publishedPages.map(pagePath), ...published.map(postPath)], ctx),
    "robots.txt": robotsTxt(ctx),
  };
  for (const page of contentPages) files[`${page.slug}/index.html`] = contentPage(page, ctx);
  for (const post of posts) files[`${postPath(post).slice(1)}index.html`] = postPage(post, ctx, posts);

  await Promise.all(Object.entries(files).map(([file, contents]) => write(join(outDir, file), contents)));

  return { posts: posts.length, pages: contentPages.length };
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      out: { type: "string" },
      origin: { type: "string" },
      drafts: { type: "boolean", default: false },
    },
  });
  const { posts, pages } = await build({
    outDir: values.out,
    // `||` so an empty SITE_URL falls back to the default, as before.
    origin: values.origin || process.env.SITE_URL || site.defaultOrigin,
    includeDrafts: values.drafts,
  });
  console.log(`Built ${posts} posts and ${pages} pages.`);
}
