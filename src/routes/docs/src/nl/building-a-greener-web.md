---
title: "Statische sites en CO2: Een Groener web bouwen"
description: Waarom statische sites minder koolstof uitstoten, hoe CDN caching energie verbruikt en hoe een groener web eruitziet.
date: 2026-10-14T13:30:00Z
draft: Onjuist
tags:
  - duurzaamheid
  - statisch-sites
  - groen-web
  - co2
  - ssg
keywords: lightcms
preview: /og-image.png
serial: 3
---

Het kost veel om een pagina te laden. Soms is een pagina niet in staat om vanuit de cache de database meerdere keren te laden en elke query gebruikt veel stroom uitstoot kilogram CO2. Er wordt gezegd dat 2 tot 4 procent van de CO2-emissies van het web komt.

Net als de luchtvaartindustrie kan het web de planeet schade berokkenen. De lay-out die je kiest laat je laten zien hoeveel je aan aarde geeft. De eco-vriendelijke manier om informatie te delen is een statische site generator die uw site eenmaal bouwt en deze vervolgens bedient vanaf een CDN.

## Waarom Statische Sites Carbon Emit Carbon

Om een reactieve werksites te geven voert je meestal elke keer het renderwerk uit als er een interactie is: ze voeren code uit naar de database en sturen een volledige pagina van de server. Dus de server moet voortdurend online blijven, zelfs als niemand iets bezoekt.

- Een statische site bouwt een keer. De voltooide HTML is gekopieerd naar CDN rand knooppunten wereldwijd. Bediend uit cache:

- Geen berekening nodig voor elke aanvraag. Het opslaan van een gebouwd bestand kost heel weinig energie in vergelijking met het weergeven van een pagina in het vliegtuig.

- Niet altijd op databases. Geen servers en databases lopen de hele tijd. Statische sites hebben geen server nodig om 24/7 te draaien. Er worden geen databankonderzoeken uitgevoerd die leiden tot minder koolstofemissies.

- Cache standaard Een verzoek dat een zijkant cache raakt beweegt geen energie buiten de netwerkhop.

- Kleine payloads. De HTML gemaakt van Markdown is klein. Er is geen zware JavaScript of vet CSS naar de klant gestuurd. De klant ontvangt het bestand altijd zodat het sneller geladen wordt.

U hebt allemaal gehoord dat de studie [milliseconden miljoenen](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html) maakt

Het Rimpeleffect: Duurzaamheid is Duurzaamheid

Een in 2016 gemaakt Hugo of Astro Starlight project kan dat nog steeds zijn. geserveerd in 2036 omdat de inhoud gewoon Markdown is, wat op tijd blijft. De hele toolchain is bron en leveranciersneutraal en de output is slechts mappen en bestanden.

Het bezit van uw inhoud als Markdown in Git is duurzaam en bespaart tijd.

Hoe uw websites Carbon Emissies meten

Wat je doet kun je niet verbeteren als je het niet meet.

- [Website Carbon Calculator](https://www.websitecarbon.com/) – schattingen van gram CO2 per pagina weergave en vergelijkt uw site met het gemiddelde.

- Eco-beoordelaar – verhoog pagina ervaring, toegankelijkheid, groene hosting en CO2-emissiereducties.

- Groen Frame – simuleert gebruikersscenario's en multistap interacties om het toepassingsniveau van koolstofvoetafdruk en energieverbruik te meten.

- WebPage Test – bevat dieptediagnoses in de prestaties naast CO2-voetafdruk schattingen en Core Web Vitals defecten.

- Groene webchecker – controleert of een domeinen die infrastructuur bezitten hernieuwbare energie gebruikt.

- Realenda gebruikersstatistieken & Core Web Vitalen – statistieken zoals de kleinste inhoudvolle verf (LCP) en de totale overdracht van de initiële bundel gedownload door elke nieuwe gebruiker op elk bezoek.

Hoe bouw je een Greener Web

1. **Serveer statisch van een CDN** - de manier om energie te besparen voor inhoudsites.

2. Statische sites zijn één keer gebouwd. Vervolgens diende het van een CDN om het de meest eco vriendelijke manier te maken om een website te bouwen.

3. JavaScript verzenden. Elke kilobyte moet worden gelezen, geparseerd, uitgevoerd en opgeslagen op de batterij en bandbreedte.

4. Cache images. Media is meestal het grootste deel van een pagina, dus gebruik het via CDN en gebruik moderne formaten zoals WebP.

Waar LightCMS Fits

> LightCMS werkt op precies deze manieren:

- Inhoud is gemaakt als Markdown naar uw eigen repository, gepubliceerd door een statische site generator en gecompileerd minified bestanden van uw hosting providers edge netwerk.

- De CMS draait alleen terwijl u schrijft. Geen productie database dient lezers omdat lezers worden geserveerd door een CDN.

## Kosten van actieve statische sites

Statische sites zijn meestal goedkoper of zelfs gratis om te hosten.

- [GitHub Pages](https://pages.github.com/)
- [Codeberg pagina's](https://codeberg.org/pages)
- [Cloudflare pagina's](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlificeren](https://www.netlify.com/)
- [Bitbucket pagina's](https://bitbucket.org/pages)
- [Weergeven](https://render.com/)
- [opleving](https://surge.sh/)

U kunt zelfs een statische site bedienen vanuit een aangepaste S3-emmer.
