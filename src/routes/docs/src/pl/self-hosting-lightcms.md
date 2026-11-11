---
title: Samodzielny Hosting LightCMS
description: Przewodnik do samodzielnego hosta LightCMS, obejmujący aplikację GitHub, PostgreSQL, zmienne środowiskowe, opcjonalne AI, CDN i e-mail oraz implementację do krawędzi.
serial: 4
section: Zacznij
badge: Wdrożenie
date: 2026-09-18T01:45:00Z
draft: fałszywy
tags:
  - selfhost
  - Światła
  - postgresql
  - wdrażanie
keywords:
  - Światła
  - probot
  - samozadowolenie
  - github_app
  - crwdns74646:0crwdne74646:0
  - sveltekit
preview: /og-image.png
---

Chcesz LightCMS pod swoją kontrolą? LightCMS jest aplikacją [SvelteKit](https://svelte.dev) , więc może być wdrożony w dowolnym miejscu, obsługiwaną przez bazę danych PostgreSQL i aplikację GitHub (Octokit). Twoja zawartość nigdy nie opuszcza twoich własnych repozytoriów GitHub.

Ten przewodnik przechodzi przez wszystko, czego potrzebujesz, aby uruchomić własną instancję: tworzenie aplikacji GitHub, zaopatrywanie PostgreSQL, konfigurowanie zmiennych środowiskowych i wdrażanie.

## Jak dopasować części razem

| Komponent                 | Cel                                                                           | Wymagane                           |
| ------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| PostgreSQL                | Przechowuje użytkowników, sesje, hasła i instalacje GitHub                    | Tak                                |
| GitHub App                | Czyta i zapisuje zawartość w repozytoriach i rejestruje użytkowników w GitHub | Tak                                |
| Dostawca SMTP             | Wysyła magiczne linki do logowania                                            | Tak, do logowania magicznego linku |
| API kompatybilne z OpenAI | Powoduje kopilot SI                                                           | Opcjonalnie                        |
| API Speech-to-text        | Powoduje dyktację głosową                                                     | Opcjonalnie                        |
| Obraz CDN                 | Hosty obrazy przesłane do edytora                                             | Opcjonalnie                        |
| PostHog                   | Analiza produktów i obserwacja grypy ptaków                                   | Wymagane tylko w rozwoju           |

## Wymagania wstępne

- **[brakuje](https://mise.jdx.dev)**: instaluje i zarządza zależnościami zadań. Ten przewodnik zakłada, że jesteś zainstalowany.
- **PostgreSQL**: baza danych, która akceptuje połączenia TLS. Dostawcy chmury tacy jak [Neon](https://neon.tech), [Supabase](https://supabase.com) lub [Nile](https://thenile.dev) działają dobrze. See [awesome-free-postgres](https://github.com/alexeyfv/awesome-free-postgres) for free options.
- **konto GitHub**: potrzebne do rejestracji aplikacji GitHub.
- **dostawca SMTP** (dla magicznych linków): Jeśli masz domenę, [Wyślij ponownie](https://resend.com) jest dobrą opcją. W przeciwnym razie użyj [Zoho Mail](https://www.zoho.com/mail) i utwórz hasło aplikacji.

> **TLS jest obowiązkowy.** Aplikacja łączy się z PostgreSQL z `ssl: "require"`. Lokalna instancja PostgreSQL bez włączonej TLS zostanie odrzucona, więc użyj hostowanej bazy danych lub skonfiguruj TLS na własnym serwerze.

## 1. Forkuj repozytorium i instaluj zależności

Sklonuj repozytorium i zainstaluj zależności:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS używa aplikacji GitHub do dwóch rzeczy: logowania użytkowników w GitHub (OAuth) i działania w Twoim imieniu poprzez instalacje. Możesz go utworzyć za pomocą wbudowanego kreatora konfiguracyjnego Probota lub ręcznie.

### Opcja A: Kreator konfiguracji probota

uruchom bota z:

```bash
brak bota
```

Bez danych logowania w `.env`, Probot uruchamia serwer konfiguracyjny na `http://localhost:3000`:

1. Otwórz `http://localhost:3000` i kliknij **Zarejestruj GitHub App**.
2. Wybierz swoje konto osobiste lub organizację.
3. Potwierdź Probot tworzy aplikację i zapisuje swoje poświadczenia do pliku `.env`.

Kreator ustawia adres URL webhooka aplikacji na kanał Sme (lub `http://localhost:3000/`), nie do punktu końcowego LightCMS . Zaktualizuj go w ustawieniach aplikacji GitHub przed przejściem na żywo (patrz [Wdrożenie produkcji](#6-production-deployment)).

### Opcja B: Ręczna konfiguracja

Utwórz aplikację w **GitHub Settings → Ustawienia programisty → GitHub Apps → New GitHub App** z następującymi wartościami:

| Ustawienie               | Wartość                                                           |
| ------------------------ | ----------------------------------------------------------------- |
| Adres URL strony głównej | `https://<your-domain>`                                     |
| Callback URL             | `https://<your-domain>/api/auth/callback/github`            |
| Setup URL                | `https://<your-domain>/github/setup`                        |
| URL webhooka             | `https://<your-domain>/api/github/webhook`                  |
| Sekret Webhooka          | Losowy sekret (patrz [Generowanie sekretów](#generating-secrets)) |

## Uprawnienia repozytorium

| Uprawnienie         | Dostęp           | Używane do                                         |
| ------------------- | ---------------- | -------------------------------------------------- |
| `Treść`             | Czytaj i zapisuj | Czytanie i zatwierdzanie plików treści             |
| `Zagadnienia`       | Czytaj i zapisuj | Przejrzyj komentarze i etykiety na pull requestach |
| `Pull requesty`     | Tylko do odczytu | Lista plików zmienionych w pull request            |
| `Zatwierdź statusy` | Czytaj i zapisuj | Sprawozdawczość o walidacji treści wypychanych     |
| `Metadane`          | Tylko do odczytu | Obowiązkowe dla każdej aplikacji GitHub            |

**Subskrybuj zdarzenia:** `Push` i `Pull request`. Zdarzenia instalacyjne są dostarczane do aplikacji GitHub automatycznie.

Po utworzeniu aplikacji, zapamiętaj **App ID**, wygeneruj tajny klient ****, i generuj i pobierz klucz prywatny **** (`. em`).

## 3. Konfiguruj zmienne środowiskowe

Utwórz plik `.env` w katalogu głównym projektu. Repozytorium nie wysyła użytecznego przykładowego pliku, więc użyj odnośnika poniżej.

### Wymagane

```bash
# ---------------------------------------------------------------------------
# Uwierzytelnianie (Auth)
# -----------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# Publiczny adres URL tej instancji. Musi pasować do odwiedzanych przez użytkowników URL.
BETTER_AUTH_URL="http://localhost:5173"

# -----------------------------------------------------------
# Baza danych (PostgreSQL, TLS jest wymagana)
# -----------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# -----------------------------------------------------------
# GitHub App
# -----------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRYWATNY KEY-----"
```

`GITHUB_PRIVATE_KEY` jest pełną zawartością PEM. Zachowaj łamanie wiersza i pakuj wartość w podwójne cudzysłowy, tak jak kreatora Probota zapisuje to.

### Wymagane do rozwoju

LightCMS zgłasza analizy i błędy [PostHog](https://posthog.com). Gdy brakuje kluczy, aplikacja **rzuca w rozwój** , aby zatrzymać ciche upuszczanie wydarzeń. W produkcji są one nieobowiązkowe, a telemetria jest pomijana, gdy są wyłączone.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### E-mail: wymagany do logowania z magicznym linkiem

Magiczne linki są wysyłane przez SMTP z [Nodemailer](https://nodemailer.com). Wysyłanie nie powiodło się z błędem konfiguracyjnym, gdy `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` lub `MAIL_FROM` jest brakujące.

```bash
MAIL_HOST="smtp.resend.com"
# Domyślnie 587 kiedy pominięto
MAIL_PORT="465"
# "true", "1", "tak" lub "on" włącza domyślny TLS. Po pominięciu, TLS jest włączony tylko dla portu 465.
MAIL_SECURE="1"
MAIL_USER="ponownie"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Opcjonalne: Kopiuj SI

Copilot używa API czatu kompatybilnego z OpenAI. Wszystkie trzy zmienne są potrzebne, aby działały.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Każdy dostawca, który ujawnia API kompatybilne z OpenAI, działa na przykład [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) lub [NVIDIA NIM](https://build.nvidia.com).

### Opcjonalne: dyktacja przemówienia tekstowego

LightCMS obsługuje dwa zaplecze transkrypcyjne. Gdy oba są skonfigurowane, używany jest backend kompatybilny z OpenAI.

**transkrypcja kompatybilna z OpenAI.** Jest wybrana, gdy `SPEECH_API_KEY` jest ustawiony, a także potrzebuje `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# Podstawowy adres URL dostawcy. Pomiń używanie domyślnych OpenAI.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Punkt `SPEECH_ENDPOINT` u każdego dostawcy, który implementuje `/audio/transcriptions` API, i ustaw `SPEECH_MODEL` na model , który oferuje dostawca. Trailing `/audio/transcriptions` w punkcie końcowym jest usuwany automatycznie.

**[Wit.ai](https://wit.ai)** jest używany, gdy `SPEECH_API_KEY` nie jest ustawiony:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

Jeśli żaden nie jest skonfigurowany, dyktacja jest niedostępna.

### Opcjonalne: wgrywanie obrazów (CDN)

Obrazy wklejone lub przesłane do edytora są wysyłane do kompatybilnego z [Chevereto](https://chevereto.com)-upload API. Opcje hostingu obejmują [FreeImage.host](https://freeimage.host) i [ImgBB](https://imgbb.com)lub możesz uruchomić swoją własną instancję Chevereto.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` is sent as the `key` query parameter unless `CDN_URL` already contains one. Jeśli przesyłanie się nie powiedzie lub zmienne nie są ustawione, LightCMS spada z powrotem do osadzania obrazu w dokumencie jako base64 `:` URL. To działa, ale sprawia, że Twoje pliki Markdown są znacznie większe, więc skonfiguruj CDN do prawdziwego użytku.

### Lokalne przekazywanie Webhook (Tylko deweloper)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Jest to czytane przez Probota, a nie przez aplikację SvelteKit. Zobacz [Testowanie webhooków lokalnie](#testing-webhooks-locally).

### Generowanie sekretów

Użyj dowolnego z nich, aby wygenerować `BETTER_AUTH_SECRET` i `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# lub
węzeł -e "console.log(require('kryptowalut').randomBytes(32).toString('hex')"
```

## 4. Ustaw bazę danych

LightCMS używa [Drizzle ORM](https://orm.drizzle.team). Schemat mieszka w `src/lib/server/db/schema.ts`, a migracje są generowane w katalogu `drizzle`. Z `DATABASE_URL` ustawione, zastosuj migracje:

```bash
bun run db:migrate
```

Podczas lokalnego rozwoju możesz zamiast tego przenieść schemat bezpośrednio do bazy danych, bez plików migracji:

```bash
bun uruchom db:push
```

Inne skrypty bazy danych:

| Polecenie                | Opis                                            |
| ------------------------ | ----------------------------------------------- |
| `bun uruchom db:Generuj` | Generuj migrację po edycji schematu             |
| `bun run db:studio`      | Przeglądaj i edytuj swoje dane w Drizzle Studio |

## 5. Uruchom lokalnie

```bash
bun run dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![uprawnienia szczegółowe](https://i.ibb.co/0p7tk88V/image.png)

LightCMS jest teraz dostępny pod adresem `http://localhost:5173`. Ustaw `BETTER_AUTH_URL` na ten adres i zaloguj się za pomocą GitHub po raz pierwszy.

### Testowanie webhooków lokalnie

GitHub nie może dostarczyć webhooków do `localhost`, więc przekaż je przez [smee.io](https://smee.io):

1. Utwórz kanał [smee.io](https://smee.io) i skopiuj jego adres URL.
2. Ustaw `WEBHOOK_PROXY_URL` w `.env` na ten adres URL.
3. Ustaw adres URL **Webhook** w ustawieniach aplikacji GitHub na ten sam adres URL.
4. Uruchom bota w drugim terminalu:

   ```bash
   bun run bot:start
   ```

Bot rejestruje te same uchwyty co punkt końcowy produkcji: sprawdzanie poprawności treści na `push`, przejrzyj komentarze i etykiety na `pull_request`i `instalacja`.

## 6. Rozmieszczenie produkcji

Projekt jest skonfigurowany z SvelteKit, który jest agnostyką dostawcy. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) i [Cloudflare Workers](https://www.cloudflare.com/) są obsługiwane przez cele wdrożenia poza polem zadania.

1. Importuj swoje repozytorium Git do platformy wdrożeniowej.
2. Dodaj każdą zmienną środowiskową z [krok 3](#3-configure-environment-variables) w **Ustawienia Projektu → Środowisko Zmienne**. Ustaw `BETTER_AUTH_URL` na swój adres URL produkcji.
3. Wdrożenie.

Aby zweryfikować lokalnie budowę produkcji:

```bash
bun run build
bun run preview
```

## Rozwiązywanie problemów

Utwórz konto z [Wit.ai](https://wit.ai/) jest darmową usługą przez meta | I wszelkie API kompatybilne z openai do transkrypcji. | Jedno może użyć [groq](https://groq.com/) lub [assemblyai](https://assemblyai.com/) lub | [11 laboratoriów](https://elevenlabs.io/) lub [deepgram](https://deepgram.com/) lub [sarvam](https://sarvam.ai/) |

## Poświadczenia PostHog

Użyj tokenu projektu z **własnego projektu** PostHog (**Ustawienia projektu → Klucz API projektu**). Nie używaj ponownie tokenu z tej dokumentacji: zdarzenia wysłane ze wspólnym tokenem w innym projekcie, aby powiadomienia nie były Twoimi informacjami, alertami i .

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Token dostępu do serwera"
WIT_AI_CLIENT_TOKEN="Token dostępu klienta "
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

![Konfiguracja bota](https://i.ibb.co/jP5tgcJH/image.png)
