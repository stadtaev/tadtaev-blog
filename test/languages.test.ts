import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import { loadPosts, parsePost } from "../src/content.ts";
import { homePage, postPage, postPath } from "../src/templates/pages.ts";

const source = '---\ntitle: "Title"\ndate: "2026-10-12"\ndescription: "Description"\n---\nBody';
const ctx = { origin: "https://example.test", nav: [] };
it("keeps English URLs and gives Russian translations distinct URLs", () => {
  assert.equal(postPath(parsePost("note.md", source)), "/posts/note/");
  assert.equal(postPath(parsePost("note.en.md", source)), "/posts/note/");
  assert.equal(postPath(parsePost("note.ru.md", source)), "/posts/note/ru/");
  assert.throws(() => parsePost("note.fr.md", source), /language|filename/);
});
it("links translations, declares their language, and groups homepage entries", async () => {
  const dir = await mkdtemp(join(tmpdir(), "blog-languages-"));
  try {
    await writeFile(join(dir, "note.en.md"), source);
    await writeFile(join(dir, "note.ru.md"), source.replace('"Title"', '"Русский"'));
    const posts = await loadPosts(dir);
    const ru = posts.find((post) => postPath(post).endsWith("/ru/"))!;
    const page = postPage(ru, ctx, posts);
    assert.match(page, /<html lang="ru">/);
    assert.match(page, /hreflang="en" href="https:\/\/example.test\/posts\/note\/"/);
    assert.match(page, /hreflang="ru" href="https:\/\/example.test\/posts\/note\/ru\/"/);
    assert.match(page, /href="\/posts\/note\/"[^>]*>English/);
    assert.equal((homePage(posts, ctx).match(/<article class="post">/g) ?? []).length, 1);
    await writeFile(join(dir, "note.md"), source);
    await assert.rejects(loadPosts(dir), /duplicate|Duplicate/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
it("does not link draft translations in production", async () => {
  const dir = await mkdtemp(join(tmpdir(), "blog-language-drafts-"));
  try {
    await writeFile(join(dir, "note.en.md"), source);
    await writeFile(join(dir, "note.ru.md"), source.replace("---\nBody", "draft: true\n---\nBody"));
    const posts = await loadPosts(dir);
    assert.equal(posts.length, 1);
    assert.doesNotMatch(postPage(posts[0]!, ctx, posts), /hreflang="ru"/);
    assert.equal((await loadPosts(dir, { includeDrafts: true })).length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
