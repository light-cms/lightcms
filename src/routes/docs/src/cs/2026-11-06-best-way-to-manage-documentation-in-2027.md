---
title: Nejlepší způsob, jak spravovat dokumentaci v roce 2027
date:
draft: nepravda
weight: 0
tags:
  - cms
  - světlomety
  - zelený web
isCJKLanguage: nepravda
headless: nepravda
keywords: ""
preview: ""
description: ""
serial: 0
section: ""
badge: ""
---

Dokumentace je součástí projektu, na kterém se všichni shodnou, a nikdo se zcela neshodne na tom, jak naložit. Podívejte se na pět open source projektů a najdete pět různých nastavení. Některé fungují dobře. Největší posun do zanedbávání.

Zde je to, jak běžné vzorce vypadají v praxi a proč někteří lidé v průběhu času drží lépe.

## Wiki přístup: Rychlý začátek, Pomalý až Die

GitHub wiki a Confluence jsou výchozí pro mnoho týmů. Jsou rychlé nastavení, žádná konfigurace není vyžadována a kdokoliv může přidat stránku.

Problém je v tom, že wiki hromadí stránky rychleji, než se udržuje. Prostor pro dvouletý projekt má obvykle stránky přesné, stránky, které jsou zastaralé, a žádný spolehlivý způsob, jak určit, kdo je. Hledat povrchy stejně jako všechno. Neexistuje žádný proces hodnocení. Nikdo nic nevlastní.

GitHub wiki má stejný problém s přidaným omezením: žijí v odděleném úložišti od vašeho kódu. Požadavek na natažení, který mění API, automaticky nikoho nežádá o aktualizaci dokumentů. Rozdíl mezi kódem a dokumentací se tiše zvětšuje.

Týmy, které používají wiki jsou výjimkou. Obvykle mají oddaný technický spisovatel vynucující si standardy. Většina týmů nefunguje.

## Pojem a podobné nástroje: skvělé pro interní týmy, špatné pro dlouhověkost

Pojem je opravdu dobrý pro interní dokumentaci – návody k nastupování, runbooky, týmové procesy, poznámky na schůzce. Editor je flexibilní, oprávnění jsou granulární a je dostatečně snadné, aby jej netechnické přispěvatelé skutečně používali.

Pro projektovou dokumentaci, která má žít vedle kódu, je stručná.

Vaše dokumenty jsou v databázi Noty, ne v repozitáři. Neexistuje žádná rozdílná recenze PR, žádné automatické nasazení. Pokud pojem změní své ceny, zastaralě nebo jednoduše odejdou, migrace je manuální export a přeformátování.

Hlubší otázkou je odhalitelnost. Doklady, které žijí v note, nejsou indexovány vedle vaší kódové základny. Zvýraznění vývojáře pro název funkce nenajde stránku s názorem, která vysvětluje, proč funguje tak, jak funguje. Oba systémy si navzájem nemluví.

## Pohled na ČTVRT: čestný, ale obtížně škálovatelný

Mnoho menších projektů – a mnoho projektů s otevřeným zdrojovým kódem – se téměř výhradně opírá o ČERVEN. Jeden soubor, zachovaný v provozu, který zahrnuje instalaci, použití a pokyny pro příspěvky.

To funguje překvapivě dobře pro cílené nástroje se stabilním API. Omezení jednoho souboru vynutí prioritizaci. Neexistuje žádná dokumentace, protože není nikde kam jít.

Rozpadá, když se projekt rozšíří o určitou složitost. README zahrnující patnáct různých konfiguračních možností, tři zaváděcí cíle a migrační příručku z v1 na v2 zastávky, která je čitelná. Tehdy se týmy buď nechají hniloby nebo začnou stavět něco jiného.

## Kód dokumentu: vzorek, který se stupňuje

Projekty s konzistentní dobrou dokumentací obvykle používají stejný základní vzor: soubory Markdown v úložišti, postaveno statickým generátorem lokality nasazeným společně s každým vydáním.

Kubernetes dokumentace jsou ve stejném monorepo jako codebase, přezkoumány ve stejném workflow požadavku na natažení. Rust Book je projekt Markdown na GitHubu se stovkami přispěvatelů. Dokumentace Astrou je lokalita Astro Starlight spáchaná vedle samotného rámce.

