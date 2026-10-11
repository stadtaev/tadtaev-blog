# tadtaev.dev

A small TypeScript static blog, with handwritten CSS. No framework, theme engine, database, or runtime server.

## Write and publish

Requires Node 24. Run `npm ci`, `npm run check`, and `npm run build`. Serve `dist/` with any static host. Markdown is trusted repository content: only commit files you have reviewed (raw HTML is supported).

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

Quote all metadata strings. Filenames use lowercase letters, numbers, and hyphens and become `/posts/my-note/`. `draft: true` excludes a post. Put images in `public/images/` and reference `/images/example.png`. Edit `public/style.css` to change the design. Edit `src/build.ts` for page structure and the About text.

The `/editor/` workbench opens local Markdown, previews it safely, and downloads post files. It does not upload, store, authenticate, or publish posts. Publishing happens through Git and a build.

The opening post is a starter draft written for this site; edit or remove it before making the site public.

## Hosting and CI

Sites hosts the initial private version and keeps the source in its managed Git repository. A Git push alone is not configured to redeploy this Site. Updates can be published through Sites.

For independent push-to-deploy hosting on your Cloudflare account, copy this repository to GitHub/GitLab, create a Cloudflare Pages project, connect the repository, choose build command `npm run build`, output `dist`, and Node version 24. Set `SITE_URL=https://tadtaev.dev`. Connect `tadtaev.dev` through that Pages project's custom-domain flow. Do not attach the same domain to both hosts. The included GitHub workflow checks and builds; Cloudflare's Git integration performs deployment.

Alternatively use the DNS records returned by Sites' custom-domain registration. The domain is only live once DNS and certificate validation finish; DNS is managed in your Cloudflare account.

## Deliberately small

RSS at `/feed.xml`, sitemap at `/sitemap.xml`, responsive layouts, system dark mode, and readable article pages. No browser JavaScript on reading pages, analytics, remote fonts, or cookies.
