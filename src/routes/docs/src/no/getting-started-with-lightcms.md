---
title: Introduksjon
serial: 1
date: 2026-09-01T16:44:00Z
draft: usann
tags:
  - lysdioder
  - cm
  - git
  - ssg
  - statisk
  - nettsted
  - generator
keywords:
  - lysdioder
  - kom i gang
  - introduksjon
  - wysiwyg
  - markdown
  - git basert
---

[LightCMS](https://www.lightcms.me) er en Git-backed editor for static sites. Du skriver i et rikt redigeringsprogram, trykk publisering, og [LightCMS](https://www.lightcms.me) kommanderer Markdown reng til ditt depot. Rørledningen din — Skyflare sider, Netlify, Vercel, GitHub sider — tar den derfra.

Innholdet ditt bor i ditt eget Git depot, som vanlige Markdown-filer, leselig og distribueres av enhver statisk sidegenerator du allerede bruker.

## Slik fungerer det

1. Logg inn med din GitHub konto.
2. Koble til arkivet som inneholder det statiske nettstedet ditt. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy – alt som leser Markdown.
3. Skriv og rediger innholdet i den innebygde editoren. Opprett innlegg, rediger eksisterende og last opp bilder og fyll ut front matter felt uten å berøre en terminal.
4. Trykk publisert. [LightCMS](https://www.lightcms.me) commits your content to the path you configured — for example, `content/blog/my-post.md` in your repository root.
5. Din reise av rørledningen din automatisk. Posten er i live innen et minutt eller to, avhengig av din leverandør av netthotell.

Det er den fulle løkken. [LightCMS](https://www.lightcms.me) kjører bare mens du skriver. Lesere er tjener av CDN, ikke av [LightCMS](https://www.lightcms.me).

## Hva er i editoren

**Tipsbasert, rik redaktør** — skriver clean Markdown med frontsak. Det du ser er hva som blir begått. Hvis du noen gang har åpnet en `.md` -fil og funnet en suppp av HTML-tagger, er dette alternativet.

**AI copilot** — koblet til et OpenAI-kompatibelt API. Nyttig når et avsnitt ikke landes: Be det om å stramme ordet, utvide et punkt, eller plukke opp et utkast du forlatt midttanke.

**Voice-to-text** — diktere direkte i editoren ved å bruke en Whisper-kompatibel transkripsjon API eller Wit.ai. Bra for å først få et utkast til et rotete først når man skriver hvordan man tenker sammen.

**Light and dark themes** — several theme options so the editor is comfortable during longer writing sessions.

**Automatisering av nyhetsbrev** — publiser et innlegg og varsle abonnenter automatisk via [Nyhet](/docs/newsletter-newsy). Ingen tredjeparts nyhetsbrevtjeneste kreves.

## Hva [LightCMS](https://www.lightcms.me) ikke gjør

Det er ikke vert for innholdet ditt eller servere leserne dine, og det er det er et design. Hvis du kommer fra WordPress eller Ghost, er CMS som er verten hva du er vant til. Her er forholdet forskjell: [LightCMS](https://www.lightcms.me) er et verktøy som skriver verdi, ikke infrastruktur. Den statiske nettstedet generatoren bygger ut, vertsleverandøren din serverer den, og du eier hver fil. Bytter ikke tekstbehandlere, generatorer eller verter betyr ikke å migrere en database.

Det erstatter heller ikke distribusjonen din. Den fungerer med hvilken av rørene du allerede har.

## De neste trinnene

- [Why LightCMS?](/docs/why-lightcms) — designfilosofien bak Git-sikkerhetskopiert publisering
- [Hvordan starte en blogg](/docs/how-to-start-a-blog) — velg en mal og gå fra null til publisert
- [Selvhosting LightCMS](/docs/self-hosting-lightcms) - kjøre din egen private forekomst
- [Nyhetsbrev automasjon](/docs/newsletter-newsy) - sende innlegg til abonnenter automatisk med nyhet
- [Bygger et grønnere web](/docs/building-a-greener-web) — hvorfor statisk publisering er valget av lavere karbon
