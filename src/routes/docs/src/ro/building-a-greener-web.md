---
title: "Site-uri statice și CO2: Construirea unui web Greener"
description: De ce siturile statice emit mai puțin carbon, cum cache-ul CDN reduce consumul de energie, și cum arată o rețea mai verde.
date: 2026-10-14T13:30:00Z
draft: fals
tags:
  - sustenabilitate;
  - situri statice
  - web verde
  - co2
  - ssg
keywords: beculețe
preview: /og-image.png
serial: 3
---

Costă mult să încarci o pagină. Uneori o pagină nu se încarcă din cache-ul bazei de date este lovit de mai multe ori şi fiecare interogare utilizează multe kilograme de CO2 care emit energie. Se afirmă că 2-4% din emisiile de co2 provin de pe internet.

La fel ca în cazul companiilor aeriene, internetul poate dăuna planetei. Aspectul pe care îl alegi îți permite să arăți cât de mult îți pasă de Pământ. Modul eco-prietenos de a partaja informații este un generator static de site-uri care construiește site-ul o dată și apoi îl folosește de la un CDN.

## De ce Site-uri Statice Emit Carbon

Pentru a avea un efect reactiv, site-urile efectuează de obicei activitatea de redare de fiecare dată când cineva interacționează: execută codul cere baza de date și trimite o pagină completă de pe server. Așa că serverul trebuie să rămână online tot timpul chiar și atunci când nimeni nu vizită.

- Un site static construieste o data. HTML terminat este copiat în nodurile de margine CDN din întreaga lume. Servit din cache:

- Nu sunt necesare calcule pentru fiecare solicitare. Folosirea unui fișier construit folosește foarte puțină energie în comparație cu randarea unei pagini în zbor.

- Nu există întotdeauna baze de date. Nici un server sau baze de date nu rulează tot timpul. Site-urile statice nu au nevoie de un server pentru a rula 24/7. Nu se fac interogări de baze de date, ceea ce ar duce la emisii mai reduse de carbon.

- Cache în mod implicit. O cerere care lovește o geocutie nu deplasează energie dincolo de speranța rețelei.

- Mici salarii. HTML făcut din Markdown este mic. Nu este trimis către client niciun JavaScript greu sau CSS. Clientul primește întotdeauna fișierul astfel încât acesta să se încarce mai repede.

Este posibil ca voi toţi să fi auzit studiul [milisecunde face milioane](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

Efectul Ripple: durabilitatea este durabilitatea

Un proiect Hugo sau Astro Starlight realizat în 2016 poate fi în continuare. Servit în 2036 deoarece conținutul este marcarea simplă, care rămâne fără timp. Întregul lanț de instrumente este sursa și vendor-neutru, iar rezultatul este doar dosare și fișiere.

Deținerea conținutului tău ca Markdown în Git este durabilă și economisește timp.

Cum să îți măsoare site-urile web Emisii de carbon

Nu puteți îmbunătăți ceea ce faceți dacă nu îl măsurați:

- [Website Carbon Calculator](https://www.websitecarbon.com/) - estimează gramele de CO2 emise pe pagina de vizualizare şi compară site-ul cu media.

- Eco grader – rate ale experienței, accesibilitate, găzduire ecologică și estimări ale emisiilor de carbon.

- Cadrul verde – simulează scenarii de utilizare și interacțiuni în mai multe etape pentru măsurarea nivelului de amprentă de carbon și a consumului de energie.

- Testarea paginii web – oferă un diagnostic aprofundat al performanței, alături de estimările privind amprenta de carbon și de defecțiunile de bază ale vitalelor web.

- Green Web Checker – verifică dacă domeniile care găzduiesc infrastructura rulează pe energie regenerabilă.

- Măsurători cu utilizatorul real & Core Web Vitals – măsurători precum Largest contentful Paint (LCP) și transferul total al pachetelor inițiale descărcate de orice utilizator nou la fiecare vizită.

Cum să construiești un Greener Web

1. **Serviți static de la un CDN** – modul de a reduce energia pentru site-urile de conținut.

2. Locurile statice sunt construite o singură dată. Apoi a servit de la un CDN făcând-o cel mai prietenos mod de a construi un site web.

3. Navă JavaScript. Fiecare kilobyte trebuie citit, analizat, executat și stocat pe baterie și lățimea benzii vizitatorilor.

4. Cache images. Mass-media este de obicei cea mai mare parte a unei pagini care o deserveşte prin CDN şi foloseşte formate moderne ca WebP.

Unde se potrivește LightCMS

> LightCMS funcţionează exact în acest mod:

- Conținutul este angajat ca Markdown la propriul depozit, publicat de un generator static al site-ului si a servit ca fisiere miniaturate din reteaua de hosting a furnizorilor.

- CMS rulează doar în timp ce scrii. Nicio bază de date de producție nu servește cititorilor, deoarece cititorii sunt deserviți de un CDN.

## Costul siturilor statice care rulează

Site-urile statice sunt de obicei mai ieftine sau chiar gratuite de găzduit.

- [GitHub Pages](https://pages.github.com/)
- [Pagini Codeberg](https://codeberg.org/pages)
- [Pagini Cloudflare](https://pages.cloudflare.com/)
- [Versă](https://vercel.com/)
- [Neconsolidat](https://www.netlify.com/)
- [Pagini Bitbucket](https://bitbucket.org/pages)
- [Randare](https://render.com/)
- [crestere](https://surge.sh/)

Poți chiar servi un site static dintr-o găleată S3 personalizată.
