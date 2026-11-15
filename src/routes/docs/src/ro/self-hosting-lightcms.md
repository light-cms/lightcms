---
title: Auto găzduire LightCMS
description: Ghid pentru LightCMS, care acoperă aplicația GitHub, PostgreSQL, variabilele de mediu, AI, CDN și e-mail opțional, și implementarea la muchii.
serial: 4
section: Începeți
badge: Desfășurare
date: 2026-09-18T01:45:00Z
draft: fals
tags:
  - selfhost
  - beculețe
  - postgresql
  - implementare
keywords:
  - beculețe
  - probot
  - auto-găzduire
  - github_app
  - verc
  - sveltekit
preview: /og-image.png
---

Vrei LightCMS complet sub controlul tău? LightCMS este o aplicație [SvelteKit](https://svelte.dev) , deci poate fi implementată oriunde, susținută de o bază de date PostgreSQL și un GitHub App (Octokit). Conținutul dvs. nu părăsește niciodată propriile depozite GitHub.

Acest ghid te duce prin tot ce ai nevoie pentru a rula propria instanță: crearea aplicației GitHub, provizionarea PostgreSQL, configurarea variabilelor de mediu și implementarea.

## Cum se potrivește părțile împreună

| Componentă                       | Scop                                                                            | Necesar                                   |
| -------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| PostgreSQL                       | Stochează utilizatorii, sesiunile, cheile de acces și instalațiile GitHub       | Da                                        |
| GitHub App                       | Citește și scrie conținut în depozitele tale și semnează utilizatorii cu GitHub | Da                                        |
| Furnizor SMTP                    | Trimite e-mailuri de autentificare prin link magic                              | Da, pentru autentificarea prin link magic |
| API compatibil OpenAI-compatibil | Puterea Copilot-ului AI                                                         | Opţional                                  |
| API-ul Speech-to-Text            | Putere dictație vocală                                                          | Opţional                                  |
| Imagine CDN                      | Gazdă imagini încărcate în editor                                               | Opţional                                  |
| PostHog                          | Analiza produselor și observabilitatea AI                                       | Necesar doar în dezvoltare                |

## Cerințe prealabile

- **[creează](https://mise.jdx.dev)**: instalează și gestionează dependențele de sarcini. Acest ghid presupune că îl aveți instalat.
- **PostgreSQL**: o bază de date care acceptă conexiuni TLS. Furnizori de cloud precum [Neon](https://neon.tech), [Supabase](https://supabase.com) sau [Nile](https://thenile.dev) funcționează bine. Vezi [postgres gratuit](https://github.com/alexeyfv/awesome-free-postgres) pentru opţiuni gratuite.
- **Contul GitHub**: necesar pentru a înregistra aplicația GitHub.
- **SMTP furnizor** (pentru link-uri magice): Dacă aveţi un domeniu, [Retrimite](https://resend.com) este o opţiune bună. Altfel, folosiți [Zoho Mail](https://www.zoho.com/mail) și creați o parolă pentru aplicație.

> **TLS este obligatoriu.** Aplicația se conectează la PostgreSQL cu `ssl: "require"`. O instanță PostgreSQL locală fără TLS activată va fi respinsă, așa că folosiți o bază de date găzduită sau configurați TLS pe propriul server.

## 1. Fă repertoriul și instalează dependențele

Clonează depozitul și instalează dependențe:

```bash
cd lightcms
mise de încredere
depează
mise rulează instalat
```

## 2. Create the GitHub App

LightCMS folosește o aplicație GitHub pentru două lucruri: semnarea utilizatorilor cu GitHub (OAuth) și acționarea în numele prin instalări. Îl poți crea cu ajutorul testului de configurare Probot, sau manual.

### Opțiunea A: Asistent de configurare a Probot

pornește bot-ul cu:

```bash
barbot rulat mise
```

Fără acreditări în `.env`, Probot pornește un server de configurare la `http://localhost:3000`:

1. Deschide `http://localhost:3000` și apasă **Înregistrează GitHub App**.
2. Alegeți un cont personal sau o organizație.
3. Confirmare Probot creează aplicația și scrie acreditările sale în fișierul `.env`.

Asistentul setează URL-ul webhook-ului al aplicației la un canal Smee (sau `http://localhost:3000/`), nu la criteriul final de webhook al LightCMS. Actualizați-l în setările aplicației GitHub înainte de a intra în direct (a se vedea [Production deployment](#6-production-deployment)).

### Opțiunea B: Configurare manuală

Creați aplicația în **Setări GitHub → Setări pentru dezvoltatori → Aplicații GitHub → Noua aplicație GitHub** cu aceste valori:

| Setare                | Valoare                                                            |
| --------------------- | ------------------------------------------------------------------ |
| URL Pagina Principala | `http://<your-domain>`                                             |
| Callback URL          | `https://<your-domain>/api/auth/callback/github`                   |
| Setup URL             | `http://<your-domain>/github/setup`                                |
| URL Webhook           | `http://<your-domain>/api/github/webhook`                          |
| Webhook secret        | Un secret aleatoriu (vezi [Generând secrete](#generating-secrets)) |

## Permisiuni repo

| Permisiune           | Acces            | Folosit pentru                                          |
| -------------------- | ---------------- | ------------------------------------------------------- |
| `Conținutul`         | Citește și scrie | Citire și comitere fișiere de conținut                  |
| `Probleme`           | Citește și scrie | Revizuiește comentariile și etichetele la pull requests |
| `Trageți cererile`   | Doar citire      | Listarea fişierelor modificate într-o cerere pull       |
| `Statusuri comitete` | Citește și scrie | Raportarea validării conținutului pe împingeri          |
| `Metadate`           | Doar citire      | Obligatoriu pentru fiecare aplicație GitHub             |

**Abonați-vă la evenimente:** `Push` și `Solicitare Pull`. Evenimentele de instalare sunt livrate automat către GitHub Apps.

După crearea aplicației, țineți cont de **App ID**, generați un **client secret**, și generează și descarcă un **cheie privată** (`. em`).

## 3. Configurați variabilele de mediu

Creați un fișier `.env` în rădăcina proiectului. Depozitul nu livrează un fișier exemplar utilizabil, așa că utilizați referința de mai jos.

### Necesar

```bash
# -----------------------------------------------------------------------------------
# Autentificare (Better Auth)
# ---------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# URL public al acestei instanţe. Trebuie să se potrivească cu vizita utilizatorilor URL.
BETTER_AUTH_URL="http://localhost:5173"

# -------------------------------------------------------------------
# Baza de date (PostgreSQL, TLS necesar)
# -----------------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=necesar"

# -------------------------------------------------------------------
# GitHub App
# -------------------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxxxx"
GITUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
CHESTIUNI PRIVATE LA RSA -----CE"
```

`GITHUB_PRIVATE_KEY` este întregul conținut PEM. Păstraţi liniile rupte şi completaţi valoarea în ghilimele duble, şi anume cum asistentul Probot o scrie.

### Necesar pentru dezvoltare

LightCMS raportează analize și erori pentru [PostHog](https://posthog.com). Când lipsesc tastele, aplicația **aruncă în dezvoltare** pentru a opri blocarea silențioasă a evenimentelor. În producţie sunt opţionale, iar telemetria este omisă atunci când sunt dezinstalate.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### E-mail: necesar pentru autentificare link magic

Linkurile magice sunt trimise prin SMTP cu [Nodemailer](https://nodemailer.com). Trimiterea nu reușește cu o eroare de configurare când `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` sau `MAIL_DE` lipsește.

```bash
MAIL_HOST="smtp.resend.com"
# Implicit 587 când omite
MAIL_PORT="465"
# "true", "1", "da" sau "on" permite TLS implicit. Când este omis, TLS este activat doar pentru portul 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Opțional: AI Copilot

Copilot folosește orice API compatibil cu OpenAI. Toate cele trei variabile sunt necesare pentru a funcționa.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Orice furnizor care expune un API compatibil cu OpenAI, de exemplu [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) sau [NVIDIA NIM](https://build.nvidia.com).

### Opţional: dicţie vorbire-text

LightCMS suportă două backend-uri de transcriere. Atunci când ambele sunt configurate, este utilizat backend-ul compatibil OpenAI.

**Transcripția compatibilă cu OpenAI.** Este selectată când `SPEECH_API_KEY` este setată și are nevoie de `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# URL-ul de bază al furnizorului. Omiteți pentru a utiliza implicit OpenAI.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Punctul `SPEECH_ENDPOINT` la orice furnizor care implementează API-ul `/audio/transcrierile` ; și setează `SPEECH_MODEL` la un model care oferă furnizorul. Un trailing `/audio/transcrieri` în final este decapat automat.

**[Wit.ai](https://wit.ai)** este folosit atunci când `SPEECH_API_KEY` nu este setat:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>
```

Dacă nici unul nu este configurat, dictația nu este disponibilă.

### Opțional: încărcare imagini (CDN)

Imaginile lipite sau încărcate în editor sunt trimise la un [Chevereto](https://chevereto.com)-compatibil cu API. Opțiunile găzduite includ [FreeImage.host](https://freeimage.host) și [ImgBB](https://imgbb.com), sau puteți rula propria instanță Chevereto.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>
```

`CDN_KEY` este trimis ca parametru de interogare `cheie` cu excepţia cazului în care `CDN_URL` deja conţine unul. Dacă încărcarea eșuează sau variabilele nu sunt setate, LightCMS se întoarce la încorporarea imaginii în document ca date de bază64 `:` URL. Aceasta functioneaza, dar face fisierele Markdown mult mai mari, asa ca configureaza un CDN pentru uz real.

### Webhook Redirecționare locală (doar dezvoltare)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>
```

Acesta este citit de Probot, nu de aplicația SvelteKit. Vezi [Testarea webhooks local](#testing-webhooks-locally).

### Generarea de secrete

Utilizați oricare dintre acestea pentru a genera `BETTER_AUTH_SECRET` și `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# sau
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Configurați baza de date

LightCMS folosește [Drizzle ORM](https://orm.drizzle.team). Schema trăiește în `src/lib/server/db/schema.ts`și migrațiile sunt generate în directorul `drizzle`. Cu setarea `DATABASE_URL` , aplică migrațiile:

```bash
bun run db:migrate
```

In timpul dezvoltarii locale poti in schimb sa împingi schema direct la baza de date, fara fisiere de migrare:

```bash
bun rulează db:push
```

Alte scripturi ale bazei de date:

| Comanda               | Descriere                                    |
| --------------------- | -------------------------------------------- |
| `bun run db:generate` | Generează o migrare după editarea schemei    |
| `bun run db:studio`   | Navigați și editați datele în Drizzle Studio |

## 5. Rulează local

```bash
Rulează dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![permisiuni detaliate](https://i.ibb.co/0p7tk88V/image.png)

LightCMS este acum disponibil la `http://localhost:5173`. Setați `BETTER_AUTH_URL` la această adresă și conectați-vă cu GitHub pentru prima dată.

### Testare webhooks local

GitHub nu poate livra webhook-uri pentru `localhost`, așa că înaintează prin [smee.io](https://smee.io):

1. Creați un canal la [smee.io](https://smee.io) și copiați-i URL.
2. Setați `WEBHOOK_PROXY_URL` în `.env` la acel URL.
3. Setați URL-ul **Webhook** în setările aplicației GitHub la același URL.
4. Rulează botul într-un al doilea terminal:

   ```bash
   Rulare bun bot:start
   ```

Botul înregistrează aceiași manipulatori ca și punctul final de producție: validarea conținutului pe `împinge`, Revizuiește comentariile și etichetele pe `pull_request`și loging `de instalare`.

## 6. Instalarea producției

Proiectul este configurat cu SvelteKit, care este vendor agnostic. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) şi [Angajaţi Cloudflare](https://www.cloudflare.com/) sunt cu toţii acceptaţi obiectivele de implementare din cutie.

1. Importați depozitul Git în platforma de implementare.
2. Adaugă fiecare variabilă de mediu de la [pasul 3](#3-configure-environment-variables) în **Setări proiect → Mediu Variabile**. Setează `BETTER_AUTH_URL` la URL-ul de producție.
3. Desfăşurare.

Pentru a verifica producția construiește local:

```bash
Rulează construcția
Bine run previzualizare
```

## Depanare

Faceți un cont cu [Wit.ai](https://wit.ai/) este un serviciu gratuit cu meta <unk> Și orice API compatibil openai pentru transcriere. Se poate folosi [groq](https://groq.com/) sau [assemblyai](https://assemblyai.com/) sau <unk> [elevenlabe](https://elevenlabs.io/) sau [adâncime](https://deepgram.com/) sau [sarvam](https://sarvam.ai/). |

## Acreditări PostHog

Folosiți token-ul proiectului de la **propriul dvs. proiect** PostHog (**Setări proiect → Project API key**). Nu refolosiți un token din această documentație: evenimente trimise cu un pământ token comun în proiectul altcuiva, astfel încât informațiile, alertele și notificările nu sunt ale dvs. de citit.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Token de acces la server"
WIT_AI_CLIENT_TOKEN="Simbolul de acces al clientului"
```

```env
APP_ID=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
CDN_KEY=
CDN_URL=
DATABASE_URL=
GITHUB_APP_ID=
GITHUB_APP_NAME=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
MAIL_FROM=
MAIL_HOST=
MAIL_PASS=
MAIL_PORT=
MAIL_SECURE=
MAIL_USER=
OPEN_AI_ENDPOINT=
OPEN_AI_MODEL=
OPEN_AI_APIKEY=
ORIGIN=
PRIVATE_KEY=
VITE_POSTHOG_HOST=
VITE_POSTHOG_PROJECT_TOKEN=
SPEECH_API_KEY=
SPEECH_ENDPOINT=
SPEECH_MODEL=
WEBHOOK_SECRET=
WIT_AI_CLIENT_TOKEN=
WIT_AI_TOKEN=
```

![Configurare bot](https://i.ibb.co/jP5tgcJH/image.png)
