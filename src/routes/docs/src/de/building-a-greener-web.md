---
title: "Statische Stätten und CO2: Baue ein grüneres Web"
description: Warum statische Websites weniger Kohlenstoff emittieren, wie CDN Caching den Energieverbrauch senkt und wie ein grüneres Web aussieht.
date: 2026-10-14T13:30:00Z
draft: falsch
tags:
  - nachhaltiger
  - statische Seiten
  - grünes Web
  - ko2
  - ssg
keywords: hellcms
preview: /og-image.png
serial: 3
---

Es kostet viel eine Seite zu laden. Manchmal kann eine Seite nicht aus dem Cache geladen werden, wird die Datenbank mehrmals getroffen und jede Abfrage verwendet eine Menge Energie emittieren Kilogramm CO2. Es wird gesagt, dass 2–4% der CO2-Emissionen aus dem Netz kommen.

Wie die Luftfahrtindustrie kann das Internet dem Planeten schaden. Mit dem Layout, das Sie auswählen, können Sie zeigen, wie sehr Ihnen die Erde am Herzen liegt. Der umweltfreundliche Weg, um Informationen auszutauschen ist ein statischer Site-Generator, der Ihre Website einmal baut und sie dann von einer CDN bedient.

## Warum statische Websites Kohlenstoff abgeben

Um einen reaktiven Effekt Websites in der Regel führen die Rendering-Arbeit jedes Mal, wenn jemand interagiert: Sie führen Code fragen die Datenbank und senden eine vollständige Seite vom Server. Also muss der Server immer online bleiben, auch wenn niemand besucht.

- Eine statische Seite baut einmal auf. Das fertige HTML wird weltweit auf CDN-Kantenknoten kopiert. Gedient vom Cache:

- Keine Berechnung für jede Anfrage erforderlich. Das Servieren einer erstellten Datei verbraucht sehr wenig Energie im Vergleich zur Darstellung einer Seite auf dem Laufenden.

- Nicht immer in Datenbanken. Keine Server und Datenbanken laufen die ganze Zeit. Statische Sites benötigen keinen Server, um 24/7 laufen zu können. Es werden keine Datenbankabfragen durchgeführt, wodurch weniger Kohlenstoffemissionen entstehen.

- Cache standardmäßig. Eine Anfrage, die einen Randcache trifft, bewegt keine Energie über den Netzwerk-Hop.

- Kleine Nutzlasten. Das HTML aus Markdown ist winzig. Es wird kein schweres JavaScript oder fettes CSS an den Client gesendet. Der Client empfängt die Datei immer so, dass sie schneller geladen wird.

Sie alle haben vielleicht gehört, dass die Studie [Millisekunden Millionen](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html) ergeben.

Der Rippeleffekt: Dauerhaftigkeit ist Nachhaltigkeit

Ein Hugo oder Astro Starlight Projekt aus dem Jahr 2016 kann immer noch sein. Gedient im Jahr 2036, weil der Inhalt ist schlicht Markdown, was zeitlos bleibt. Die gesamte Toolchain ist Quellcode und vendor-neutral und die Ausgabe ist nur Ordner und Dateien.

Ihre Inhalte als Markdown in Git zu besitzen ist haltbar und spart Zeit.

Wie man Ihre Websites CO2-Emissionen misst

Sie können nicht verbessern, was Sie tun, wenn Sie es nicht messen:

- [Website Carbon Calculator](https://www.websitecarbon.com/) – schätzt Gramm CO2 pro Seitenansicht und vergleicht Ihre Website mit dem Durchschnitt.

- Eco Grader – Tariferfahrung, Zugänglichkeit, grünes Hosting und Kohlenstoffemissionen.

- Green Frame – simuliert Anwenderszenarien und Interaktionen mit mehreren Schritten, um den CO2-Fußabdruck und den Energieverbrauch zu messen.

- WebPage Test – bietet umfassende Leistungsdiagnostik neben Schätzungen über den CO2-Fußabdruck und den Core Web Vitals Fehlschlägen.

- Green Web Checker – prüft, ob eine Domains Hosting-Infrastruktur auf erneuerbare Energien läuft.

- Echtzeit-Metriken & Core Web Vitals – Metriken wie die größten Inhaltsstoffe Paint (LCP) und die totale Übertragung des ursprünglichen Bundles von jedem neuen Benutzer bei jedem Besuch.

Wie man ein grüneres Web baut

1. **Servieren Sie statisch von einem CDN** – der Weg, um Energie für Content-Sites zu sparen.

2. Statische Stätten werden einmal gebaut. Dann diente von einem CDN und machte es zur ökologischsten Art, eine Website zu bauen.

3. Schiff JavaScript. Jedes Kilobyte muss auf der Besucherbatterie und der Bandbreite gelesen, analysiert, ausgeführt und gespeichert werden.

4. Cache images. Media ist in der Regel der größte Teil einer Seite, so dass sie über die CDN und verwenden moderne Formate wie WebP.

Wo LightCMS passt

> LightCMS funktioniert auf genau diese Weise:

- Inhalte werden als Markdown in Ihr eigenes Repository übertragen, von einem statischen Site-Generator veröffentlicht und als kompilierte minimierte Dateien von Ihren Hosting-Anbietern ausgeliefert, stellt das Netzwerk dar.

- Das CMS läuft nur, während Sie schreiben. Keine Produktionsdatenbank dient den Lesern, da die Leser von einer CDN bedient werden.

## Kosten für statische Sites

Statische Sites sind in der Regel billiger oder sogar frei zu Gast.

- [GitHub Pages](https://pages.github.com/)
- [Codeberg Seiten](https://codeberg.org/pages)
- [Cloudflare-Seiten](https://pages.cloudflare.com/)
- [Bobby](https://vercel.com/)
- [Verneigen](https://www.netlify.com/)
- [Bitbucket-Seiten](https://bitbucket.org/pages)
- [Rendern](https://render.com/)
- [anheben](https://surge.sh/)

Sie können sogar eine statische Website aus einem benutzerdefinierten S3-Eimer bedienen.
