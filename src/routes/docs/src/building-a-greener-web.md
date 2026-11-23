---
title: "Static Sites and CO2: Building a Greener Web"
description: Why static sites emit less carbon, how CDN caching cuts energy use, and what a greener web looks like.
date: 2026-10-14T13:30:00Z
draft: false
tags:
  - sustainability
  - static-sites
  - green-web
  - co2
  - ssg
keywords: lightcms
preview: /og-image.png
serial: 3
---

Pages use energy. Dynamic pages often consume CPU and database resources on every request. Static sites are built once and served from CDN caches. That design reduces energy per visit.

## Why static sites reduce carbon

- Build once, serve many times: generate HTML at build time and distribute it to CDN edge nodes. Serving a cached file uses far less energy than rendering a page on every request.
- No always-on database: readers do not trigger database queries for static content.
- Smaller payloads: Markdown to HTML tends to produce compact pages with smaller JavaScript and CSS bundles.
- Cache-friendly: CDNs cut origin requests and lower latency.

A well-cached static page can emit far less CO2 per visit than a heavy dynamic page.

## Measure the impact

Useful tools:

- Website Carbon (https://www.websitecarbon.com/) — estimates grams of CO2 per page view.
- GreenFrame — simulates user scenarios and estimates energy use.
- WebPageTest — performance diagnostics with carbon estimates.
- Green Web Checker — checks whether a host uses renewable energy.

Track Core Web Vitals and bytes transferred. Those metrics correlate with energy use.

## Practical steps for a greener site

1. Serve static content from a CDN.
2. Minimize JavaScript and ship only what you need for interactivity.
3. Optimize images and serve responsive sizes in modern formats like WebP.
4. Set cache headers and enable compression.

## How LightCMS fits

LightCMS commits Markdown to your repository. Your SSG builds static HTML and your hosting provider serves the files from a CDN. LightCMS is only active while someone edits content, so it does not affect runtime energy use for readers.

## Hosting options

Static hosting providers include GitHub Pages, Cloudflare Pages, Vercel, Netlify, Render, and S3 with a CDN. These options often cost less and have a smaller environmental footprint than always-on servers.
