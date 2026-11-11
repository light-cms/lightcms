---
title: "Static Sites and CO2: Building a Greener Web"
description: Dlaczego statyczne strony emitują mniej dwutlenku węgla, jak buforowanie CDN zmniejsza zużycie energii i jak wygląda bardziej ekologiczna strona internetowa.
date: 2026-10-14T13:30:00Z
draft: fałszywy
tags:
  - trwałość
  - lokalizacje statyczne
  - zielona strona
  - co2
  - ssg
keywords: Światła
preview: /og-image.png
serial: 3
---

Ładowanie strony jest bardzo kosztowne. Czasami strona nie ładuje się z pamięci podręcznej, a każda zapytanie wykorzystuje dużo mocy emitujących kilogramy CO2. Mówi się, że 2-4% emisji CO2 pochodzi z sieci.

Podobnie jak sektor linii lotniczych, sieć może zaszkodzić planecie. Wybrany układ pozwala Ci pokazać, ile troszczy się o Ziemię. Eco przyjaznym sposobem dzielenia się informacjami jest statyczny generator witryny, który raz buduje Twoją witrynę, a następnie obsługuje ją z CDN.

## Dlaczego Static Sites Emit Carbon

Aby nadać reaktywny efekt, strony zazwyczaj wykonują renderowanie za każdym razem, gdy ktoś interakcji: uruchamiają kod zapytaj bazę danych i wyślij pełną stronę z serwera. Tak więc serwer musi pozostać online przez cały czas, nawet gdy nikt nie odwiedza.

- Statyczna witryna buduje jeden raz. Zakończony HTML jest kopiowany do krawędzi CDN na całym świecie. Obsługiwane z pamięci podręcznej:

- Dla każdego żądania nie jest wymagane obliczanie. Obsługa wbudowanego pliku zużywa bardzo mało energii w porównaniu z renderowaniem strony w locie.

- Nie zawsze w bazach danych. Brak serwerów i baz danych przez cały czas. Witryny statyczne nie muszą być uruchomione 24/7. Nie dokonuje się żadnych zapytań dotyczących baz danych, które skutkują zmniejszeniem emisji dwutlenku węgla.

- Domyślnie pamięć podręczną. Żądanie, które trafi w cache krawędzi nie przenosi energii poza skok sieciowy.

- Małe obciążenia administracyjne. HTML wykonany z Markdown jest mały. Żaden ciężki JavaScript lub tłuszcz CSS nie jest wysyłany do klienta. Klient zawsze odbiera plik, więc ładuje się szybciej.

Wszyscy mogli usłyszeć badanie [milisekund zrób miliony](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

Efekt Ripple: Trwałość jest zrównoważona

Projekt Hugo lub Astro Starlight wykonany w 2016 r. może nadal być. Obsługuje w 2036 r., ponieważ zawartość jest prosta Markdown, która pozostaje mniej czasu. Cały łańcuch narzędzi jest źródłem i neutralny dla dostawców, a wyjścia są tylko folderami i plikami.

Posiadanie treści jako Markdown w Git jest trwałe i oszczędza czas.

Jak mierzyć emisję dwutlenku węgla w zakładach

Nie można poprawić tego, co robisz, jeśli nie zmierzysz go:

- [Website Carbon Calculator](https://www.websitecarbon.com/) – szacuje gramy wyemitowanego CO2 na widok strony i porównuje swoją stronę ze średnią.

- Eco grader – ocenianie doświadczenia na stronie, dostępności, ekologiczności hostingu i emisji dwutlenku węgla.

- Zielone ramy – symulują scenariusze użytkowników i wieloetapowe interakcje w celu pomiaru poziomu emisji dwutlenku węgla i zużycia energii.

- Badanie strony internetowej – wraz z oszacowaniami śladu węglowego i rozkładami witaliów sieci bazowej – zapewnia dogłębną diagnostykę wydajności.

- Green Web Checker – sprawdza, czy domeny obsługujące infrastrukturę działają w dziedzinie energii odnawialnej.

- Rzeczywiste metryki & Core Web Vitals - metryki takie jak Largest contentful Paint (LCP) i całkowity transfer początkowego pakietu pobranego przez każdego nowego użytkownika podczas każdej wizyty.

Jak zbudować zieloną sieć

1. **Słup statycznie z CDN** – sposób na zmniejszenie energii dla stron treści.

2. Witryny statyczne są zbudowane jeden raz. Następnie służył CDN, czyniąc go najbardziej przyjaznym dla środowiska sposobem budowy strony internetowej.

3. JavaScript statku Każdy kilobajt musi być odczytany, przetworzony, wykonany i przechowywany na baterii i szerokości pasma odwiedzających.

4. Cache images. Media są zazwyczaj największą częścią strony, więc służą za pośrednictwem CDN i używają nowoczesnych formatów, takich jak WebP.

Gdzie pasuje LightCMS

> LightCMS działa dokładnie w następujący sposób:

- Zawartość jest przypisana jako Markdown do własnego repozytorium, opublikowane przez statyczny generator stron i obsługiwane jako skompilowane zminimalizowane pliki z krawędziowej sieci dostawców hostingu.

- CMS działa tylko podczas pisania. Żadna baza danych produkcji nie służy czytnikom, ponieważ czytniki są obsługiwane przez CDN.

## Koszt uruchomionych witryn statycznych

Witryny statyczne są zazwyczaj tańsze lub nawet darmowe dla gospodarza.

- [GitHub Pages](https://pages.github.com/)
- [Strony Codeberg](https://codeberg.org/pages)
- [Strony w chmurze](https://pages.cloudflare.com/)
- [crwdns74646:0crwdne74646:0](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Strony Bitbucket](https://bitbucket.org/pages)
- [Renderowanie](https://render.com/)
- [gwałtowny](https://surge.sh/)

Możesz nawet obsługiwać witrynę statyczną z niestandardowego wiadra S3.
