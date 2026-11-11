---
title: Selbst-Hosting LightCMS
description: Leitfaden zum Selbst-Host von LightCMS, die GitHub App, PostgreSQL, Umgebungsvariablen, optionale AI, CDN und E-Mail abdecken und in Kanten bereitstellen.
serial: 4
section: Los geht's
badge: Deploy
date: 18.09.20T01:45:00Z
draft: falsch
tags:
  - selfhost
  - hellcms
  - postgresql
  - einrichten
keywords:
  - hellcms
  - probot
  - selbst-Hosting
  - github_app
  - Paket
  - sveltekit
preview: /og-image.png
---

Möchten Sie LightCMS voll unter Ihrer Kontrolle? LightCMS ist eine [SvelteKit](https://svelte.dev) Anwendung, so dass sie überall eingesetzt werden kann, unterstützt von einer PostgreSQL Datenbank und einer GitHub App (Octokit). Dein Inhalt hinterlässt niemals deine eigenen GitHub Repositories.

Diese Anleitung führt Sie durch alles, was Sie benötigen, um Ihre eigene Instanz auszuführen: Erstellen der GitHub App, Bereitstellung von PostgreSQL, Konfigurieren von Umgebungsvariablen und Bereitstellen.

## Wie die Teile zusammen passen

| Komponente            | Zweck                                                                              | Benötigt                            |
| --------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| PostgreSQL            | Speichert Benutzer, Sitzungen, Passkeys und GitHub Installationen                  | Ja                                  |
| GitHub App            | Liest und schreibt Inhalte in deinen Repositories und signiert Benutzer mit GitHub | Ja                                  |
| SMTP-Anbieter         | Sendet Magic-Link-Anmeldemails                                                     | Ja, für Magic-Link-Anmeldung        |
| OpenAI-kompatible API | Macht den KI Copilot                                                               | Optional                            |
| Sprach-zu-Text API    | Diktation der Mächte                                                               | Optional                            |
| Bild CDN              | Hosts Bilder im Editor hochgeladen                                                 | Optional                            |
| PostHog               | Produktanalytik und KI-Beobachtung                                                 | Nur in der Entwicklung erforderlich |

## Voraussetzungen

- **[mise](https://mise.jdx.dev)**: Installiert und verwaltet Aufgabenabhängigkeiten. Diese Anleitung setzt voraus, dass Sie sie installiert haben.
- **PostgreSQL**: eine Datenbank, die TLS-Verbindungen akzeptiert. Cloud-Anbieter wie [Neon](https://neon.tech), [Supabase](https://supabase.com) oder [Nile](https://thenile.dev) funktionieren gut. Siehe [awesome-free-postgres](https://github.com/alexeyfv/awesome-free-postgres) für kostenlose Optionen.
- **GitHub Konto**: erforderlich, um die GitHub App zu registrieren.
- **SMTP-Provider** (für magische Links): Wenn Sie eine Domain haben, [Erneutes Senden](https://resend.com) ist eine gute Option. Andernfalls verwenden Sie [Zoho Mail](https://www.zoho.com/mail) und erstellen Sie ein App-Passwort.

> **TLS ist obligatorisch.** Die Anwendung verbindet sich mit PostgreSQL mit `ssl: "require"`. Eine lokale PostgreSQL-Instanz ohne TLS aktiviert wird abgelehnt, also verwenden Sie eine gehostete Datenbank oder konfigurieren Sie TLS auf Ihrem eigenen Server.

## 1. Fork das Repository und installiere Abhängigkeiten

Repository klonen und Abhängigkeiten installieren:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS verwendet eine GitHub App für zwei Dinge: die Anmeldung von Benutzern mit GitHub (OAuth) und das Handeln in deinem Namen durch Installationen. Sie können es mit dem eingebauten Probot Installationsassistenten oder von Hand erstellen.

### Option A: Probot Einrichtungsassistent

starte den Bot mit:

```bash
mise run Bot
```

Ohne Anmeldedaten in `.env`startet Probot einen Setup-Server unter `http://localhost:3000`:

1. Öffnen Sie `http://localhost:3000` und klicken Sie auf **GitHub App** registrieren.
2. Wählen Sie Ihr persönliches Konto oder eine Organisation.
3. Bestätigen. Probot erstellt die App und schreibt ihre Anmeldedaten in Ihre `.env` Datei.

Der Assistent setzt die URL der App auf einen Smee Channel (oder `http://localhost:3000/`), nicht auf den Webhook von LightCMS Endpunkt. Aktualisieren Sie es in den GitHub App-Einstellungen bevor Sie live gehen (siehe [Production deployment](#6-production-deployment)).

### Option B: Manuelles Setup

Erstelle die App in **GitHub Einstellungen → Entwicklereinstellungen → GitHub Apps → Neue GitHub App** mit diesen Werten:

| Einstellung       | Wert                                                            |
| ----------------- | --------------------------------------------------------------- |
| Homepage URL      | `https://<your-domain>`                                   |
| Callback URL      | `https://<your-domain>/api/auth/callback/github`          |
| Setup URL         | `https://<your-domain>/github/setup`                      |
| Webhook-URL       | `https://<your-domain>/api/github/webhook`                |
| Webhook Geheimnis | A random secret (see [Generating secrets](#generating-secrets)) |

## Repository-Berechtigungen

| Berechtigung    | Zugang              | Verwendet für                                              |
| --------------- | ------------------- | ---------------------------------------------------------- |
| `Inhalt`        | Lesen und schreiben | Dateien lesen und übertragen                               |
| `Probleme`      | Lesen und schreiben | Kommentare und Beschriftungen bei Pull-Requests überprüfen |
| `Pull-Request`  | Nur lesen           | Liste der geänderten Dateien in einem Pull-Request         |
| `Commit-Status` | Lesen und schreiben | Inhaltsüberprüfung bei Pushes melden                       |
| `Metadaten`     | Nur lesen           | Pflichtfeld für jede GitHub App                            |

**Veranstaltungen abonnieren:** `Push` und `Pull Request`. Installationsereignisse werden automatisch an GitHub Apps ausgeliefert.

Nach dem Erstellen der App beachten Sie die **App ID**, erzeugen Sie ein **Client-Geheimnis**, und generieren und laden Sie einen **privaten Schlüssel** (`. em`).

## 3. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env` Datei im Projektstamm. Das Projektarchiv liefert keine verwendbare Beispieldatei. Verwenden Sie daher die nachfolgende Referenz .

### Benötigt

```bash
# ---------------------------------------------------------------------------
# Authentifizierung (Better Auth)
# ---------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# Public URL of this instance. Muss mit dem Besuch von URL-Benutzern übereinstimmen.
BETTER_AUTH_URL="http://localhost:5173"

# ---------------------------------------------------------------------------
# Datenbank (PostgreSQL, TLS erforderlich)
# ---------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# ---------------------------------------------------------------------------
# GitHub App
# -----------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----ENDE RSA PRIVATE KEY-----"
```

`GITHUB_PRIVATE_KEY` ist der vollständige PEM-Inhalt. Behalte die Zeilenumbrüche und wickele den Wert in doppelte Anführungszeichen. So schreibt der Probot-Assistent.

### Für die Entwicklung erforderlich

LightCMS meldet Analysen und Fehler an [PostHog](https://posthog.com). Wenn die Schlüssel fehlen, wird die App **in der Entwicklung** geworfen um zu verhindern, dass Ereignisse stillschweigend gelöscht werden. In der Produktion sind sie optional, und die Telemetrie wird übersprungen, wenn sie nicht gesetzt sind.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### E-Mail: erforderlich für Magic-Link-Anmeldung

Magic Links werden über SMTP mit [Nodemailer](https://nodemailer.com) versendet. Senden fehlgeschlagen mit einem Konfigurationsfehler, wenn `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` oder `MAIL_FROM` fehlt.

```bash
MAIL_HOST="smtp.resend.com"
# Standardwerte 587, wenn
MAIL_PORT="465"
# "true", "1", "yes" oder "on" aktiviert implizites TLS. Wird TLS weggelassen, ist nur für Port 465 aktiviert.
MAIL_SECURE="1"
MAIL_USER="Weitersenden"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Optional: KI Copilot

Das Copilot verwendet jede OpenAI-kompatible Chat-Vervollständigungs-API. Alle drei Variablen werden benötigt, damit es funktioniert.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
Öffne AI_MODEL="gpt-4o-mini"
```

Jeder Provider, der eine OpenAI-kompatible API aufdeckt, arbeitet zum Beispiel [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) oder [NVIDIA NIM](https://build.nvidia.com).

### Optional: Sprach-zu-Text Diktation

LightCMS unterstützt zwei Transkriptions-Backends. Wenn beide konfiguriert sind, wird das OpenAI-kompatible Backend verwendet.

**OpenAI-kompatible Transkription.** Wird ausgewählt, wenn `SPEECH_API_KEY` gesetzt ist und benötigt auch `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="Whisper-1"
# Basis-URL des Anbieters. Erlaube es den OpenAI Standard zu verwenden.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Punkt `SPEECH_ENDPOINT` auf jeden Provider, der die `/Audio/Transkriptionen` API implementiert und setzen Sie `SPEECH_MODEL` auf ein -Modell, das der Anbieter anbietet. Ein `/ Audio/Transkriptionen` am Endpunkt wird automatisch entfernt.

**[Wit.ai](https://wit.ai)** wird verwendet, wenn `SPEECH_API_KEY` nicht gesetzt ist:

```bash
Mit AI_TOKEN="<wit-ai-server-access-token>"
```

Wenn keiner der beiden konfiguriert ist, ist Diktation nicht verfügbar.

### Optional: Bild-Uploads (CDN)

Im Editor eingefügte oder hochgeladene Bilder werden an eine [Chevereto](https://chevereto.com)-kompatible Upload-API gesendet. Die Hosted-Optionen beinhalten [FreeImage.host](https://freeimage.host) und [ImgBB](https://imgbb.com)oder Sie können Ihre eigene Chevereto-Instanz ausführen.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` wird als `Schlüssel` Abfrageparameter gesendet, es sei denn, `CDN_URL` enthält bereits einen. Wenn der Upload fehlgeschlagen ist oder die Variablen nicht gesetzt sind LightCMS fällt zurück auf die Einbettung des Bildes in das Dokument als Base64 `Daten:` URL. Dies funktioniert, , aber es macht Ihre Markdown-Dateien viel größer, so konfigurieren Sie eine CDN für den echten Gebrauch.

### Lokale Webhook-Weiterleitung (nur Entwicklung)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Dies wird von Probot gelesen und nicht von der SvelteKit App. Siehe [Webhooks lokal](#testing-webhooks-locally) testen.

### Generiere Geheimnisse

Verwenden Sie eine dieser Funktionen, um `BETTER_AUTH_SECRET` und `GITHUB_WEBHOOK_SECRET` zu generieren:

```bash
openssl rand -hex 32
# oder
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Datenbank einrichten

LightCMS verwendet [Drizzle ORM](https://orm.drizzle.team). Das Schema lebt in `src/lib/server/db/schema.ts`und Migrationen werden in das Verzeichnis `drizzle` generiert. Mit `DATABASE_URL` setzen Sie die Migrationen:

```bash
bun run db:migrate
```

Während der lokalen Entwicklung können Sie stattdessen das Schema direkt in die Datenbank schieben, ohne Migrationsdateien:

```bash
bun ausführen db:push
```

Andere Datenbank-Skripte:

| Befehl                      | Beschreibung                                                |
| --------------------------- | ----------------------------------------------------------- |
| `bun ausführen db:generate` | Eine Migration nach dem Bearbeiten des Schemas generieren   |
| `bun ausführen db:studio`   | Durchsuchen und bearbeiten Sie Ihre Daten in Drizzle Studio |

## 5. Lokal ausführen

```bash
bun run dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![detailliert](https://i.ibb.co/0p7tk88V/image.png)

LightCMS ist ab sofort unter `http://localhost:5173` verfügbar. Setze `BETTER_AUTH_URL` auf diese Adresse und melde dich zum ersten Mal mit GitHub an.

### Webhooks lokal testen

GitHub kann Webhooks nicht an `localhost`übergeben, also leiten Sie sie über [smee.io](https://smee.io) weiter:

1. Erstelle einen Kanal unter [smee.io](https://smee.io) und kopiere seine URL.
2. Setze `WEBHOOK_PROXY_URL` in `.env` auf diese URL.
3. Legen Sie die **Webhook URL** in den GitHub App-Einstellungen auf die gleiche URL.
4. Den Bot in einem zweiten Terminal ausführen:

   ```bash
   bun run bot:start
   ```

Der Bot registriert die gleichen Handler wie der Produktionsendpunkt: Inhaltsvalidierung auf `Push`, überprüfen Sie die Kommentare und Beschriftungen auf `pull_request`und `Installation` Protokollierung.

## 6. Produktionseinsatz

Das Projekt wird mit SvelteKit konfiguriert, einem Verkäufer, der agnostisch ist. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) und [Cloudflare Arbeiter](https://www.cloudflare.com/) werden alle mit Bereitstellungsziele außerhalb der Box unterstützt.

1. Importieren Sie Ihr Git-Repository in die Bereitstellungsplattform.
2. Fügen Sie jede Umgebungsvariable aus [Schritt 3](#3-configure-environment-variables) in **Projekteinstellungen → Umwelt Variablen** hinzu. Setze `BETTER_AUTH_URL` auf deine Produktions-URL.
3. Deploy.

Um die Produktion lokal zu überprüfen:

```bash
bun run build
bun run Vorschau
```

## Fehlerbehebung

Erstellen Sie ein Konto mit [Wit.ai](https://wit.ai/) es ist ein kostenloser Service durch die Meta | und jede Openai-kompatible API für die Transkription. | Man kann [groq](https://groq.com/) oder [Assemblyai](https://assemblyai.com/) oder | [elvenlabs](https://elevenlabs.io/) oder [deepgram](https://deepgram.com/) oder [sarvam](https://sarvam.ai/) verwenden. |

## PostHog Zugangsdaten

Verwenden Sie das Projekt-Token von **Ihrem eigenen** PostHog Projekt (**Projekteinstellungen → Project API Key**). Verwenden Sie kein Token aus dieser Dokumentation: Ereignisse, die mit einem freigegebenen Token Land in einem anderen Projekt gesendet werden damit seine Einsichten, Warnungen und Benachrichtigungen nicht zu lesen sind.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Server-Zugangs-Token"
WIT_AI_CLIENT_TOKEN="Client Zugangs-Token"
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

![Bot-Konfiguration](https://i.ibb.co/jP5tgcJH/image.png)
