import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePage, parsePost, readingMinutes } from "../src/content.ts";
import { contentPage } from "../src/templates/pages.ts";

const valid = `---
title: "A note"
date: "2026-10-10"
description: "Short."
---
Hello **world**.
`;

describe("parsePost", () => {
  it("parses a valid post", () => {
    const post = parsePost("a-note.md", valid);
    assert.equal(post.slug, "a-note");
    assert.equal(post.title, "A note");
    assert.equal(post.draft, false);
    assert.equal(post.minutes, 1);
    assert.equal(post.body, "Hello **world**.\n");
  });

  it("handles CRLF line endings", () => {
    assert.equal(parsePost("a-note.md", valid.replaceAll("\n", "\r\n")).title, "A note");
  });

  it("accepts unquoted dates", () => {
    assert.equal(parsePost("a-note.md", valid.replace('"2026-10-10"', "2026-10-10")).date, "2026-10-10");
  });

  for (const [name, file, source, message] of [
    ["invalid filenames", "My_Note.md", valid, /filename/],
    ["missing titles", "a.md", valid.replace('title: "A note"\n', ""), /title: must be/],
    ["blank descriptions", "a.md", valid.replace('"Short."', '"  "'), /description: must be/],
    ["impossible dates", "a.md", valid.replace("2026-10-10", "2026-02-30"), /date: must be/],
    ["non-ISO dates", "a.md", valid.replace("2026-10-10", "10/10/2026"), /date: must be/],
    ["non-boolean drafts", "a.md", valid.replace("---\nHello", 'draft: "yes"\n---\nHello'), /draft: must be/],
  ] as const) {
    it(`rejects ${name}`, () => assert.throws(() => parsePost(file, source), message));
  }
});

describe("parsePage", () => {
  const page = '---\ntitle: "Uses"\ndescription: "Tools."\n---\nBody';

  it("renders the title as heading by default and leaves the page out of the nav", () => {
    const parsed = parsePage("uses.md", page);
    assert.equal(parsed.slug, "uses");
    assert.match(contentPage(parsed, { origin: "", nav: [], year: 2026 }), /<h1>Uses<span class="dot">/);
    assert.equal(parsed.nav, undefined);
    assert.equal(parsed.eyebrow, undefined);
  });

  it("reads the nav position", () =>
    assert.equal(parsePage("uses.md", page.replace("---\nBody", "nav: 2\n---\nBody")).nav, 2));
  it("rejects non-numeric nav", () =>
    assert.throws(() => parsePage("uses.md", page.replace("---\nBody", 'nav: "2"\n---\nBody')), /nav: must be/));
  it("rejects reserved slugs", () => assert.throws(() => parsePage("posts.md", page), /reserved/));
});

describe("readingMinutes", () => {
  it("is at least one minute", () => assert.equal(readingMinutes(""), 1));
  it("rounds up at 220 words per minute", () => assert.equal(readingMinutes("word ".repeat(221)), 2));
});