To, co dělá z toho fungovat, není nástroj. Je to pracovní postup. Dokazuje živé vedle kódu, takže se aktualizují při změně kódu. PR, který přidává novou vlajku, musí aktualizovat dokumentaci před jejím sloučením. Přezkumný proces jej prosazuje.

Sekundární požitek je trvanlivý. Soubory Markdown od roku 2015 jsou stále čitelné a použitelné v roce 2027. Není vyžadován žádný vlastní formát exportu, žádná závislost na platformě. Obsah je pouze textové soubory ve složce.

## Třecí frikce, která zabíjí doky jako kód pro netechnické přispěvatele

Skutečnou slabinou přístupu Markdown-in-Git je, že předpokládá, že každý je spokojen s textovým editorem a požadavkem na natažení. Pro mnoho týmů je to v pořádku. Pro týmy s netechnickými přispěvateli – marketingem, produktem, podporou – vytváří tření, které vede k tomu, že dokumentace je ignorována nebo udržována v souběžném systému.

Právě zde se vejde do Gitem podporovaného CMS. Nástroje jako LightCMS sedí před repozitářem a dají přispěvatelům skutečnou zkušenost s editorem, zatímco stále přidávají soubory Markdown do repo. Editor zpracovává formátování. CMS zpracovává revizi. Přispěvatel nikdy nevidí terminál.

Výsledek je stejný jako dokument „docs-as-cod“ – obsah v Markdown, verze v Gitu, nasazeno již existujícím plynovodem — ale přístupné lidem, kteří nechtějí používat Git přímo.

## Co fakticky funguje v roce 2027

Vzor, který držíte nahoru, je jednoduchý: Markdown soubory ve vašem úložišti, vytvořené statickým generátorem stránky, zkontrolováno v požadavcích na natažení, nasazeno na sloučení.

Konkrétní nástroje kolem tohoto vzoru mají menší význam než pracovní postup. Pokud váš tým používá GitHub, Starlight nebo Docusaurus portál vložený do stejného repozitáře vám dává vše: vyhledávání, verze, řádný zážitek ze čtení a proces recenze, který udržuje dokumenty v synchronizaci s kódem.

Pokud máte netechnické přispěvatele, vložte před něj Git-backed editor, aby mohli psát bez dotyku s terminálem. Základní nastavení zůstává stejné. Obsah zůstává ve vašem repozitáři.

Projekty s nejlepší dokumentací nejsou ty s nejlepším nástrojem. Jsou to ty, které vytvořily dokumentaci v části stejného pracovního postupu jako kód.

---

## Časté dotazy

### Co je to dokument jako kód?

Dokumentace jako kód je praxe psaní a uchovávání dokumentace za použití stejných nástrojů a pracovních postupů jako vývoj softwaru: obyčejné textové soubory (obvykle Markdown), kontrola verzí (obvykle Git), kontrola kódu a automatické nasazení. Uchovává dokumentaci blízko kódu, který popisuje, a aktualizuje část normálního vývojového pracovního postupu.

### Je Markdown dobré pro dokumentaci?

Ano, pro velkou většinu projektů. Zvýraznění rukojetí, kódovací bloky, tabulky, obrázky a odkazy. Statické generátory stránek jako Starlight, Docusaurus a MkDocs přidávají vyhledávání, navigaci, verzi a správné čtení nahoře. Omezení prostého textu je funkce: je čitelný v libovolném editoru, greppable, diffable a trvanlivý po celá desetiletí.

### Jak přispějí netechničtí spisovatelé k Markdown dokumentaci?

Git-backed CMS nástroje jako LightCMS poskytují bohatý editor, který komprimuje Markdown do vašeho repositáře, aniž by přispěvatelé museli používat Git přímo. Obsah zůstává ve vašem repozitáři v prostém Markdown. Editor je pouze přístupnější rozhraní pro stejné základní soubory.

### Co je nejlepší statický generátor webu pro dokumentaci?

Závisí na vašem zásobníku. Astro Starlight a Docusaurus jsou nejplnější možnosti s dobrým vyhledáváním mimo krabici. MkDocs s Material je vynikající pro projekty v Pythonu. Pokud jste již na Hugo nebo Eleventy pro váš blog, mohou také zpracovávat dokumenty. Generátor má menší význam než uchovávání dokumentů ve stejném úložišti jako váš kód.
