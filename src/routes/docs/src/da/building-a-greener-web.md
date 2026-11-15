---
title: "Statiske steder og CO2: Opbygning af et Greener Web"
description: Hvorfor statiske steder udleder mindre kulstof, hvordan CDN caching skærer energiforbrug, og hvordan en grønnere web ser ud.
date: 2026-10-14T13:30:00Z
draft: falsk
tags:
  - bæredygtighed
  - statiske-sites
  - grøn-web
  - co2
  - ssg
keywords: lyspunkter
preview: /og-image.png
serial: 3
---

Det koster meget at indlæse en side. Nogle gange kan en side ikke indlæses fra cache, databasen er ramt flere gange, og hver forespørgsel bruger en masse strøm udsender kilogram CO2. Det siges, at 2-4 % af co2-emissionerne kommer fra nettet.

Ligesom luftfartsindustrien internettet kan skade planeten. Layoutet du vælger lader dig vise, hvor meget du bekymrer dig om Jorden. Den øko-venlige måde at dele oplysninger er en statisk site generator, der bygger dit websted en gang og derefter tjener det fra en CDN.

## Hvorfor Statiske Sites Emit Carbon

For at give en reaktiv effekt sites generelt udføre rendering arbejde hver gang nogen interagerer: de kører kode spørge databasen og sende en fuld side fra serveren. Så serveren skal forblive online hele tiden, selv når ingen besøger.

- Et statisk websted bygger én gang. Den færdige HTML er kopieret til CDN kantknuder over hele verden. Serveret fra cache:

- Ingen beregning nødvendig for hver anmodning. Serverer en bygget fil bruger meget lidt energi i forhold til at gengive en side i farten.

- Ikke altid på databaser. Ingen servere og databaser kører hele tiden. Statiske websteder behøver ikke en server for at køre 24/7. Der stilles ingen databaseforespørgsler, der resulterer i færre kulstofemissioner.

- Cache som standard. En anmodning der rammer en kantcache flytter ingen energi ud over netværket hop.

- Små nyttelast. HTML lavet af Markdown er lille. Ingen tung JavaScript eller fedt CSS sendes til klienten. Klienten modtager altid filen, så den indlæser hurtigere.

Du har alle hørt studiet [millisekunder gøre millioner](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

Ripple Effekt: Holdbarhed Er Bæredygtighed

Et Hugo eller Astro Starlight projekt fra 2016 kan stadig være. Serveres i 2036, fordi indholdet er almindelig Markdown, som forbliver tidløs. Hele værktøjskæden er kilde og leverandør-neutral, og output er kun mapper og filer.

At eje dit indhold som Markdown i Git er holdbart og sparer tid.

Sådan måler du dine hjemmesider Carbon Emissions

Du kan ikke forbedre det, du gør, hvis du ikke måler det:

- [Website Carbon Calculator](https://www.websitecarbon.com/) – anslår gram CO2 udledt pr side visning og sammenligner dit websted i forhold til gennemsnittet.

- Eco grader - satser sideoplevelse, tilgængelighed, grøn hosting og CO2-emissioner skøn.

- Green Frame – simulerer brugerscenarier og multistep interaktioner til at måle applikationsniveau carbon footprint og energiforbrug.

- WebPage Test – giver i dybden ydeevne diagnostik sammen med carbon footprint skøn og Core Web Vitals nedbrud.

- Green Web Checker – kontrollerer, om et domæne hosting infrastruktur kører på vedvarende energi.

- Realbruger målinger & Core Web Vitals – målinger som Største tilfredse Paint (LCP) og total overførsel af første pakke downloadet af enhver ny bruger ved hvert besøg.

Sådan opbygger du et Greener Web

1. **Serveres statisk fra en CDN** - vejen til at skære energi til indholdssteder.

2. Statiske steder er bygget én gang. Derefter tjente fra en CDN gør det til den mest øko-venlige måde at opbygge en hjemmeside.

3. Ship JavaScript. Hvert kilobyte skal læses, analyseres, udføres og opbevares på de besøgendes batteri og båndbredde.

4. Cache images. Medier er normalt den største del af en side, så tjene det gennem CDN og bruge moderne formater som WebP.

Hvor LightCMS Passer

> LightCMS virker på netop disse måder:

- Indhold er engageret som Markdown til dit eget depot, offentliggjort af en statisk site generator og tjente som kompileret minified filer fra dine hosting-udbydere kant netværk.

- CMS kører kun mens du skriver. Ingen produktionsdatabase tjener læsere, fordi læserne betjenes af en CDN.

## Udgifter til løbende statiske websteder

Statiske steder er normalt billigere eller endda gratis at være vært.

- [GitHub Pages](https://pages.github.com/)
- [Codeberg sider](https://codeberg.org/pages)
- [Cloudflare Sider](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Bitbucket-sider](https://bitbucket.org/pages)
- [Gengiv](https://render.com/)
- [bølge](https://surge.sh/)

Du kan endda tjene en statisk hjemmeside fra en custom S3 spand.
