---
title: Úvod
serial: 1
date: 2026-09-01T16:44:00Z
draft: nepravda
tags:
  - světlomety
  - cms
  - git
  - ssg
  - statické
  - web
  - generátor
keywords:
  - světlomety
  - začínají
  - úvod
  - wysiwyg
  - markdown
  - na základě gitu
---

[LightCMS](https://www.lightcms.me) je Git-backed editor pro statické stránky. Psáte do bohatého editoru, zmáčkněte publikovat a [LightCMS](https://www.lightcms.me) provede čisté Markdown do vašeho repozitáře. Vaše zaváděcí plynovod – Cloudflare Pages, Netlify, Vercel, GitHub stránky – odtamtud odtam.

Váš obsah žije ve svém vlastním Git repozitáři, jako jsou obyčejné Markdown soubory, čitelné a přenositelné jakýmkoli statickým generátorem webu, který již používáte.

## Jak to funguje

1. Přihlaste se svým GitHub účtem.
2. Připojte repozitář, který obsahuje vaše statické stránky. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — cokoliv, co čte Markdown.
3. Zapisovat a upravovat obsah v vestavěném editoru. Vytvářejte příspěvky, upravujte existující obrázky, nahrajte obrázky a vyplňte pole pro záhlaví, aniž by se dotkl terminálu.
4. Stiskněte pro publikování. [LightCMS](https://www.lightcms.me) přenese váš obsah na cestu, kterou jste nakonfigurovali - například `content/blog/my-post.md` v kořenovém adresáři vašeho repositáře.
5. Tvoje stavěcí potrubí se automaticky rozvádí. V závislosti na vašem hostiteli je příspěvek živý během jedné nebo dvou minut.

To je celý cyklus. [LightCMS](https://www.lightcms.me) běží pouze při psaní. Čtenáři jsou servírováni vaším CDN, ne [LightCMS](https://www.lightcms.me).

## Co je v editoru

**Bohatý editor** na TipTapu — vyčistí Markdown s předními záležitostmi. To, co vidíte, je to, co je závazné. Pokud jste někdy otevřeli soubor `.md` a našli polévku HTML značek, je to alternativa.

**AI copilot** – připojeno k libovolnému API kompatibilnímu s OpenAI. Užitečné v případě, že určitý bod nenaplní: požádejte jej, aby zpřísnil formulaci, rozšířil bod nebo vyzvedl koncept, který jsi opustil středem myšlení.

**Hlas/text** — diktujte přímo do editoru pomocí jakéhokoliv přepisu kompatibilního s Whisperem. API nebo Wit.ai. Dobré za to, že se rychle dostává nepříjemný první návrh dolů, když se píšeme do myšlení.

**Světlé a tmavé motivy** — několik možností motivu, takže je editor pohodlný během delšího psaní.

**Automatizace newsletteru** — zveřejnit příspěvek a automaticky informovat předplatitele prostřednictvím [Newsy](/docs/newsletter-newsy). Služba odběru novinek třetí strany není vyžadována.

## Co [LightCMS](https://www.lightcms.me) nedělá

Nehostuje váš obsah ani neslouží svým čtenářům, a to je podle návrhu. Pokud pocházíte z WordPress nebo Ghost, je CMS hostitelem to, na co jste zvyklí. Zde je vztah odlišný: [LightCMS](https://www.lightcms.me) je zapisovací nástroj, nikoli infrastruktura. Váš statický generátor stránek vytváří výstup, váš poskytovatel hostingu jej slouží a vlastníte každý soubor. Přepínání editorů, generátorů nebo hostitelů neznamená migraci databáze.

Také nenahrazuje vaše nasazení. Funguje s jakýmkoliv potrubím, které již máte.

## Další kroky

- [Proč LightCMS?](/docs/why-lightcms) — filozofie designu za vydavatelstvím podporovaným Gitem
- [Jak spustit blog](/docs/how-to-start-a-blog) — vyberte šablonu a přejděte od nuly do publikace
- [Samohosting LightCMS](/docs/self-hosting-lightcms) — spusťte vlastní soukromou instanci
- [Automatizace newsletteru](/docs/newsletter-newsy) — automaticky posílat příspěvky předplatitelům s Newsy
- [Vytváření zelenějšího webu](/docs/building-a-greener-web) — proč statické publikování je volba nízkouhlíkového
