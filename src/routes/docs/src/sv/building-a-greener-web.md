---
title: "Statiska platser och CO2: bygga en grönare webb"
description: Varför statiska webbplatser avger mindre kol, hur CDN cachelagring minskar energianvändningen, och hur en grönare webben ser ut.
date: 2026-10-14T13:30:00Z
draft: falskt
tags:
  - hållbarhet
  - statisk-platser
  - grön-webb
  - co2
  - ssg
keywords: ljusslingor
preview: /og-image.png
serial: 3
---

Det kostar mycket att ladda en sida. Ibland misslyckas en sida att ladda från cache databasen träffas flera gånger och varje fråga använder en hel del makt avger kilogram CO2. Det sägs att 2–4 procent av co2-utsläppen kommer från webben.

Liksom flygindustrin kan webben skada planeten. Layouten du väljer låter dig visa hur mycket du bryr dig om Jorden. Det miljövänliga sättet att dela information är en statisk webbplats generator som bygger din webbplats en gång och sedan serverar den från en CDN.

## Varför statiska platser avger kol

För att ge en reaktiv effekt utför vanligtvis renderingsarbetet varje gång någon interagerar: de kör koden fråga databasen och skicka en hel sida från servern. Så servern måste stanna online hela tiden även när ingen besöker.

- En statisk plats bygger en gång. Den färdiga HTML kopieras till CDN edge noder över hela världen. Serveras från cache:

- Ingen beräkning behövs för varje begäran. Servering av en byggd fil använder mycket lite energi jämfört med att göra en sida i farten.

- Nej alltid i databaser. Inga servrar och databaser körs hela tiden. Statiska webbplatser behöver inte en server för att köras 24/7. Inga databasfrågor görs som resulterar i mindre koldioxidutsläpp görs.

- Cache som standard. En begäran som träffar en edge cache flyttar ingen energi utanför nätverket hop.

- Små nyttolaster. HTML-koden från Markdown är liten. Inget tungt JavaScript eller fett CSS skickas till kunden. Kunden tar alltid emot filen så den laddar snabbare.

Du kanske alla har hört studien [millisekunder göra miljoner](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

The Ripple Effect: Hållbarhet är hållbarhet

Ett Hugo eller Astro Starlight projekt som gjordes 2016 kan fortfarande vara. Serveras år 2036 eftersom innehållet är vanligt markdown, som förblir tidlös. Hela verktygskedjan är källa och leverantörsneutral och utdata är bara mappar och filer.

Att äga ditt innehåll som Markdown i Git är hållbart och sparar tid.

Hur man mäter dina webbplatser Kolutsläpp

Du kan inte förbättra det du gör om du inte mäter det:

- [Website Carbon Calculator](https://www.websitecarbon.com/) – uppskattar gram CO2 som släpps ut per sidvy och jämför din webbplats med genomsnittet.

- Eco grader – priser sidan erfarenhet, tillgänglighet, grön hosting och koldioxidutsläpp uppskattningar.

- Green Frame – simulerar användarscenarier och multistegsinteraktioner för att mäta applikationsnivån koldioxidavtryck och energiförbrukning.

- WebPage Test – ger i djup prestanda diagnostik tillsammans med koldioxidavtryck uppskattningar och Core Web Vitals haverier.

- Green Web Checker - kontrollerar om en domäner värd infrastruktur körs på förnybar energi.

- Real‐user metrics & Core Web Vitals – mätvärden som Största innehållsrika Färg (LCP) och total överföring av första paketet hämtas av alla nya användare vid varje besök.

Hur man bygger en grönare webb

1. **Servera statiskt från en CDN** – sättet att minska energi för innehållsplatser.

2. Statiska platser byggs en gång. Sedan serveras från en CDN gör det till det mest miljövänliga sättet att bygga en webbplats.

3. Fartyg JavaScript. Varje kilobyte måste läsas, tolkas, utföras och lagras på besökarnas batteri och bandbredd.

4. Cache images. Media är oftast den största delen av en sida så tjäna det genom CDN och använda moderna format som WebP.

Där LightCMS passar

> LightCMS fungerar, på exakt dessa sätt:

- Innehållet är engagerat som Markdown till din egen utvecklingskatalog, publiceras av en statisk webbplats generator och fungerar som kompilerade minifierade filer från dina webbhotell leverantörer edge nätverk.

- CMS körs endast medan du skriver. Ingen produktionsdatabas betjänar läsare eftersom läsare betjänas av en CDN.

## Kostnaden för att köra statiska platser

Statiska platser är oftast billigare eller till och med gratis att värda.

- [GitHub Pages](https://pages.github.com/)
- [Codeberg sidor](https://codeberg.org/pages)
- [Cloudflare sidor](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Bitbucket sidor](https://bitbucket.org/pages)
- [Rendera](https://render.com/)
- [svallning](https://surge.sh/)

Du kan även tjäna en statisk webbplats från en anpassad S3 hink.
