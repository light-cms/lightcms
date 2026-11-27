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

If you want full control, you can run LightCMS yourself. LightCMS is a SvelteKit app that needs a PostgreSQL database and a GitHub App. This guide shows the pieces, local setup, and deployment notes.

## Required components

| Component             | Purpose                                                   |      Required       |
| --------------------- | --------------------------------------------------------- | :-----------------: |
| PostgreSQL            | Stores users, sessions, passkeys and GitHub installations |         Yes         |
| GitHub App            | Reads and writes repository content and handles OAuth     |         Yes         |
| SMTP provider         | Sends magic link sign-ins                                 | Yes for magic links |
| OpenAI-compatible API | AI helper (optional)                                      |      Optional       |
| Speech-to-text API    | Voice dictation (optional)                                |      Optional       |
| Image CDN             | Hosts uploaded images (optional)                          |      Optional       |

## Prerequisites

- `mise` for task management
- A PostgreSQL instance that accepts TLS connections (Neon, Supabase, Nile, etc.)
- A GitHub account to register a GitHub App
- An SMTP provider for email (Resend is a good option)

TLS is mandatory for database connections.

## 1. Clone and install

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

You can use the Probot setup wizard or create the app manually in GitHub Developer Settings.

### Probot setup

```bash
mise run bot
```

Open `http://localhost:3000` to register the GitHub App locally. The wizard can write credentials to your `.env` for development. Update the webhook URL in GitHub before going to production.

### Manual setup

Create a GitHub App with these values:

| Setting      | Value                                            |
| ------------ | ------------------------------------------------ |
| Homepage URL | `https://<your-domain>`                          |
| Callback URL | `https://<your-domain>/api/auth/callback/github` |
| Setup URL    | `https://<your-domain>/github/setup`             |
| Webhook URL  | `https://<your-domain>/api/github/webhook`       |

Give the app repository permissions: `Contents` (read & write), `Issues` (read & write), `Pull requests` (read), `Commit statuses` (read & write), and `Metadata` (read).

Record the App ID, client secret, and download the private key file.

## 3. Environment variables

Create a `.env` in the project root. Required values include authentication, database, and GitHub credentials. Example:

```bash
BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
BETTER_AUTH_URL="http://localhost:5173"
DATABASE_URL="postgresql://user:pass@host:5432/lightcms?sslmode=require"
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1.xxxxx"
GITHUB_CLIENT_SECRET="xxxx"
GITHUB_WEBHOOK_SECRET="xxxx"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
MAIL_HOST="smtp.resend.com"
MAIL_PORT=465
MAIL_SECURE=1
MAIL_USER="resend"
MAIL_PASS="<smtp-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

Keep PEM line breaks intact. Wrap values in quotes where needed.

### Optional: AI Copilot

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

### Optional: Speech-to-text

OpenAI-compatible transcription:

```bash
SPEECH_API_KEY="<key>"
SPEECH_MODEL="whisper-1"
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Or use Wit.ai with `WIT_AI_TOKEN="<token>"`.

### Optional: Image uploads

Configure a Chevereto-compatible endpoint:

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<key>"
```

If uploads are not configured, the editor embeds images as base64 data URLs which increases the Markdown file size.

## 4. Database

LightCMS uses Drizzle ORM. The schema lives in `src/lib/server/db/schema.ts`. With `DATABASE_URL` set, apply migrations:

```bash
bun run db:migrate
```

For development you can push the schema directly:

```bash
bun run db:push
```

Other scripts: `bun run db:generate`, `bun run db:studio`.

## 5. Run locally

```bash
bun run dev
```

Open `http://localhost:5173` and set `BETTER_AUTH_URL` to that address. Sign in with GitHub to test.

### Testing webhooks locally

Use smee.io to forward webhooks. Set `WEBHOOK_PROXY_URL` in `.env`, then run the bot in a second terminal:

```bash
bun run bot:start
```

## 6. Production deployment

LightCMS is SvelteKit-based and works on Vercel, Netlify, or Cloudflare Workers. Steps:

1. Import the repository into your hosting provider.
2. Add the required environment variables in project settings and set `BETTER_AUTH_URL` to your production URL.
3. Deploy.

To verify locally:

```bash
bun run build
bun run preview
```

## Troubleshooting notes

- Use a hosted PostgreSQL with TLS if you cannot enable TLS locally.
- PostHog keys are required in development to avoid dropped telemetry; they are optional in production.
- Keep all secrets private.

## Example `.env` keys (summary)

```
APP_ID=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
DATABASE_URL=
GITHUB_APP_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
MAIL_FROM=
MAIL_HOST=
MAIL_PASS=
MAIL_PORT=
MAIL_USER=
OPEN_AI_APIKEY=
SPEECH_API_KEY=
CDN_URL=
CDN_KEY=
```

See the project README for platform-specific deployment tips.
