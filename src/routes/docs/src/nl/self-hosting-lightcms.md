---
title: Eigen Hosting LightCMS
description: Handleiding voor zelf-host LightCMS, het omvat de GitHub App, PostgreSQL, omgevingsvariabelen, optionele AI, CDN en e-mail en het implementeren naar randen.
serial: 4
section: Nu inschrijven
badge: Implementeren
date: 2026-09-18T01:45:00Z
draft: Onjuist
tags:
  - selfhost
  - lightcms
  - postgresql
  - implementatie
keywords:
  - lightcms
  - probot
  - eigen hosting
  - github_app
  - vercel
  - sveltekit
preview: /og-image.png
---

Wilt u LightCMS volledig onder uw controle? LightCMS is een [SvelteKit](https://svelte.dev) applicatie, zodat het overal kan worden geïmplementeerd, ondersteund door een PostgreSQL database en een GitHub App (oktober. Uw inhoud laat nooit uw eigen GitHub repositories over.

Deze handleiding leidt je door alles wat je nodig hebt om je eigen installatie te draaien: het maken van de GitHub App, provisioning PostgreSQL, het configureren van omgevingsvariabelen en het implementeren.

## Hoe de stukjes samen passen

| Onderdeel              | Doel                                                                          | vereist                        |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| PostgreSQL             | Opslaat gebruikers, sessies, toegangscodes en GitHub installaties             | ja                             |
| GitHub App             | Leest en schrijft inhoud in je repositories en verbindt gebruikers met GitHub | ja                             |
| SMTP provider          | Verstuurt magic-link inlog e-mails                                            | Ja, voor magic-link aanmelden  |
| OpenAI-compatibele API | Behoudt de AI Copilot                                                         | Optioneel                      |
| Spraak-naar-tekst API  | Posters spraakdictatie                                                        | Optioneel                      |
| CDN afbeelding         | Afbeeldingen van hosts geüpload in de editor                                  | Optioneel                      |
| Postvakje              | Product analytics en AI waarneming                                            | Alleen vereist in ontwikkeling |

## Vereisten

- **[mise](https://mise.jdx.dev)**: installeert en beheert taken afhankelijkheden. Deze handleiding veronderstelt dat je hem hebt geïnstalleerd.
- **PostgreSQL**: een database die TLS-verbindingen accepteert. Cloud providers zoals [Neon](https://neon.tech), [Supabase](https://supabase.com) of [Nile](https://thenile.dev) werken goed. Zie [coole free postgres](https://github.com/alexeyfv/awesome-free-postgres) voor gratis opties.
- **GitHub account**: nodig om de GitHub App te registreren.
- **SMTP provider** (voor magische links): Als u een domein heeft, [opnieuw verzenden is](https://resend.com) een goede optie. Anders, gebruik [Zoho Mail](https://www.zoho.com/mail) en maak een app-wachtwoord aan.

> **TLS is verplicht.** Het programma verbindt met PostgreSQL met `ssl: "require"`. Een lokale PostgreSQL instantie zonder TLS ingeschakeld zal worden geweigerd, dus gebruik een gehoste database of configureer TLS op uw eigen server.

## 1. Fork de repository en installeer afhankelijkheden

Kloon de repository en installeer dependencies:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS gebruikt een GitHub App voor twee dingen: gebruikers ondertekenen met GitHub (OAuth) en namens u handelen namens via installaties. Je kunt het maken met de ingebouwde Probot setup wizard, of met de hand.

### Optie A: Probot installatiewizard

start de bot met:

```bash
mise run bot
```

Zonder inloggegevens in `.env`, start Probot een setup server op `http://localhost:3000`:

1. Open `http://localhost:3000` en klik op **Registreer GitHub App**.
2. Kies uw persoonlijke account of een organisatie.
3. Bevestigen. Probot maakt de app en schrijft de inloggegevens naar je `.env` bestand.

De wizard stelt de webhook URL in op een Smee kanaal (of `http://localhost:3000/`), niet op LightCMS webhook eindpunt. Werk het bij in de GitHub App instellingen voordat u live gaat (Zie [Production deployment](#6-production-deployment)).

### Optie B: Handmatige installatie

Maak de app in **GitHub instellingen → Ontwikkelaarsinstellingen → GitHub Apps → Nieuwe GitHub App** met deze waarden:

| Instellingen    | Waarde                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| Startpagina URL | `https://<your-domain>`                                                |
| Callback URL    | `https://<your-domain>/api/auth/callback/github`                       |
| Setup URL       | `https://<your-domain>/github/setup`                                   |
| Webhook URL     | `https://<your-domain>/api/github/webhook`                             |
| Webhook geheim  | Een willekeurig geheim (zie [geheimen genereren](#generating-secrets)) |

## Repository rechten

| Bevoegdheden           | Toegangsrechten    | Gebruikt voor                                              |
| ---------------------- | ------------------ | ---------------------------------------------------------- |
| `Inhoud`               | Lezen en schrijven | Inhoudsbestanden lezen en uitvoeren                        |
| `Kwesties`             | Lezen en schrijven | Bekijk opmerkingen en labels op pull requests              |
| `Pull requests`        | Alleen-lezen       | Aanbieding van de bestanden gewijzigd in een pull-aanvraag |
| `Vastleggen statussen` | Lezen en schrijven | Rapporteer content validatie bij pushes                    |
| `Metagegevens`         | Alleen-lezen       | Verplicht voor elke GitHub App                             |

**Abonneer je op gebeurtenissen:** `Duw` en `Pomp verzoek`. Activiteiten van de installatie worden automatisch geleverd in GitHub apps.

Na het aanmaken van de app, noteer de **App ID**, genereer een **client secret**, en download een **persoonlijke sleutel** (`.` </code> ).

## 3. Configureer omgevingsvariabelen

Maak een `.env` bestand aan in de projectroot. De repository verzendt geen bruikbaar voorbeeldbestand, dus gebruik de referentie hieronder.

### vereist

```bash
# ---------------------------------------------------------------------------
# Authenticatie (Better Auth)
# ---------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# Publieke URL van deze instantie. Moet overeenkomen met de URL-gebruikers bezoeken.
BETTER_AUTH_URL="http://localhost:5173"

# ---------------------------------------------------------------------------
# Database (PostgreSQL, TLS vereist)
# -----------------------------------------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# -------------------------------------------------------------------------------------------
# GitHub App
# -----------------------------------------------------------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
```

`GITHUB_PRIVATE_KEY` is de volledige PEM inhoud. Houd de regeleinden en omhullen de waarde in dubbele aanhalingstekens, dat is hoe de Probot wizard het schrijft.

### Vereist voor ontwikkeling

LightCMS rapporteert analytics en fouten naar [PostHog](https://posthog.com). Als de sleutels ontbreken, gooit de app **ontwikkeling** om te voorkomen dat events stilletjes worden laten vallen. In de productie zijn ze optioneel, en telemetrie wordt overgeslagen wanneer ze niet zijn ingesteld.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### E-mail: vereist voor magic-link aanmelding

Magische links worden verzonden via SMTP met [Nodemailer](https://nodemailer.com). Het verzenden mislukt met een configuratiefout wanneer `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` of `MAIL_FROM` ontbreken.

```bash
MAIL_HOST="smtp.resend.com"
# Standaard ingesteld op 587 wanneer
MAIL_PORT="465"
# "true", "1", "yes" of "aan" maakt impliciet TLS mogelijk. Als weggelaten wordt, is TLS alleen ingeschakeld voor poort 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Optioneel: AI Copilot

De Copilot gebruikt elke OpenAI-compatibele chat completions API. Alle drie de variabelen zijn nodig om het te laten werken.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Elke provider die een OpenAI-compatibele API laat zien, bijvoorbeeld [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) of [NVIDIA NIM](https://build.nvidia.com).

### Optioneel: speech-to-text dictatie

LightCMS ondersteunt twee backends van transcriptie. Als beide zijn geconfigureerd, wordt de OpenAI-compatibele backend gebruikt.

**OpenAI-compatibele transcriptie.** Het is geselecteerd wanneer `SPEECH_API_KEY` is ingesteld, en heeft ook `SPEECH_MODEL` nodig :

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="fluister-1"
# basis-URL van de provider. Laat het weg om de OpenAI-standaard te gebruiken.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Punt `SPEECH_ENDPOINT` bij elke provider die de `/audio/transcripties` API implementeert. en zet `SPEECH_MODEL` naar een model dat aanbiedt. Een trailing `/audio/transcripties` in het eindpunt wordt automatisch verwijderd.

**[Wit.ai](https://wit.ai)** wordt gebruikt wanneer `SPEECH_API_KEY` niet is ingesteld:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

Als geen van beide is geconfigureerd, is dictatie niet beschikbaar.

### Optioneel: afbeelding uploaden (CDN)

Afbeeldingen in de editor worden verzonden naar een [Chevereto](https://chevereto.com)-compatibele upload API. De gehoste opties omvatten [FreeImage.host](https://freeimage.host) en [ImgBB](https://imgbb.com), of u kunt uw eigen Chevereto bijvoorbeeld uitvoeren .

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>
```

`CDN_KEY` wordt verzonden als de `key` query parameter tenzij `CDN_URL` al een bevat. Als de upload mislukt of de variabelen zijn vrijgegeven LightCMS valt terug naar het insluiten van de afbeelding in het document als base64 `gegevens:` URL. Dit werkt maar het maakt uw Markdown bestanden veel groter, dus configureer een CDN voor echt gebruik.

### Lokale Webhook doorsturen (alleen ontwikkeling)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Dit wordt gelezen door Probot, niet door de SvelteKit app. Zie [Testen van lokale webhooks](#testing-webhooks-locally).

### Geheimen genereren

Gebruik een van deze om `BETTER_AUTH_SECRET` en `GITHUB_WEBHOOK_SECRET` te genereren:

```bash
openssl rand -hex 32
# of
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. De database instellen

LightCMS gebruikt [Drizzle ORM](https://orm.drizzle.team). Het schema leeft in `src/lib/server/db/schema.ts`, en migraties worden gegenereerd in de map `drizzle`. Met `DATABASE_URL` ingesteld, pas de migratie toe:

```bash
bun run db:migreren
```

Tijdens de lokale ontwikkeling kun je het schema rechtstreeks naar de database pushen, zonder migratiebestanden:

```bash
bun run db:push
```

Andere database scripts:

| Opdracht               | Beschrijving                                          |
| ---------------------- | ----------------------------------------------------- |
| `bun run db:genereren` | Een migratie genereren na het bewerken van het schema |
| `bun run db:studio`    | Blader en bewerk uw gegevens in Drizzle Studio        |

## 5. Lokaal uitvoeren

```bash
bun run dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![gedetailleerde machtigingen](https://i.ibb.co/0p7tk88V/image.png)

LightCMS is nu beschikbaar op `http://localhost:5173`. Stel `BETTER_AUTH_URL` in op dit adres en log voor de eerste keer in met GitHub

### Webhooks lokaal testen

GitHub kan webhooks niet leveren aan `localhost`, dus stuur ze door via [smee.io](https://smee.io):

1. Maak een kanaal aan op [smee.io](https://smee.io) en kopieer de URL ervan.
2. Zet `WEBHOOK_PROXY_URL` in `.env` naar die URL.
3. Zet de **Webhook URL** in je GitHub App instellingen op dezelfde URL.
4. Voer de bot uit in een tweede terminal:

   ```bash
   bun run bot:start
   ```

De bot registreert dezelfde handlers als het productie eindpunt: inhoudsvalidatie op `push`, review commentaren en labels op `pull_request`, en `installatie` loggen.

## 6. Productie implementatie

Het project is geconfigureerd met SvelteKit, wat een leverancier is. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) en [Cloudflare Workers](https://www.cloudflare.com/) worden allemaal ondersteunde implementatiedoelen uit de doos.

1. Importeer je Git repository naar implementatieplatform.
2. Voeg elke omgevingsvariabele toe van [stap 3](#3-configure-environment-variables) in **Projectinstellingen → Omgeving Variabelen**. Zet `BETTER_AUTH_URL` op uw productie URL.
3. Implementeren.

Om de productie versie lokaal te verifiëren:

```bash
bun run build
bun run voorbeeld
```

## Probleemoplossing

Make a account with [Wit.ai](https://wit.ai/) it's a free service by meta | And any openai compatible API for transcription. · Men kan [groq](https://groq.com/) of [assemblyai](https://assemblyai.com/) of Lv. [Elevenlabs](https://elevenlabs.io/) of [deepgram](https://deepgram.com/) of [sarvam](https://sarvam.ai/) gebruiken. |

## Referenties PostHog Referenties

Gebruik het project token van **je eigen** PostHog project (**Project instellingen → Project API**). Gebruik geen token uit deze documentatie: gebeurtenissen die zijn verzonden met een gedeeld land in het project van iemand anders dus zijn inzichten, waarschuwingen en meldingen zijn niet van jou om te lezen.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Toegangstoken"
WIT_AI_CLIENT_TOKEN="Client access token"
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

![Bot configuratie](https://i.ibb.co/jP5tgcJH/image.png)
