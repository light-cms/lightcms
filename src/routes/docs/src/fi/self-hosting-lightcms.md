---
title: Self Hosting LightCMS
description: Opas itse isäntä LightCMS, kattaa GitHub App, PostgreSQL, ympäristömuuttujat, valinnainen AI, CDN ja sähköposti, ja ottaa käyttöön edge.
serial: 4
section: Aloita Alusta
badge: Julkaise
date: 2026-09-18T01:45:00Z
draft: epätosi
tags:
  - selfhost
  - lightcms
  - postgresql
  - käyttöönotto
keywords:
  - lightcms
  - anturi
  - itsepalvelin
  - github_app
  - vercel
  - sveltekit
preview: /og-image.png
---

Haluatko LightCMS täysin sinun hallinnassasi? LightCMS on [SvelteKit](https://svelte.dev) -sovellus, joten se voidaan ottaa käyttöön missä tahansa, jota tukee PostgreSQL tietokanta ja GitHub -sovellus (lokakit). Sisältö ei koskaan jätä omia GitHub-repojasi.

Tämä opas kävelee läpi kaiken mitä tarvitset oman instanssin: GitHub Appin luominen, PostgreSQL:n, ympäristömuuttujien määrittämisen ja käyttöönoton.

## Miten kappaleet sopivat yhteen

| Komponentti              | Tarkoitus                                                                         | Pakollinen                      |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------- |
| PostgreSQL               | Kaupan käyttäjät, istunnot, salasanat ja GitHub-asennukset                        | Kyllä                           |
| GitHub App               | Lukee ja kirjoittaa sisältöä arkistoissasi ja allekirjoittaa käyttäjät GitHubilla | Kyllä                           |
| SMTP tarjoaja            | Lähettää magic-link kirjautumissähköpostit                                        | Kyllä, magic-link kirjautuminen |
| OpenAI- Yhteensopiva API | Toimii tekoälyn kopilotti                                                         | Valinnainen                     |
| Puhe-to-text API         | Toimivallan äänen sanakirja                                                       | Valinnainen                     |
| Kuvan CDN                | Palvelimeen ladatut isännät kuvat                                                 | Valinnainen                     |
| PostHog                  | Tuoteanalytiikka ja tekoälyn havainnointi                                         | Vaaditaan vain kehityksessä     |

## Edellytykset

- **[mise](https://mise.jdx.dev)**: asentaa ja hallinnoi tehtävien riippuvuuksia. Tämä opas olettaa, että sinulla on se asennettu.
- **PostgreSQL**: tietokanta, joka hyväksyy TLS-yhteydet. Pilvipalvelut kuten [Neon](https://neon.tech), [Supabase](https://supabase.com) tai [Nile](https://thenile.dev) toimivat hyvin. Katso [mahtavia postikortteja](https://github.com/alexeyfv/awesome-free-postgres) ilmaisia vaihtoehtoja.
- **GitHub tili**: tarvitaan GitHub Appin rekisteröintiin.
- **SMTP tarjoaja** (taika linkit): Jos sinulla on verkkotunnus, [Lähetä uudelleen](https://resend.com) on hyvä vaihtoehto. Muussa tapauksessa käytä [Zoho Mail](https://www.zoho.com/mail) ja luo sovelluksen salasana.

> **TLS on pakollinen.** Sovellus yhdistää PostgreSQL:ään `ssl: "tarvitaan"`. Paikallinen PostgreSQL instanssi , jossa ei ole TLS käytössä, hylätään, joten käytä isäntätietokantaa tai määritä TLS omalla palvelimellasi.

## 1. Fork the Repository and Install Depencies

Kloonaa repo ja asenna riippuvuudet:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

LightCMS käyttää GitHub App -sovellusta kahteen asiaan: käyttäjien allekirjoittamiseen GitHubilla (OAuth) ja toimimiseen asennusten kautta. Voit luoda sen kanssa rakennettu Probot setup velho, tai käsin.

### Vaihtoehto A: Probotti asetusten ohjattu

aloittaa botti kanssa:

```bash
mise run bot
```

Probot käynnistää asennuspalvelimen osoitteessa `http://localhost:3000` : Ei tunnistetietoja `.env`:

1. Avaa `http://localhost:3000` ja napsauta **Rekisteröidy GitHub App**.
2. Valitse henkilökohtainen tilisi tai organisaatio.
3. Vahvista Probot luo sovelluksen ja kirjoittaa sen tunnistetiedot `.env` tiedostoon.

Ohjattu toiminto asettaa sovelluksen webhook URL-osoitteen Smee-kanavalle (tai `http://localhost:3000/`), ei LightCMS:n webhook -päätepisteelle. Päivitä se GitHub App -asetuksissa ennen suorana lähetystä (katso [Tuotannon käyttöönotto](#6-production-deployment)).

### Vaihtoehto B: Manuaalinen määritys

Luo sovellus **GitHub Asetukset → Kehittäjän asetukset → GitHub sovellukset → Uusi GitHub App** näillä arvoilla:

| Asetus              | Arvo                                                            |
| ------------------- | --------------------------------------------------------------- |
| Kotisivun URL       | `SOD://<your-domain>`                                     |
| Callback URL        | `https://<your-domain>/api/auth/callback/github`          |
| Setup URL           | `†://<your-domain>/github/setup`                          |
| Webkoukun URL       | `℃://<your-domain>/api/github/webhook`                    |
| Webkoukku salaisuus | A random secret (see [Generating secrets](#generating-secrets)) |

## Versiovaraston käyttöoikeudet

| Käyttöoikeus        | Pääsy            | Käytetty varten                                            |
| ------------------- | ---------------- | ---------------------------------------------------------- |
| `Sisältö`           | Lue ja kirjoita  | Luetaan ja lähetetään sisältötiedostoja                    |
| `Ongelmat`          | Lue ja kirjoita  | Tarkastele huomioita ja merkkejä pullopyyntöjen yhteydessä |
| `Vedä pyynnöt`      | Vain Lukutilassa | Listaus tiedostoista, jotka on muutettu pull-pyynnössä     |
| `Toimituksen tilat` | Lue ja kirjoita  | Raportoinnin sisällön validointi työntöpyynnöissä          |
| `Metatiedot`        | Vain Lukutilassa | Pakollinen jokaiselle GitHub -sovellukselle                |

**Tilaa tapahtumat:** `Push` ja `Pull-pyyntö`. Asennustapahtumat toimitetaan GitHub Appsiin automaattisesti.

Kun olet luonut sovelluksen, huomaa **App ID**, Luo **asiakkaan salainen**, ja luo ja lataa **yksityinen avain** (`. em`).

## 3. Määritä ympäristömuuttujat

Luo `.env` tiedosto projektin juuriin. Repo ei lähetä käyttökelpoista esimerkkitiedostoa, joten käytä alla olevaa viittausta.

### Pakollinen

```bash
# -----------------------------------------------------------------------
# Todennus (Better Auth)
# ---------------------------------------------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# Tämän instanssin julkinen URL. Täytyy vastata URL-osoitteen käyttäjiä.
BETTER_AUTH_URL="http://localhost:5173"

# ---------------------------------------------------------------------------------------
# Tietokanta (PostgreSQL, TLS tarvitaan)
# -------------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# -----------------------------------------------------------------------
# GitHub sovellus
# -----------------------------------------------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA YKSITYISKOHTAINEN KEY-----"
```

`GITHUB_PRIVATE_KEY` on koko PEM sisältö. Pidä rivi taukoja ja kääri arvo kaksinkertainen lainauksia, joka on, miten Probot velho kirjoittaa sen.

### Tarvitaan kehitystä varten

LightCMS raportoi analytiikkaa ja virheitä [PostHog](https://posthog.com). Kun avaimet puuttuvat, sovellus **heittää kehitystyöhön** lopettaakseen tapahtumien hiljaa pudottamisen. Tuotannossa ne ovat valinnaisia, ja telemetriaa ohitetaan, kun niitä ei aseteta.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### Sähköposti: vaaditaan magic-link sign-in

Magic linkit lähetetään SMTP kanssa [Nodemailer](https://nodemailer.com). Lähettäminen epäonnistui asetusvirheen ollessa `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` tai `MAIL_FROM` puuttuu.

```bash
MAIL_HOST="smtp.resend.com"
# Oletuksena on 587 jätettäessä pois
MAIL_PORT="465"
# "true", "1", "kyllä" tai "päälle" mahdollistaa implisiittisen TLS. Jos tämä ei ole käytössä, TLS on käytössä vain portille 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Valinnainen: AI Copilot

Copilot käyttää mitä tahansa OpenAI-yhteensopivaa chatin valmistumisrajapintaa. Kaikki kolme muuttujaa ovat tarpeen, jotta se toimisi.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Mikä tahansa tarjoaja, joka paljastaa OpenAI-yhteensopivan API-toiminnan, esimerkiksi [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) tai [NVIDIA NIM](https://build.nvidia.com).

### Valinnainen: puheesta tekstiin liittyvä sanamuoto

LightCMS tukee kahta transkriptitaustaohjelmaa. Kun molemmat on määritetty, käytetään OpenAI-yhteensopivaa taustaosaa.

**OpenAI-yhteensopiva transkriptio.** Se on valittuna, kun `SPEECH_API_KEY` on asetettu, ja tarvitsee myös `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="kuiska-1"
# palveluntarjoajan perusURL. Jätä se käyttääksesi OpenAI:n oletusarvoa.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Piste `SPEECH_ENDPOINT` millä tahansa palveluntarjoajalla, joka toteuttaa `/audio/transcriptions` APIa, ja aseta `SPEECH_MODEL` -malliin, jonka tarjoaja tarjoaa. Loppupisteessä oleva `/audio/transkriptio` poistetaan automaattisesti.

**[Wit.ai](https://wit.ai)** käytetään kun `SPEECH_API_KEY` ei ole asetettu:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

Jos kumpaakaan ei ole asetettu, sanakirja ei ole käytettävissä.

### Valinnainen: kuvan lataaminen (CDN)

Muokkaimeen liitetyt tai ladattavat kuvat lähetetään [Chevereto](https://chevereto.com)-yhteensopivaan latausrajapintaan. Hosted vaihtoehtoja ovat [FreeImage.host](https://freeimage.host) ja [ImgBB](https://imgbb.com), tai voit ajaa oman Chevereto instanssi.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` lähetetään `avaimen` kyselyn parametrina, ellei `CDN_URL` jo sisältää yksi. Jos lataus epäonnistuu tai -muuttujia ei ole asetettu, LightCMS palautuu kun kuva upotetaan asiakirjaan base64 `-datana:` URL. Tämä toimii, , mutta se tekee Markdown-tiedostoistasi paljon suurempia, joten määritä CDN oikeaa käyttöä varten.

### Paikallinen Verkkokoukku Eteenpäinvälitys (Vain Kehitys)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Tämän lukee Probot, ei SvelteKit sovellus. Katso [Testing webhooks paikallisesti](#testing-webhooks-locally).

### Luodaan salaisuuksia

Käytä mitä tahansa näistä tuottaaksesi `BETTER_AUTH_SECRET` ja `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# tai
node -e "console.log(require('crypto').randomBytes(32).toString('hex')"
```

## 4. Määritä tietokanta

LightCMS käyttää [Drizzle ORM](https://orm.drizzle.team). Järjestelmä elää `src/lib/server/db/schema.ts`ja siirtymät luodaan `drizzle` -hakemistoon. Kun `DATABASE_URL` on asetettu, käytä siirtoja:

```bash
bun run db:migrate
```

Paikallisen kehityksen aikana voit sen sijaan työntää järjestelmän suoraan tietokantaan, ilman muuttotiedostoja:

```bash
pullo ajo db:push
```

Muut tietokannan skriptit:

| Komento               | Kuvaus                                            |
| --------------------- | ------------------------------------------------- |
| `bun run db:generate` | Luo muuttoliike järjestelmän muokkaamisen jälkeen |
| `bun run db:studio`   | Selaa ja muokkaa tietojasi Drizzle Studiossa      |

## 5. Suorita paikallisesti

```bash
pullo ajo dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![käyttöoikeudet yksityiskohtainen](https://i.ibb.co/0p7tk88V/image.png)

LightCMS on nyt saatavilla osoitteessa `http://localhost:5173`. Aseta `BETTER_AUTH_URL` tähän osoitteeseen ja kirjaudu sisään GitHubilla ensimmäistä kertaa.

### Verkkokoukkujen testaus paikallisesti

GitHub ei voi toimittaa webkoukkuja `localhost`, joten lähetä ne eteenpäin [smee.io](https://smee.io) kautta:

1. Luo kanava [smee.io](https://smee.io) ja kopioi sen URL.
2. Aseta `WEBHOOK_PROXY_URL` `.env` kyseiselle URL:lle.
3. Aseta **Webhook URL** GitHub App asetuksissa samalle URL:lle.
4. Suorita botti toisessa terminaalissa:

   ```bash
   bun run bot:start
   ```

The bot registers the same handlers as the production endpoint: content validation on `push`, review comments and labels on `pull_request`, and `installation` logging.

## 6. Tuotannon käyttöönotto

Projekti on konfiguroitu SvelteKitin kanssa, joka on myyjä agnostinen. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) ja [Cloudflare Työntekijät](https://www.cloudflare.com/) ovat kaikki tuettuja käyttöönottokohteita laatikossa.

1. Tuo Git repo käyttöönottoalustalle.
2. Lisää jokainen ympäristömuuttuja [vaiheesta 3](#3-configure-environment-variables) **Projektiasetukset → Ympäristö Muuttujat**. Aseta `BETTER_AUTH_URL` tuotannon URL-osoitteeseen.
3. Julkaise.

Varmistaa tuotanto rakentaa paikallisesti:

```bash
bun run build
bun run esikatselu
```

## Vianmääritys

Tee tili kanssa [Wit.ai](https://wit.ai/) se on ilmainen palvelu meta ¼ Ja mikä tahansa openai yhteensopiva API transkriptille. ¶ Yksi voi käyttää [groq](https://groq.com/) tai [assemblyai](https://assemblyai.com/) tai ¶ [elevenlabs](https://elevenlabs.io/) tai [syvä-](https://deepgram.com/) tai [sarvam](https://sarvam.ai/). |

## PostHogin Käyttöoikeustiedot

Käytä projektin tunnusta **omasta** PostHog projektista (**Projektin asetukset → Projektin API-avain**). Älä käytä uudelleen tunnusta tästä dokumentaatiosta: tapahtumia, jotka on lähetetty jaetun tunnuksen avulla jonkun toisen projektissa, joten sen oivallukset, hälytykset ja ilmoitukset eivät ole sinun lukea.

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

![Botti asetukset](https://i.ibb.co/jP5tgcJH/image.png)
