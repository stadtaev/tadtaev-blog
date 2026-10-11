# tadtaev.dev

A small TypeScript static blog, with handwritten CSS. No framework, theme engine, database, or runtime server.

## Commands

Requires Node 24. Run `npm ci` once, then:

- `npm run dev` — preview at `http://localhost:4321` with drafts included. Rebuilds whenever `content/`, `public/` or `src/` changes; refresh the browser to see it. If a build fails, the last good version keeps being served. Uses a POSIX shell (`&`), so on Windows run it from WSL or Git Bash.
- `npm run build` — build the site into `dist/`. Serve `dist/` with any static host. Links use `SITE_URL` (default `https://tadtaev.dev`).
- `npm test` — run the tests.
- `npm run verify` — type-check, format check, tests and build; this is what CI runs. `npm run format` fixes formatting.

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

- The filename becomes the URL (`/posts/my-note/`) and must use lowercase letters, numbers and hyphens.
- `title`, `description` and `date` are required; `date` must be a real `YYYY-MM-DD` date. Quoting values is recommended.
- `draft: true` (unquoted) keeps a post out of the build, RSS and sitemap. `npm run dev` shows drafts with a "Draft" label. Drafts are not checked in production builds, so an unfinished draft never breaks a build; in dev, an incomplete draft is skipped with a warning.
- Invalid published content stops the build with an error naming the file, and the previous `dist/` is left untouched.
- Markdown is trusted repository content: only commit files you have reviewed (raw HTML is supported).
- Put images in `public/images/` and reference `/images/example.png`.

The opening post is a starter draft written for this site; edit or remove it before making the site public.

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
- Site name, description and reading speed: `src/config.ts`.
- Front matter rules: `src/content.ts`.

## Editor

The `/editor/` workbench opens local Markdown, previews it safely, and downloads post files, keeping any extra front matter such as `draft: true`. It does not upload, store, authenticate, or publish posts. Publishing happens through Git and a build.

## Hosting and CI

Sites hosts the initial private version and keeps the source in its managed Git repository. A Git push alone is not configured to redeploy this Site. Updates can be published through Sites.

For independent push-to-deploy hosting on your Cloudflare account, copy this repository to GitHub/GitLab, create a Cloudflare Pages project, connect the repository, choose build command `npm run build`, output `dist`, and Node version 24. Set `SITE_URL=https://tadtaev.dev`. Connect `tadtaev.dev` through that Pages project's custom-domain flow. Do not attach the same domain to both hosts. The included GitHub workflow runs `npm run verify`; Cloudflare's Git integration performs deployment.

Alternatively use the DNS records returned by Sites' custom-domain registration. The domain is only live once DNS and certificate validation finish; DNS is managed in your Cloudflare account.

## Deliberately small

RSS at `/feed.xml`, sitemap at `/sitemap.xml`, responsive layouts, system dark mode, and readable article pages. No browser JavaScript on reading pages, analytics, remote fonts, or cookies. Runtime dependencies: `marked` (Markdown), `@11ty/gray-matter` (front matter), `zod` (front matter validation), and `dompurify` and `js-yaml` for the editor.
