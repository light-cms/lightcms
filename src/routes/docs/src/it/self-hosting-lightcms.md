---
title: Self Hosting LightCMS
description: Guida all'autohost LightCMS, che copre l'app GitHub, PostgreSQL, le variabili d'ambiente, l'API opzionale, il CDN e l'e-mail e la distribuzione sul bordo.
serial: 4
section: Per Iniziare
badge: Dispiega
date: 2026-09-18T01:45:00Z
draft: falso
tags:
  - selfhost
  - lightcms
  - postgresql
  - distribuzione
keywords:
  - lightcms
  - probot
  - auto-hosting
  - github_app
  - vercel
  - sveltekit
preview: /og-image.png
---

Vuoi LightCMS completamente sotto il tuo controllo? LightCMS è un'applicazione [SvelteKit](https://svelte.dev) , quindi può essere distribuita ovunque, supportata da un database PostgreSQL e da un'App GitHub (Octokit). Il tuo contenuto non lascia mai i tuoi repository GitHub.

Questa guida ti guida attraverso tutto ciò che ti serve per eseguire la tua istanza: creare l'app GitHub, il provisioning PostgreSQL, la configurazione delle variabili di ambiente e la distribuzione.

## Come i Pezzi si adattano insieme

| Componente            | Scopo                                                                      | Richiesto                        |
| --------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| PostgreSQL            | Memorizza installazioni di utenti, sessioni, passkey e GitHub              | Sì                               |
| GitHub App            | Legge e scrive contenuti nei tuoi repository e firma gli utenti con GitHub | Sì                               |
| Provider SMTP         | Invia email di accesso al link magico                                      | Sì, per l'accesso al link magico |
| API OpenAI-compatible | Potenzia il Copilot AI                                                     | Facoltativo                      |
| Api Speech-to-Text    | Potenzia dettatura vocale                                                  | Facoltativo                      |
| Immagine CDN          | Immagini host caricate nell'editor                                         | Facoltativo                      |
| PostHog               | Analisi del prodotto e osservabilità dell'IA                               | Richiesto solo in sviluppo       |

## Prerequisiti

