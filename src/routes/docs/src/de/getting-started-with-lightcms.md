---
title: Einführung
serial: 1
date: 2026-09-01T16:44:00Z
draft: falsch
tags:
  - hellcms
  - cms
  - git
  - ssg
  - statisch
  - site
  - generator
keywords:
  - hellcms
  - loslegen
  - einführen
  - wysiwyg
  - markdown
  - git basiert
---

[LightCMS](https://www.lightcms.me) ist ein Git-unterstützter Editor für statische Seiten. Sie schreiben in einem Rich-Editor, drücken Veröffentlichungen und [LightCMS](https://www.lightcms.me) überträgt Markdown in Ihr Repository. Ihre Bereitstellungs-Pipeline – Cloudflare Pages, Netlify, Vercel, GitHub Pages – bringt sie von dort.

Deine Inhalte leben in deinem eigenen Git-Repository als einfache Markdown-Dateien, lesbar und von jedem statischen Website-Generator, den du bereits verwendest.

## So funktioniert es

1. Melden Sie sich mit Ihrem GitHub-Konto an.
2. Verbinden Sie das Repository, das Ihre statische Website enthält. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — alles was Markdown liest.
3. Schreiben und bearbeiten Sie Inhalte im eingebauten Editor. Erstellen Sie Beiträge, bearbeiten Sie bestehende Beiträge, laden Sie Bilder hoch und füllen Sie Frontfelder aus, ohne ein Terminal zu berühren.
4. Treffer veröffentlichen. [LightCMS](https://www.lightcms.me) überträgt Ihren Inhalt in den Pfad, den Sie konfiguriert haben — zum Beispiel `content/blog/my-post.md` in Ihrem Projektarchiv.
5. Ihre Pipeline wird automatisch bereitgestellt. Der Beitrag ist innerhalb von ein oder zwei Minuten live je nach Gastgeber.

Das ist die ganze Schleife. [LightCMS](https://www.lightcms.me) läuft nur während du schreibst. Leser werden von Ihrer CDN bedient, nicht von [LightCMS](https://www.lightcms.me).

## Was ist im Editor

**TipTap-basierter Rich-Editor** — schreibt Markdown mit Frontmasse. Was Sie sehen, ist das, was engagiert wird. Wenn Sie jemals eine `.md` Datei geöffnet haben und eine Suppe von HTML-Tags gefunden haben, ist dies die Alternative.

**KI copilot** — mit einer OpenAI-kompatiblen API verbunden. Nützlich, wenn ein Absatz nicht landet: Bitten Sie ihn, den Wortlaut zu verschärfen, einen Punkt zu erweitern oder einen Entwurf aufzugreifen, den Sie während des Gedankens aufgegeben haben.

**Voice-to-text** — diktieren Sie direkt in den Editor mit einer beliebigen Whisper-kompatiblen Transkriptions-API oder Wit.ai. Gut zum schnellen Abwerfen eines unordentlichen ersten Entwurfs beim Eintippen im Denken.

**Helle und dunkle Themen** — mehrere Theme-Optionen, so dass der Editor während längerer Schreibsitzungen bequem ist.

**Newsletter Automatisierung** — Veröffentlichen Sie einen Beitrag und benachrichtigen Sie Abonnenten automatisch über [Newsy](/docs/newsletter-newsy). Kein Newsletter-Service von Dritten erforderlich.

## Was [LightCMS](https://www.lightcms.me) nicht macht

Es beherbergt weder Ihre Inhalte noch Ihre Leser, und das ist nach Design. Wenn Sie von WordPress oder Ghost, das CMS ist der Gastgeber ist, was Sie gewohnt sind. Hier ist die Beziehung anders: [LightCMS](https://www.lightcms.me) ist ein Schreibwerkzeug, nicht eine Infrastruktur. Ihr statischer Site-Generator erstellt die Ausgabe, Ihr Hosting-Provider sie und Sie besitzen jede Datei. Das Wechseln von Editoren, Generatoren oder Hosts bedeutet nicht, eine Datenbank zu migrieren.

Es ersetzt auch Ihre Deployment-Einrichtung nicht. Es funktioniert mit jeder Pipeline, die Sie bereits haben.

## Nächste Schritte

- [Warum LightCMS?](/docs/why-lightcms) — die Designphilosophie hinter Git-Backed Publishing
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [Self-Hosting LightCMS](/docs/self-hosting-lightcms) — führen Sie Ihre eigene private Instanz aus
- [Newsletter Automatisierung](/docs/newsletter-newsy) — Nachrichten automatisch mit Newsy an Abonnenten senden
- [Erstelle ein grüneres Web](/docs/building-a-greener-web) — warum statische Veröffentlichung die kohlenstoffarme Wahl ist
