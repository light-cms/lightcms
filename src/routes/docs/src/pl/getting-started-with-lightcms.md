---
title: Wprowadzanie
serial: 1
date: 2026-09-01T16:44:00Z
draft: fałszywy
tags:
  - Światła
  - cms
  - git
  - ssg
  - statyczne
  - strona
  - Generator
keywords:
  - Światła
  - zaczyna się
  - wprowadzenie
  - wysiwyg
  - markdown
  - Na podstawie git
---

[LightCMS](https://www.lightcms.me) jest edytorem obsługiwanym przez Git-a dla witryn statycznych. Napisz w bogatym edytorze, wciśnij publikację i [LightCMS](https://www.lightcms.me) commits clean Markdown to your repository. Twój rurociąg wdrażania – strony Cloudflare, Netlify, Vercel, GitHub - zabierają go stąd.

Twoja zawartość mieszka w twoim repozytorium Git jako zwykłe pliki Markdown nadające się do odczytu i implementacji przez dowolny statyczny generator witryn, którego już używasz.

## Jak to działa

1. Zaloguj się za pomocą konta GitHub.
2. Podłącz repozytorium zawierające witrynę statyczną. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — wszystko, co czyta Markdown.
3. Napisz i edytuj zawartość w wbudowanym edytorze. Twórz posty, edytuj istniejące, wysyłaj zdjęcia i wypełnij pola wstępne bez dotykania terminalu.
4. Wciśnij publikację. [LightCMS](https://www.lightcms.me) zatwierdza zawartość na ścieżkę, którą skonfigurowałeś — na przykład `content/blog/my-post.md` w Twoim repozytorium.
5. Twoja budowa rurociągu rozwija się automatycznie. Post jest na żywo w ciągu minuty lub dwóch, w zależności od Twojego hosta.

To jest pełna pętla. [LightCMS](https://www.lightcms.me) działa tylko podczas pisania. Czytniki są obsługiwane przez Twój CDN, nie przez [LightCMS](https://www.lightcms.me).

## Co jest w edytorze

**TipTapowy bogaty edytor** — zapisuje markdown z frontu. To, co widzisz, to co się angażuje. Jeśli kiedykolwiek otworzyłeś plik `.md` i znalazłeś zupę tagów HTML, to jest alternatywa.

**copilot** — połączony z dowolnym API kompatybilnym z OpenAI. Przydatne, gdy ustęp nie wylądowuje: poproś go o zaostrzenie sformułowania, rozszerzenie punktu lub podnieś projekt, który porzuciłeś w połowie myślenia.

**Voice-to-text** — dyktuj bezpośrednio do edytora za pomocą API transkrypcji kompatybilnych z Whisperem lub Wit.ai. Dobrze postawić szybko pierwszy szkic podczas pisania na drodze myślenia.

**Jasne i ciemne motywy** — kilka opcji motywu, więc edytor jest wygodny podczas dłuższych sesji pisania.

**Automatyzacja newslettera** — publikuj post i powiadamiaj abonentów automatycznie za pośrednictwem [Newsy](/docs/newsletter-newsy). Usługa newslettera nie jest wymagana.

## Co [LightCMS](https://www.lightcms.me) nie robi

Nie przechowuje twoich treści ani nie obsługuje Twoich czytelników, a to jest po projekcie. Jeśli pochodzisz z WordPress lub Ghost, CMS jest hostem, do którego używasz. Tutaj relacja jest inna: [LightCMS](https://www.lightcms.me) jest narzędziem do pisania, a nie infrastrukturą. Twój statyczny generator witryny buduje wyjście, obsługuje go dostawca hostingu, a Ty posiadasz każdy plik. Przełączanie edytorów, generatorów lub hostów nie oznacza migracji bazy danych.

Nie zastępuje również konfiguracji wdrożenia. Działa z każdym rurociągiem, który już posiadasz.

## Kolejne kroki

- [Dlaczego LightCMS?](/docs/why-lightcms) — filozofia projektowa za publikacją wspieraną przez Gita
- [Jak rozpocząć blog](/docs/how-to-start-a-blog) — wybierz szablon i przejdź od zera do opublikowanego
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — uruchom własną prywatną instancję
- [Automatyzacja newslettera](/docs/newsletter-newsy) — automatycznie wysyłaj posty do subskrybentów z Newsy
- [Budowa bardziej ekologicznej sieci](/docs/building-a-greener-web) — dlaczego publikacja statyczna jest wyborem niższym od emisji dwutlenku węgla
