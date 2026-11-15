---
title: "Statické weby a CO2: Budování Greener Web"
description: Proč statické stránky vypouštějí méně uhlíku, jak CDN snižuje spotřebu energie a jak vypadá zelenější web.
date: 2026-10-14T13:30:00Z
draft: nepravda
tags:
  - Udržitelnost
  - statická místa
  - zelený web
  - co2
  - ssg
keywords: světlomety
preview: /og-image.png
serial: 3
---

Načítání stránky stojí hodně. Stránka se někdy nepodařilo načíst z mezipaměti, databáze je stisknuta vícekrát a každý dotaz používá množství energie emitující kilogramy CO2. Říká se, že 2 až 4 % emisí z ko2 pochází z internetu.

Stejně jako letecký průmysl může web poškodit planetu. Vybrané rozvržení vám umožní ukázat, kolik vám záleží na Zemi. Ekologický způsob, jak sdílet informace, je statický generátor stránek, který vytváří vaše stránky jednou a poté je servíruje z CDN.

## Proč se statické servery vypouštět uhlík

Aby stránky s reaktivními efekty obvykle provádějí vykreslovací práci pokaždé, když někdo interakce ovlivní: spouští kód, požádejte databázi a pošlete celou stránku ze serveru. Takže server musí zůstat online, i když nikdo nenavštíví.

- Statická stránka je postavena jednou. Dokončený HTML je zkopírován do hraných uzlů CDN po celém světě. Servis z mezipaměti:

- Pro každý požadavek není třeba žádný výpočet. Serving vytvořeného souboru využívá velmi málo energie ve srovnání s vykreslováním stránky za letu.

- Ne vždy v databázích. Žádné servery a databáze neběží po celou dobu. Statické stránky nepotřebují mít server 24/7. Neprovádějí se žádné dotazy v databázi, které by vedly k nižším emisím uhlíku.

- Mezipaměť ve výchozím nastavení Požadavek, který zasáhne hranu keše, nepřesouvá energii za síťovou naději.

- Malá užitečná zatížení. HTML z Markdown je malý. Klientovi není zaslán žádný těžký JavaScript ani tuk CSS. Klient vždy přijímá soubor, takže se načte rychleji.

Všichni jste možná slyšeli studium [milisekundy činí miliony](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

Ripple Effect: Trvanlivost je udržitelná

Projekt Hugo nebo Astro Starlight vytvořený v roce 2016 stále může být. Slouží v roce 2036, protože obsah je prostý Markdown, který zůstává bez časového omezení. Celý nástrojový řetězec je zdrojový a neutrální a výstup je pouze složkami a soubory.

Vlastnictví vašeho obsahu jako Markdown v Gitu je trvalé a šetří čas.

Jak měřit emise uhlíku na webových stránkách

Nemůžete zlepšit to, co děláte, pokud to nezměříte:

- [Webová kalkulačka Carbon Calculator](https://www.websitecarbon.com/) – odhaduje gramy CO2 emitovaného na zobrazení stránky a porovnává vaše místo s průměrem.

- Eco grader – hodnocení stránky zkušeností, přístupnosti, zeleného hostingu a odhadů uhlíkových emisí.

- Zelený rám – simuluje uživatelské scénáře a vícestupňové interakce k měření úrovně uhlíkové stopy a spotřeby energie.

- WebPage Test – poskytuje hloubkovou diagnostiku spolu s odhady uhlíkové stopy a poruchami Jádrového webového centra.

- Green Web Checker – Kontroluje se, zda domény hostující infrastrukturu provozují obnovitelné energie.

- metrika reálného uživatele & Jádro webového centra – metrika jako Lest contentful Paint (LCP) a celkový přenos počátečního balíku staženého novým uživatelem při každé návštěvě.

Jak vybudovat Greener Web

1. **Serve staticky z CDN** – způsob, jak snížit energii pro stránky obsahu.

2. Statické stránky jsou postaveny jednou. Potom sloužil z CDN, aby se stal nejekologičtějším způsobem budování webových stránek.

3. Lodní JavaScript. Každý kilobajt musí být čitelný, parsovaný, spuštěný a uložený na baterii a šířku pásma.

4. Cache images. Média jsou obvykle největší částí stránky, takže slouží prostřednictvím CDN a používají moderní formáty jako je WebP.

Kde LightCMS sedí

> LightCMS funguje přesně takto:

- Obsah je přiřazen jako Markdown do vašeho vlastního repozitáře, publikováno statickým generátorem webu a sloužilo jako kompilované minifikované soubory z vašich poskytovatelů hostingu na okrajové síti.

- CMS běží pouze když píšete. Žádná produkční databáze neslouží čtenářům, protože čtenáře jsou obsluhovány CDN.

## Náklady na spuštěná statická místa

Statické stránky jsou obvykle levnější nebo dokonce zdarma.

- [GitHub Pages](https://pages.github.com/)
- [Stránky Codeberg](https://codeberg.org/pages)
- [Cloudflare stránky](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Stránky Bitbucketu](https://bitbucket.org/pages)
- [Vykreslovat](https://render.com/)
- [prudký nárůst](https://surge.sh/)

Můžete dokonce obsluhovat statické stránky z vlastního kbelíku S3.
