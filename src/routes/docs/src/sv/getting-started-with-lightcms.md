---
title: Introduktion
serial: 1
date: 2026-09-01T16:44:00Z
draft: falskt
tags:
  - ljusslingor
  - cm
  - git
  - ssg
  - statisk
  - webbplats
  - generator
keywords:
  - ljusslingor
  - komma igång
  - introduktion
  - wysiwyg
  - markdown
  - git baserad
---

[LightCMS](https://www.lightcms.me) är en Git-backad redigerare för statiska platser. Du skriver i en rik redaktör, tryck publicera, och [LightCMS](https://www.lightcms.me) förbinder ren Markdown till ditt förråd. Din distribution pipeline — Cloudflare sidor, Netlify, Vercel, GitHub sidor — tar det därifrån.

Ditt innehåll bor i ditt eget Git-arkiv som vanliga Markdown-filer, läsbara och distribuerbara av någon statisk webbplatsgenerator som du redan använder.

## Så här fungerar det

1. Logga in med ditt GitHub-konto.
2. Anslut utvecklingskatalogen som innehåller din statiska webbplats. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy – allt som läser Markdown.
3. Skriv och redigera innehåll i den inbyggda redigeraren. Skapa inlägg, redigera befintliga, ladda upp bilder och fyll i fälten utan att röra vid en terminal.
4. Hit publicera. [LightCMS](https://www.lightcms.me) kopplar ditt innehåll till den sökväg du har konfigurerat — till exempel `content/blog/my-post.md` i din utvecklingskatalogsrot.
5. Din bygga pipeline distribueras automatiskt. Inlägget är live inom en minut eller två, beroende på din värd.

Det är hela slingan. [LightCMS](https://www.lightcms.me) körs bara medan du skriver. Läsarna betjänas av din CDN, inte av [LightCMS](https://www.lightcms.me).

## Vad finns i redigeraren

**Tipsbaserad rik redigerare** — skriver ren Markdown med front materia. Vad ni ser är vad som engageras. Om du någonsin har öppnat en `.md` fil och hittat en soppa av HTML-taggar, är detta alternativet.

**AI copilot** — ansluten till alla OpenAI-kompatibla API. Användbart när ett stycke inte landar: be det att skärpa ordalydelsen, expandera en punkt, eller plocka upp ett utkast som du övergav mitt i tanken.

**Voice-to-text** — diktera direkt in i redigeraren med valfritt Whisper-kompatibelt transkription API eller Wit.ai. Bra för att få ett stökigt första utkast snabbt ner när du skriver får i tankesättet.

**Ljus och mörka teman** — flera temaalternativ så att redaktören är bekväm under längre skrivtillfällen.

**Nyhetsbrev automation** — publicera ett inlägg och meddela prenumeranter automatiskt via [Newsy](/docs/newsletter-newsy). Ingen tredje parts nyhetsbrevstjänst krävs.

## Vad [LightCMS](https://www.lightcms.me) inte gör

Det är inte värd för ditt innehåll eller tjäna dina läsare, och det är genom design. Om du kommer från WordPress eller Ghost, CMS är värd är vad du är van vid. Här är förhållandet annorlunda: [LightCMS](https://www.lightcms.me) är ett skrivverktyg, inte infrastruktur. Din statiska webbplats generator bygger utgången, ditt webbhotell tjänstgör det, och du äger varje fil. Byta redaktörer, generatorer eller värdar betyder inte att migrera en databas.

Det ersätter inte din driftsättning heller. Det fungerar med vilken pipeline du redan har.

## Nästa steg

- [Varför LightCMS?](/docs/why-lightcms) – designfilosofin bakom Git-stödd publicering
- [Hur man startar en blogg](/docs/how-to-start-a-blog) — välj en mall och gå från noll till publicerad
- [Själv-hosting LightCMS](/docs/self-hosting-lightcms) — kör din egen privata instans
- [Nyhetsbrev automatisering](/docs/newsletter-newsy) — skicka inlägg till prenumeranter automatiskt med Newsy
- [Bygga ett grönare webb](/docs/building-a-greener-web) — varför statisk publicering är det lägre koldioxidutsläppen valet
