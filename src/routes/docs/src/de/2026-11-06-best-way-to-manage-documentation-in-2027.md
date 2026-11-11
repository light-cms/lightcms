---
title: Die beste Möglichkeit, die Dokumentation 2027 zu verwalten
date:
draft: falsch
weight: 0
tags:
  - cms
  - hellcms
  - grünes Web
isCJKLanguage: falsch
headless: falsch
keywords: ""
preview: ""
description: ""
serial: 0
section: ""
badge: ""
---

Dokumentation ist Teil eines Projekts, dem jeder zustimmt, und niemand ist sich völlig einig, wie man damit umgehen soll. Schauen Sie sich fünf Open-Source-Projekte an und Sie finden fünf verschiedene Setups. Einige funktionieren gut. Die meisten treiben in die Vernachlässigung.

Hier ist, wie die gemeinsamen Muster in der Praxis tatsächlich aussehen und warum einige besser halten als andere im Laufe der Zeit.

## Der Wiki-Ansatz: Schnell zu starten, langsam zu sterben

GitHub Wikis und Confluence sind der Standard für viele Teams. Sie sind schnell eingestellt, keine Konfiguration erforderlich, und jeder kann eine Seite hinzufügen.

Das Problem ist, dass Wikis Seiten schneller sammeln, als sie gewartet werden. Ein Confluence-Raum für ein zweijähriges Projekt hat typischerweise genaue Seiten, -Seiten, die veraltet sind und keine verlässliche Art zu sagen, wer was ist. Suche nach Oberflächen alles gleichermaßen. Es gibt keinen Überprüfungsprozess. Niemand besitzt irgendetwas.

GitHub Wikis haben das gleiche Problem mit einer zusätzlichen Einschränkung: Sie leben in einem separaten Repository von deinem Code. Eine Pull-Anfrage, die eine API ändert, fordert niemanden automatisch auf, die Docs zu aktualisieren. Die Lücke zwischen Code und Dokumentation breitet sich leise aus.

Teams, die Wikis verwenden, sind die Ausnahme. Sie haben in der Regel einen eigenen technischen Schriftsteller, der Standards durchsetzt. Die meisten Teams nicht.

## Idee und ähnliche Tools: ideal für interne Teams, schlecht für die Langlebigkeit

Der Begriff ist wirklich gut für die interne Dokumentation — Onboarding-Guides, Runbooks, Team-Prozesse, Meetingnoten. Der Editor ist flexibel, die Berechtigungen sind granular, und es ist einfach genug, dass nicht-technische Mitwirkende es tatsächlich verwenden.

Für die Projektdokumentation, die neben Code leben soll, ist sie in einigen Fällen mangelhaft.

Ihre Dokumentation befindet sich in Notion's Datenbank, nicht in Ihrem Repository. Es gibt keinen Diff, keine PR-Überprüfung, keinen automatisierten Einsatz. Wenn Notion seine Preise ändert, eine Funktion veraltet oder einfach verschwindet, ist Migration ein manueller Export- und Formatierungsauftrag.

Die tiefere Frage ist die Entdeckbarkeit. Dokumente, die in Notion leben, werden nicht neben Ihrer Codebase indiziert. Ein Entwickler, der nach einem Funktionsnamen sucht, findet nicht die Notion-Seite, die erklärt, warum es so funktioniert. Die beiden Systeme sprechen nicht miteinander.

## README-Antrieb: ehrlich, aber schwer skalierbar

Viele kleinere Projekte – und viele Open-Source-Projekte – sind fast ausschließlich auf die README angewiesen. Eine Datei, die aktuell gehalten wurde und die Installation, Nutzung und Beitragsrichtlinien umfasst.

Das funktioniert überraschend gut für fokussierte Tools mit einer stabilen API. Die Einschränkung einer Datei erzwingt Priorisierung. Es gibt keine Dokumentations-Streuung, weil es nirgends für sie gehen kann.

Es bricht zusammen, wenn ein Projekt an einer gewissen Komplexität vorbei wächst. Ein README-Programm, das fünfzehn verschiedene Konfigurationsoptionen, drei Einsatzziele und einen Migrationsleitfaden von v1 bis v2 abdeckt, um nicht mehr lesbar zu sein. An dieser Stelle lassen Teams sie entweder verrotten oder etwas anderes bauen.

## Docs-as-Code: das Muster, das skaliert

Die Projekte mit konsistent guter Dokumentation neigen dazu, dasselbe Grundmuster zu verwenden: Markdown Dateien im Repository, von einem statischen Site-Generator, der neben jeder Veröffentlichung eingesetzt wird.

Kubernetes Docs sind im gleichen monorepo wie die Codebase, überprüft im gleichen Pull-Request-Workflow. Das Rust Book ist ein Markdown Projekt auf GitHub mit hunderten von Mitwirkenden. Astros Dokumentation ist eine Astro Starlight-Website, die neben dem Framework selbst engagiert ist.

