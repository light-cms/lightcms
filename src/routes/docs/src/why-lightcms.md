---
title: "Why LightCMS: Git-backed publishing without the lock-in"
description: Most CMS platforms own your content. LightCMS keeps it in your Git repo, in plain Markdown, deployed by your own pipeline.
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

Most content platforms store your writing in their database, render it on their servers, and charge you to keep accessing it. When the platform shuts down, raises prices, or changes its terms, your content goes with it.

[LightCMS](https://lightcms.me) takes a different position: your content lives in your own Git repository as plain Markdown files. [LightCMS](https://lightcms.me) never touches your readers — it only runs while you're writing.

## The Core Problem with Hosted CMS Platforms

When you publish on a traditional hosted CMS, you're renting space in someone else's database. That sounds fine until something goes wrong.

The platform kills your plan tier. They add a new storage limit. They get acquired. The import tool breaks. Suddenly migrating years of content is an afternoon of work you didn't budget for.

Even when nothing goes wrong, the lock-in is quiet but real. Your content is trapped in a proprietary format behind an API. You can't run a `grep` on your own articles. You can't diff a draft against the previous version. You can't resolve a merge conflict in a post.

With [LightCMS](https://lightcms.me), content is committed to your repo as Markdown files. That's it. Your publishing pipeline is just a static site generator — Astro, Hugo, Jekyll, Eleventy, Zola, whatever you're already using. [LightCMS](https://lightcms.me) is the editor layer on top. Swap it out anytime, and your content is untouched.

## What Git based publishing actually means

Every save is a commit. Every edit is auditable and version controlled. Every post has a full history going back to the first draft.

Collaboration works the same way it does for code: branches for drafts, pull requests for review, commit messages as a changelog. If you're already comfortable with Git, this is the mental model you already have for everything else in your stack.

The flipside is that readers never hit [LightCMS](https://lightcms.me). Content is committed to your repository, the build pipeline runs (Cloudflare Pages, Netlify, Vercel, GitHub Pages), and the output is static HTML served from a CDN edge node. No application server sits between your reader and the content.

This matters for performance — cached static files load fast. It also matters for cost. Most of these hosts have free tiers that cover a high-traffic personal site or small publication without a monthly bill.

## The editor doesn't make you think about any of this

The Git mechanics run in the background. From the editor, the experience is just writing.

The TipTap-based editor writes clean Markdown. You can dictate using any Whisper-compatible API or Wit.ai if you prefer voice. The built-in AI copilot, which works with any OpenAI-compatible endpoint, can refine a draft, fix a sentence, or pick up where you left off.

When you hit publish, LightCMS commits the file to the path you've configured and your deployment pipeline takes over. If you're on Cloudflare Pages, the post is live within about a minute.

## What LightCMS is not

It's not a hosted blogging platform. There's no LightCMS managed infrastructure between you and your readers. LightCMS is software you run as a writer and it writes to repositories you own.

## The sustainability angle

Static sites emit significantly less CO2 per page view than server-rendered equivalents. There's no always-on database, no per-request rendering, and no server to keep warm. A page view that hits a CDN cache is mostly just a network hop.

[Research puts a typical static, cached page at around 0.002 grams of CO2 per visit](https://www.websitecarbon.com/) — versus a gram or more for a heavy, server-rendered page. That gap compounds across millions of page views.

It's not the primary reason to choose a static architecture, but it's a real benefit if the environmental cost of infrastructure matters to you.

## Who it's for

LightCMS is a good fit if:

- You're a developer running a blog on a static site generator and want a decent editor for yourself or collaborators
- You want your writing to outlast any single platform
- You want zero hosting costs for content delivery
- You want your content in a format that AI coding agents, search tools, and custom scripts can all read natively

It's not a good fit if you need real-time features, complex relational content structures, or a fully managed platform where someone else handles infrastructure.

## Where to go from here

- [Getting started with LightCMS](/docs/getting-started-with-lightcms) — overview of features and how it works
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — run your own instance, full configuration reference
- [Static sites and CO2](/docs/building-a-greener-web) — the environmental case for static publishing in more depth
