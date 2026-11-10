---
title: Self Hosting LightCMS
description: Guide to self host LightCMS, covering the GitHub App, PostgreSQL, environment variables, optional AI, CDN and email, and deploying to edge.
serial: 4
section: Get Started
badge: Deploy
date: 2026-09-18T01:45:00Z
draft: false
tags:
  - selfhost
  - lightcms
  - postgresql
  - deployment
keywords:
  - lightcms
  - probot
  - self-hosting
  - github_app
  - vercel
  - sveltekit
preview: /og-image.png
---

Want LightCMS fully under your control? LightCMS is a [SvelteKit](https://svelte.dev) application, so it can be deployed anywhere, backed by a PostgreSQL database and a GitHub App (Octokit). Your content never leaves your own GitHub repositories.

This guide walks you through everything you need to run your own instance: creating the GitHub App, provisioning
PostgreSQL, configuring environment variables, and deploying.

## How the Pieces Fit Together

| Component             | Purpose                                                                       | Required                     |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| PostgreSQL            | Stores users, sessions, passkeys and GitHub installations                     | Yes                          |
| GitHub App            | Reads and writes content in your repositories, and signs users in with GitHub | Yes                          |
| SMTP provider         | Sends magic-link sign-in emails                                               | Yes, for magic-link sign-in  |
| OpenAI-compatible API | Powers the AI Copilot                                                         | Optional                     |
| Speech-to-text API    | Powers voice dictation                                                        | Optional                     |
| Image CDN             | Hosts images uploaded in the editor                                           | Optional                     |
| PostHog               | Product analytics and AI observability                                        | Required in development only |

## Prerequisites

- **[mise](https://mise.jdx.dev)**: installs and manages task dependencies. This guide assumes you have it installed.
- **PostgreSQL**: a database that accepts TLS connections. Cloud providers such as [Neon](https://neon.tech),
  [Supabase](https://supabase.com) or [Nile](https://thenile.dev) work well. See
  [awesome-free-postgres](https://github.com/alexeyfv/awesome-free-postgres) for free options.
- **GitHub account**: needed to register the GitHub App.
- **SMTP provider** (for magic links): If you have a domain, [Resend](https://resend.com) is a good option.
  Otherwise, use [Zoho Mail](https://www.zoho.com/mail) and create an app password.

> **TLS is mandatory.** The application connects to PostgreSQL with `ssl: "require"`. A local PostgreSQL instance
> without TLS enabled will be rejected, so use a hosted database or configure TLS on your own server.

## 1. Fork the Repository and Install Dependencies

Clone the repository and install dependencies:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS uses a GitHub App for two things: signing users in with GitHub (OAuth), and acting on your behalf
through installations. You can create it with the built in Probot setup wizard, or by hand.

### Option A: Probot setup wizard

start the bot with:

```bash
mise run bot
```

With no credentials in `.env`, Probot starts a setup server at `http://localhost:3000`:

1. Open `http://localhost:3000` and click **Register GitHub App**.
2. Choose your personal account or an organization.
3. Confirm. Probot creates the app and writes its credentials to your `.env` file.

The wizard sets the app's webhook URL to a Smee channel (or `http://localhost:3000/`), not to LightCMS's webhook
endpoint. Update it in the GitHub App settings before going live (see [Production deployment](#6-production-deployment)).

### Option B: Manual setup

Create the app in **GitHub Settings → Developer settings → GitHub Apps → New GitHub App** with these values:

| Setting        | Value                                                           |
| -------------- | --------------------------------------------------------------- |
| Homepage URL   | `https://<your-domain>`                                         |
| Callback URL   | `https://<your-domain>/api/auth/callback/github`                |
| Setup URL      | `https://<your-domain>/github/setup`                            |
| Webhook URL    | `https://<your-domain>/api/github/webhook`                      |
| Webhook secret | A random secret (see [Generating secrets](#generating-secrets)) |

## Repository permissions

| Permission        | Access         | Used for                                    |
| ----------------- | -------------- | ------------------------------------------- |
| `Contents`        | Read and write | Reading and committing content files        |
| `Issues`          | Read and write | Review comments and labels on pull requests |
| `Pull requests`   | Read-only      | Listing the files changed in a pull request |
| `Commit statuses` | Read and write | Reporting content validation on pushes      |
| `Metadata`        | Read-only      | Mandatory for every GitHub App              |

**Subscribe to events:** `Push` and `Pull request`. Installation events are delivered to GitHub Apps automatically.

After creating the app, note the **App ID**, generate a **client secret**, and generate and download a **private key**
(`.pem`).

## 3. Configure environment variables

Create a `.env` file in the project root. The repository does not ship a usable example file, so use the reference below.

### Required

```bash
# ---------------------------------------------------------------------------
# Authentication (Better Auth)
# ---------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# Public URL of this instance. Must match the URL users visit.
BETTER_AUTH_URL="http://localhost:5173"

# ---------------------------------------------------------------------------
# Database (PostgreSQL, TLS required)
# ---------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms?sslmode=require"

# ---------------------------------------------------------------------------
# GitHub App
# ---------------------------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1.xxxxxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
```

`GITHUB_PRIVATE_KEY` is the full PEM contents. Keep the line breaks and wrap the value in double quotes, which is how
the Probot wizard writes it.

### Required for development

LightCMS reports analytics and errors to [PostHog](https://posthog.com). When the keys are missing, the app **throws in development** to stop events being silently dropped. In production they are optional, and telemetry is skipped when they are unset.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### Email: required for magic-link sign-in

Magic links are sent over SMTP with [Nodemailer](https://nodemailer.com). Sending fails with a configuration error when
`MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` or `MAIL_FROM` is missing.

```bash
MAIL_HOST="smtp.resend.com"
# Defaults to 587 when omitted
MAIL_PORT="465"
# "true", "1", "yes" or "on" enables implicit TLS. When omitted, TLS is enabled only for port 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Optional: AI Copilot

The Copilot uses any OpenAI-compatible chat completions API. All three variables are needed for it to work.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Any provider that exposes an OpenAI-compatible API works, for example [OpenAI](https://platform.openai.com),
[OpenRouter](https://openrouter.ai) (`https://openrouter.ai/api/v1`) or [NVIDIA NIM](https://build.nvidia.com).

### Optional: speech-to-text dictation

LightCMS supports two transcription backends. When both are configured, the OpenAI-compatible backend is used.

**OpenAI-compatible transcription.** It is selected when `SPEECH_API_KEY` is set, and also needs `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# Base URL of the provider. Omit it to use the OpenAI default.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Point `SPEECH_ENDPOINT` at any provider that implements the `/audio/transcriptions` API, and set `SPEECH_MODEL` to a
model that provider offers. A trailing `/audio/transcriptions` in the endpoint is stripped automatically.

**[Wit.ai](https://wit.ai)** is used when `SPEECH_API_KEY` is not set:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

If neither is configured, dictation is unavailable.

### Optional: image uploads (CDN)

Images pasted or uploaded in the editor are sent to a [Chevereto](https://chevereto.com)-compatible upload API.
Hosted options include [FreeImage.host](https://freeimage.host) and [ImgBB](https://imgbb.com), or you can run
your own Chevereto instance.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` is sent as the `key` query parameter unless `CDN_URL` already contains one. If the upload fails or the
variables are unset, LightCMS falls back to embedding the image in the document as a base64 `data:` URL. This works,
but it makes your Markdown files much larger, so configure a CDN for real use.

### Local Webhook Forwarding (Development Only)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

This is read by Probot, not by the SvelteKit app. See [Testing webhooks locally](#testing-webhooks-locally).

### Generating secrets

Use any of these to generate `BETTER_AUTH_SECRET` and `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Set up the database

LightCMS uses [Drizzle ORM](https://orm.drizzle.team). The schema lives in `src/lib/server/db/schema.ts`, and migrations
are generated into the `drizzle` directory. With `DATABASE_URL` set, apply the migrations:

```bash
bun run db:migrate
```

During local development you can instead push the schema straight to the database, without migration files:

```bash
bun run db:push
```

Other database scripts:

| Command               | Description                                   |
| --------------------- | --------------------------------------------- |
| `bun run db:generate` | Generate a migration after editing the schema |
| `bun run db:studio`   | Browse and edit your data in Drizzle Studio   |

## 5. Run locally

```bash
bun run dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![permissions detailed](https://i.ibb.co/0p7tk88V/image.png)

LightCMS is now available at `http://localhost:5173`. Set `BETTER_AUTH_URL` to this address, and sign in with GitHub for the first time.

### Testing webhooks locally

GitHub cannot deliver webhooks to `localhost`, so forward them through [smee.io](https://smee.io):

1. Create a channel at [smee.io](https://smee.io) and copy its URL.
2. Set `WEBHOOK_PROXY_URL` in `.env` to that URL.
3. Set the **Webhook URL** in your GitHub App settings to the same URL.
4. Run the bot in a second terminal:

   ```bash
   bun run bot:start
   ```

The bot registers the same handlers as the production endpoint: content validation on `push`, review comments and
labels on `pull_request`, and `installation` logging.

## 6. Production deployment

The project is configured with SvelteKit, which is vendor agnostic. [Vercel](https://vercel.com),
[Netlify](https://www.netlify.com/) and [Cloudflare Workers](https://www.cloudflare.com/) are all supported
deployment targets out of the box.

1. Import your Git repository into deployment platform.
2. Add every environment variable from [step 3](#3-configure-environment-variables) in **Project Settings → Environment
   Variables**. Set `BETTER_AUTH_URL` to your production URL.
3. Deploy.

To verify the production build locally:

```bash
bun run build
bun run preview
```

## Troubleshooting

Make a account with [Wit.ai](https://wit.ai/) it's a free service by meta |
And any openai compatible API for transcription. |
One can use [groq](https://groq.com/) or [assemblyai](https://assemblyai.com/) or |
[elevenlabs](https://elevenlabs.io/) or [deepgram](https://deepgram.com/) or [sarvam](https://sarvam.ai/). |

## PostHog Credentials

Use the project token from **your own** PostHog project (**Project settings → Project API key**). Do not reuse a token
from this documentation: events sent with a shared token land in someone else's project, so its insights, alerts and
notifications are not yours to read.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Server access token"
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

![Bot configuration](https://i.ibb.co/jP5tgcJH/image.png)
