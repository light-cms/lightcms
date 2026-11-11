---
title: Самохостинг LightCMS
description: Руководство по самому хосту LightCMS, охватывающее GitHub приложение, PostgreSQL, переменные среды, опциональные AI, CDN и почту и развёрнутые на край.
serial: 4
section: Начать работу
badge: Развертывание
date: 2026-09-18T01:45:00Z
draft: ложь
tags:
  - selfhost
  - молнии
  - postgresql
  - развертывание
keywords:
  - молнии
  - пробот
  - самохостинг
  - github_app
  - вершина
  - sveltekit
preview: /og-image.png
---

Хотите LightCMS полностью под вашим контролем? LightCMS является приложением [SvelteKit](https://svelte.dev) , поэтому оно может быть развернуто в любом месте, подкрепленное базой данных PostgreSQL и приложением GitHub (октябрь). Ваш контент никогда не оставляет свои репозитории на GitHub.

Это руководство рассказывает о том, что вам нужно запустить свой собственный экземпляр: создание GitHub приложения, подготовка PostgreSQL, настройка переменных среды и развертывание.

## Как все фигуры укладываются вместе

| Компонент              | Цель                                                                                           | Требуется                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| PostgreSQL             | Хранит пользователей, сеансов, паролей и установок GitHub                                      | Да                               |
| GitHub App             | Читает и записывает содержимое в ваши репозитории и подписывает пользователей с помощью GitHub | Да                               |
| SMTP провайдер         | Отправлять сообщения о входе в систему                                                         | Да, для входа в волшебную ссылку |
| OpenAI-совместимый API | Усиляет копилот ИИ                                                                             | Опционально                      |
| API речи               | Усиляет диктовку голоса                                                                        | Опционально                      |
| CDN изображения        | Изображения узлов, загруженных в редактор                                                      | Опционально                      |
| Постхог                | Аналитика продуктов и наблюдение ИИ                                                            | Требуется только для развития    |

## Предпосылки

- **[mise](https://mise.jdx.dev)**: устанавливает и управляет зависимостями заданий. В этом руководстве предполагается, что он установлен.
- **PostgreSQL**: база данных, которая принимает TLS соединения. Облачные поставщики, такие как [Neon](https://neon.tech), [Supabase](https://supabase.com) или [Nile](https://thenile.dev) хорошо работают. Смотрите [awesome-free-postgres](https://github.com/alexeyfv/awesome-free-postgres) для бесплатных опций.
- **GitHub Account**: требуется для регистрации GitHub приложения.
- **SMTP провайдер** (для волшебных ссылок): Если у вас есть домен, [Повторная отправка](https://resend.com) является хорошим вариантом. В противном случае используйте [Zoho Mail](https://www.zoho.com/mail) и создайте пароль приложения.

> **TLS является обязательным.** Приложение подключается к PostgreSQL с `ssl: "require"`. Локальная копия PostgreSQL без TLS будет отклонена, поэтому используйте размещенную базу данных или настройте TLS на вашем собственном сервере.

## 1. Форкнуть репозиторий и установить зависимости

Клонировать репозиторий и установить зависимости:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS использует GitHub для двух вещей: вход пользователей в GitHub (OAuth) и действующий от вашего имени через установки. Вы можете создать его с помощью встроенного мастера настройки Пробота или вручную.

### Вариант А: Мастер установки Пробота

начать бот:

```bash
пропущенный бот
```

Не имея учетных данных в `.env`Пробот запускает установочный сервер на `http://localhost:3000`:

1. Откройте `http://localhost:3000` и нажмите **Register GitHub App**.
2. Выберите свой личный аккаунт или организацию.
3. Подтвердить. Пробот создает приложение и записывает свои учетные данные в файл `.env`.

The wizard sets the app's webhook URL to a Smee channel (or `http://localhost:3000/`), not to LightCMS's webhook endpoint. Обновите его в настройках приложения GitHub до начала работы (см. [Production deployment](#6-production-deployment)).

### Вариант В: Ручная настройка

Создайте приложение в настройках **GitHub → Настройки разработчика → GitHub Apps → New GitHub App** с этими значениями:

| Настройка            | Значение                                                        |
| -------------------- | --------------------------------------------------------------- |
| URL главной страницы | `https://<your-domain>`                                   |
| Callback URL         | `https://<your-domain>/api/auth/callback/github`          |
| Setup URL            | `https://<your-domain>/github/setup`                      |
| URL вебхука          | `https://<your-domain>/api/github/webhook`                |
| Секрет Webhook       | A random secret (see [Generating secrets](#generating-secrets)) |

## Разрешения репозитория

| Разрешение           | Доступ          | Используется для                              |
| -------------------- | --------------- | --------------------------------------------- |
| `Содержание`         | Чтение и запись | Чтение и фиксация файлов содержимого          |
| `Задачи`             | Чтение и запись | Просмотр комментариев и меток pull-request'ов |
| `Запросы на слияние` | Только чтение   | Список файлов изменен в Pull Request          |
| `Статусы коммитов`   | Чтение и запись | Отчеты об валидации содержимого на pushes     |
| `Метаданные`         | Только чтение   | Обязательный для каждого приложения GitHub    |

**Подписаться на мероприятия:** `Push` и `Pull request`. События по установке автоматически передаются в GitHub приложения.

После создания приложения, обратите внимание на **App ID**, сгенерируйте **секрет клиента**, и сгенерировать и скачать приватный ключ **** (`. em`).

## 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта. Репозиторий не предоставляет пригодный для использования пример файл, поэтому используйте ссылку ниже.

### Требуется

```bash
# -----------------------------------------------------------------------------------
# Аутентификация (Better Auth)
# ---------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# публичный URL этого экземпляра. Должен совпадать с посещаемым пользователем URL-адресом.
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
-----ГОРОДА ПРИВАТЬ КЛЮЙ-----"
```

`GITHUB_PRIVATE_KEY` является полным содержимым PEM. Держите строку разрыва и оберните значение в двойные кавычки, вот как пишет её мастером.

### Требуется для разработки

LightCMS сообщает аналитику и ошибки для [PostHog](https://posthog.com). When the keys are missing, the app **throws in development** to stop events being silently dropped. В производстве они являются необязательными, а телеметрия пропускается, когда они отключены.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### E-mail: требуется для входа в систему magic-link

Магические ссылки отправляются через SMTP с помощью [Nodemailer](https://nodemailer.com). Отправка не удалась с ошибкой конфигурации, когда отсутствуют `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` или `MAIL_FROM`.

```bash
MAIL_HOST="smtp.resend.com"
# По умолчанию до 587 при пропускании
MAIL_PORT="465"
# "true", "1", "да" или "в" позволяет неявным TLS. При отсутствии TLS включен только для порта 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Необязательно: AI Copilot

Copilot использует любой API дополнений OpenAI-совместимого чата. Все три переменные необходимы для работы.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Любой поставщик, который открывает OpenAI-совместимый API, работает, например, [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) or [NVIDIA NIM](https://build.nvidia.com).

### Необязательно: диктование речи к тексту

LightCMS поддерживает два транскрипта. При настройке используется OpenAI-совместимый бэкэнд.

**Совместимый с OpenAI.** Выбран когда установлен `SPEECH_API_KEY` и также требуется `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# Базовый URL провайдера. Опустите его, чтобы использовать OpenAI по умолчанию.
СПЕЦИАЛЬНЫЕ СРЕДСТВА_СРЕДСТВУ="https://api.openai.com/v1"
```

Point `SPEECH_ENDPOINT` at any provider that implements the `/audio/transcriptions` API, and set `SPEECH_MODEL` to a model that provider offers. Заканчивая `/audio/transcriptions` в конечной точке удаляется автоматически.

**[Wit.ai](https://wit.ai)** используется, когда не задана `SPEECH_API_KEY`:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

Если ни один из них не настроен, продиктование недоступно.

### Опционально: загрузка изображений (CDN)

Изображения, вставленные или загруженные в редактор, отправляются на [Chevereto](https://chevereto.com)-совместимый API загрузки загрузки. Размещенные опции включают [FreeImage.host](https://freeimage.host) и [ImgBB](https://imgbb.com), или вы можете запустить свой собственный экземпляр Chevereto.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` is sent as the `key` query parameter unless `CDN_URL` already contains one. Если загрузка не удалась, или переменные не заданы, LightCMS возвращается к встраиванию изображения в документ в виде данных base64 `:` URL. Это работает, но делает файлы Markdown значительно больше, поэтому настройте CDN для реального использования.

### Локальная пересылка веб-хуков (только разработка)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>
```

Это читается Probot, а не приложением SvelteKit. См. [Testing webhooks локально](#testing-webhooks-locally).

### Генерация секретов

Используйте любое из этих для генерации `BETTER_AUTH_SECRET` и `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# или
узел -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Настройка базы данных

LightCMS использует [Моросящий ORM](https://orm.drizzle.team). The schema lives in `src/lib/server/db/schema.ts`, and migrations are generated into the `drizzle` directory. С набором `DATABASE_URL` примените миграции:

```bash
bun run db:migrate
```

Во время локального развития вы можете вместо этого отправлять схему прямо в базу данных, без миграционных файлов:

```bash
bun run db:push
```

Другие скрипты базы данных:

| Команда               | Описание                                          |
| --------------------- | ------------------------------------------------- |
| `bun run db:generate` | Генерировать миграцию после редактирования схемы  |
| `bun run db:studio`   | Просмотр и редактирование данных в Drizzle Studio |

## 5. Локальный запуск

```bash
bun run dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![детализированные разрешения](https://i.ibb.co/0p7tk88V/image.png)

LightCMS теперь доступен на сайте `http://localhost:5173`. Установите на этот адрес `BETTER_AUTH_URL` и впервые войдите в GitHub.

### Тестирование вебхуков локально

GitHub cannot deliver webhooks to `localhost`, so forward them through [smee.io](https://smee.io):

1. Create a channel at [smee.io](https://smee.io) and copy its URL.
2. Установите `WEBHOOK_PROXY_URL` в `.env` на этот URL.
3. Установите **Webhook URL** в настройках приложения GitHub на тот же URL.
4. Запустите бота во втором терминале:

   ```bash
   bun run bot:start
   ```

The bot registers the same handlers as the production endpoint: content validation on `push`, review comments and labels on `pull_request`, and `installation` logging.

## 6. Направление производства

Проект настроен на SvelteKit, который является поставщиком агностики. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) и [Cloudflare Workers](https://www.cloudflare.com/) are all supported deployment targets from the box.

1. Импортируйте ваш Git-репозиторий в платформу установки.
2. Добавить все переменные окружения из [шаг 3](#3-configure-environment-variables) в **Параметры проекта → Окружающая среда переменные**. Установите `BETTER_AUTH_URL` на ваш производственный URL.
3. Развертывание.

Для проверки производительности сборки локально:

```bash
bun run build
bun preview
```

## Устранение проблем

Сделайте аккаунт с [Wit.ai](https://wit.ai/) бесплатным сервисом meta | И любым openai совместимым API для транскрипции. | Можно использовать [грок](https://groq.com/) или [ассемблий](https://assemblyai.com/) или | [эссемблей](https://elevenlabs.io/) или [глубокограмм](https://deepgram.com/) или [sarvam](https://sarvam.ai/). |

## Учётные данные PostHog

Используйте токен проекта от **вашего собственного проекта** PostHog (**Настройки проекта → Ключ проекта**). Do not reuse a token from this documentation: events sent with a shared token land in someone else's project, so its insights, alerts and notifications are not yours to read.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Код доступа к серверу"
WIT_AI_CLIENT_TOKEN="Токен доступа к клиенту"
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

![Конфигурация бота](https://i.ibb.co/jP5tgcJH/image.png)
