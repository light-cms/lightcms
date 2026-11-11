---
title: الإضاءة الذاتية للضوء
description: دليل الاستضافة الذاتية لـ LightCMS ، الذي يغطي تطبيق GitHub ، و PostgreSQL ، متغيرات البيئة و AI و CDN و البريد الإلكتروني الاختياري، والنشر إلى الحافة.
serial: 4
section: ابدأ
badge: نشر
date: 2026-09-18T01:45:00Z
draft: خاطئ
tags:
  - selfhost
  - ضوضاء
  - postgresql
  - النشر
keywords:
  - ضوضاء
  - بروبوت
  - الاستضافة الذاتية
  - github_app
  - فيرسيل
  - sveltekit
preview: /og-image.png
---

هل تريد أن يكون LightCMS تحت سيطرتك؟ LightCMS هو تطبيق [SvelteKit](https://svelte.dev) بحيث يمكن نشره في أي مكان، مدعوم بقاعدة بيانات PostgreSQL وتطبيق GitHub (October kit). المحتوى الخاص بك لا يترك مستودعات GitHub الخاصة بك.

هذا الدليل يمشي عليك من خلال كل ما تحتاجه لتشغيل مثيل خاص بك: إنشاء تطبيق GitHub ، توفير PostgreSQL ، تكوين متغيرات البيئة والنشر.

## كيف تتوافق القطع مع بعضها البعض

| المكون                                    | الغرض                                                                        | مطلوب                                |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| PostgreSQL                                | يخزن المستخدمين، الجلسات، مفاتيح المرور وتثبيتات GitHub                      | نعم                                  |
| GitHub App                                | يقرأ ويكتب المحتوى في المستودعات الخاصة بك، ويوقع المستخدمين باستخدام GitHub | نعم                                  |
| موفر SMTP                                 | إرسال رسائل تسجيل الدخول للرابط السحري                                       | نعم، لتسجيل الدخول إلى الرابط السحري |
| واجهة برمجة التطبيقات المتوافقة مع OpenAI | صلاحيات AI Copilot                                                           | اختياري                              |
| كلمة - نص API                             | إملاء الصوت للقوى                                                            | اختياري                              |
| صورة CDN                                  | استضافة الصور التي تم تحميلها في المحرر                                      | اختياري                              |
| PostHog                                   | تحليلات المنتجات وإمكانية رصد الذكاء الاصطناعي                               | مطلوب في التطوير فقط                 |

## الشروط المسبقة

- **[mise](https://mise.jdx.dev)**: installs and manages task dependencies. هذا الدليل يفترض أنك مثبت.
- **PostgreSQL**: قاعدة بيانات تقبل اتصالات TLS. يعمل موفري السحابة مثل [Neon](https://neon.tech)و [Supabase](https://supabase.com) أو [Nile](https://thenile.dev) بشكل جيد. انظر [aesome-Free postgres](https://github.com/alexeyfv/awesome-free-postgres) للحصول على خيارات مجانية.
- حساب **GitHub**: مطلوب لتسجيل تطبيق GitHub
- **مزود SMTP** (للروابط السحرية): إذا كان لديك نطاق، [إعادة إرسال](https://resend.com) خيار جيد. خلاف ذلك، استخدم [Zoho Mail](https://www.zoho.com/mail) وقم بإنشاء كلمة مرور تطبيق.

> **TLS إلزامي.** يتصل التطبيق بـ PostgreSQL باستخدام `ssl: "مطلوب"`. A local PostgreSQL instance without TLS enabled will be rejected, so use a hosted database or configure TLS on your own server.

## 1. إنشاء المستودع وتثبيت التبعيات

استنساخ المستودع وتثبيت التبعيات:

```bash
cd مصابيح
فرضية الثقة
فرضية
تشغيل التثبيت
```

## 2. Create the GitHub App

يستخدم LightCMS تطبيق GitHub لشيئين: تسجيل دخول المستخدمين باستخدام GitHub (OAuth)، والتصرف نيابة عنك من خلال التثبيت. يمكنك إنشاءه مع معالج إعداد بروبوت، أو باليد.

### الخيار ألف: معالج إعداد بروبوت

ابدأ بوت بواسطة:

```bash
فرضية تشغل بوت
```

بدون بيانات اعتماد في `.env`، يبدأ Probot خادم الإعداد على `http://localhost:3000`:

1. افتح `http://localhost:3000` وانقر فوق **تسجيل تطبيق GitHub**.
2. اختر حسابك الشخصي أو مؤسسة.
3. تأكيد. يقوم Probot بإنشاء التطبيق وكتابة بيانات الاعتماد الخاصة به إلى ملف `.env`.

يقوم المعالج بتعيين عنوان URL للتطبيقات على قناة Smee (أو `http://localhost:3000/`وليس على نقطة نهاية LightCMS webhook . قم بتحديثه في إعدادات تطبيق GitHub قبل الذهاب مباشرة (انظر [نشر الإنتاج](#6-production-deployment).

### الخيار باء: الإعداد اليدوي

Create the app in **GitHub Settings → Developer settings → GitHub Apps → New GitHub App** with these values:

| الإعدادات            | القيمة                                                 |
| -------------------- | ------------------------------------------------------ |
| رابط الصفحة الرئيسية | `https://<your-domain>`                          |
| Callback URL         | `https://<your-domain>/api/auth/callback/github` |
| Setup URL            | `https://<your-domain>/github/setup`             |
| رابط Webhook         | `https://<your-domain>/api/github/webhook`       |
| سر Webhook           | سر عشوائي (أنظر [توليد الأسرار](#generating-secrets))  |

## أذونات المستودع

| الصلاحية         | الوصول           | يستخدم لـ                                   |
| ---------------- | ---------------- | ------------------------------------------- |
| `المحتويات`      | القراءة والكتابة | قراءة ملفات المحتوى والالتزام بها           |
| `المشكلات`       | القراءة والكتابة | مراجعة التعليقات و التسميات على طلبات السحب |
| `طلبات السحب`    | قراءة فقط        | إدراج الملفات المتغيرة في طلب سحب           |
| `حالات الالتزام` | القراءة والكتابة | التحقق من صحة المحتوى عند الدفع             |
| `بيانات التعريف` | قراءة فقط        | إلزامية لكل تطبيق GitHub                    |

**اشترك في الأحداث:** `Push` و `اسحب طلب`. يتم تسليم أحداث التثبيت إلى تطبيقات GitHub تلقائياً.

After creating the app, note the **App ID**, generate a **client secret**, and generate and download a **private key** (`.pem`).

## 3. تهيئة متغيرات البيئة

إنشاء ملف `.env` في جذر المشروع. لا يشحن المستودع ملف مثال قابل للاستعمال، لذا استخدم المرجع أدناه.

### مطلوب

```bash
# ---------------------------------------------------------------------------
# المصادقة (مصادقة أفضل)
# --------------------------------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>
A# URL العام لهذا المثال. يجب أن تطابق زيارة مستخدمي الرابط.
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
---نهاية RSA PRIVATE KEY-----"
```

`GITHUB_PRIVATE_KEY` هو محتوى PEM الكامل. Keep the line breaks and wrap the value in double quotes, which is how the Probot wizard writes it.

### مطلوب للتطوير

يقدم LightCMS تحليلات وأخطاء إلى [PostHog](https://posthog.com). عندما تكون المفاتيح مفقودة، يرمي التطبيق **في التطوير** لإيقاف الأحداث التي يتم إسقاطها بصمت. وهي في الإنتاج اختيارية، ويتم تخطي القياس عن بعد عند عدم تعيينها.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### البريد الإلكتروني: مطلوب لتسجيل الدخول إلى الوصلة السحرية

يتم إرسال الروابط السحرية عبر SMTP مع [Nodemailer](https://nodemailer.com). فشل الإرسال مع خطأ في التكوين عندما يفتقد `MAIL_HOST`أو `MAIL_USER`أو `MAIL_PASS` أو `MAIL_FROM`.

```bash
MAIL_HOST="smtp.resend.com"
# الإعدادات الافتراضية إلى 587 عند حذف
MAIL_PORT="465"
# "true", "1", "نعم" أو "on" تمكن TLS الضمني. عند حذفه، يتم تمكين TLS فقط للمنفذ 465.
MAIL_SECURE="1"
MAIL_USER="إعادة إرسال"
MAIL_PASS="<smtp-password-or-api-key>
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### اختياري: AI Copilot

يستخدم برنامج Copilot أي محادثة متوافقة مع OpenAI-تكمل API. والمتغيرات الثلاثة جميعها ضرورية لكي يعمل الفريق.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

أي موفر يعرض واجهة برمجة تطبيقات متوافقة مع OpenAI، على سبيل المثال [OpenAI](https://platform.openai.com)و [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`أو [NVIDIA NIM](https://build.nvidia.com)

### اختياري: إملاء الكلام إلى النص

LightCMS يدعم نسختين خلفيتين. عندما يتم تكوين كليهما، يتم استخدام الخلفية المتوافقة مع OpenAI.

**تدوين متوافق مع OpenAI-** يتم اختياره عندما يتم تعيين `SPEECH_API_KEY` ويحتاج أيضًا إلى `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# URL الأساسي لمقدم الخدمة. اسمح له باستخدام الإفتراضي OpenAI.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

النقطة `SPEECH_ENDPOINT` في أي موفر يقوم بتنفيذ `/audio/transcriptions` API، وقم بتعيين `SPEECH_MODEL` إلى نموذج الذي يقدمه مقدم الخدمات. يتم تجريد المسافة `/audio/criptions` في نقطة النهاية تلقائياً.

**[Wit.ai](https://wit.ai)** يستخدم عندما لا يتم تعيين `SPEECH_API_KEY`:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>
```

إذا لم يتم تكوين أي منهما، فإن الإملاء غير متوفر.

### اختياري: تحميل الصور (CDN)

يتم إرسال الصور الملصقة أو المحملة في المحرر إلى API [Chevereto](https://chevereto.com)- المتوافقة مع التحميل. تشمل الخيارات المستضافة [FreeImage.host](https://freeimage.host) و [ImgBB](https://imgbb.com)، أو يمكنك تشغيل مثيل Chevereto الخاص بك.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

يتم إرسال `CDN_KEY` كمعلمة الاستعلام `` إلا إذا كان `CDN_URL` يحتوي على واحد بالفعل. إذا فشل الرفع أو لم يتم تعيين المتغيرات LightCMS يعود إلى تضمين الصورة في المستند كبيانات base64 `:` URL. هذا يعمل، ولكن يجعل ملفات Markdown الخاصة بك أكبر بكثير، لذا قم بتكوين CDN للاستخدام الحقيقي.

### إعادة توجيه Webhook المحلية (التطوير فقط)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

هذا يقرأه بروبوت، وليس تطبيق SvelteKit. انظر [اختبار webhooks محليا](#testing-webhooks-locally).

### توليد الأسرار

استخدم أي من هذه لإنشاء `BETTER_AUTH_SECRET` و `GITHUB_WEBHOK_SECRET`:

```bash
openssl rand -hex 32
# أو
عقدة -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. إعداد قاعدة البيانات

LightCMS يستخدم [Drizle ORM](https://orm.drizzle.team). ويعيش المخطط في `src/lib/server/db/schema.ts`، ويتم توليد الهجرات في دليل `drizle`. مع تعيين `DATABASE_URL` ، قم بتطبيق الهجرات:

```bash
لكن تشغيلdb:migate
```

خلال التنمية المحلية يمكنك بدلاً من ذلك دفع المخطط مباشرة إلى قاعدة البيانات بدون ملفات الترحيل:

```bash
جارٍ تشغيل db:push
```

البرامج النصية لقاعدة البيانات الأخرى:

| أمر                  | الوصف                                |
| -------------------- | ------------------------------------ |
| `تم تشغيل db:وليدر`  | توليد هجرة بعد تحرير المخطط(أ)       |
| `تم تشغيل db:studio` | تصفح وتحرير بياناتك في Drizle Studio |

## 5. تشغيل محليا

```bash
تشغل ديف
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![تفاصيل الأذونات](https://i.ibb.co/0p7tk88V/image.png)

LightCMS متاح الآن على `http://localhost:5173`. تعيين `BETTER_AUTH_URL` إلى هذا العنوان، وتسجيل الدخول باستخدام GitHub لأول مرة.

### اختبار webhooks محليا

لا يمكن لـ GitHub توصيل ملفات الويب إلى `localhost`، لذا قم بتوجيهها من خلال [smee.io](https://smee.io):

1. إنشاء قناة على [smee.io](https://smee.io) ونسخ عنوان URL الخاص بها.
2. تعيين `WEBHOOK_PROXY_URL` في `.env` إلى هذا الرابط.
3. عيّن عنوان URL **Webhook** في إعدادات تطبيق GitHub الخاص بك إلى نفس الرابط.
4. تشغيل البوت في محطة طرفية ثانية:

   ```bash
   تشغيل البوت:start
   ```

البوت يسجل نفس المعالجين كنقطة نهاية الإنتاج: التحقق من المحتوى على `دفع`، مراجعة التعليقات و تسميات على `Cll_request`، و `تثبيت` تسجيل الدخول.

## 6. نشر الإنتاج

تم تكوين المشروع مع SvelteKit، وهو غير مميز للبائعين. [Vercel](https://vercel.com)و [Netlify](https://www.netlify.com/) و [Cloudflare عمال](https://www.cloudflare.com/) كلها مدعومة أهداف الانتشار خارج الصندوق.

1. استيراد مستودع Git الخاص بك إلى منصة النشر.
2. إضافة كل متغير بيئة من [الخطوة 3](#3-configure-environment-variables) في **إعدادات المشروع → Environment المتغيرات**. Set `BETTER_AUTH_URL` to your production URL.
3. نشر.

للتحقق من بناء الإنتاج محليا:

```bash
جارٍ تشغيل إنشاء
bn تشغيل المعاينة
```

## استكشاف الأخطاء

قم بإنشاء حساب مع [Wit.ai](https://wit.ai/) هو خدمة مجانية من قبل Meta <unk> وأي واجهة برمجة تطبيقات مفتوحة متطابقة للنسخ الإداري. <unk> يمكن للمرء استخدام [groq](https://groq.com/) أو [assemblyai](https://assemblyai.com/) أو <unk> [format@@1. المختبرات](https://elevenlabs.io/) أو [deepgram](https://deepgram.com/) أو [sarvam](https://sarvam.ai/). |

## بيانات اعتماد PostHog

استخدم الرمز المميز للمشروع من **مشروعك** PostHog (**إعدادات المشروع → مفتاح API للمشروع**). لا تعيد استخدام الرمز من هذه الوثائق: الأحداث المرسلة مع أرض رمزية مشتركة في مشروع شخص آخر، لذا فإن رؤاه و تنبيهاته و إشعارات ليست لك للقراءة.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="رمز وصول الخادم"
WIT_AI_CLIENT_TOKEN="رمز وصول العميل
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

![تكوين البوت](https://i.ibb.co/jP5tgcJH/image.png)
