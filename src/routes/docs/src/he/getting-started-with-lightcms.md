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

[LightCMS](https://www.lightcms.me) is a Git-backed editor for static sites. You write in a rich editor, hit publish, and [LightCMS](https://www.lightcms.me) commits clean Markdown to your repository. Your deployment pipeline — Cloudflare Pages, Netlify, Vercel, GitHub Pages — takes it from there.

Your content lives in your own Git repository as plain Markdown files, readable and deployable by any static site generator you're already using.

## How it works

1. Sign in with your GitHub account.
2. Connect the repository that contains your static site. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — anything that reads Markdown.
3. Write and edit content in the built-in editor. Create posts, edit existing ones, upload images, and fill in front matter fields without touching a terminal.
4. Hit publish. [LightCMS](https://www.lightcms.me) commits your content to the path you've configured — for example, `content/blog/my-post.md` in your repository root.
5. Your build pipeline deploys automatically. The post is live within a minute or two, depending on your host.

That's the full loop. [LightCMS](https://www.lightcms.me) only runs while you're writing. Readers are served by your CDN, not by [LightCMS](https://www.lightcms.me).

## What's in the editor

**TipTap-based rich editor** — writes clean Markdown with front matter. What you see is what gets committed. If you've ever opened a `.md` file and found a soup of HTML tags, this is the alternative.

**AI copilot** — connected to any OpenAI-compatible API. Useful when a paragraph isn't landing: ask it to tighten the wording, expand a point, or pick up a draft you abandoned mid-thought.

**Voice-to-text** — dictate directly into the editor using any Whisper-compatible transcription API or Wit.ai. Good for getting a messy first draft down quickly when typing gets in the way of thinking.

**Light and dark themes** — several theme options so the editor is comfortable during longer writing sessions.

**Newsletter automation** — publish a post and notify subscribers automatically via [Newsy](/docs/newsletter-newsy). No third-party newsletter service required.

## What [LightCMS](https://www.lightcms.me) does not do

It doesn't host your content or serve your readers, and that's by design. If you're coming from WordPress or Ghost, the CMS being the host is what you're used to. Here the relationship is different: [LightCMS](https://www.lightcms.me) is a writing tool, not infrastructure. Your static site generator builds the output, your hosting provider serves it, and you own every file. Switching editors, generators, or hosts doesn't mean migrating a database.

It doesn't replace your deployment setup either. It works with whatever pipeline you already have.

## Next steps

- [Why LightCMS?](/docs/why-lightcms) — the design philosophy behind Git-backed publishing
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — run your own private instance
- [Newsletter automation](/docs/newsletter-newsy) — send posts to subscribers automatically with Newsy
- [Building a greener web](/docs/building-a-greener-web) — why static publishing is the lower-carbon choice
