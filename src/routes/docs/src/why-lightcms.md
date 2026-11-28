---
title: "Why LightCMS Git-backed CMS for static sites"
description: Most cms platforms keep your content out of your soverignity LightCMS writes Markdown into your repo so you control the files and the workflow.
serial: 2
date: 2026-10-14T14:00:00Z
draft: false
tags:
  - lightcms
  - git
  - cms
  - static
  - markdown
  - publishing
keywords:
  - why lightcms
  - git based cms
  - headless cms
  - markdown cms
  - static site cms
preview: /og-image.png
---

Many hosted platforms store content behind their APIs. When the platform changes pricing or features, migrating content can be slow and error prone.

LightCMS takes a different approach: it is an editor that commits Markdown to your repository. You keep the canonical files and the build pipeline.

## Problems with hosted CMS platforms

Hosted systems can lock content into proprietary formats. That makes operations like grep, diffs, and branch‑based review harder. When you need to move, exporting becomes work.

## What Git-backed publishing gives you

- Portability: plain Markdown files work with any SSG or editor.
- Versioning and review: edits are Git commits; use branches and pull requests for drafts and reviews.
- Fast delivery: your CI builds static HTML and your CDN serves it.
- Lower hosting cost: many static hosting providers offer generous free tiers.

## The editor experience

LightCMS hides the Git mechanics so writing feels like a normal editor session. It uses a TipTap editor to produce clean Markdown, supports optional voice dictation, and can connect to an OpenAI-style endpoint for editing suggestions.

When you press Publish, LightCMS writes the file and your pipeline takes over.

## Sustainability

Static, cached pages use far less energy per page view than server-rendered pages because they avoid per-request rendering and large numbers of origin requests.

## Who it's for

LightCMS is a good fit if you:

- Use a static site generator and want a friendly editor for collaborators.
- Prefer to keep content portable and durable in your repo.
- Want low-cost, fast content delivery via a CDN.

It is not the right choice if you need real time features or complex relational content that requires a managed backend.

## Next steps

- [Getting started with LightCMS](/docs/getting-started-with-lightcms)
- [How to start a blog](/docs/how-to-start-a-blog)
- [Self hosting LightCMS](/docs/self-hosting-lightcms)
- [Static sites and CO2](/docs/building-a-greener-web)
