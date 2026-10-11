import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { build } from "../src/build.ts";
import { loadPosts } from "../src/content.ts";

describe("build", () => {
  let outDir: string;
  const origin = "https://example.test";
  const read = (file: string) => readFile(join(outDir, file), "utf8");

  before(async () => {
    outDir = await mkdtemp(join(tmpdir(), "blog-build-"));
    await build({ outDir, origin });
  });
  after(() => rm(outDir, { recursive: true, force: true }));

  it("writes every published post with a canonical URL", async () => {
    const posts = await loadPosts("content/posts");
    assert.ok(posts.length > 0);
    for (const post of posts) {
      const path = `/posts/${post.slug}/${post.language === "ru" ? "ru/" : ""}`;
      const page = await read(`${path.slice(1)}index.html`);
      assert.ok(page.includes(`<link rel="canonical" href="${origin}${path}"`));
      assert.ok(page.includes(`<html lang="${post.language}">`));
      assert.ok((await read("feed.xml")).includes(`${origin}${path}`));
      assert.ok((await read("sitemap.xml")).includes(`${origin}${path}`));
    }
  });

  it("writes the static pages, feeds and editor assets", async () => {
    for (const file of [
      "index.html",
      "about/index.html",
      "404.html",
      "feed.xml",
      "sitemap.xml",
      "robots.txt",
      "style.css",
      "editor/index.html",
      "vendor/marked.js",
      "vendor/purify.js",
      "vendor/js-yaml.js",
    ]) {
      assert.ok(await read(file), `${file} is empty`);
    }
  });

  it("marks the current page in the navigation", async () => {
    assert.match(await read("about/index.html"), /<a href="\/about\/" aria-current="page">About<\/a>/);
  });

  it("ships no JavaScript on reading pages", async () => {
    assert.doesNotMatch(await read("index.html"), /<script/);
  });

  it("uses the configured origin in feeds", async () => {
    assert.match(await read("feed.xml"), /<link>https:\/\/example\.test<\/link>/);
    assert.match(await read("robots.txt"), /Sitemap: https:\/\/example\.test\/sitemap\.xml/);
  });
});
