---
title: Само-хостинг LightCMS
description: Прямуйте до власного хосту LightCMS, що охоплює програму GitHub, PostgreSQL, змінні середовища, параметри додаткового AI, CDN та електронну пошту, а також розгортання до краю.
serial: 4
section: Початок роботи
badge: Розгортання
date: 2026-09-18T01:45:00Z
draft: хибність
tags:
  - selfhost
  - лампочки
  - postgresql
  - розгортання
keywords:
  - лампочки
  - робот
  - самохостинг
  - github_app
  - версель
  - sveltekit
preview: /og-image.png
---

Хочете LightCMS повністю під керуванням? LightCMS is a [SvelteKit](https://svelte.dev) application, so it can be deployed anywhere, backed by a PostgreSQL database and a GitHub App (Octokit). Ваш контент ніколи не залишає власного репозиторію GitHub.

Цей посібник проводить вас через все, що вам потрібно запустити свій екземпляр програми, створення програми GitHub, ініціювання PostgreSQL, налаштування змінних середовища та розгортання.

## Як падають частинки разом

| Компонент              | Призначення                                                                  | Обов'язково                              |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| PostgreSQL             | Зберігає користувачі, сесії, passkeys та GitHub інсталяції                   | Так                                      |
| GitHub App             | Читає та записує вміст у ваші репозиторії, та підписує користувачів у GitHub | Так                                      |
| SMTP провайдер         | Надсилає магічне посилання для входу                                         | Так, для авторизації чарівного посилання |
| OpenAI-сумісний API    | Потужність Копилота ШІ                                                       | За бажанням                              |
| API мовлення до тексту | Голосові сили                                                                | За бажанням                              |
| CDN зображення         | Хости зображень, завантажені в редактор                                      | За бажанням                              |
| Постгог                | Аналітика продукту і спостережуваність AI                                    | Тільки для розробки                      |

## Передумови

- **[mise](https://mise.jdx.dev)**: installs and manages task dependencies. Це керівництво передбачає, що у вас його було встановлено.
- **PostgreSQL**: база, яка приймає TLS-з'єднання. Cloud providers such as [Neon](https://neon.tech), [Supabase](https://supabase.com) or [Nile](https://thenile.dev) work well. See [awesome-free-postgres](https://github.com/alexeyfv/awesome-free-postgres) for free options.
- **акаунт GitHub**: потрібно зареєструвати додаток GitHub.
- **SMTP провайдер** (для магічних посилань): Якщо у вас є домен, [Resend](https://resend.com) - хороша опція. Інакше використовуйте [Zoho Mail](https://www.zoho.com/mail) та створіть пароль застосунку.

> **TLS є обов'язковим.** Застосування підключення до PostgreSQL з `ssl: "require"`. Локальний екземпляр PostgreSQL без увімкненого TLS буде відхилений, тому використовуйте хост бази даних або налаштуйте TLS на вашому власному сервері.

## 1. Форк репозиторію та встановлення залежностей

Клонувати репозиторій і встановлювати залежності:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS uses a GitHub App for two things: signing users in with GitHub (OAuth), and acting on your behalf through installations. Ви можете створити його за допомогою вбудованого в майстер налаштування Пробота або за рукою.

### Опція В: майстер налаштування Пробота

запускати бота з:

```bash
неправильний запущений бот
```

With no credentials in `.env`, Probot starts a setup server at `http://localhost:3000`:

1. Open `http://localhost:3000` and click **Register GitHub App**.
2. Оберіть ваш особистий рахунок або організацію.
3. Підтверд. Probot створює додаток і записує його облікові дані до вашого `.env` файлу.

The wizard sets the app's webhook URL to a Smee channel (or `http://localhost:3000/`), not to LightCMS's webhook endpoint. Оновіть це в налаштуваннях додатку GitHub, перед тим як вийдете жити (див. [Розгортання Виробництва](#6-production-deployment)).

### Опція В: Ручне налаштування

Створіть програму в **GitHub Налаштування → Налаштування розробника → Налаштування → Додаток GitHub → Новий GitHub** з такими значеннями:

| Налаштування           | Цінність                                                        |
| ---------------------- | --------------------------------------------------------------- |
| URL домашньої сторінки | `https://<your-domain>`                                         |
| Callback URL           | `https://<your-domain>/api/auth/callback/github`                |
| Setup URL              | `https://<your-domain>/github/налаштування`                     |
| URL вебхука            | `https://<your-domain>/api/github/webhook`                      |
| Секрет Webhook         | A random secret (see [Generating secrets](#generating-secrets)) |

## Дозволи для репозиторію

| Дозвіл            | Доступ          | Використовується для                        |
| ----------------- | --------------- | ------------------------------------------- |
| `Вміст`           | Читання і запис | Читання та комітування файлів вмісту        |
| `Issues`          | Read and write  | Review comments and labels on pull requests |
| `Pull requests`   | Read-only       | Listing the files changed in a pull request |
| `Commit statuses` | Read and write  | Reporting content validation on pushes      |
| `Metadata`        | Read-only       | Mandatory for every GitHub App              |

**Subscribe to events:** `Push` and `Pull request`. Installation events are delivered to GitHub Apps automatically.

After creating the app, note the **App ID**, generate a **client secret**, and generate and download a **private key** (`.pem`).

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

`GITHUB_PRIVATE_KEY` is the full PEM contents. Keep the line breaks and wrap the value in double quotes, which is how the Probot wizard writes it.

### Required for development

LightCMS reports analytics and errors to [PostHog](https://posthog.com). When the keys are missing, the app **throws in development** to stop events being silently dropped. In production they are optional, and telemetry is skipped when they are unset.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### Email: required for magic-link sign-in

Magic links are sent over SMTP with [Nodemailer](https://nodemailer.com). Sending fails with a configuration error when `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` or `MAIL_FROM` is missing.

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

Any provider that exposes an OpenAI-compatible API works, for example [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter.ai/api/v1`) or [NVIDIA NIM](https://build.nvidia.com).

### Optional: speech-to-text dictation

LightCMS supports two transcription backends. When both are configured, the OpenAI-compatible backend is used.

**OpenAI-compatible transcription.** It is selected when `SPEECH_API_KEY` is set, and also needs `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# Base URL of the provider. Omit it to use the OpenAI default.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Point `SPEECH_ENDPOINT` at any provider that implements the `/audio/transcriptions` API, and set `SPEECH_MODEL` to a model that provider offers. A trailing `/audio/transcriptions` in the endpoint is stripped automatically.

**[Wit.ai](https://wit.ai)** is used when `SPEECH_API_KEY` is not set:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

If neither is configured, dictation is unavailable.

### Optional: image uploads (CDN)

Images pasted or uploaded in the editor are sent to a [Chevereto](https://chevereto.com)-compatible upload API. Розміщені параметри включають [FreeImage.host](https://freeimage.host) та [ImgBB](https://imgbb.com)або ви можете запустити ваш власний Chevereto екземпляр.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>
```

`CDN_KEY` is sent as the `key` query parameter unless `CDN_URL` already contains one. Якщо завантаження не працюватиме або змінні не встановлені, LightCMS повертається до вбудованого зображення в документ як дані base64 `:` URL. Це працює, , але він значно більше робить ваші файли Markdown більш доступними, тож налаштуйте CDN для реального використання.

### Пересилання локальних Webhook (тільки для розробки)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Про це читає Probot, а не додаток SvelteKit. Дивіться [тестування вебхуків локально](#testing-webhooks-locally).

### Генерація секретів

Використовуйте будь-який з них, щоб створити `BETTER_AUTH_SECRET` та `GITHUB_WEBHOOK_SECRET`

```bash
openssl rand -hex 32
# або
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Налаштувати базу даних

LightCMS використовує [Drile ORM](https://orm.drizzle.team). The schema lives in `src/lib/server/db/schema.ts`, and migrations are generated into the `drizzle` directory. With `DATABASE_URL` set, apply the migrations:

```bash
робота db:migrate
```

Під час локального розвитку ви можете замість цього перенести схему прямо до бази даних, без міграційних файлів:

```bash
семінар запущено db:push
```

Інші скрипти бази даних:

| Команда                   | Опис                                                 |
| ------------------------- | ---------------------------------------------------- |
| `bun запуск db:генерація` | Генерувати міграцію після редагування схеми          |
| `брудний db:studio`       | Переглядайте та редагуйте ваші дані в Drizzle Studio |

## 5. Запускати локально

```bash
в булочку
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![детальна дозволи](https://i.ibb.co/0p7tk88V/image.png)

LightCMS is now available at `http://localhost:5173`. Встановіть `BETTER_AUTH_URL` на цю адресу та увійдіть за допомогою GitHub вперше.

### Тестування вебхуків локально

GitHub cannot deliver webhooks to `localhost`, so forward them through [smee.io](https://smee.io):

1. Create a channel at [smee.io](https://smee.io) and copy its URL.
2. Set `WEBHOOK_PROXY_URL` in `.env` to that URL.
3. Set the **Webhook URL** in your GitHub App settings to the same URL.
4. Запустіть бота в другому терміналі:

   ```bash
   зуп для бігу бота:start
   ```

Бот реєструє ті ж обробники, що і кінцева точка виробництва: перевірка вмісту на `push`, переглянути коментарі та етикетки на `pull_request`і `лог`.

## 6. Розгортання виробництва

Проект налаштований "SvelteKit", який є агностиком. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) і [Cloudflare Workers](https://www.cloudflare.com/) всі вони підтримуються Цілі розгортання з коробки.

1. Імпортуйте свій Git репозиторій до платформи розгортання.
2. Add every environment variable from [step 3](#3-configure-environment-variables) in **Project Settings → Environment Variables**. Встановіть `BETTER_AUTH_URL` у свою виробничу URL-адресу.
3. Загортайте.

Щоб перевірити локальну версію виробництва:

```bash
робота команди bun запуску
bun run preview
```

## Виправлення несправностей

Зробити обліковий запис на сайті [Wit.ai](https://wit.ai/) це безкоштовний сервіс meta | та будь-який openai сумісний API для транскрипції. | One can use [groq](https://groq.com/) or [assemblyai](https://assemblyai.com/) or | [elevenlabs](https://elevenlabs.io/) or [deepgram](https://deepgram.com/) or [sarvam](https://sarvam.ai/). |

## Облікові дані PostHog

Use the project token from **your own** PostHog project (**Project settings → Project API key**). Не повторно використовувати токен з цього документації: події, надіслані з загальним токатом у чужому проекті так що сповіщення, оповіщення і не ваші для прочитання.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Сервер маркера"
WIT_AI_CLIENT_TOKEN="маркер доступу"
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

![Налаштування бота](https://i.ibb.co/jP5tgcJH/image.png)
