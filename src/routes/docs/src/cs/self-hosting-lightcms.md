---
title: Vlastní hostování LightCMS
description: Průvodce pro vlastní hostování LightCMS, zahrnující GitHub App, PostgreSQL, proměnné prostředí, volitelné AI, CDN a e-mail a nasazení na okraj.
serial: 4
section: Začněte
badge: Publikovat
date: 2026-09-18T01:45:00Z
draft: nepravda
tags:
  - selfhost
  - světlomety
  - postgresql
  - nasazení
keywords:
  - světlomety
  - probot
  - vlastní hostování
  - github_app
  - vercel
  - sveltekit
preview: /og-image.png
---

Chceš LightCMS plně pod kontrolou? LightCMS je aplikace [SvelteKit](https://svelte.dev) , takže může být nasazena kdekoli, s podporou PostgreSQL databáze a GitHub aplikace (Octokit). Váš obsah nikdy nezanechává vaše vlastní GitHub repositáře.

Tento návod vás prochází vším, co potřebujete pro spuštění vlastní instance: vytvoření GitHub aplikace, nastavení PostgreSQL, nastavení proměnných prostředí a nasazení.

## Jak se díry shodují dohromady

| Komponenty              | Účel                                                                           | Požadováno                                  |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- |
| PostgreSQL              | Obchoduje uživatele, relace, passkeys a instalace GitHub                       | Ano                                         |
| GitHub App              | Čte a zapisuje obsah do vašich repositářů a podepisuje uživatele pomocí GitHub | Ano                                         |
| SMTP poskytovatel       | Odešle e-maily pro přihlášení s magickým odkazem                               | Ano, pro přihlášení pomocí magického odkazu |
| OpenAI kompatibilní API | Síla AI Copilot                                                                | Nepovinné                                   |
| API řeči k textu        | Síla hlasové diktace                                                           | Nepovinné                                   |
| CDN obrázku             | Hostitelské obrázky nahrané do editoru                                         | Nepovinné                                   |
| PostHog                 | Analýza produktů a sledování AI                                                | Vyžadováno pouze ve vývoji                  |

## Předpoklady

- **[mise](https://mise.jdx.dev)**: instaluje a spravuje závislosti na úlohách. Tento průvodce předpokládá, že je nainstalován.
- **PostgreSQL**: databáze, která přijímá TLS spojení. Poskytovatelé Cloudu jako [Neon](https://neon.tech), [Supabase](https://supabase.com) nebo [Nile](https://thenile.dev) fungují dobře. Viz [awesome-free postgres](https://github.com/alexeyfv/awesome-free-postgres) pro volné možnosti.
- **GitHub účet**: potřeba pro registraci GitHub aplikace.
- **SMTP provider** (pro magické odkazy): Pokud máte doménu, [znovu odeslat](https://resend.com) je dobrá volba. V opačném případě použijte [Zoho Mail](https://www.zoho.com/mail) a vytvořte heslo aplikace.

> **TLS je povinné.** Aplikace se připojuje k PostgreSQL s `ssl: "require"`. Místní PostgreSQL instance bez povolení TLS bude zamítnuta, proto použijte hostovanou databázi nebo nakonfigurujte TLS na vašem vlastním serveru.

## 1. Rozštěpit repositář a instalovat závislosti

Klonovat repositář a záviset na instalaci:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS používá GitHub aplikaci pro dvě věci: podepisování uživatelů pomocí GitHub (OAuth) a jednání jménem prostřednictvím instalací. Můžete jej vytvořit s vestavěným průvodcem nastavením Probot nebo ručně.

### Možnost A: Průvodce nastavením

spustit bota pomocí:

```bash
mise spustit bota
```

Bez pověření v `.env`, Probot spustí nastavovací server na `http://localhost:3000`:

1. Otevřete `http://localhost:3000` a klikněte na **Registrovat GitHub App**.
2. Vyberte si svůj osobní účet nebo organizaci.
3. Potvrdit. Problém vytváří aplikaci a zapisuje její přihlašovací údaje do souboru `.env`.

Průvodce nastaví URL webhooku aplikace na Smee kanál (nebo `http://localhost:3000/`), ne na koncový bod webhook LightCMS. Aktualizujte ji v nastavení aplikace GitHub před spuštěním (viz [Produkce](#6-production-deployment)).

### Možnost B: Ruční nastavení

Vytvořte aplikaci v **Nastavení GitHub → Nastavení vývojáře → GitHub aplikace → Nová GitHub App** s těmito hodnotami:

| Nastavení            | Hodnota                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| URL domovské stránky | `https:////<your-domain>`                                              |
| Callback URL         | `https://<your-domain>/api/auth/callback/github`                       |
| Setup URL            | `https:////<your-domain>/github/setup`                                 |
| URL webového háčku   | `https:////<your-domain>/api/github/webhook`                           |
| Tajný webový háček   | náhodný tajný klíč (viz [Generování tajných informací](#generating-secrets)) |

## Oprávnění repositáře

| Právo                   | Přístup         | Používá se pro                                             |
| ----------------------- | --------------- | ---------------------------------------------------------- |
| `Obsah`                 | Číst a psát     | Čtení a úprava obsahových souborů                          |
| `Problémy`              | Číst a psát     | Zkontrolovat komentáře a štítky na požadavcích na natažení |
| `Požadavky na natažení` | Pouze pro čtení | Seznam souborů změněných v požadavku na natažení           |
| `Stav revizí`           | Číst a psát     | Hlášení o ověření obsahu při odesílání                     |
| `Metadata`              | Pouze pro čtení | Povinné pro každou GitHub aplikaci                         |

**Přihlásit se k událostem:** `Push` a `Pull request`. Instalační události jsou automaticky doručeny do GitHub.

Po vytvoření aplikace si povšimněte **App ID**, vygenerujte **klientské tajné**, a vygenerovat a stáhnout **soukromý klíč** (`.`).

## 3. Konfigurovat proměnné prostředí

Vytvořte v kořenovém adresáři projektu soubor `.env`. Repozitář nedodává použitelný příklad souboru, proto použijte níže uvedenou odkaz.

### Požadováno

```bash
# -------------------------------------------------------------------
# Authentication (Better Auth)
# -----------------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# Veřejná URL této instance. Musí odpovídat návštěvě URL uživatelů.
BETTER_AUTH_URL="http://localhost:5173"

# -----------------------------------------------------------
# Databáze (PostgreSQL, TLS vyžadována)
# -------------------------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# ---------------------------------------------------------------------------
# GitHub App
# -------------------------------------------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE="-----BEGIN RSA PRIVATE KE-----
...
-----END RSA PRIVÁT KEY-----"
```

`GITHUB_PRIVATE_KEY` je celý obsah PEM. Udržujte zalomení řádky a obalte hodnotu dvojitými uvozovkami, což je způsob, jakým průvodce Probot ji píše.

### Vyžadováno pro vývoj

LightCMS hlásí analyticy a chyby [PostHog](https://posthog.com). Když klíče chybí, aplikace **hodí vývojář** k tomu, aby zastavila tiše upustení událostí. Ve výrobě jsou volitelné a při odstavení se vynechává telemetrie.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### E-mail: vyžadováno pro přihlášení pomocí magické linky

Magické odkazy jsou posílány přes SMTP s [Nodemailer](https://nodemailer.com). Odesílání selhalo s konfigurační chybou, když chybí `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` nebo `MAIL_FROM`.

```bash
MAIL_HOST="smtp.resend.com"
# Výchozí hodnota je 587 při vynechání
MAIL_PORT="465"
# "true", "1", "ano" nebo "on" povolí implicitní TLS. Pokud je vynecháno, TLS je povoleno pouze pro port 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Volitelné: AI Copilot

Copilot používá jakýkoliv chat kompatibilní s OpenAI API. Všechny tři proměnné jsou potřebné, aby fungovaly.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
Přidat do modu
```

Jakýkoliv poskytovatel, který odhaluje API kompatibilní s OpenAI, funguje například [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`nebo [NVIDIA NIM](https://build.nvidia.com).

### Volitelné: slovník k textu

LightCMS podporuje dvě přepisovací backendy. Pokud jsou oba nastaveny, použije se backend kompatibilní s OpenAI.

**přepis kompatibilní s OpenAI.** Je vybrán když je nastaven `SPEECH_API_KEY` a také potřebuje `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# Základní URL poskytovatele. Zrušte pro použití výchozího nastavení OpenAI.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

bod `SPEECH_ENDPOINT` u jakéhokoli poskytovatele, který implementuje `/audio/transcriptions` API, a nastavte `SPEECH_MODEL` na model , který poskytovatel nabízí. trailing `/audio/transcriptions` v koncovém bodě je automaticky odstraněn.

**[Wit.ai](https://wit.ai)** se používá, když `SPEECH_API_KEY` není nastaveno:

```bash
BE_AI_TOKEN="<wit-ai-server-access-token>"
```

Pokud ani jeden není nakonfigurován, slovník není k dispozici.

### Volitelné: Nahrávání obrázků (CDN)

Obrázky vložené nebo nahrané do editoru jsou odeslány na [Chevereto](https://chevereto.com)- kompatibilní s nahrávacím API. Možnosti hostování zahrnují [FreeImage.host](https://freeimage.host) a [ImgBB](https://imgbb.com)nebo můžete spustit vlastní instanci Chevereto.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` je odesílána jako parametr dotazu `` , pokud `CDN_URL` již nějaký obsahuje. Pokud se nahrávání nezdařilo nebo jsou přerušeny proměnné , LightCMS se vrátí k vložení obrázku do dokumentu jako base64 `data:` URL. To funguje, ale vaše Markdown soubory jsou mnohem větší, takže nakonfigurujte CDN pro skutečné použití.

### Místní přesměrování webhooku (pouze vývoj)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Toto je přečteno Probotem, ne aplikací SvelteKit. Viz [Testování webhooků lokálně](#testing-webhooks-locally).

### Generování sekretů

Použijte některý z nich k generování `BETTER_AUTH_SECRET` a `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# nebo
uzel -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Nastavit databázi

LightCMS používá [Drizzle ORM](https://orm.drizzle.team). Schéma žije v `src/lib/server/db/schema.ts`a migrace jsou generovány do adresáře `drizzle`. S nastavením `DATABASE_URL` , aplikujte migrace:

```bash
běh bun db:migrát
```

Během místního vývoje můžete raději posunout schéma přímo do databáze, bez migračních souborů:

```bash
bun run db:push
```

Další databázové skripty:

| Příkaz                 | L 343, 22.12.2009, s. 1).                         |
| ---------------------- | ------------------------------------------------- |
| `spustit db:generovat` | Vygenerovat migraci po úpravě schématu            |
| `bun run db:studio`    | Procházejte a upravujte svá data v Drizzle Studio |

## 5. Spustit lokálně

```bash
bun spustit dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![oprávnění detailně](https://i.ibb.co/0p7tk88V/image.png)

LightCMS je nyní k dispozici na adrese `http://localhost:5173`. Nastavte `BETTER_AUTH_URL` na tuto adresu a poprvé se přihlaste s GitHub.

### Testování webhooků lokálně

GitHub nemůže doručit webové háčky `localhost`, tak je přeposlat přes [smee.io](https://smee.io):

1. Vytvořte kanál v [smee.io](https://smee.io) a zkopírujte jeho URL.
2. Nastavte `WEBHOOK_PROXY_URL` v `.env` na tuto URL.
3. Nastavte **URL Webhook** v nastavení aplikace GitHub na stejnou URL.
4. Spustit bota ve druhém terminálu:

   ```bash
   bun spustit bot:start
   ```

Bot registruje stejné manipulátory jako koncový bod výroby: ověření obsahu na `push`, zkontrolujte komentáře a štítky na `pull_request`a `instalaci` logování.

## 6. Zavádění produkce

Projekt je konfigurován se SvelteKit, což je vendor agnostic. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) a [Cloudflare Workers](https://www.cloudflare.com/) jsou všechny podporované cíle nasazení mimo krabici.

1. Importujte váš Git repozitář do platformy pro nasazení.
2. Přidejte každou proměnnou prostředí z [krok 3](#3-configure-environment-variables) v **Nastavení projektu → Životní prostředí proměnné**. Nastavte `BETTER_AUTH_URL` na vaši produkční URL.
3. Nasadit.

K ověření výroby na místě:

```bash
bun spustit sestavení
náhled běhu bun
```

## Řešení problémů

Vytvořte si účet s [Wit.ai](https://wit.ai/) je to bezplatná služba meta | a jakékoliv openai kompatibilní API pro přepsání. | Lze použít [groq](https://groq.com/) nebo [assemblyai](https://assemblyai.com/) nebo | [elevenlabs](https://elevenlabs.io/) nebo [deepgram](https://deepgram.com/) nebo [sarvam](https://sarvam.ai/). |

## PostHog pověření

Použijte token projektu od **svého vlastního** PostHog projektu (**Nastavení projektu → Projekt API klíč**). Nepoužívejte znovu token z této dokumentace: události odeslané se sdíleným tokenem v projektu někoho jiného, takže jeho pohledy, upozornění a nejsou vaše oznámení ke čtení.

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

![Konfigurace bota](https://i.ibb.co/jP5tgcJH/image.png)
