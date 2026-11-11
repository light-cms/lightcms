---
title: Αυτοεξυπηρετούμενο LightCMS
description: Οδηγός για την αυτο-φιλοξενία LightCMS, που καλύπτει το GitHub App, PostgreSQL, μεταβλητές περιβάλλοντος, προαιρετικά AI, CDN και ηλεκτρονικού ταχυδρομείου, και την ανάπτυξη στην άκρη.
serial: 4
section: Ας Αρχίσουμε
badge: Ανάπτυξη
date: 2026-09-18T01:45:00Z
draft: ψευδές
tags:
  - selfhost
  - ελαφριά
  - postgresql
  - εγκατάσταση
keywords:
  - ελαφριά
  - probot
  - αυτο-φιλοξενία
  - github_app
  - vercel
  - sveltekit
preview: /og-image.png
---

Θέλετε LightCMS πλήρως υπό τον έλεγχό σας? Το LightCMS είναι μια εφαρμογή [SvelteKit](https://svelte.dev) , ώστε να μπορεί να αναπτυχθεί οπουδήποτε, υποστηριζόμενη από μια βάση δεδομένων PostgreSQL και μια εφαρμογή GitHub (Octokit). Το περιεχόμενό σας δεν αφήνει ποτέ τα δικά σας αποθετήρια GitHub.

Αυτός ο οδηγός σας περπατά μέσα από όλα όσα χρειάζεστε για να εκτελέσετε το δικό σας στιγμιότυπο: δημιουργία της εφαρμογής GitHub, παροχή PostgreSQL, ρύθμιση μεταβλητών περιβάλλοντος και ανάπτυξη.

## Πώς τα κομμάτια ταιριάζουν μαζί

| Συστατικό              | Σκοπός                                                                                | Απαιτείται                         |
| ---------------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| PostgreSQL             | Αποθηκεύει χρήστες, συνεδρίες, κλειδιά πρόσβασης και εγκαταστάσεις GitHub             | Ναι                                |
| GitHub App             | Διαβάζει και γράφει περιεχόμενο στα αποθετήρια σας και υπογράφει χρήστες με το GitHub | Ναι                                |
| Πάροχος SMTP           | Στέλνει μηνύματα ηλεκτρονικού ταχυδρομείου σύνδεσης μαγικού συνδέσμου                 | Ναι, για σύνδεση μαγικού συνδέσμου |
| API συμβατό με OpenAI- | Εξουσίες το AI Copilot                                                                | Προαιρετικό                        |
| API Ομιλίας-κειμένου   | Τροφοδοσία λεξικής φωνής                                                              | Προαιρετικό                        |
| Εικόνα CDN             | Φιλοξενεί εικόνες που φορτώθηκαν στον επεξεργαστή                                     | Προαιρετικό                        |
| PostHog                | Αναλυτικά στοιχεία προϊόντων και παρατηρούμενη τεχνητή νοημοσύνη                      | Απαιτείται μόνο σε ανάπτυξη        |

## Προϋποθέσεις

- **[mise](https://mise.jdx.dev)**: εγκαθιστά και διαχειρίζεται εξαρτήσεις εργασιών. Αυτός ο οδηγός υποθέτει ότι τον έχετε εγκαταστήσει.
- **PostgreSQL**: μια βάση δεδομένων που δέχεται συνδέσεις TLS. Πάροχοι Cloud όπως [Neon](https://neon.tech), [Supabase](https://supabase.com) ή [Nile](https://thenile.dev) λειτουργούν καλά. Δείτε [φοβερές ταχυδρομικές αποστολές](https://github.com/alexeyfv/awesome-free-postgres) για δωρεάν επιλογές.
- **GitHub λογαριασμός**: απαιτείται για την εγγραφή της εφαρμογής GitHub.
- **πάροχος SMTP** (για μαγικούς συνδέσμους): Εάν έχετε έναν τομέα, [Επαναποστολή](https://resend.com) είναι μια καλή επιλογή. Διαφορετικά, χρησιμοποιήστε το [Zoho Mail](https://www.zoho.com/mail) και δημιουργήστε έναν κωδικό πρόσβασης εφαρμογής.

> **TLS είναι υποχρεωτικό.** Η εφαρμογή συνδέεται με PostgreSQL με `ssl: "require"`. Μια τοπική παρουσία PostgreSQL χωρίς ενεργοποιημένο TLS θα απορριφθεί, οπότε χρησιμοποιήστε μια φιλοξενούμενη βάση δεδομένων ή ρυθμίστε το TLS στο δικό σας διακομιστή.

## 1. Πιρούνι το αποθετήριο και εγκατάσταση εξαρτημάτων

Κλωνοποίηση του αποθετηρίου και εγκατάσταση εξαρτήσεων:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

Το LightCMS χρησιμοποιεί μια εφαρμογή GitHub για δύο πράγματα: υπογραφή χρηστών με το GitHub (OAuth), και ενεργώντας για λογαριασμό σας μέσω εγκαταστάσεων. Μπορείτε να το δημιουργήσετε με τον ενσωματωμένο οδηγό εγκατάστασης Probot ή με το χέρι.

### Επιλογή A: Οδηγός εγκατάστασης Probot

ξεκινήστε το bot με:

```bash
mise run bot
```

Χωρίς διαπιστευτήρια σε `.env`, το Probot ξεκινά έναν διακομιστή εγκατάστασης στο `http://localhost:3000`:

1. Ανοίξτε `http://localhost:3000` και κάντε κλικ στο στοιχείο **Εγγραφή εφαρμογής GitHub**.
2. Επιλέξτε τον προσωπικό σας λογαριασμό ή έναν οργανισμό.
3. Επιβεβαίωση. Το Probot δημιουργεί την εφαρμογή και γράφει τα διαπιστευτήριά του στο αρχείο `.env`.

Ο οδηγός ορίζει το URL της εφαρμογής σε ένα κανάλι Smee (ή `http://localhost:3000/`), όχι στο τελικό σημείο του LightCMS's webhook . Ενημερώστε το στις ρυθμίσεις της εφαρμογής GitHub πριν μεταβείτε ζωντανά (βλ. [Ανάπτυξη παραγωγής](#6-production-deployment)).

### Επιλογή Β: Χειροκίνητη ρύθμιση

Δημιουργήστε την εφαρμογή σε **Ρυθμίσεις GitHub → Ρυθμίσεις προγραμματιστή → Εφαρμογές GitHub → Νέα εφαρμογή GitHub** με αυτές τις τιμές:

| Ρύθμιση             | Τιμή                                                                |
| ------------------- | ------------------------------------------------------------------- |
| Url Αρχικής Σελίδας | `◆ ://<your-domain>`                                          |
| Callback URL        | `https://<your-domain>/api/auth/callback/github`              |
| Setup URL           | `◆ ://<your-domain>/github/setup`                             |
| URL Webhook         | `◆ ://<your-domain>/api/github/webhook`                       |
| Μυστικό Webhook     | Ένα τυχαίο μυστικό (βλ. [Δημιουργία μυστικών](#generating-secrets)) |

## Δικαιώματα χώρου αποθήκευσης

| Άδεια                    | Πρόσβαση            | Χρησιμοποιείται για                                    |
| ------------------------ | ------------------- | ------------------------------------------------------ |
| `Περιεχόμενα`            | Διαβάστε και γράψτε | Ανάγνωση και δέσμευση αρχείων περιεχομένου             |
| `Θέματα`                 | Διαβάστε και γράψτε | Επανεξέταση σχολίων και ετικετών σε pull requests      |
| `Αιτήματα έλξης`         | Μόνο για ανάγνωση   | Καταχώρηση των αρχείων που άλλαξαν σε μια αίτηση έλξης |
| `Καταχώριση καταστάσεων` | Διαβάστε και γράψτε | Αναφορά επικύρωσης περιεχομένου σε ωθήσεις             |
| `Μεταδεδομένα`           | Μόνο για ανάγνωση   | Υποχρεωτική για κάθε εφαρμογή GitHub                   |

**Εγγραφείτε σε γεγονότα:** `Push` και `Αίτημα έλξης`. Τα γεγονότα εγκατάστασης παραδίδονται αυτόματα στο GitHub Apps.

Μετά τη δημιουργία της εφαρμογής, σημειώστε το **App ID**, δημιουργήστε ένα μυστικό πελάτη ****, and create and download a **private key** (`. em`).

## 3. Ρύθμιση μεταβλητών περιβάλλοντος

Δημιουργήστε ένα αρχείο `.env` στη ρίζα του έργου. Το αποθετήριο δεν στέλνει ένα χρήσιμο αρχείο παραδειγμάτων, οπότε χρησιμοποιήστε την παρακάτω αναφορά.

### Απαιτείται

```bash
# -------------------------------------------------------------------------------------------
# Ταυτοποίηση (Better Auth)
# ---------------------------------------------------------------------------
BETTER_Hep_SECRET="<output of: openssl rand -hex 32>"
# Δημόσια URL αυτής της παρουσίας. Πρέπει να ταιριάζει με την επίσκεψη των χρηστών URL.
BETTER_Last_URL="http://localhost:5173"

# -----------------------------------------------------------------------------------
# Βάση Δεδομένων (PostgreSQL, απαιτείται TLS)
# ---------------------------------------------------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# ---------------------------------------------------------------------------
# GitHub App
# ---------------------------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
```

`GITHUB_PRIVATE_KEY` είναι το πλήρες περιεχόμενο PEM. Κρατήστε τα διαλείμματα γραμμής και τυλίξτε την τιμή σε διπλά εισαγωγικά, το οποίο είναι το πώς ο οδηγός Probot το γράφει.

### Απαιτείται για την ανάπτυξη

Το LightCMS αναφέρει αναλυτικά και σφάλματα σε [PostHog](https://posthog.com). Όταν λείπουν τα πλήκτρα, η εφαρμογή **πετάει στην ανάπτυξη** για να σταματήσει τα γεγονότα να πέφτουν σιωπηλά. Στην παραγωγή είναι προαιρετικά και η τηλεμετρία παραλείπεται όταν δεν έχουν ρυθμιστεί.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### Email: απαιτείται για την είσοδο μαγικού συνδέσμου

Οι Magic links αποστέλλονται μέσω SMTP με [Nodemailer](https://nodemailer.com). Η αποστολή αποτυγχάνει με σφάλμα ρύθμισης όταν λείπει `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` ή `MAIL_FROM`.

```bash
MAIL_HOST="smtp.resend.com"
# Από προεπιλογή είναι 587 όταν παραλειφθεί
MAIL_PORT="465"
# "true", "1", "yes" ή "on" ενεργοποιεί έμμεσα TLS. Όταν παραλειφθεί, το TLS είναι ενεργοποιημένο μόνο για τη θύρα 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Προαιρετικό: AI Copilot

Το Copilot χρησιμοποιεί οποιοδήποτε API συμπληρωμάτων συνομιλίας συμβατό με OpenAI. Και οι τρεις μεταβλητές είναι απαραίτητες για να λειτουργήσει.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Κάθε πάροχος που εκθέτει ένα OpenAI συμβατό API λειτουργεί, για παράδειγμα [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) ή [NVIDIA NIM](https://build.nvidia.com).

### Προαιρετικό: λεξική σε κείμενο

Το LightCMS υποστηρίζει δύο συστήματα υποστήριξης απομαγνητοφώνησης. Όταν και οι δύο έχουν ρυθμιστεί, χρησιμοποιείται το σύστημα υποστήριξης συμβατό με OpenAI.

**OpenAI συμβατή μεταγραφή.** Επιλέγεται όταν έχει οριστεί `SPEECH_API_KEY` και χρειάζεται επίσης `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# Βασικό URL του παρόχου. Παραχωρήστε το να χρησιμοποιήσετε το OpenAI προεπιλογή.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Σημείο `SPEECH_ENDPOINT` σε κάθε πάροχο που εφαρμόζει το API `/ήχου/μεταγραφές` , και ορίστε `SPEECH_MODEL` σε ένα μοντέλο που προσφέρει ο πάροχος. Ένα ρυμουλκούμενο `/audio/transcriptions` στο τελικό σημείο αφαιρείται αυτόματα.

**[Wit.ai](https://wit.ai)** χρησιμοποιείται όταν δεν έχει οριστεί `SPEECH_API_KEY`

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

Αν δεν έχει ρυθμιστεί, η υπαγόρευση δεν είναι διαθέσιμη.

### Προαιρετικά: μεταφορτώσεις εικόνας (CDN)

Εικόνες που επικολλήθηκαν ή μεταφορτώθηκαν στον επεξεργαστή αποστέλλονται σε ένα API αποστολής συμβατό με [Chevereto](https://chevereto.com). Φιλοξενούμενες επιλογές περιλαμβάνουν [FreeImage.host](https://freeimage.host) και [ImgBB](https://imgbb.com), ή μπορείτε να εκτελέσετε το δικό σας Chevereto instance.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` αποστέλλεται ως παράμετρος ερωτήματος `` εκτός αν το `CDN_URL` περιέχει ήδη μία. Εάν η μεταφόρτωση αποτύχει ή οι μεταβλητές δεν έχουν οριστεί, Το LightCMS επιστρέφει στην ενσωμάτωση της εικόνας στο έγγραφο ως base64 `δεδομένα:` URL. This works, but it makes your Markdown files much larger, so configure a CDN for real use.

### Τοπική Προώθηση Webhook (Μόνο Για Ανάπτυξη)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Αυτό διαβάζεται από το Probot, όχι από την εφαρμογή SvelteKit. Βλέπε [Έλεγχος webhooks τοπικά](#testing-webhooks-locally).

### Δημιουργία μυστικών

Χρησιμοποιήστε οποιοδήποτε από αυτά για να δημιουργήσετε `BETTER_Galax_SECRET` και `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# ή
κόμβος -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Ρύθμιση της βάσης δεδομένων

Το LightCMS χρησιμοποιεί το [Drizzle ORM](https://orm.drizzle.team). The schema lives in `src/lib/server/db/schema.ts`, and migrations are generated into the `drizzle` directory. Με `DATABASE_URL` που ορίσατε, εφαρμόστε τις μεταναστεύσεις:

```bash
bun τρέξιμο db:migrate
```

Κατά τη διάρκεια της τοπικής ανάπτυξης μπορείτε αντ' αυτού να ωθήσετε το σχήμα κατευθείαν στη βάση δεδομένων, χωρίς αρχεία μετανάστευσης:

```bash
bun τρέξιμο db:push
```

Άλλα σενάρια βάσης δεδομένων:

| Εντολή                    | Περιγραφή                                                          |
| ------------------------- | ------------------------------------------------------------------ |
| `bun τρέξιμο db:generate` | Δημιουργήστε μια μετάβαση μετά την επεξεργασία του σχήματος        |
| `bun τρέξιμο db:studio`   | Περιηγηθείτε και επεξεργαστείτε τα δεδομένα σας στο Drizzle Studio |

## 5. Εκτέλεση τοπικά

```bash
εκτέλεση bun dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![λεπτομερή δικαιώματα](https://i.ibb.co/0p7tk88V/image.png)

Το LightCMS είναι τώρα διαθέσιμο στο `http://localhost:5173`. Ορίστε `BETTER_AID_URL` σε αυτή τη διεύθυνση και συνδεθείτε με το GitHub για πρώτη φορά.

### Έλεγχος webhooks τοπικά

Το GitHub δεν μπορεί να παραδώσει webhooks στο `localhost`, επομένως να τα προωθήσει μέσω του [smee.io](https://smee.io):

1. Δημιουργήστε ένα κανάλι στο [smee.io](https://smee.io) και αντιγράψτε το URL του.
2. Ορίστε `WEBHOOK_PROXY_URL` σε `.env` σε αυτό το URL.
3. Ορίστε το **Webhook URL** στις ρυθμίσεις της εφαρμογής GitHub στην ίδια διεύθυνση URL.
4. Εκτελέστε το bot σε ένα δεύτερο τερματικό:

   ```bash
   εκτέλεση bun bot:start
   ```

Το bot καταγράφει τους ίδιους χειριστές με το τελικό σημείο παραγωγής: επικύρωση περιεχομένου στο `push`, ανασκόπηση σχολίων και ετικετών σε `pull_request`, και `εγκατάσταση` καταγραφή.

## 6. Ανάπτυξη παραγωγής

Το έργο έχει ρυθμιστεί με SvelteKit, το οποίο είναι ανταγωνιστικό προμηθευτή. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) και [Cloudflare Workers](https://www.cloudflare.com/) υποστηρίζονται στόχοι ανάπτυξης από το κουτί.

1. Εισαγάγετε το αποθετήριο Git στην πλατφόρμα ανάπτυξης
2. Προσθήκη κάθε μεταβλητής περιβάλλοντος από [βήμα 3](#3-configure-environment-variables) σε **Ρυθμίσεις Έργου → Περιβάλλον Μεταβλητές**. Ορίστε `BETTER_AID_URL` στο URL παραγωγής σας.
3. Εφαρμογή.

Για να επαληθεύσετε την κατασκευή της παραγωγής τοπικά:

```bash
εκτέλεση bun build
bun εκτέλεση προεπισκόπησης
```

## Αντιμετώπιση Προβλημάτων

Κάντε ένα λογαριασμό με [Wit.ai](https://wit.ai/) είναι μια δωρεάν υπηρεσία με meta " Και κάθε openai συμβατό API για μεταγραφή. " Μπορεί κανείς να χρησιμοποιήσει [groq](https://groq.com/) ή [assemblyai](https://assemblyai.com/) ή " [elevenlabs](https://elevenlabs.io/) ή [deepgram](https://deepgram.com/) ή [sarvam](https://sarvam.ai/). |

## Πιστοποιητικά PostHog

Χρησιμοποιήστε το διακριτικό του έργου από **το δικό σας** PostHog (**Ρυθμίσεις έργου → κλειδί API έργου**). Do not reuse a token from this documentation: events sent with a shared token land in someone else's project, so its insights, alerts and notifications are not yours to read.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Διακριτικό πρόσβασης διακομιστή"
WIT_AI_CLIENT_TOKEN="διακριτικό πρόσβασης πελάτη"
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

![Διαμόρφωση bot](https://i.ibb.co/jP5tgcJH/image.png)
