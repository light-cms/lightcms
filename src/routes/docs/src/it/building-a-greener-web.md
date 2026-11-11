---
title: "Siti statici e CO2: Costruire un Web più verde"
description: Perché i siti statici emettono meno carbonio, come CDN caching taglia il consumo di energia, e come appare una web più verde.
date: 2026-10-14T13:30:00Z
draft: falso
tags:
  - sostenibilità
  - siti statici
  - green-web
  - co2
  - ssg
keywords: lightcms
preview: /og-image.png
serial: 3
---

Costa molto caricare una pagina. A volte una pagina non riesce a caricare dalla cache il database viene colpito più volte e ogni query utilizza un sacco di potenza emettendo chilogrammi di CO2. Si dice che il 2-4% delle emissioni di CO2 proviene dal web.

Come l'industria aerea il web può danneggiare il pianeta. Il layout che scegli ti permette di mostrare quanto ti interessa della Terra. Il modo ecologico per condividere le informazioni è un generatore di sito statico che costruisce il vostro sito una volta e poi lo serve da un CDN.

## Perché I Siti Statici Emettono Carbonio

Per dare un effetto reattivo i siti generalmente eseguono il lavoro di rendering ogni volta che qualcuno interagisce: eseguono il codice chiedono al database e inviano una pagina completa dal server. Quindi il server deve rimanere online tutto il tempo anche quando nessuno visita.

- Un sito statico costruisce una volta. L'HTML finito viene copiato in CDN edge nodes in tutto il mondo. Servito dalla cache:

- Nessun calcolo necessario per ogni richiesta. Servire un file costruito utilizza pochissima energia rispetto a rendere una pagina sul volo.

- Non sempre sui database. Nessun server e database vengono eseguiti per tutto il tempo. I siti statici non hanno bisogno di un server per essere in esecuzione 24/7. Non vengono fatte domande su banche dati con conseguente riduzione delle emissioni di carbonio.

- Cache per impostazione predefinita. Una richiesta che colpisce una cache edge non muove energia oltre il hop.

- Piccoli carichi utili. L'HTML fatto da Markdown è piccolo. Nessun JavaScript pesante o CSS grasso viene inviato al client. Il client riceve sempre il file in modo da caricarlo più velocemente.

Potresti aver sentito tutti lo studio [millisecondi fare milioni](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

Effetto Ondula: La Durevolezza È Sostenibilità

Un progetto Hugo o Astro Starlight realizzato nel 2016 può ancora essere. Servito nel 2036 perché il contenuto è semplice Markdown, che rimane senza tempo. L'intera catena di strumenti è fonte e vendore-neutrale e l'output è solo cartelle e file.

Possedere i propri contenuti come Markdown in Git è durevole e consente di risparmiare tempo.

Come misurare i vostri siti web emissioni di carbonio

Non puoi migliorare quello che fai se non lo misuri:

- [Website Carbon Calculator](https://www.websitecarbon.com/) – stima grammi di CO2 emesso per pagina visualizza e confronta il tuo sito con la media.

- Eco grader – stima l'esperienza della pagina, l'accessibilità, l'hosting verde e le emissioni di carbonio.

- Green Frame – simula scenari utente e interazioni multistep per misurare il livello di applicazione impronta di carbonio e il consumo di energia.

- WebPage Test – fornisce una diagnostica approfondita delle prestazioni insieme alle stime dell'impronta di carbonio e ai guasti Core Web Vitals.

- Green Web Checker – verifica se un dominio che ospita un'infrastruttura funziona su energia rinnovabile.

- Metriche utente reale & Core Web Vitals – metriche come la vernice contenziosa più grande (LCP) e il trasferimento totale del pacchetto iniziale scaricato da qualsiasi nuovo utente ad ogni visita.

Come costruire un Web più verde

1. **Serve staticamente da una CDN** – il modo di tagliare l'energia per i siti di contenuto.

2. I siti statici sono costruiti una volta. Poi servito da un CDN che lo rende il modo più ecologico di costruire un sito web.

3. Nave JavaScript. Ogni kilobyte deve essere letto, analizzato, eseguito e memorizzato sulla batteria dei visitatori e larghezza di banda.

4. Cache images. I media sono di solito la parte più grande di una pagina in modo da servirlo attraverso il CDN e utilizzare formati moderni come WebP.

Dove LightCMS Adatta

> LightCMS funziona esattamente in questi modi:

- Il contenuto è impegnato come Markdown nel tuo repository, pubblicato da un generatore di sito statico e servito come file compilati minified dalla rete edge provider di hosting.

- Il CMS viene eseguito solo mentre scrivi. Nessun database di produzione serve i lettori perché i lettori sono serviti da un CDN.

## Costo dei siti statici in esecuzione

I siti statici sono di solito più economici o anche liberi di ospitare.

- [GitHub Pages](https://pages.github.com/)
- [Pagine di Codeberg](https://codeberg.org/pages)
- [Pagine Cloudflare](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Pagine Bitbucket](https://bitbucket.org/pages)
- [Render](https://render.com/)
- [picco](https://surge.sh/)

Puoi anche servire un sito statico da un secchio S3 personalizzato.
