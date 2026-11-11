---
title: "Staattiset sivustot ja CO2: Greener Webin rakentaminen"
description: Miksi staattiset sivustot tuottavat vähemmän hiiltä, miten CDN välimuisti vähentää energian käyttöä, ja miltä vihreämpi verkko näyttää.
date: 2026-10-14T13:30:00Z
draft: epätosi
tags:
  - kestävyys
  - staattiset sivustot
  - vihreä-verkko
  - co2
  - ssg
keywords: lightcms
preview: /og-image.png
serial: 3
---

Se maksaa paljon ladata sivun. Joskus sivu ei lataudu kätköstä, tietokanta osuu useita kertoja ja jokainen kysely käyttää paljon virtaa lähettää kiloa CO2. Sanotaan, että 2–4 prosenttia hiilidioksidipäästöistä on peräisin verkosta.

Lentoliikennealan tavoin verkko voi vahingoittaa planeettaa. Valitsemasi ulkoasu antaa sinulle mahdollisuuden näyttää, kuinka paljon välität Maasta. Ekoystävällinen tapa jakaa tietoa on staattinen sivusto generaattori, joka rakentaa sivustosi kerran ja sitten palvelee sitä CDN.

## Miksi Staattiset Sivustot Emit Carbon

Voit antaa reaktiivinen vaikutus sivustot yleensä suorittaa renderöinti työtä aina, kun joku vuorovaikutus: ne toimivat koodi kysyä tietokanta ja lähettää koko sivun palvelimelta. Joten palvelimen on pysyttävä verkossa koko ajan, vaikka kukaan ei käy.

- Staattinen sivusto rakentuu kerran. Valmis HTML on kopioitu CDN reunussolmuihin maailmanlaajuisesti. Tarjoillaan kätköstä:

- Kullekin pyynnölle ei tarvita laskentaa. Rakennetun tiedoston palveleminen käyttää hyvin vähän energiaa verrattuna tehdä sivun lennon.

- Ei aina tietokannoissa. Yhtään palvelinta tai tietokantaa ei ole käytössä koko ajan. Staattiset sivustot eivät tarvitse palvelinta olla käynnissä 24/7. Tietokantaan ei tehdä kyselyjä, joiden perusteella hiilidioksidipäästöt olisivat pienemmät.

- Välimuisti oletuksena. Pyyntö, joka osuu reunan kätköä ei liikuta energiaa verkon humalaa.

- Pienet hyötykuormat. Markdownista tehty HTML on pieni. Ei raskasta JavaScriptiä tai rasvaa CSS lähetetään asiakkaalle. Asiakas saa aina tiedoston, jotta se latautuu nopeammin.

Te kaikki olette ehkä kuulleet tutkimuksen [millisekunteja tekevän miljoonia](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

Kyydin Teho: Kestävyys On Kestävä

Vuonna 2016 tehty Hugo tai Astro Starlight -projekti voi vielä olla. Palveltu vuonna 2036, koska sisältö on pelkkää Markdownia, joka pysyy ajattomana. Koko työkaluketju on lähde ja myyjä neutraali ja ulostulo on vain kansioita ja tiedostoja.

Sisällön omistaminen Markdownina Gitissä on kestävää ja säästää aikaa.

Kuinka mitata sivustosi hiilidioksidipäästöjä

Et voi parantaa sitä, mitä teet, jos et mittaa sitä:

- [Verkkosivusto Hiilililevylaskenta](https://www.websitecarbon.com/) – arviot päästöt grammoina sivukohtaisesta näkymästä ja vertaa sivustoasi keskiarvoon.

- Eco luokkalainen – hinnat sivukokemus, esteettömyys, vihreä hosting ja hiilidioksidipäästöjen arviot.

- Green Frame – simuloi käyttäjäskenaarioita ja multistep-vuorovaikutusta sovellustason hiilijalanjäljen ja energiankulutuksen mittaamiseksi.

- WebPage Test – tarjoaa perusteellisen suorituskyvyn diagnostiikan yhdessä hiilijalanjäljen arvioiden ja Core Web Vitals erittelyt.

- Green Web Checker – tarkistaa, onko verkkotunnukset isännöi infrastruktuuria uusiutuvan energian alalla.

- Reaali-käyttäjä mittarit & Core Web Vitals – mittareita, kuten suurin tyytyväinen maali (LCP) ja koko siirto ensimmäinen nippu ladataan tahansa uusi käyttäjä jokaisella käynnillä.

Miten rakentaa Greener Web

1. **Palvella staattisesti CDN** – tapa leikata energiaa sisältösivustoja.

2. Staattisia sivustoja rakennetaan kerran. Sitten palvellut CDN joten se kaikkein ekoystävällinen tapa rakentaa verkkosivuilla.

3. Ship JavaScript. Jokainen kilotavu pitää lukea, jakaa, suorittaa ja tallentaa kävijöiden akku ja kaistanleveys.

4. Cache images. Media on yleensä suurin osa sivun, joten palvella sitä kautta CDN ja käyttää nykyaikaisia formaatteja, kuten WebP.

Missä LightCMS Sopii

> LightCMS toimii, juuri näillä tavoilla:

- Sisältö on sidottu Markdown omaan repoon, julkaissut staattinen sivusto generaattori ja tarjoillaan koottu minified tiedostoja hosting tarjoajien reunaverkko.

- CMS toimii vain kirjoittaessasi. Mikään tuotantotietokanta ei palvele lukijoita, koska lukijoita palvelee CDN.

## Kustannukset käynnissä staattisia sivustoja

Staattiset sivustot ovat yleensä halvempia tai jopa vapaasti isännöidä.

- [GitHub Pages](https://pages.github.com/)
- [Codeberg sivut](https://codeberg.org/pages)
- [Cloudflare Sivut](https://pages.cloudflare.com/)
- [Versio](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Bitbucket sivut](https://bitbucket.org/pages)
- [Renderöi](https://render.com/)
- [äkillinen](https://surge.sh/)

Voit jopa palvella staattinen sivusto mukautetun S3 ämpäri.
