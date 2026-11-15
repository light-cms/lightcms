---
title: "Statiske nettsteder og CO2: Bygge et Greener Web"
description: Derfor gir statiske steder mindre karbon, hvordan CDN hurtigbufrer energibruken, og hvordan et grønnere nett ser ut.
date: 2026-10-14T13:30:00Z
draft: usann
tags:
  - bærekraft
  - statiske steder
  - grønn-web
  - k2
  - ssg
keywords: lysdioder
preview: /og-image.png
serial: 3
---

Det koster mye å laste inn en side. Noen ganger blir ikke en side lastet fra cachen databasen blir påtruffet flere ganger, og hver spørring bruker mange kilogram strømuttak av CO2. 2-4 % av utslippene fra k2 kommer fra nettet.

Som flybransjen på nettet kan det skade planeten. Oppsettet du velger, lar deg vise hvor mye du bryr deg om jorden. Miljøvennlig måte å dele informasjon på er en statisk nettstedsgenerator som bygger nettstedet ditt en gang og deretter tjener det fra et CDN.

## Hvorfor Statiske nettsteder med Emit Carbon

For å gi en reaktiv effektside utfører vanligvis gjengivelsesarbeidet hver gang noen intervju: de kjører kode spør databasen og sender en fullside fra serveren. Så serveren må være tilkoblet hele tiden, selv når ingen besøker.

- Et statisk byggeplass bygger én gang. Den ferdige HTML-koden kopieres til CDN-kantnoder over hele verden. Serveres fra hurtigbuffer:

- Ingen beregning er nødvendig for hver forespørsel. Å servere en bygd fil bruker svært lite energi i forhold til å gjengi en side direkte.

- Ikke alltid på databaser. Ingen servere og databaser kjører hele tiden. Statiske nettsteder trenger ikke en server for å kjøre 24/7. Det gjøres ingen databasespørsmål som resulterer i mindre utslipp av karbon.

- Cache som standard. En forespørsel som treffer en kantcache beveger seg ikke strøm utover nettverkshåpet.

- Liten nyttelaster. HTML laget fra Markdown er liten. Det sendes ingen tung JavaScript eller fett CSS til klienten. Klienten mottar alltid filen slik at den laster raskere.

Dere har alle kanskje hørt studien [millisekunder som lager millioner](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

The Ripple Effect: Varighet Is Sustainability

Et Hugo eller Astro Starlight-prosjekt som er gjort i 2016, kan fremdeles være. Serveres i 2036 fordi innholdet er ren Markdown, som holder seg tidløst. Hele verktøykjeden er kilde og leverandørnøytral samt utgangen er bare mapper og filer.

Å eie innholdet som Markdown i Git er varig og spare tid.

Slik måler du nettsider Karbonutslipp

Du kan ikke forbedre det du gjør hvis du ikke måler den:

- [Nettside Carbon Calculator](https://www.websitecarbon.com/) – anslår CO2-utslipp per sidevisning og sammenligner nettstedet ditt mot gjennomsnittet.

- Satser på siders erfaring, tilgjengelighet, miljøvertsvirksomhet og beregninger av karbonutslipp.

- Grønn ramme – simulerer brukerscenarier og multitrinns interaksjoner for å måle karbonavtrykk og energiforbruk.

- WebPage Test – gir deg god diagnostikk ved siden av karbonfotavtrykkingsestimater og brudd på kjerneweb-vitner.

- Grønn Web Checker – kontrollerer om et domene som hosting av infrastruktur kjører på fornybar energi.

- Realrullebrukermetrikker & Kjerne Web Vitals – måltall som den største innholdsrike malingen (LCP) og total overføring av den initielle pakken lastet ned av alle nye brukere på hvert besøk.

Slik bygger du et Greener Web

1. **Server statisk fra en CDN** – måten å kutte energi på for innholdssteder.

2. Statiske lokaliteter bygges én gang. Så servert fra CDN gjør det den mest miljøvennlige måten å bygge et nettsted.

3. Skipet JavaScript. Hver kilobyte må leses, analyseres, kjøres og lagres på besøkende batteri og båndbredde.

4. Cache images. Media er vanligvis den største delen av en side som betjener den gjennom CDN og bruker moderne formater som WebP.

Hvor LightCMS sett

> LightCMS virker på akkurat disse måtene:

- Innholdet er utført som Markdown til ditt eget depot, publisert av en statisk nettstedsgenerator og fungerer som sammenstilte minifiserte filer fra netthotellet ditt leverandører.

- CMS kjører bare mens du skriver. Ingen produksjonsdatabase serverer lesere fordi lesere er tjent av CDN.

## Kostnader ved produksjon statiske nettsteder

Statiske lokaliteter er vanligvis billigere eller til og med gratis.

- [GitHub Pages](https://pages.github.com/)
- [Codeberg sider](https://codeberg.org/pages)
- [Cloudflare-sider](https://pages.cloudflare.com/)
- [Ordliste](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Bitbucket sider](https://bitbucket.org/pages)
- [Render](https://render.com/)
- [surfing](https://surge.sh/)

Du kan til og med servere en statisk side fra en egendefinert S3 bøtte.
