---
title: Introduzione
serial: 1
date: 2026-09-01T16:44:00Z
draft: falso
tags:
  - lightcms
  - cms
  - git
  - ssg
  - statico
  - sito
  - generatore
keywords:
  - lightcms
  - per iniziare
  - introduzione
  - wysiwyg
  - markdown
  - git based
---

[LightCMS](https://www.lightcms.me) è un editor supportato da Git per siti statici. Scrivi in un editor ricco, premi pubblica, e [LightCMS](https://www.lightcms.me) commette Markdown pulito nel tuo repository. La tua pipeline di distribuzione — Pagine Cloudflare, Netlify, Vercel, Pagine GitHub — lo prende da lì.

Il tuo contenuto vive nel tuo repository Git come file Markdown semplice, leggibili e distribuibili da qualsiasi generatore di siti statici che stai già utilizzando.

## Come funziona

1. Accedi con il tuo account GitHub.
2. Collega il repository che contiene il tuo sito statico. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — tutto ciò che legge Markdown.
3. Scrivi e modifica il contenuto nell'editor incorporato. Crea post, modifica quelli esistenti, carica immagini e riempi i campi della materia anteriore senza toccare un terminale.
4. Colpisci pubblica. [LightCMS](https://www.lightcms.me) invia il tuo contenuto al percorso che hai configurato — per esempio, `content/blog/my-post.md` nel tuo repository root.
5. La tua pipeline di costruzione si distribuisce automaticamente. Il post è in diretta entro un minuto o due, a seconda del tuo host.

È il ciclo completo. [LightCMS](https://www.lightcms.me) funziona solo mentre scrivi. I lettori sono serviti dal tuo CDN, non da [LightCMS](https://www.lightcms.me).

## Cosa c'è nell'editor

**TipTap-based rich editor** — scrive Markdown pulito con la materia davanti. Quello che vedete è quello che si commette. Se hai mai aperto un file `.md` e hai trovato una zuppa di tag HTML, questa è l'alternativa.

**AI copilot** — connesso a qualsiasi API compatibile con OpenAI. Utile quando un paragrafo non sta atterrando: chiedigli di stringere la formulazione, espandere un punto, o raccogliere una bozza che hai abbandonato a metà pensiero.

**Voice-to-text** — dettare direttamente nell'editor utilizzando qualsiasi API di trascrizione Whisper-compatibile o Wit.ai. Buono per ottenere una prima bozza disordinata giù rapidamente quando la digitazione diventa nel modo di pensare.

**Temi chiari e scuri** — diverse opzioni di tema in modo che l'editor sia comodo durante le sessioni di scrittura più lunghe.

**Newsletter automation** — pubblicare un post e notificare automaticamente gli abbonati tramite [Newsy](/docs/newsletter-newsy). Nessun servizio di newsletter di terze parti richiesto.

## Cosa [LightCMS](https://www.lightcms.me) non fa

Non ospita i tuoi contenuti o serve i tuoi lettori, e questo è per design. Se vieni da WordPress o Ghost, il CMS che è l'host è quello a cui sei abituato. Qui il rapporto è diverso: [LightCMS](https://www.lightcms.me) è uno strumento di scrittura, non un'infrastruttura. Il vostro generatore di sito statico costruisce l'output, il vostro provider di hosting lo serve, e possiedi ogni file. Cambiare editor, generatori o host non significa migrare un database.

Non sostituisce nemmeno la tua configurazione di distribuzione. Funziona con qualsiasi pipeline che hai già.

## Prossime tappe

- [Perché LightCMS?](/docs/why-lightcms) — la filosofia del design dietro Git-backed publishing
- [Come avviare un blog](/docs/how-to-start-a-blog) — scegli un modello e vai da zero a pubblicato
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — esegui la tua istanza privata
- [Newsletter automation](/docs/newsletter-newsy) — invia messaggi agli abbonati automaticamente con Newsy
- [Building a greener web](/docs/building-a-greener-web) — why static publishing is the lower-carbon choice
