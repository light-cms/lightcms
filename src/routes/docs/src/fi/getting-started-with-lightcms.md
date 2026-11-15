---
title: Johdanto
serial: 1
date: 2026-09-01T16:44:00Z
draft: epätosi
tags:
  - lightcms
  - cms
  - git
  - ssg
  - staattinen
  - sivusto
  - generaattori
keywords:
  - lightcms
  - aloitettaessa
  - esittely
  - wysiwyg
  - markdown
  - git pohjainen
---

[LightCMS](https://www.lightcms.me) on Git-tukema editori staattisille sivustoille. Kirjoitat rikkaan editorin, paina julkaisun, ja [LightCMS](https://www.lightcms.me) toimittaa puhtaan Markdownin arkistoon. Käyttöputkesi — Cloudflare sivut, Netlify, Vercel, GitHub sivut — vie sen sieltä.

Sisältösi asuu omassa Git-arkistossa pelkkänä Markdown-tiedostoina, luettavina ja käyttöön otettavina millä tahansa staattisella sivustogeneraattorilla, jota jo käytät.

## Miten se toimii

1. Kirjaudu sisään GitHub-tililläsi.
2. Yhdistä arkisto, joka sisältää staattisen sivuston. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy - kaikki, mikä lukee Markdown.
3. Kirjoita ja muokkaa sisältöä sisäänrakennetussa editorissa. Luo viestejä, muokkaa olemassa olevia viestejä, lataa kuvia ja täytä etukappaleen kentät koskematta päätteeseen.
4. Hit julkaistu. [LightCMS](https://www.lightcms.me) toimittaa sisältösi polulle, jonka olet määrittänyt – esimerkiksi, `sisältö/blog/my-post.md` arkiston juuri.
5. Rakennusputkesi otetaan käyttöön automaattisesti. Julkaisu on suorana lähetyksenä muutaman minuutin tai kahden minuutin sisällä isäntäsi riippuen.

Tuo on täysi silmukka. [LightCMS](https://www.lightcms.me) toimii vain kirjoittaessasi. CDN palvelee lukijoita, ei [LightCMS](https://www.lightcms.me).

## Mitä editorissa on

**TipTap-pohjainen rikas editori** — kirjoittaa puhdas Markdown etualalla. Näette, mitä sitoudutaan. Jos olet koskaan avannut `.md` tiedoston ja löytänyt keitto HTML-tageja, tämä on vaihtoehto.

**AI copilot** — yhdistetty mihin tahansa OpenAI-yhteensopivaan APIin. Hyödyllinen, kun kappale ei ole laskeutunut: pyydä sitä kiristämään sanamuotoa, laajentamaan pistettä tai poimimaan keskiajatuksen hylkäämäsi luonnoksen.

**Ääni-to-text** — sano suoraan editoriin käyttäen mitä tahansa Whisper-compatible transcription API tai Wit.ai. Hyvä saada sotkuinen ensimmäinen luonnos alas nopeasti, kun kirjoittaminen saa tavalla ajattelua.

**Vaalea ja tumma teemat** — useita teemavaihtoehtoja, joten editori on mukava pidempien kirjoitustilaisuuksien aikana.

**Newsletter automaatio** — julkaista viesti ja ilmoittaa tilaajille automaattisesti [Newsy](/docs/newsletter-newsy). Kolmannen osapuolen uutiskirjepalvelua ei tarvita.

## Mitä [LightCMS](https://www.lightcms.me) ei tee

Se ei isännöi sisältöä tai palvella lukijoita, ja se on suunnitteilla. Jos olet tulossa WordPress tai Ghost, CMS on isäntä on mitä olet tottunut. Tässä suhde on erilainen: [LightCMS](https://www.lightcms.me) on kirjoitusväline, ei infrastruktuuri. Staattinen sivusto generaattori rakentaa tuotos, hosting tarjoaja palvelee sitä, ja omistat jokaisen tiedoston. Vaihtaminen editoreihin, generaattoreihin tai isäntiin ei tarkoita tietokannan siirtämistä.

Se ei myöskään korvaa käyttöönottoasetuksiasi. Se toimii minkä tahansa putken kanssa sinulla jo on.

## Seuraavat vaiheet

- [Miksi LightCMS?](/docs/why-lightcms) — Git-tukeman kustantamisen taustalla oleva suunnittelufilosofia
- [Miten aloittaa blogi](/docs/how-to-start-a-blog) — valitse malli ja siirry nollasta julkaistu
- [Itse hosting LightCMS](/docs/self-hosting-lightcms) — suorita oma yksityinen instanssi
- [Newsletter automaatio](/docs/newsletter-newsy) — lähetä viestejä tilaajille automaattisesti uutisella
- [Vihreämmän verkon rakentaminen](/docs/building-a-greener-web) – miksi staattinen kustantaminen on vähähiilistä
