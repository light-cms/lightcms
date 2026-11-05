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
keywords:
  - static sites
  - green web
  - sustainability
  - website carbon
preview: /og-image.png
---

It costs a lot to load a page. Sometimes a page fails to load from cache the database is hit multiple times and each query uses a lot of power emitting kilograms of CO2. It is said that 2–4% of co2 emissions come from the web.

Like the airline industry the web can harm the planet. The layout you pick lets you show how much you care about Earth. The eco friendly way to share information is a static site generator that builds your site once and then serves it from a CDN.

## Why Static Sites Emit Carbon

To give a real‑time feel dynamic sites perform work every time someone interacts: they run code ask the database and send a full page from the server. So the server must stay online all the time even when nobody visits.

- A static site builds once. The finished HTML is copied to CDN edge nodes worldwide. Served from cache:

- No computing needed for each request. Serving a built file uses very little energy compared to rendering a page on the fly.

- No always on databases. No servers and databases runs all the time. Static sites do not need a server to be running 24/7. No database queries are made resulting in less carbon emissions are made.

- Cache by default. A request that hits an edge cache moves no energy beyond the network hop.

- Small payloads. The HTML made from Markdown is tiny. No heavy JavaScript or fat CSS is sent to the client. The client always receives the file so it loads faster.

You all may have heard the study ["milliseconds make millions"](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

The Ripple Effect: Durability Is Sustainability

A Hugo or Astro Starlight project made in 2016 can still be. Served in 2036 because the content is plain Markdown, which stays timeless. The whole toolchain is source and vendor‑neutral and the output is just folders and files.

Owning your content as Markdown in Git is durable and saves time.

How to Measure Your Websites Carbon Emissions

You cannot improve what you do if you do not measure it:

- **[Website Carbon Calculator](https://www.websitecarbon.com/)** – estimates grams of CO2 emitted per page view and compares your site against the average.

- Ecograder – rates page experience, accessibility, green hosting and carbon emissions estimates.

- GreenFrame – simulates user scenarios and multistep interactions to measure application level carbon footprint and energy consumption.

- WebPageTest – provides in depth performance diagnostics alongside carbon footprint estimates and Core Web Vitals breakdowns.

- Green Web Checker – checks whether a domains hosting infrastructure runs on renewable energy.

- Real‑user metrics & Core Web Vitals – metrics like Largest Content‑ful Paint (LCP) and total transfer of initial bundle downloaded by any new user on every visit.

How to Build a Greener Web

1. **Serve statically from a CDN** – the way to cut energy for content sites.

2. Static sites are built once. Then served from a CDN making it the most energy‑friendly way forward.

3. Ship JavaScript. Every kilobyte must be read, parsed, executed and stored on the visitors battery and bandwidth.

4. Cache images. Media is usually the part of a page so serve it through the CDN and use modern formats like WebP.

Where LightCMS Fits

> LightCMS works, in exactly these ways:

- Content is committed as Markdown to your own repository, published by a static site generator and served as compiled minified files from your hosting providers edge network.

- The CMS runs only while you write. No production database serves readers because readers are served by a CDN.

## Cost of Running Static Sites

Static sites are usually cheaper or even free to host.

- [GitHub Pages](https://pages.github.com/)
- [codeberg pages](https://codeberg.org/pages)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [bitbucket pages](https://bitbucket.org/pages)
- [Render](https://render.com/)
- [surge](https://surge.sh/)

You can even serve a static site from a custom S3 bucket.
