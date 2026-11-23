---
title: Newsletter
description: "Set up automated newsletters for your static blog with Newsy: posts published straight from Git, subscriber emails sent for you, no monthly platform fee
."
serial: 5
date: 2026-09-18T01:50:00Z
draft: false
tags:
  - newsletter
  - email
  - newsy
  - smtp
keywords:
  - newsletter
  - email automation
  - newsy
  - smtp
  - lightcms
preview: /og-image.png
---

Sending a newsletter when you publish a post is one of the simplest ways to grow an audience. Newsy uses Git as the source of truth so you can automate that step without a separate newsletter platform.

## How Newsy works

- Write and publish posts as Markdown in your repository.
- Newsy watches repository events or a configured issues feed and detects new posts.
- Newsy builds a newsletter from the published content and sends it to your subscriber list via SMTP. You can use Resend, Postmark, or another provider.

Key points:

- Content stays in your repo, not locked in a newsletter platform.
- You control delivery settings via SMTP and your provider account.
- Newsy is open source. See the implementation and examples at https://github.com/light-cms/newsy