Was diese Arbeit macht, ist nicht das Werkzeug. Es ist der Workflow. Die Dokumentation befindet sich neben dem Code, so dass sie aktualisiert werden, wenn der Code sich ändert. Eine PR, die ein neues Flag hinzufügt, muss die Dokumentation aktualisieren, bevor sie zusammengeführt wird. Der Überprüfungsprozess setzt ihn durch.

Der zweite Vorteil ist die Haltbarkeit. Markdown Dateien aus dem Jahr 2015 sind noch 2027 lesbar und einsetzbar. Keine Migration erforderlich, kein proprietäres Exportformat, keine Plattformabhängigkeit. Der Inhalt ist nur Textdateien in einem Ordner.

## Die Reibung, die Docs als Code für nicht-technische Mitwirkende tötet

Die einzige wirkliche Schwäche des Markdown-In-Git-Ansatzes ist, dass er davon ausgeht, dass jeder mit einem Texteditor und einem Pull-Request zufrieden ist. Für viele Teams ist das in Ordnung. Für Teams mit nicht-technischen Mitwirkenden – Marketing, Produkt, Support – schafft es Reibung, die dazu führt, dass die Dokumentation in einem parallelen System ignoriert oder gepflegt wird.

Hier fügt sich ein Git-unterstütztes CMS ein. Tools wie LightCMS sitzen vor dem Projektarchiv und geben den Mitwirkenden ein echtes Editorerlebnis, während Markdown Dateien immer noch in das Repo übertragen werden. Der Editor bearbeitet Formatierungen. Das CMS behandelt den Commit. Der Mitwirkende sieht nie ein Terminal.

Das Ergebnis ist der gleiche wie docs-as-code — Inhalt in Markdown, versioniert in Git, wird von Ihrer bestehenden Pipeline eingesetzt – aber zugänglich für Leute, die Git nicht direkt verwenden möchten.

## Was eigentlich im Jahr 2027 funktioniert

Das Muster ist einfach: Markdown Dateien in Ihrem Projektarchiv, erstellt von einem statischen Site-Generator, überprüft in Pull-Requests, bei Zusammenführung bereitgestellt.

Die spezifischen Werkzeuge um dieses Muster sind weniger wichtig als der Workflow. Wenn dein Team GitHub verwendet, eine Starlight oder Docusaurus Website, die zum selben Repo verpflichtet ist, gibt dir alles: Suche, -Versionierung, eine korrekte Lesungserfahrung und ein Überprüfungsprozess, der die Dokumentation mit dem Code synchronisiert.

Wenn Sie nicht-technische Mitwirkende haben, setzen Sie einen Git-unterstützten Editor vor ihm, so dass sie schreiben können, ohne das Terminal zu berühren. Das zugrunde liegende Setup bleibt unverändert. Der Inhalt bleibt in Ihrem Repo.

Die Projekte mit der besten Dokumentation sind nicht die mit dem besten Werkzeug. Sie sind diejenigen, die die Dokumentation zu einem Teil des gleichen Workflows wie Code gemacht haben.

---

## FAQ

### Was ist docs-as-code?

Docs-as-Code ist die Praxis, Dokumentation zu schreiben und zu pflegen, die dieselben Werkzeuge und Workflows wie Softwareentwicklung verwendet: Klartext-Dateien (normalerweise Markdown), Versionskontrolle (üblicherweise Git), Überprüfung des Codes und automatisches Bereitstellen. Es hält die Dokumentation nah an dem beschriebenen Code und macht Aktualisierungen zu einem Teil des normalen Entwicklungsworkflows.

### Ist Markdown gut genug für Dokumentation?

Ja, für die überwiegende Mehrheit der Projekte. Markdown behandelt Überschriften, Code-Blöcke, Tabellen, Bilder und Links. Statische Site-Generatoren wie Starlight, Docusaurus und MkDocs ergänzen Suche, Navigation, Versionierung und ein angemessenes Leseerlebnis. Die Einschränkung von reinem Text ist ein Feature: Er ist in jedem Editor lesbar, vergrößerbar, diffbar und über Jahrzehnte langlebig.

### Wie tragen nicht-technische Autoren zur Markdown-Dokumentation bei?

Git-unterstützte CMS-Tools wie LightCMS bieten einen Rich-Editor, der Markdown in Ihr Repository überträgt, ohne dass Mitwirkende Git direkt verwenden müssen. Der Inhalt bleibt in Ihrem Repo im Klaren Markdown. Der Editor ist nur eine zugänglichere Schnittstelle zu den gleichen dahinter liegenden Dateien.

### Was ist der beste statische Site-Generator für Dokumentation?

Abhängig von Ihrem Stack. Astro Starlight und Docusaurus sind die besten Optionen mit guter Suche aus dem Box. MkDocs mit Material ist hervorragend für Python-Projekte. Wenn Sie bereits auf Hugo oder Eleventy für Ihren Blog, können sie auch mit Docs zu behandeln. Der Generator ist weniger wichtig, als die Dokumentation im selben Projektarchiv wie Ihr Code zu halten.