- **[mise](https://mise.jdx.dev)**: installa e gestisce le dipendenze delle attività. Questa guida presuppone che l'hai installata.
- **PostgreSQL**: un database che accetta connessioni TLS. I provider cloud come [Neon](https://neon.tech), [Supabase](https://supabase.com) o [Nile](https://thenile.dev) funzionano bene. Vedi [awesome-free-postgres](https://github.com/alexeyfv/awesome-free-postgres) per le opzioni gratuite.
- **account GitHub**: necessario per registrare l'app GitHub.
- **SMTP provider** (per link magici): Se hai un dominio, [Reinvia](https://resend.com) è una buona opzione. Altrimenti, usa [Zoho Mail](https://www.zoho.com/mail) e crea una password per l'app.

> **TLS è obbligatorio.** L'applicazione si collega a PostgreSQL con `ssl: "require"`. Un'istanza locale PostgreSQL senza TLS abilitata sarà rifiutata, quindi usa un database ospitato o configura TLS sul tuo server.

## 1. Fork the Repository and Install Dependencies

Clona il repository e installa le dipendenze:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS utilizza un'applicazione GitHub per due cose: firma gli utenti con GitHub (OAuth) e agisce per tuo conto attraverso le installazioni. È possibile crearlo con la procedura guidata di configurazione del robot, o a mano.

### Opzione A: Configurazione guidata del robot,

avviare il bot con:

```bash
dise run bot
```

Senza credenziali in `.env`, Probot avvia un server di configurazione su `http://localhost:3000`:

1. Apri `http://localhost:3000` e clicca **Registra GitHub App**.
2. Scegli il tuo account personale o un'organizzazione.
3. Conferma. Probot crea l'app e scrive le sue credenziali sul tuo file `.env`.

La procedura guidata imposta l'URL del webhook dell'app a un canale Smee (o `http://localhost:3000/`), non all'endpoint del webhook di LightCMS. Aggiornarlo nelle impostazioni dell'app GitHub prima di andare in diretta (vedi [distribuzione produzione](#6-production-deployment)).

### Opzione B: Configurazione manuale

Crea l'app in **Impostazioni GitHub → Impostazioni sviluppatore → App GitHub → Nuova App GitHub** con questi valori:

| Impostazione       | Valore                                                            |
| ------------------ | ----------------------------------------------------------------- |
| Url Della Homepage | `● ://<your-domain>`                                        |
| Callback URL       | `https://<your-domain>/api/auth/callback/github`            |
| Setup URL          | `● ://<your-domain>/github/setup`                           |
| Url Webhook        | `● ://<your-domain>/api/github/webhook`                     |
| Webhook segreto    | Un segreto casuale (vedi [Generare segreti](#generating-secrets)) |

## Autorizzazioni repository

| Permesso                | Accesso        | Utilizzato per                                      |
| ----------------------- | -------------- | --------------------------------------------------- |
| `Contenuti`             | Leggi e scrivi | Lettura e commit di file di contenuto               |
| `Problemi`              | Leggi e scrivi | Rivedere commenti ed etichette sulle richieste pull |
| `Richieste di prelievo` | Sola Lettura   | Elencando i file modificati in una pull request     |
| `Stato di commit`       | Leggi e scrivi | Validazione del contenuto di segnalazione su pushes |
| `Metadati`              | Sola Lettura   | Obbligatorio per ogni app GitHub                    |

**Iscriviti agli eventi:** `Push` e `Pull request`. Gli eventi di installazione vengono consegnati automaticamente alle app GitHub.

Dopo aver creato l'app, nota l' **App ID**, genera un **client secret**, e genera e scarica una chiave privata **** (`. em`).

## 3. Configura le variabili d'ambiente

Crea un file `.env` nella radice del progetto. Il repository non fornisce un file di esempio utilizzabile, quindi usa il riferimento qui sotto.

### Richiesto

```bash
# ---------------------------------------------------------------------------
# Authentication (Better Auth)
# -------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# Public URL di questa istanza. Deve corrispondere alla visita degli utenti URL.
BETTER_AUTH_URL="http://localhost:5173"

# -----------------------------------------------------------
# Database (PostgreSQL, TLS richiesto)
# -----------------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# -------------------------------------------------------------------
# GitHub App
# -----------------------------------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
```

`GITHUB_PRIVATE_KEY` è il contenuto completo di PEM. Mantieni le interruzioni di riga e avvolgi il valore in virgolette doppie, che è come la procedura guidata del Probot lo scrive.

### Richiesto per lo sviluppo

LightCMS segnala analisi ed errori a [PostHog](https://posthog.com). Quando i tasti sono mancanti, l'app **lancia nello sviluppo** per fermare gli eventi in silenzio. In produzione sono facoltativi, e la telemetria viene saltata quando vengono disattivati.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### Email: richiesto per l'accesso al link magico

I link magici vengono inviati tramite SMTP con [Nodemailer](https://nodemailer.com). L'invio fallisce con un errore di configurazione quando `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` o `MAIL_FROM` è mancante.

```bash
MAIL_HOST="smtp.resend.com"
# Predefinito a 587 quando omesso
MAIL_PORT="465"
# "true", "1", "sì" o "on" abilita TLS implicito. Quando omesso, TLS è abilitato solo per la porta 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Facoltativo: Ai Copilot

Copilot utilizza qualsiasi API di chat compatibile con OpenAI. Tutte e tre le variabili sono necessarie per funzionare.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Qualsiasi provider che espone un API compatibile con OpenAI, funziona, ad esempio [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`o [NVIDIA NIM](https://build.nvidia.com).

### Facoltativo: dettatura vocale al testo

LightCMS supporta due backend di trascrizione. Quando entrambi sono configurati, viene utilizzato il backend compatibile con OpenAI.

Trascrizione **compatibile con OpenAI.** È selezionata quando `SPEECH_API_KEY` è impostata e necessita anche di `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# URL di base del provider. Omettere di utilizzare il valore predefinito di OpenAI.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Punto `SPEECH_ENDPOINT` presso qualsiasi provider che implementa l'API `/audio/trascrizioni` , e imposta `SPEECH_MODEL` a un modello che il provider offre. Un trailing `/audio/trascrizioni` nell'endpoint viene spogliato automaticamente.

**[Wit.ai](https://wit.ai)** viene utilizzato quando `SPEECH_API_KEY` non è impostato:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

Se nessuno è configurato, la dettatura non è disponibile.

### Opzionale: upload di immagini (CDN)

Le immagini incollate o caricate nell'editor vengono inviate a un'API di caricamento compatibile con [Chevereto](https://chevereto.com). Le opzioni ospitate includono [FreeImage.host](https://freeimage.host) e [ImgBB](https://imgbb.com), oppure puoi eseguire la tua istanza Chevereto.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` viene inviato come parametro di query `key` a meno che `CDN_URL` non ne contenga già uno. Se il caricamento fallisce o le variabili sono disattivate, LightCMS torna a incorporare l'immagine nel documento come base64 `dati:` URL. Questo funziona, ma rende i tuoi file Markdown molto più grandi, quindi configurare un CDN per un uso reale.

### Inoltro Webhook Locale (Solo Sviluppo)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Questo è letto da Probot, non dall'app SvelteKit. Vedi [Testing webhooks localmente](#testing-webhooks-locally).

### Generazione di segreti

Utilizzare uno di questi per generare `BETTER_AUTH_SECRET` e `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# o
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Configura il database

LightCMS utilizza [Drizzle ORM](https://orm.drizzle.team). Lo schema vive in `src/lib/server/db/schema.ts`e le migrazioni sono generate nella directory `drizzle`. Con `DATABASE_URL` impostato, applicare le migrazioni:

```bash
bun run db:migrate
```

Durante lo sviluppo locale è possibile invece premere lo schema diritto al database, senza file di migrazione:

```bash
bun run db:push
```

Altri script del database:

| Comando               | Descrizione                                          |
| --------------------- | ---------------------------------------------------- |
| `bun run db:generate` | Genera una migrazione dopo aver modificato lo schema |
| `bun run db:studio`   | Sfoglia e modifica i tuoi dati in Drizzle Studio     |

## 5. Esegui localmente

```bash
bun run dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![permessi dettagliati](https://i.ibb.co/0p7tk88V/image.png)

LightCMS è ora disponibile su `http://localhost:5173`. Imposta `BETTER_AUTH_URL` a questo indirizzo e accedi con GitHub per la prima volta.

### Testare webhooks localmente

GitHub non può consegnare webhooks a `localhost`, quindi inoltrarli attraverso [smee.io](https://smee.io):

1. Crea un canale su [smee.io](https://smee.io) e copia il suo URL.
2. Imposta `WEBHOOK_PROXY_URL` in `.env` a quell'URL.
3. Impostare l'URL **Webhook** nelle impostazioni dell'app GitHub sullo stesso URL.
4. Esegui il bot in un secondo terminale:

   ```bash
   bun run bot:start
   ```

Il bot registra gli stessi gestori dell'endpoint di produzione: convalida del contenuto su `push`, recensione commenti e etichette su `pull_request`, e `installazione` di registrazione.

## 6. Dispiegamento della produzione

Il progetto è configurato con SvelteKit, che è fornitore agnostico. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) e [Cloudflare Workers](https://www.cloudflare.com/) sono tutti obiettivi di distribuzione supportati fuori dalla casella.

1. Importa il tuo repository Git nella piattaforma di distribuzione.
2. Aggiungi ogni variabile d'ambiente dalla fase [3](#3-configure-environment-variables) nelle impostazioni del progetto **→ Ambiente Variabili**. Imposta `BETTER_AUTH_URL` al tuo URL di produzione.
3. Deploy.

Per verificare la produzione costruire localmente:

```bash
bun run build
bun run preview
```

## Risoluzione Dei Problemi

Crea un account con [Wit.ai](https://wit.ai/) è un servizio gratuito di meta <unk> E qualsiasi API openai compatibile per la trascrizione. <unk> Si può utilizzare [groq](https://groq.com/) o [assemblyai](https://assemblyai.com/) o <unk> [elevenlabs](https://elevenlabs.io/) o [deepgram](https://deepgram.com/) o [sarvam](https://sarvam.ai/). |

## Credenziali PostHog

Usa il token del progetto **il tuo progetto** PostHog (**Impostazioni del progetto → Chiave API del progetto**). Non riutilizzare un token da questa documentazione: eventi inviati con un token land condiviso nel progetto di qualcun altro, così le sue intuizioni, avvisi e le notifiche non sono le tue da leggere.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Token di accesso al server"
WIT_AI_CLIENT_TOKEN="Token di accesso al cliente"
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

![Configurazione del bot](https://i.ibb.co/jP5tgcJH/image.png)
