---
title: Why LightCMS?
description: The philosophy behind LightCMS — why writing should be frictionless, why Git backed content matters, and keeping complexity away from the writer.
serial: 2
section: Get Started
date: 2026-09-18T00:41:00Z
draft: false
tags:
  - cms
  - philosophy
  - lightcms
keywords:
  - why lightcms
  - git-backed cms
  - static sites
  - carbon footprint
preview: /og-image.png
---

Over the years we all have tried a lot of CMS's, but most were quite boring and didn't really hit the mark where you love writing.
The best I could find was using Front Matter extension in VS Code. This helps you manage your content files, however opening up an entire code editor, pulling down git branches, and dealing with formatting conflicts and debugging tools just to publish a 3 paragraph article seems like a large amount of effort.

Writing should be simple!

## Giving Everyone a Voice

The main aim of having a website is having a voice where you own your words. It is incredibly valuable to have your own space where you can publish freely no need for a middleman to censor.

If you have learnt something share it.

If you have created something interesting write about it.

If you have solved a difficult bug that took you 3 days to understand, write about it! Someone will search for that exact error in 6 months time and find your solution.

Everyone should have their own space on the internet to say what they want. You shouldn’t have to use a private social media platform to publish essays and technical information.

You shouldn’t have to be a senior DevOps engineer or full stack web developer to get started.

---

## Static Sites

Static sites are the easiest, quickest and most robust way to publish content.

Fast: Content is pre-rendered so HTML and CSS can be served from edge CDNs.

Secure: No runtime or database to expose.

Green: Very little computation is done, no database queries are made meaning less carbon emissions are made. Tools like [Website Carbon](https://www.websitecarbon.com) show how much of an impact this makes.

There are some amazing static site generators out there such as [Astro](https://astro.build), [Hugo](https://gohugo.io), [Jekyll](https://jekyllrb.com), [SvelteKit](https://svelte.dev) and [Eleventy](https://www.11ty.dev).

The issue is that whilst they are easy to run they are not easy to manage.

You shouldn’t have to know about git rebase flags, markdown linters in the terminal, front matter yaml validation or GitHub token scopes to publish your thoughts. It is too much to ask a non technical person or a tired developer to open up a code editor.

---

## Green Web = Static Web

Static sites are green. Dynamic sites use electricity for every request, static sites only use it once and then serve from cache meaning less energy is used. No database running 24/7, no computation per view.

Content that lasts is green! Using simple markdown files in your own repo means you can always read and rebuild your content. Platforms will shut down and WordPress installs will go bad. Every blog that switches to static from a database driven site will reduce their carbon footprint.

Read more here [Building a Greener Web](/docs/building-a-greener-web).

---

## Easy to Write With

[LightCMS](https://lightcms.me) aims to make it easy to write and publish content.

Content is stored in git. Articles are kept as simple Markdown in your own GitHub repo.

Automated CI/CD. You can use your current build pipelines or build and deploy your site using GitHub actions.

Easy to write. The author can open the editor in their browser, write, and click publish.

All the auditing, roll back and ownership of using a git backed repo whilst also giving the author a distraction free environment to want to write.

---

## TL;DR

[LightCMS](https://lightcms.me) gives everyone a place to share their ideas. Blogging should not feel like an engineering task. It should be something you enjoy.

"Everyone has an idea or experiences worth sharing. Share yours."
