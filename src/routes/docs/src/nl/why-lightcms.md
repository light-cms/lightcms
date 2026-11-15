---
title: "Waarom LightCMS: Git-ondersteund CMS voor statische websites"
description: De meeste CMS-platformen bezitten uw inhoud. LightCMS houdt het in uw Git repo, in platte Markdown, geïmplementeerd door uw eigen pipeline.
serial: 2
date: 2026-10-14T14:00:00Z
draft: Onjuist
tags:
  - lightcms
  - git
  - cms
  - statisch
  - markdown
  - publiceren
keywords:
  - waarom lightcms
  - Git gebaseerde cms
  - hoofdloze cms
  - markdown cms
  - Statische site cms
preview: /og-image.png
---

De meeste inhoudsplatforms slaan uw schrijven in hun database op, renderen het op hun servers en vragen u om toegang te blijven krijgen. Wanneer het platform afsluit, de prijzen doet stijgen of de voorwaarden verandert, gaat uw inhoud ermee akkoord.

[LightCMS](https://www.lightcms.me) neemt een andere positie in: uw inhoud leeft in uw eigen Git repository als platte Markdown bestanden. [LightCMS](https://www.lightcms.me) raakt nooit uw lezers aan - het wordt alleen uitgevoerd terwijl u schrijft.

## De kern van het probleem met gehoste CMS-platformen

Wanneer u publiceert op een traditionele CMS, verhuur u ruimte in andermans database. Dat klinkt mooi tot er iets misgaat.

Het platform doodt je plan tier. Er is een nieuwe opslaglimiet vastgesteld. Ze worden verworven. De import tool breekt. Plotseling migrerende jaren is een middag van werk waarvoor u geen begroting had.

Zelfs als er niets fout gaat, is de lock-in stil, maar reëel. Uw inhoud is gevangen in een merkgebonden formaat achter een API. Je kunt geen `grep` uitvoeren op je eigen artikelen. U kunt een concept niet verschillen met de vorige versie. Je kunt een samenvoegconflict in een post niet oplossen.

Met [LightCMS](https://www.lightcms.me)is de inhoud verbonden aan uw repo als Markdown bestanden. Dat is het. Je publicatie pipeline is slechts een statische site generator - Astro, Hugo, Jekyll, Eleventy, Zola, wat je al gebruikt. [LightCMS](https://www.lightcms.me) is de tekstverwerker lager. Wissel het altijd uit en je inhoud wordt niet aangeraakt.

## Wat publicatie van een Git betekent, is eigenlijk

Elke save is een commit. Elke wijziging is controleerbaar en versie gecontroleerd. Elk bericht heeft een volledige geschiedenis die teruggaat naar het eerste concept.

Samenwerking werkt op dezelfde manier als voor code: branches voor concepten, pull requests voor beoordeling, commit berichten als een changelog. Als je Git al comfortabel hebt, is dit het mentale model dat je al voor alles in je stapel hebt.

De flipside is dat lezers nooit [LightCMS](https://www.lightcms.me) raken. Inhoud is verbonden aan je repository, de build-pipeline draait (Cloudflare pagina's, Netlify, Vercel, GitHub pagina's), en de uitvoer is statische HTML serveerd van een CDN rand node. Geen applicatieserver zit tussen uw lezer en de inhoud.

Dit is belangrijk voor de performance — gecachte statische bestanden laden snel. Het gaat ook om de kosten. De meeste van deze gastheren hebben gratis laarzen die een high-traffic personal site of kleine publicatie dekken zonder een maandelijkse rekening.

## De editor laat je aan geen van deze vragen denken

De Git mechanica loopt op de achtergrond. Uit de editor is de ervaring gewoon schrijven.

De Tipgebaseerde editor schrijft schoonmaakbewerker op Markdown. U kunt dicteren met behulp van een Whisper-compatibele API of Wit.ai als u de voorkeur geeft aan een stem. De ingebouwde AI copilot, die met elk OpenAI-compatibel eindpunt werkt, kan een concept, een zin repareren of oppakken waar je gestopt bent.

Wanneer je op publicatie drukt commits LightCMS het bestand naar het pad dat je hebt geconfigureerd en de implementatie pipeline neemt over. Als je op Cloudflare pagina's zit, is het bericht ongeveer binnen een minuut lief.

## Wat LightCMS niet is

Het is geen gehoste bloggingsplatform. Er is geen LightCMS beheerde infrastructuur tussen u en uw lezers. LightCMS is software die u als schrijver gebruikt en schrijft op uw eigen repositories

## De duurzaamheidshoek

Statische sites stoten per pagina aanzienlijk minder CO2 uit dan server-gerenderde equivalenten. Er is geen altijd-actieve database, geen weergave per verzoek en geen server om warm te houden. Een paginaweergave die een CDN-cache raakt is meestal gewoon een netwerkhop.

[Research plaatst een typische statische, gecachete pagina op ongeveer 0. 02 gram CO2 per bezoek](https://www.websitecarbon.com/) - tegen een gram of meer voor een hemelse, server-rended pagina. Deze kloof vormt een aanvulling op miljoenen standpunten van onze bladzijden.

Het is niet de primaire reden om een statische architectuur te kiezen, maar het is een echt voordeel als de milieukosten van de infrastructuur voor jou belangrijk zijn.

## Voor wie is

LightCMS is een goede pasvorm als:

- Je bent een ontwikkelaar die een blog uitvoert op een statische site generator en wilt een fatsoenlijke editor voor jezelf of medewerkers.
- Je wilt dat je schrijft naar de laatste versie van elk platform
- U wilt geen hostingkosten voor content levering
- Je wilt je inhoud in een formaat dat AI programmeeragenten, zoekmachines en aangepaste scripts allemaal kunnen lezen

Het is geen goede zaak als je real-time functies, complexe relationele content structuren of een volledig beheerd platform waar iemand anders met infrastructuur omgaat.

## Waar te gaan vanaf hier

- [Aan de slag met LightCMS](/docs/getting-started-with-lightcms) - overzicht van functies en hoe het werkt
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [Zelfhosting LightCMS](/docs/self-hosting-lightcms) - voer uw eigen voorbeeld uit, referentie van volledige configuratie
- [Statische sites en CO2](/docs/building-a-greener-web) – de milieukwestie voor statische publicatie met meer diepte
