# tadtaev.dev

A small TypeScript static blog, with handwritten CSS. No framework, theme engine, database, or runtime server.

## Quick start

Requires Node 24 and npm. The `.node-version` file records the supported development version.

```sh
npm ci
npm run dev
```

Open <http://localhost:4321>. Changes to `content/`, `public/`, and `src/` rebuild the site; refresh your browser manually. Drafts are included in development. Stop both processes with Ctrl+C. The development commands run through `concurrently`, including on Windows.

## Commands

| Command                | Purpose                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `npm run dev`          | Watch content and source, and serve `.dev/`.                       |
| `npm run build`        | Generate production output in `dist/`, excluding drafts.           |
| `npm run preview`      | Serve an existing `dist/` build locally. Run the build first.      |
| `npm run check`        | Type-check TypeScript without emitting files.                      |
| `npm test`             | Run the test suite.                                                |
| `npm run format`       | Apply Prettier formatting.                                         |
| `npm run format:check` | Check formatting without changing files.                           |
| `npm run verify`       | Run type checks, formatting checks, tests, and a production build. |

Both local servers use port 4321 and fail if it is occupied. Run development and production preview separately.

Build options are passed after `--`:

```sh
npm run build -- --out dist --origin https://example.com
npm run build -- --drafts --out .dev
```

The origin comes from `--origin`, then `SITE_URL`, then `https://tadtaev.dev`. Empty values fall back to the next source. A trailing slash is removed. `--drafts` is for local review; do not publish that output.

Content parsing and validation finish before the output directory is replaced. Content errors preserve the previous build; later rendering or filesystem errors can leave incomplete output.

## Project structure

```text
content/
  pages/          Standalone Markdown pages
  posts/          Markdown posts; filenames become slugs
public/           Static assets copied into the output
scripts/          Local development port check
src/
  build.ts        Build orchestrator and CLI
  config.ts       Site settings and paths
  content.ts      Front matter parsing and validation
  html.ts         Escaped HTML template helpers
  editor/         Local Markdown workbench
  templates/      Page layouts and feeds
test/             Content, HTML, build, and regression tests
```

`dist/` and `.dev/` are generated and ignored by Git. Reading pages require no runtime server or browser JavaScript.

## Write a post

Add `content/posts/my-note.md`:

```markdown
---
title: "My note"
date: "2026-10-10"
description: "A short description."
draft: false
---

Your Markdown here.
```

- The filename stem becomes the URL (`/posts/my-note/`) and must use lowercase letters, numbers and hyphens. Posts may end in `.en.md` or `.ru.md`; see below.
- `title`, `description` and `date` are required; `date` must be a real `YYYY-MM-DD` date. Quoting values is recommended.
- `draft: true` (unquoted) keeps a post out of the build, RSS and sitemap. `npm run dev` shows drafts with a "Draft" label. Drafts with valid YAML skip field validation in production, so required fields can be unfinished. In dev, drafts with invalid fields are skipped with a warning. Malformed YAML always stops the build.
- Invalid published content stops the build with an error naming the file, and the previous `dist/` is left untouched.
- Markdown is trusted repository content: only commit files you have reviewed (raw HTML is supported).
- Put images in `public/images/` and reference `/images/example.png`.

The opening post is published by default. Edit it, remove it, or add `draft: true` before publishing if it is still a placeholder.

## Post translations

Use the same filename stem for each version:

| File                            | Language | URL                  |
| ------------------------------- | -------- | -------------------- |
| `my-note.md` or `my-note.en.md` | English  | `/posts/my-note/`    |
| `my-note.ru.md`                 | Russian  | `/posts/my-note/ru/` |

The filename determines the language; no language front matter is needed. Each version has its own title, description, date, body, and draft status. Unsupported suffixes and duplicate versions (such as both `my-note.md` and `my-note.en.md`) fail the build. A translation can exist without an English version.

The homepage lists each post once, preferring English when available, and links its available translations. Article pages link translations and emit their own canonical URL, HTML language, and reciprocal `hreflang` metadata. RSS and sitemap include every published version. Draft translations appear only in development output. The site navigation remains English.

The editor accepts filename stems such as `my-note.en` and `my-note.ru` and preserves them when reopening and downloading files.

## Add a page

Add `content/pages/uses.md`; it becomes `/uses/`. No code change is needed.

```markdown
---
title: "Uses"
description: "Tools I use."
nav: 2
---

Your Markdown here.
```

- `title` and `description` are required.
- `nav` (a number) links the page from the header; lower numbers come first. Leave it out to keep the page off the header.
- Optional: `heading` (the large heading; defaults to the title), `eyebrow` (small label above it), `draft`.
- Names used by generated files (`posts`, `editor`, `vendor`, `index`, `404`, `feed`, `sitemap`, `robots`) are rejected.

The About page is `content/pages/about.md`.

## Change the site

- Design: `public/style.css`.
- Page structure: `src/templates/` (`layout.ts` for the shared header and footer, `pages.ts` for page bodies, `feeds.ts` for RSS, sitemap and robots.txt).
- Author, metadata description, default origin, and reading speed: `src/config.ts`. The wordmark and introductory copy are in the templates.
- Front matter rules: `src/content.ts`.

## Editor

The `/editor/` workbench opens local Markdown, previews it safely, and downloads post files, keeping any extra front matter such as `draft: true`. It does not upload, store, authenticate, or publish posts. Publishing happens through Git and a build.

## Hosting and CI

Sites hosts the initial private version and keeps the source in its managed Git repository. A Git push alone is not configured to redeploy this Site. Updates can be published through Sites.

For independent push-to-deploy hosting on your Cloudflare account, copy this repository to GitHub/GitLab, create a Cloudflare Pages project, connect the repository, choose build command `npm run build`, output `dist`, and Node version 24. Set `SITE_URL=https://tadtaev.dev`. Connect `tadtaev.dev` through that Pages project's custom-domain flow. Do not attach the same domain to both hosts. The included GitHub workflow runs `npm run verify`; Cloudflare's Git integration performs deployment.

Alternatively use the DNS records returned by Sites' custom-domain registration. The domain is only live once DNS and certificate validation finish; DNS is managed in your Cloudflare account.

## Deliberately small

RSS at `/feed.xml`, sitemap at `/sitemap.xml`, responsive layouts, system dark mode, and readable article pages. No browser JavaScript on reading pages, analytics, remote fonts, or cookies. Dependencies: `marked` (Markdown), `@11ty/gray-matter` (front matter), `zod` (front matter validation), and `dompurify` and `js-yaml` for the editor.

## License

The builder code, tests, configuration, and reusable styles are licensed under the [MIT License](LICENSE).

Posts and pages in `content/`, personal images and other non-code assets in `public/`, and personal branding are excluded from the MIT grant. All rights to that material are reserved unless a file states otherwise. Dependency licenses remain their own.
