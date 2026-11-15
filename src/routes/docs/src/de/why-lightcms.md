---
title: "Warum LightCMS: Git-unterstütztes CMS für statische Seiten"
description: Die meisten CMS-Plattformen besitzen Ihre Inhalte. LightCMS hält es in deinem Git Repo, in plain Markdown, installiert von deiner eigenen Pipeline.
serial: 2
date: 2026-10-14T14:00:00Z
draft: falsch
tags:
  - hellcms
  - git
  - cms
  - statisch
  - markdown
  - publizieren
keywords:
  - warum Lightcms
  - git basierte cms
  - kopflose cms
  - markdown cms
  - statische Site-cms
preview: /og-image.png
---

Die meisten Inhaltsplattformen speichern Ihr Schreiben in ihrer Datenbank, stellen es auf ihren Servern dar und berechnen Ihnen den weiteren Zugriff. Wenn die Plattform herunterfährt, die Preise erhöht oder die Bedingungen ändert, dann passt Ihr Inhalt dazu.

[LightCMS](https://www.lightcms.me) nimmt eine andere Position ein: Ihr Inhalt lebt in Ihrem eigenen Git-Repository als einfache Markdown Dateien. [LightCMS](https://www.lightcms.me) berührt Ihre Leser nie – es läuft nur während Sie schreiben.

## Das Kernproblem mit gehosteten CMS-Plattformen

Wenn Sie auf einem traditionellen gehosteten CMS veröffentlichen, mieten Sie Platz in der Datenbank von jemandem. Das klingt gut, bis etwas schief geht.

Die Plattform tötet deine Planebene. Sie fügen ein neues Speicherlimit hinzu. Sie werden erworben. Das Importwerkzeug kaputt. Plötzlich migrierende Jahre des Inhalts ist ein Nachmittag der Arbeit, für die du nicht budgetiert hast.

Selbst wenn nichts schief geht, ist die Sperre ruhig, aber real. Ihre Inhalte sind in einem proprietären Format hinter einer API gefangen. Sie können keinen `grep` auf Ihren eigenen Artikeln verwenden. Sie können einen Entwurf nicht gegen die vorherige Version verteilen. Sie können einen Zusammenführungskonflikt in einem Beitrag nicht lösen.

Mit [LightCMS](https://www.lightcms.me)werden Inhalte als Markdown Dateien an Ihr Repository übergeben. Das war's. Ihre Publishing-Pipeline ist nur ein statischer Standortgenerator — Astro, Hugo, Jekyll, Eleventy, Zola, was immer Sie bereits verwenden. [LightCMS](https://www.lightcms.me) ist die Editorebene oben. Tauschen Sie es jederzeit aus und Ihre Inhalte bleiben unberührt.

## Was Git basiertes Publizieren tatsächlich bedeutet

Jeder Speicherplatz ist ein Commit. Jede Bearbeitung ist überprüfbar und versionskontrolliert. Jeder Beitrag hat eine vollständige Geschichte, die auf den ersten Entwurf zurückgeht.

Zusammenarbeit funktioniert genauso wie bei der Code: Zweige für Entwürfe, Pull-Requests für die Überprüfung, Commit-Nachrichten als Changelog. Wenn Sie bereits mit Git zufrieden sind, ist dies das mentale Modell, das Sie bereits für alles andere in Ihrem Stapel haben.

Die Kehrseite ist, dass die Leser nie [LightCMS](https://www.lightcms.me) treffen. Inhalt wird Ihrem Repository übergeben, die Pipeline läuft (Cloudflare Seiten, Netlify, Vercel, GitHub Pages) und die Ausgabe ist statisches HTML von einem CDN-Kantenknoten. Kein Anwendungsserver sitzt zwischen dem Leser und dem Inhalt.

Dies ist wichtig für die Performance — statische Dateien laden schnell. Es kommt auch auf Kosten an. Die meisten dieser Gastgeber haben kostenlose Stufen, die eine persönliche oder kleine Website ohne monatliche Rechnung abdecken.

## Der Editor lässt dich nicht darüber nachdenken

Die Git Mechanik läuft im Hintergrund. Vom Herausgeber, die Erfahrung ist nur zu schreiben.

Der TipTap-basierte Editor schreibt Markdown sauber. Sie können eine beliebige Whisper-kompatible API oder Wit.ai verwenden, wenn Sie eine Stimme bevorzugen. Die integrierte KI-Kopilot, die mit jedem OpenAI-kompatiblen Endpunkt arbeitet, kann einen Entwurf verfeinern, einen Satz reparieren oder wo du aufgehört hast.

Wenn Sie auf "veröffentlichen" klicken, überträgt LightCMS die Datei in den Pfad, den Sie konfiguriert haben und Ihre Bereitstellungs-Pipeline übernimmt. Wenn Sie auf Cloudflare Seiten sind, ist der Beitrag in etwa einer Minute verfügbar.

## Was LightCMS nicht ist

Es ist keine gehostete Blogging-Plattform. Es gibt keine von LightCMS verwaltete Infrastruktur zwischen Ihnen und Ihren Lesern. LightCMS ist Software, die Sie als Autor laufen und es schreibt in Repositories Sie besitzen.

## Der Nachhaltigkeitswinkel

Statische Standorte emittieren deutlich weniger CO2 pro Seitenansicht als von Servern gerenderte Äquivalente. Es gibt keine permanente Datenbank, kein Request-Rendering und keinen Server, der warm. Eine Seitenansicht, die einen CDN-Cache trifft, ist meist nur ein Netzwerkhop.

[Bei der Forschung wird eine typische statische, zwischengespeicherte Seite auf etwa 0 gesetzt. 02 Gramm CO2 pro Besuch](https://www.websitecarbon.com/) — im Vergleich zu einem Gramm oder mehr für eine schwere, servergesteuerte Seite. Diese Lücke verschlimmert Millionen von Seitenaufrufen.

Es ist nicht der Hauptgrund, eine statische Architektur zu wählen, aber es ist ein echter Vorteil, wenn die Umweltkosten der Infrastruktur für Sie von Bedeutung sind.

## Wer ist für

LightCMS ist eine gute Passform, wenn:

- Du bist ein Entwickler mit einem Blog auf einem statischen Seitengenerator und möchtest einen anständigen Editor für dich oder Mitarbeiter
- Du möchtest, dass dein Schreiben jede einzelne Plattform überdauert
- Sie wollen keine Hosting-Kosten für die Zustellung von Inhalten
- Sie wollen Ihre Inhalte in einem Format, das KI-Codierer, Suchwerkzeuge und benutzerdefinierte Skripte alle nativ lesen können

Es ist nicht gut, wenn Sie Echtzeitfunktionen, komplexe relationale Content-Strukturen oder eine voll verwaltete Plattform benötigen, auf der jemand anders die Infrastruktur verwaltet.

## Wohin Sie von hier gehen

- [Erste Schritte mit LightCMS](/docs/getting-started-with-lightcms) — Überblick über die Funktionen und wie es funktioniert
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — führen Sie Ihre eigene Instanz aus, volle Konfigurationsreferenz
- [Statische Standorte und CO2](/docs/building-a-greener-web) — der Umweltfall für statisches Publizieren in größerer Tiefe
