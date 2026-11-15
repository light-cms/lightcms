---
title: Introducere
serial: 1
date: 2026-09-01T16:44:00Z
draft: fals
tags:
  - beculețe
  - cmp
  - git
  - ssg
  - static
  - site
  - generator
keywords:
  - beculețe
  - a începe
  - Introducere
  - wysiwyg
  - markdown
  - git bazat
---

[LightCMS](https://www.lightcms.me) este un editor sprijinit de Git, pentru site-uri statice. Scrii într-un editor bogat, apasă publicarea, și [LightCMS](https://www.lightcms.me) angajează Markdown în depozitul tău. Conducta ta de implementare — Pagini de Cloudflare, Netlify, Vercel, Pagini GitHub — o duce de acolo.

Conținutul dvs. trăiește în propriul repozitoriu Git ca fișiere Markdown simple, lizibile și implementabile de orice generator static al site-ului pe care îl utilizați deja.

## Cum funcţionează

1. Conectați-vă cu contul GitHub.
2. Conectați depozitul care conține site-ul dvs. static. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — orice citește Markdown.
3. Scrie și editează conținutul în editorul încorporat. Creați postări, editați-le pe cele existente, încărcați imagini și completați câmpurile din față fără a atinge un terminal.
4. Apăsați publicarea. [LightCMS](https://www.lightcms.me) comite conținutul tău pe calea pe care ai configurat-o — de exemplu, `conținut/blog/my-post.md` în rădăcina depozitului.
5. Conducta ta de construcții este implementată automat. Postarea este în direct într-un minut sau două, în funcție de gazda ta.

Aceasta este întreaga buclă. [LightCMS](https://www.lightcms.me) rulează doar în timp ce scrii. Cititorii sunt deserviţi de CDN, nu de [LightCMS](https://www.lightcms.me).

## Ce este în editor

**TipTap bogat editor** - scrie curat Markdown cu materia din față. Ceea ce vedeţi este ceea ce este angajat. Dacă ați deschis vreodată un fișier `.md` și ați găsit o supă de etichete HTML, aceasta este alternativa.

**AI copilot** - conectat la orice API compatibil OpenAI. Util atunci când un paragraf nu aterizează: cere-i să înăsprească formularea, să extindă un punct, sau să ridice un proiect pe care l-ai abandonat la jumătatea gândirii.

**Voice-to-text** - dictați direct în editor folosind orice API de transcriere compatibil cu Whisper-compatibil cu Wit.ai. Este bine pentru că obţii o greşeală primă schiţă rapidă atunci când tastarea prinde un mod de gândire.

**Teme luminoase și întunecate** — mai multe opțiuni de temă astfel încât editorul este confortabil în timpul sesiunilor de scriere mai lungi.

**Automatizarea newsletter-ului** - publică un post și notifică abonații automat prin [Newsy](/docs/newsletter-newsy). Nu este necesar un serviciu terț de buletin informativ.

## Ce nu face [LightCMS](https://www.lightcms.me)

Nu găzduiește conținutul tău și nu servește cititorii tăi, și asta e prin design. Daca vin de la WordPress sau Ghost, CMS fiind gazda este ceea ce esti obisnuit. Aici relaţia este diferită: [LightCMS](https://www.lightcms.me) este o unealtă de scriere, nu infrastructura. Generatorul tau static construieste iesirea, furnizorul tau de gazduire il deserveste si detine fiecare fisier. Schimbarea editorilor, generatorilor sau gazdelor nu înseamnă migrarea unei baze de date.

Nu înlocuiește nici configurația de implementare. Funcționează cu orice conductă ai deja.

## Etapele următoare

- [De ce LightCMS?](/docs/why-lightcms) - filozofia de design din spatele publicării susținute de Git.
- [Cum să începi un blog](/docs/how-to-start-a-blog) — alege un șablon și mergi de la zero la publicat
- [LightCMS cu autogăzduire](/docs/self-hosting-lightcms) - rulează propria ta instanță privată
- [Automatizarea buletinului informativ](/docs/newsletter-newsy) - trimite postări automat abonaților cu Știri
- [Construirea unui web mai verde](/docs/building-a-greener-web) — de ce publicarea statică este alegerea cu emisii mai scăzute de carbon
