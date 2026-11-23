---
title: Introduction
serial: 1
date: 2026-09-01T16:44:00Z
draft: false
tags:
  - lightcms
  - cms
  - git
  - ssg
  - static
  - site
  - generator
keywords:
  - lightcms
  - getting started
  - introduction
  - wysiwyg
  - markdown
  - git based
---

LightCMS is a Git-backed editor for static sites. You write in a rich editor and press Publish; LightCMS commits clean Markdown into your repository. Your build and deploy pipeline — Cloudflare Pages, Netlify, Vercel, GitHub Pages, or similar — takes it from there.

Your content stays in a repository you own as plain Markdown files. Any static site generator that reads Markdown can build the site.

## How it works

1. Sign in with GitHub or another supported provider.
2. Connect the repository that contains your site (Astro, Hugo, SvelteKit, Jekyll, Eleventy, Next, etc.).
3. Create or edit content in the editor: new posts, updates, image uploads, and front matter changes without using the terminal.
4. Press Publish. LightCMS writes the Markdown to the path you configured (for example `content/blog/my-post.md`).
5. Your CI/CD pipeline builds and deploys the site. The new page typically appears within a few minutes depending on your host.

LightCMS runs only while someone writes. Site visitors see the static pages served by your CDN.

## Editor highlights

- TipTap-based editor that produces clean Markdown with front matter.
- Optional AI helper that connects to any OpenAI-compatible API to suggest edits or continue a draft.
- Voice dictation via OpenAI-compatible transcription or Wit.ai for quick drafts.
- Light and dark themes so the editor is comfortable for long writing sessions.
- Optional newsletter automation that can send posts to subscribers using Newsy (see /docs/newsletter-newsy).

## What LightCMS does not do

- LightCMS does not host
  your site or serve pages to readers. You keep control of hosting and delivery.
- It does not replace your deployment pipeline. It integrates with the workflow you already have.

## Why this matters

- Portability: your content is plain files in your repo. Swap tools later without migrating a database.
- Traceability: every change is a Git commit, so you get full history and the usual Git collaboration model.
- Performance and cost: static HTML served from a CDN loads fast and is inexpensive to deliver.

## Next steps

- [Why LightCMS?](/docs/why-lightcms) — the design reasons for Git-backed publishing
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and publish your first post
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — run your own instance
- [Newsletter automation](/docs/newsletter-newsy) — send posts to subscribers with Newsy
- [Building a greener web](/docs/building-a-greener-web) — how static sites reduce carbon emissions
