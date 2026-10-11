// Behaviour carried over from the original single-file build (gray-matter based). Keep these passing.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { after, before, describe, it } from "node:test";
import { loadPosts, parsePost } from "../src/content.ts";

describe("drafts", () => {
  let dir: string;
  before(async () => {
    dir = await mkdtemp(join(tmpdir(), "blog-posts-"));
    await writeFile(join(dir, "ok.md"), '---\ntitle: "Ok"\ndate: "2026-01-01"\ndescription: "d"\n---\nBody');
    // Unfinished draft: invalid filename and missing fields.
    await writeFile(join(dir, "WIP_Draft.md"), "---\ndraft: true\ntitle: \n---\nTODO");
  });
  after(() => rm(dir, { recursive: true, force: true }));

  it("are skipped before validation in production builds", async () => {
    assert.deepEqual(
      (await loadPosts(dir)).map((post) => post.slug),
      ["ok"],
    );
  });

  it("are skipped with a warning, not a failure, when drafts are included", async () => {
    assert.deepEqual(
      (await loadPosts(dir, { includeDrafts: true })).map((post) => post.slug),
      ["ok"],
    );
  });
});

describe("front matter compatibility", () => {
  const post = '---\ntitle: "A"\ndate: "2026-01-01"\ndescription: "d"\n---\nBody';

  it("ignores a byte order mark", () => assert.equal(parsePost("a.md", String.fromCharCode(0xfeff) + post).title, "A"));
  it("accepts empty front matter", () =>
    assert.throws(() => parsePost("a.md", "---\n---\nBody"), /a\.md: title: must be/));
  it("names the file on YAML syntax errors", () =>
    assert.throws(
      () => parsePost("broken.md", '---\ntitle: "unterminated\n---\n'),
      /^ContentError: broken\.md: invalid front matter/,
    ));
});

describe("build CLI", () => {
  let outDir: string;
  before(async () => {
    outDir = await mkdtemp(join(tmpdir(), "blog-cli-"));
    await promisify(execFile)(process.execPath, ["src/build.ts", "--out", outDir], {
      env: { ...process.env, SITE_URL: "" },
    });
  });
  after(() => rm(outDir, { recursive: true, force: true }));

  it("falls back to the default origin when SITE_URL is empty", async () => {
    assert.match(await readFile(join(outDir, "robots.txt"), "utf8"), /Sitemap: https:\/\/tadtaev\.dev\/sitemap\.xml/);
  });
});
