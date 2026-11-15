---
title: Introductie
serial: 1
date: 2026-09-01T16:44:00Z
draft: Onjuist
tags:
  - lightcms
  - cms
  - git
  - ssg
  - statisch
  - Werkruimte
  - generator
keywords:
  - lightcms
  - aan de slag
  - inleiding
  - wysiwyg
  - markdown
  - Git gebaseerd
---

[LightCMS](https://www.lightcms.me) is een door Git-ondersteunde editor voor statische sites. U schrijft in een rijke editor, druk op publiceren en [LightCMS](https://www.lightcms.me) commits Cleits Markdown naar uw repository. Je inzet pipeline — Cloudflare pagina's, Netlify, Vercel, GitHub Pagina's — neemt het daar vandaan.

Uw inhoud leeft in uw eigen Git repository als platte Markdown bestanden, leesbaar en inzetbaar door elke statische site generator die u al gebruikt.

## Hoe het werkt

1. Log in met je GitHub account.
2. Verbind het repository met uw statische site. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy - alles dat Markdown leest.
3. Schrijf en bewerk content in de ingebouwde editor. Maak berichten, bewerk bestaande en upload afbeeldingen en vul de velden voor plaatjes in zonder een terminal aan te raken.
4. Druk op publiceren. [LightCMS](https://www.lightcms.me) commits je inhoud naar het pad dat je hebt geconfigureerd — bijvoorbeeld `content/blog/my-post.md` in je repository root.
5. Je bouw pipeline implementeert automatisch. Het bericht is live binnen een minuut of twee, afhankelijk van je host.

Dat is de volledige lus. [LightCMS](https://www.lightcms.me) werkt alleen terwijl je aan het schrijven bent. Lezers worden geserveerd door uw CDN, niet door [LightCMS](https://www.lightcms.me).

## Wat is er in de editor

**TipTap-based rich editor** – Schrijft Markdown met voornaam. Wat je ziet zijn de verplichtingen. Als je ooit een `.md` bestand hebt geopend en een soep met HTML tags hebt gevonden, is dit het alternatief.

**AI copilot** - verbonden met elke OpenAI-compatibele API. Handig wanneer een paragraaf niet landt: vraag hem de tekst aan te scherpen, een punt uit te breiden, of een concept op te pakken dat je in de steek gelaten hebt.

**Voice-to-text** - dicteer direct in de editor met behulp van elke Whisper-compatibele transcriptie-API of Wit.ai. Goed om snel een rommelig eerste ontwerp neer te krijgen wanneer typen de denkwijze in de weg staat.

**Lichte en donkere thema's** - verschillende thema-opties zodat de editor comfortabel is tijdens het schrijven van sessies.

**Nieuwsbrief automatisering** - publiceer een post en meld abonnees automatisch via [Nieuwsbrief](/docs/newsletter-newsy). Geen nieuwsbrief van derden vereist.

## Wat [LightCMS](https://www.lightcms.me) niet doet

Het organiseert geen inhoud of dient geen lezers, en dat is ontwerp. Als u van WordPress of Ghost komt, is het CMS dat u gewend bent. Hier is de relatie anders: [LightCMS](https://www.lightcms.me) is een schrijfgereedschap, niet infrastructuur. Uw statische site generator bouwt de output, uw hostingprovider dient deze en u bezit elk bestand. Wisselen van editors, generators of hosts betekent niet het migreren van een database.

Het vervangt ook uw stationeringsinstellingen niet. Het werkt met de pijplijn die je al hebt.

## Volgende stappen

- [Waarom LightCMS?](/docs/why-lightcms) - de ontwerpfilosofie achter door Git-ondersteunde publicatie
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) - voer uw eigen privé instantie uit
- [Nieuwsbrief automatisering](/docs/newsletter-newsy) - stuur berichten automatisch naar abonnees met Nieuws
- [Bouw een groener web](/docs/building-a-greener-web) - waarom statisch publiceren de keuze onder koolstof is
