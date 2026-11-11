---
title: Self Hosting LightCMS
description: Guide til selv vært LightCMS, der dækker GitHub App, PostgreSQL, miljøvariabler, valgfri AI, CDN og e-mail, og implementere til kanten.
serial: 4
section: Kom I Gang
badge: Deploy
date: 2026-09-18T01:45:00Z
draft: falsk
tags:
  - selfhost
  - lyspunkter
  - postgresql
  - implementering
keywords:
  - lyspunkter
  - probot
  - selv-hosting
  - github_app
  - pakke
  - sveltekit
preview: /og-image.png
---

Vil LightCMS fuldt ud under din kontrol? LightCMS er et [SvelteKit](https://svelte.dev) program, så det kan implementeres hvor som helst, bakkes op af en PostgreSQL database og en GitHub App (Octokit). Dit indhold forlader aldrig dine egne GitHub repositories.

Denne guide går dig gennem alt hvad du behøver for at køre din egen instans: at oprette GitHub App, provisionere PostgreSQL, konfigurere miljøvariabler og implementere.

## Hvordan Pieces passer sammen

| Komponent             | Formål                                                                | Påkrævet                     |
| --------------------- | --------------------------------------------------------------------- | ---------------------------- |
| PostgreSQL            | Butikker brugere, sessioner, passkeys og GitHub installationer        | Ja                           |
| GitHub App            | Læser og skriver indhold i dine arkiver, og tegn brugere i med GitHub | Ja                           |
| SMTP udbyder          | Sender mails med et magisk link                                       | Ja, for tryllelink-log ind   |
| OpenAI-kompatibel API | Beføjelse af AI Copilot                                               | Valgfri                      |
| Speech-to-text API    | Beføjelser til stemmediktering                                        | Valgfri                      |
| Billede Cdn           | Værter billeder uploadet i editoren                                   | Valgfri                      |
| PostHog               | Produktanalyser og AI-observabilitet                                  | Kun påkrævet under udvikling |

## Forudsætninger

- **[mise](https://mise.jdx.dev)**: installerer og styrer opgaveafhængigheder. Denne guide antager at du har den installeret.
- **PostgreSQL**: en database, der accepterer TLS-forbindelser. Cloud udbydere såsom [Neon](https://neon.tech), [Supabase](https://supabase.com) eller [Nile](https://thenile.dev) fungerer godt. Se [awesome-free-postgres](https://github.com/alexeyfv/awesome-free-postgres) for gratis muligheder.
- **GitHub konto**: nødvendigt for at registrere GitHub App.
- **SMTP udbyder** (for magiske links): Hvis du har et domæne, [Gensend](https://resend.com) er en god mulighed. Ellers skal du bruge [Zoho Mail](https://www.zoho.com/mail) og oprette en app adgangskode.

> **TLS er obligatorisk.** Applikationen forbinder til PostgreSQL med `ssl: "require"`. En lokal PostgreSQL instans uden TLS aktiveret vil blive afvist, så brug en hosted database eller konfigurer TLS på din egen server.

## 1. Gaffel af lager og installer afhængigheder

Klon depotet og installer afhængigheder:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS bruger en GitHub App til to ting: at logge brugere ind med GitHub (OAuth), og handler på dine vegne gennem installationer. Du kan oprette det med den indbyggede Probot setup guide, eller i hånden.

### Indstilling A: Probot opsætningsguide

start botten med:

```bash
mise run bot
```

Uden akkreditiver i `.env`starter Probot en setup server på `http://localhost:3000`:

1. Åbn `http://localhost:3000` og klik på **Registrer GitHub App**.
2. Vælg din personlige konto eller en organisation.
3. Bekræft. Probot opretter app'en og skriver sine legitimationsoplysninger til din `.env` -fil.

Guiden sætter appens webhook-URL til en Smee-kanal (eller `http://localhost:3000/`, ikke til LightCMS's webhook endpoint. Opdater den i GitHub App-indstillingerne før du går live (se [Produktionsimplementering](#6-production-deployment)).

### Tilvalg B: Manuel opsætning

Opret appen i **GitHub indstillinger → Udviklerindstillinger → GitHub Apps → Ny GitHub App** med disse værdier:

| Indstilling         | Værdi                                                                        |
| ------------------- | ---------------------------------------------------------------------------- |
| Hjemmeside URL      | `https://<your-domain>`                                                |
| Callback URL        | `https://<your-domain>/api/auth/callback/github`                       |
| Setup URL           | `https://<your-domain>/github/setup`                                   |
| Webhook URL         | `https://<your-domain>/api/github/webhook`                             |
| Webhook hemmelighed | En tilfældig hemmelighed (se [Genererer hemmeligheder](#generating-secrets)) |

## Repository tilladelser

| Tilladelse           | Adgang          | Brugt til                                          |
| -------------------- | --------------- | -------------------------------------------------- |
| `Indhold`            | Læs og skriv    | Læsning og committing af indholdsfiler             |
| `Problemer`          | Læs og skriv    | Gennemgå kommentarer og etiketter på pull requests |
| `Træk forespørgsler` | Skrivebeskyttet | Liste over filer ændret i en pull request          |
| `Commit statusser`   | Læs og skriv    | Validering af indhold på pushes                    |
| `Metadata`           | Skrivebeskyttet | Obligatorisk for hver GitHub App                   |

**Abonner på begivenheder:** `Push` og `Træk forespørgsel`. Installationshændelser leveres automatisk til GitHub Apps.

Efter oprettelse af appen, note **App ID**, generer en **klient hemmelighed**, og generere og downloade en **privat nøgle** (`. em`).

## 3. Indstil miljøvariabler

Opret en `.env` fil i projektroden. Lageret sender ikke en brugbar eksempelfil, så brug nedenstående reference.

### Påkrævet

```bash
# ---------------------------------------------------------------------------
# Godkendelse (Bedre Godkendelse)
# ---------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# Offentlig URL for denne instans. Skal matche URL-brugernes besøg.
BETTER_AUTH_URL="http://localhost:5173"

# ---------------------------------------------------------------------------
# Database (PostgreSQL, TLS påkrævet)
# ---------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# -----------------------------------------------------------
# GitHub App
# -----------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
```

`GITHUB_PRIVATE_KEY` er det fulde PEM-indhold. Hold linjeskift og ombryd værdien i dobbelte citater, hvilket er hvordan Probot guiden skriver det.

### Påkrævet for udvikling

LightCMS rapporterer analyser og fejl til [PostHog](https://posthog.com). Når nøglerne mangler, kaster app **i udvikling** for at forhindre, at begivenheder bliver tavs droppet. I produktionen er de valgfri, og telemetri springes over, når de ikke er indstillet.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### E-mail: påkrævet for magisk link log ind

Magiske links sendes over SMTP med [Nodemailer](https://nodemailer.com). Afsendelse mislykkes med en konfigurationsfejl, når `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` eller `MAIL_FROM` mangler.

```bash
MAIL_HOST="smtp.resend.com"
# Standard er 587 når udeladt
MAIL_PORT="465"
# "true", "1", "ja" eller "on" muliggør implicit TLS. Når dette er udeladt, er TLS kun aktiveret for port 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Valgfri: AI Copilot

Copilot bruger alle OpenAI-kompatible chat-kompletters-API. Alle tre variabler er nødvendige for at det kan fungere.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Enhver udbyder, der udsætter en OpenAI-kompatibel API virker, for eksempel [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) eller [NVIDIA NIM](https://build.nvidia.com).

### Valgfri: tale-til-tekst diktering

LightCMS understøtter to transskriptionsbackends. Når begge er konfigureret, bruges den OpenAI-kompatible backend.

**OpenAI-kompatibel transkription.** Det er valgt, når `SPEECH_API_KEY` er indstillet, og skal også `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# Base URL for udbyderen. Udelad det at bruge OpenAI standard.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Punkt `SPEECH_ENDPOINT` hos enhver udbyder, der implementerer `-/audio/transskriptioner` -API, og sæt `SPEECH_MODEL` til en model, som udbyderen tilbyder. En efterfølgende `/audio/transskriptioner` i slutpunktet fjernes automatisk.

**[Wit.ai](https://wit.ai)** anvendes, når `SPEECH_API_KEY` ikke er indstillet:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

Hvis ingen er konfigureret, er diktering ikke tilgængelig.

### Valgfri: billede uploads (CDN)

Billeder indsat eller uploadet i editoren sendes til en [Chevereto](https://chevereto.com)-kompatibel upload API. Hostede indstillinger omfatter [FreeImage.host](https://freeimage.host) og [ImgBB](https://imgbb.com), eller du kan køre din egen Chevereto instans.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` sendes som `nøgle` forespørgselsparameter, medmindre `CDN_URL` allerede indeholder en. Hvis upload mislykkes eller variablerne er frakoblet, LightCMS falder tilbage til indlejring af billedet i dokumentet som en base64 `-data:` URL. Dette virker, , men det gør dine Markdown filer meget større, så konfigurer en CDN til reel brug.

### Lokal Webhook Forwarding (Kun Udvikling)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Dette læses af Probot, ikke af SvelteKit-appen. Se [Test webhooks locally](#testing-webhooks-locally).

### Genererer hemmeligheder

Brug nogen af disse til at generere `BETTER_AUTH_SECRET` og `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# eller
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Konfigurer databasen

LightCMS bruger [Støvreg-ORM](https://orm.drizzle.team). Skemaet bor i `src/lib/server/db/schema.ts`og migrationer genereres i `drizzle` mappen. Med `DATABASE_URL` sæt, anvend migrationerne:

```bash
bun run db:migrate
```

Under lokal udvikling kan du i stedet skubbe skemaet direkte til databasen, uden migrationsfiler:

```bash
bun run db:push
```

Andre database- scripts:

| Kommando              | Varebeskrivelse                                  |
| --------------------- | ------------------------------------------------ |
| `bun run db:generate` | Generer en migration efter redigering af skemaet |
| `bun run db:studio`   | Gennemse og rediger dine data i Drizzle Studio   |

## 5. Kør lokalt

```bash
bun run dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![tilladelser detaljeret](https://i.ibb.co/0p7tk88V/image.png)

LightCMS er nu tilgængelig på `http://localhost:5173`. Sæt `BETTER_AUTH_URL` til denne adresse, og log ind med GitHub for første gang.

### Test webhooks lokalt

GitHub kan ikke levere webhooks til `localhost`, så videresende dem via [smee.io](https://smee.io):

1. Opret en kanal på [smee.io](https://smee.io) og kopier dens URL.
2. Sæt `WEBHOOK_PROXY_URL` i `.env` til denne URL.
3. Set the **Webhook URL** in your GitHub App settings to the same URL.
4. Kør botten i en anden terminal:

   ```bash
   bun run bot:start
   ```

Bot registrerer de samme handlere som produktionsendepunktet: indholdsvalidering på `push`, gennemgå kommentarer og etiketter på `pull_request`og `installation` logning.

## 6. Udarbejdelse af produktion

Projektet er konfigureret med SvelteKit, som er leverandør agnostiker. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) og [Cloudflare Workers](https://www.cloudflare.com/) understøttes alle implementeringsmål ud af boksen.

1. Importer din Git repository til implementering platform.
2. Tilføj alle miljøvariabler fra [trin 3](#3-configure-environment-variables) i **Projektindstillinger → Miljø Variabler**. Sæt `BETTER_AUTH_URL` til din produktions-URL.
3. Deploy.

For at verificere produktionsanlægget lokalt:

```bash
bun run build
bun run preview
```

## Fejlfinding

Lav en konto med [Wit.ai](https://wit.ai/) det er en gratis service med meta ¤ Og enhver openai kompatibel API til transskription. Man kan bruge [groq](https://groq.com/) eller [assemblyai](https://assemblyai.com/) eller [elevenlabs](https://elevenlabs.io/) eller [deepgram](https://deepgram.com/) eller [sarvam](https://sarvam.ai/). |

## PostHog legitimationsoplysninger

Brug projektoken fra **din egen** PostHog projekt (**Projektindstillinger → Projekt API-nøgle**). Genbrug ikke en token fra denne dokumentation: begivenheder sendt med en delt token land i en andens projekt, så dens indsigt, advarsler og -meddelelser er ikke dine til at læse.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Server adgangstoken"
WIT_AI_CLIENT_TOKEN="Klient adgangstoken"
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

![Bot konfiguration](https://i.ibb.co/jP5tgcJH/image.png)
