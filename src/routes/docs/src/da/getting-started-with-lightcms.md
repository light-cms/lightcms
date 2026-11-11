---
title: Indledning
serial: 1
date: 2026-09-01T16:44:00Z
draft: false
tags:
  - lyspunkter
  - cms
  - git
  - ssg
  - statisk
  - site
  - generator
keywords:
  - lyspunkter
  - komme i gang
  - introduktion
  - wysiwyg
  - markdown
  - git baseret
---

[LightCMS](https://www.lightcms.me) er en Git-backed editor til statiske websteder. Du skriver i en rig editor, hit publish, og [LightCMS](https://www.lightcms.me) forpligter ren Markdown til dit arkiv. Din implementering pipeline - Cloudflare Sider, Netlify, Vercel, GitHub Sider - tager det derfra.

Dit indhold lever i dit eget Git repository som almindelige Markdown filer, læselige og deployerbare af enhver statisk site generator, du allerede bruger.

## Sådan fungerer det

1. Log ind med din GitHub konto.
2. Tilslut depotet, der indeholder dit statiske websted. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — noget, der læser Markdown.
3. Skriv og rediger indhold i den indbyggede editor. Opret indlæg, rediger eksisterende indlæg, upload billeder og udfyld felterne for hovedsagen uden at røre ved en terminal.
4. Hit publicere. [LightCMS](https://www.lightcms.me) forpligter dit indhold til den sti, du har konfigureret — for eksempel `content/blog/my-post.md` i din repository root.
5. Din bygge pipeline implementeres automatisk. Indlægget er levende inden for et minut eller to, afhængigt af din vært.

Det er hele løkken. [LightCMS](https://www.lightcms.me) kører kun mens du skriver. Læsere bliver serveret af din CDN, ikke af [LightCMS](https://www.lightcms.me).

## Hvad er i editoren

**TipTap-baserede rige editor** — skriver ren Markdown med forreste spørgsmål. Hvad I ser, er det, der bliver begået. Hvis du nogensinde har åbnet en `.md` -fil og fundet en suppe af HTML-tags, er dette alternativ.

**AI copilot** — forbundet til en OpenAI-kompatibel API. Nyttigt, når et afsnit ikke landerer: Bed det om at stramme formuleringen, udvide et punkt, eller afhente et udkast du opgav midt tanke.

**Stemme-til-tekst** — diktere direkte ind i editoren ved hjælp af en Whisper-kompatibel transskription API eller Wit.ai. God til at få en rodet første udkast ned hurtigt, når du skriver får i vejen for tænkning.

**Lys og mørke temaer** — flere temaindstillinger, så redaktøren er komfortabel under længere skrivesessioner.

**Newsletter automation** — udgive et indlæg og give abonnenter automatisk via [Newsy](/docs/newsletter-newsy). Ingen tjeneste til tredjepartsnyhedsbrev kræves.

## Hvad [LightCMS](https://www.lightcms.me) ikke gør

Det er ikke vært for dit indhold eller tjene dine læsere, og det er efter design. Hvis du kommer fra WordPress eller Ghost, CMS er vært er, hvad du er vant til. Her er forholdet anderledes: [LightCMS](https://www.lightcms.me) er et skriveværktøj, ikke infrastruktur. Din statiske site generator bygger output, din hosting udbyder tjener det, og du ejer hver fil. At skifte redaktører, generatorer eller værter betyder ikke, at migrere en database.

Det erstatter heller ikke din implementeringsopsætning. Det virker med uanset hvilken rørledning, I allerede har.

## Næste trin

- [Hvorfor LightCMS?](/docs/why-lightcms) - designfilosofien bag Git-backed publishing
- [Sådan starter du en blog](/docs/how-to-start-a-blog) — vælg en skabelon og gå fra nul til publiceret
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — kør din egen private instans
- [Nyhedsbrev automatisering](/docs/newsletter-newsy) - send indlæg til abonnenter automatisk med Newsy
- [Bygning af en grønnere web](/docs/building-a-greener-web) — hvorfor statisk udgivelse er det lavere CO2-valg
