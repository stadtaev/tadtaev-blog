# AGENTS.md

This file provides guidance to coding agents working with code in this repository.

## Commands

Requires Node 24. TypeScript runs directly via Node's type stripping; there is no compile step. Run `npm ci` after cloning.

- `npm run dev` — runs `node --watch-path=content --watch-path=public --watch-path=src src/build.ts --drafts --out .dev` alongside `serve .dev` through `concurrently` on `http://localhost:4321` (fails rather than switching port if taken). Rebuilds on change; no live reload, refresh manually. No custom dev-server code. `scripts/check-port.ts` checks port 4321 before dev/preview because the installed `serve` ignores `--no-port-switching`.
- `npm run build` — production build into `dist/`. Flags: `--out`, `--origin`, `--drafts`. Origin also comes from `SITE_URL`; empty or unset falls back to `https://tadtaev.dev`; a trailing slash is stripped.
- `npm test` — `node --test` over `test/*.test.ts`. Single file: `node --test test/content.test.ts`; single test: add `--test-name-pattern="rejects impossible dates"`.
- `npm run preview` — serves the existing `dist/` build on port 4321; build first.
- `npm run check` — `tsc --noEmit` (strict, `erasableSyntaxOnly`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).
- `npm run format` / `format:check` — Prettier.
- `npm run verify` — check + format:check + test + build; this is what CI runs.

## Architecture

A framework-free static site generator: Markdown + YAML front matter in, plain HTML out.

- `src/build.ts` — `build()` orchestrator plus CLI. Loads and validates all content **before** wiping the output dir (bad content leaves the previous build intact), then copies `public/`, renders every post and page, home, 404, feeds, and copies the editor plus the browser ES module builds of `marked`, `dompurify` and `js-yaml` (resolved with `import.meta.resolve`, listed in `editorVendor` in `config.ts`) to `vendor/`.
- `src/content.ts` — front matter parsing (`@11ty/gray-matter`, Eleventy's maintained gray-matter fork) and zod schemas for posts and pages; files found with `fs.glob`.
  - Filename = slug (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Posts need non-empty string `title`/`description` and a real `YYYY-MM-DD` `date`; pages need `title`/`description` and may set `nav` (number), `heading`, `eyebrow`. `draft` must be a boolean; quoted `"true"` is an error.
  - Drafts with valid YAML are skipped _before_ schema validation; malformed YAML still fails the build. With drafts included (dev), an invalid draft is skipped with a warning. Invalid published content throws a `ContentError` naming the file. `README.md` files are skipped.
- `src/html.ts` — `html` tagged template that **auto-escapes every interpolation** unless it is a `SafeHtml` (nested `html` or `raw()`). Use it for all markup; only use `raw()` for rendered Markdown, which is trusted repo content (raw HTML passes through unsanitized).
- `src/templates/` — `layout.ts` (shared page shell; header nav comes from `RenderContext.nav`), `pages.ts` (home, post, content page, 404), `feeds.ts` (RSS, sitemap, robots). Class names here are styled by `public/style.css`.
- `src/config.ts` — site constants (author, description, default origin, reading speed), content paths and the editor's vendored packages.
- `content/pages/*.md` — standalone pages at `/<slug>/` (About is `about.md`). Pages with `nav` appear in the header after "Writing", ordered ascending. Slugs that collide with generated output (`posts`, `editor`, `vendor`, …) are rejected. Adding a page or nav link needs no code change.
- `src/editor/index.html` — self-contained browser workbench at `/editor/` (disallowed in robots.txt). ES module script: previews Markdown with `marked` sanitized by DOMPurify (no images, embeds, forms, SVG/MathML; only `href`/`src`/`alt`/`title` attributes; only http(s), root-relative and `#` URLs), parses and writes front matter with js-yaml (double-quoted strings, all loaded keys such as `draft` preserved) and downloads a post file; it never uploads. Its slug regex and required fields mirror `content.ts` — keep them in sync.

## Constraints

- Reading pages ship no JavaScript, analytics, remote fonts, or cookies. Drafts never appear in production output, RSS or sitemap.
- The design is intentional: don't change `public/style.css` or the generated markup's look unless asked. Refactors must keep output visually identical — compare screenshots of the old and new `dist/`.
- `test/regressions.test.ts` pins behavior inherited from the original gray-matter-based build (draft skipping, BOM, empty front matter, file-named errors, empty `SITE_URL`). Keep it passing.
- `package.json` `overrides` pins `compression` to 1.8.2 (patched DoS advisory in the version `serve` depends on). Drop it once `serve` updates.
- Prefer Node built-ins and standard packages over hand-written infrastructure.
- Prettier has `embeddedLanguageFormatting: "off"` on purpose: otherwise it reformats the `html` templates as HTML and mangles the XML feeds. Prettier also turns `﻿`-style escapes in template literals into literal invisible characters; use `String.fromCharCode` in such cases.

## Deployment

`dist/` can be served by any static host. The README describes Cloudflare Pages (build `npm run build`, output `dist`, Node 24, `SITE_URL=https://tadtaev.dev`). CI only verifies; it does not deploy.
