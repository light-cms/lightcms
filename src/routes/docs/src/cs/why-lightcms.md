---
title: "Proč LightCMS: Git-backed CMS pro statické stránky"
description: Většina platforem CMS vlastní váš obsah. LightCMS ji udržuje ve vašem Gitu v prostém Markdown a je nasazena svým vlastním potrubím.
serial: 2
date: 2026-10-14T14:00:00Z
draft: nepravda
tags:
  - světlomety
  - git
  - cms
  - statické
  - markdown
  - publikování
keywords:
  - proč světla
  - gitové cms
  - bezhlavé cms
  - markdown cms
  - statické stránky cms
preview: /og-image.png
---

Většina platforem obsahu ukládá vaše psaní do své databáze, vykresluje je na svých serverech a účtuje vám za zachování přístupu. Když se platforma zastaví, zvýší ceny nebo změní podmínky, váš obsah s tím souvisí.

[LightCMS](https://www.lightcms.me) zaujímá jinou pozici: váš obsah žije ve svém vlastním Git repositáři jako obyčejné Markdown soubory. [LightCMS](https://www.lightcms.me) se nikdy nedotkne vašich čtenářů — běží pouze při psaní.

## Problém jádra s Hosted CMS platformami

Když zveřejníte na tradičním hostovaném CMS, pronajímáte si místo v databázi někoho jiného. To zní dobře, dokud se něco nepovede.

Platforma zabije vaši vrstvu plánu. Přidávají nový limit úložiště. Dostávají se. Importovací nástroj se rozbije. Najednou se migrující léta obsahu je odpolední prací, na kterou jste nedostali rozpočet.

I když se nic nestane, je zámek tichý, ale skutečný. Váš obsah je zachycen v proprietárním formátu za API. Nemůžete spustit `grep` na vlastních článcích. Koncept nelze odlišit od předchozí verze. Konflikt sloučení v příspěvku nelze vyřešit.

S [LightCMS](https://www.lightcms.me)je obsah určen pro váš repozitář jako Markdown soubory. To je to. Tvůj vydavatelský plynovod je jen statickým generátorem — Astro, Hugo, Jekyll, Eleventy, Zola, cokoliv již používáš. [LightCMS](https://www.lightcms.me) je horní vrstva editoru. Prohodit jej kdykoliv a váš obsah je nedotčen.

## Co publikování založené na Gitu ve skutečnosti znamená

Každá uložená pozice je revize. Každá úprava je ověřitelná a ovládána verzí. Každý příspěvek má úplnou historii a vrací se k prvnímu návrhu.

Spolupráce funguje stejně jako pro kód: pobočky pro návrhy, žádosti o přezkum, zprávy jako seznam změn. Pokud jste již spokojeni s Git, je to duševní model, který již máte pro všechno ostatní ve vašem stacku.

Flipside je, že čtenáři nikdy nehit [LightCMS](https://www.lightcms.me). Obsah je uložen do vašeho repozitáře, spuští se pipeline na stavbě (Cloudflare Pages, Netlify, Vercel, GitHub stránky, a výstup je statický HTML servis z hraničního uzlu CDN. Žádný aplikační server neleží mezi čtenářem a obsahem.

Důležité pro výkon – rychlé načítání statických souborů. Záleží také na nákladech. Většina těchto hostitelů má bezplatné úrovně, které pokrývají špičkové osobní stránky nebo malé publikace bez měsíčního účtu.

## Editor nepřemýšlíte o tom

Git mechanika běží na pozadí. Zkušenost z editoru je jen psaná.

Editor založený na TipTapu zapíše čistý Markdown. Pokud dáváte přednost hlasu, můžete si diktovat pomocí jakéhokoliv API nebo Wit.ai kompatibilního Whisperu. Vestavěný AI copilot, který pracuje s jakýmkoliv koncovým bodem kompatibilním s OpenAI, může upřesnit koncept, opravit větu nebo vyzvednout tam, kde jste skončili.

Po kliknutí na publikování se soubor LightCMS přenese na cestu, kterou jste nakonfigurovali a vaše zaváděcí potrubí převezme. Pokud jste na stránkách Cloudflare, příspěvek je živý asi do minuty.

## Co není LightCMS

Není to hostovaná blogovací platforma. Mezi vámi a vašimi čtenáři není žádná infrastruktura spravovaná v rámci LightCMS. LightCMS je software, který používáte jako autor a který píše do vašich repozitářů.

## Úhel udržitelnosti

Statická místa vypouštějí výrazně méně CO2 na stránku než ekvivalenty vygenerované serverem. Neexistuje žádná neustále spuštěná databáze, žádné vykreslování pro každý požadavek a žádný server pro udržení teple. Zobrazení stránky, které zasáhne CDN keš je většinou jen síťová naděje.

[Výzkum umístí typickou statickou stránku v mezipaměti kolem 0. 02 gramů CO2 na návštěvu](https://www.websitecarbon.com/) — oproti gramu nebo více pro těžkou, servery vykreslenou stránku. Tato propast se prohlubuje mezi miliony stran pohledu.

Není to hlavní důvod pro výběr statické architektury, ale je to skutečný přínos, pokud pro vás záleží na environmentálních nákladech na infrastruktuře.

## Kdo je pro

LightCMS je dobrá věc, jestliže:

- Jste vývojář, který běží na blogu na statickém generátoru stránek a chcete slušný editor pro sebe nebo spolupracovníky
- Chcete, aby váš zápis překonal jakoukoliv platformu
- Chcete nulové náklady na hostování pro doručení obsahu
- Přejete si svůj obsah ve formátu, který programovatelé, vyhledávací nástroje a vlastní skripty mohou všechny číst nativně

Není to dobré, pokud potřebujete funkce v reálném čase, komplexní relační struktury obsahu nebo plně spravovanou platformu, kde se s infrastrukturou manipuluje někdo jiný.

## Odkud se má jít

- [Začínáme s LightCMS](/docs/getting-started-with-lightcms) – přehled funkcí a fungování
- [Jak spustit blog](/docs/how-to-start-a-blog) — vyberte šablonu a přejděte od nuly do publikace
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — spusťte vlastní instanci, úplný konfigurační odkaz
- [Statická místa a CO2](/docs/building-a-greener-web) – případy z hlediska životního prostředí pro statické zveřejnění do hloubky
