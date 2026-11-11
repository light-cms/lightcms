---
title: مقدمة
serial: 1
date: 2026-09-01T16:44:00Z
draft: خاطئ
tags:
  - ضوضاء
  - سم
  - git
  - ssg
  - ثابت
  - الموقع
  - مولد
keywords:
  - ضوضاء
  - البدء
  - مقدمة
  - wysiwyg
  - markdown
  - Git مبني
---

[LightCMS](https://www.lightcms.me) هو محرر مدعوم بنظام Git-للمواقع الثابتة. You write in a rich editor, hit publish, and [LightCMS](https://www.lightcms.me) commits clean Markdown to your repository. خط أنابيب النشر الخاص بك - صفحات Cloudflare ، Netliy، Vercel، GitHub - تأخذه من هناك.

المحتوى الخاص بك يعيش في مستودع Git الخاص بك كملفات معتادة و قابلة للقراءة و النشر من قبل أي مولد موقع ثابت تستخدمه بالفعل.

## كيف يعمل

1. تسجيل الدخول باستخدام حساب GitHub الخاص بك.
2. قم بتوصيل المستودع الذي يحتوي على موقعك الثابت. أسترو، هوغو، سفيلتيكيت، جيكيل، نيكوس.يس، Eleventy - أي شيء يقرأ ماركداون.
3. كتابة وتحرير المحتوى في المحرر المدمج. إنشاء المشاركات الموجودة، تحرير الصور وملء حقول المادة الأمامية دون لمس طرف.
4. اضغط على النشر. [LightCMS](https://www.lightcms.me) commits your content to the path you've configured — for example, `content/blog/my-post.md` in your repository root.
5. خط أنابيب البناء الخاص بك ينتشر تلقائياً. تتم المشاركة في غضون دقيقة أو دقيقتين، اعتماداً على مضيفك.

هذه هي الحلقة الكاملة. [LightCMS](https://www.lightcms.me) only runs while you're writing. القراء يخدمهم CDN، وليس [LightCMS](https://www.lightcms.me).

## ما هو في المحرر

**TipTap-based rich editor** — writes clean Markdown with front matter. ما ترونه هو ما يتم الالتزام به. إذا كنت قد فتحت ملف `.md` ووجدت حساء من علامات HTML، هذا هو البديل.

**AI Copilot** - متصل بأي واجهة API متوافقة مع OpenAI. مفيد عندما لا تهبط فقرة ما : اطلب منها أن تضيّق الصياغة أو توسع في نقطة ما أو أن تأخذ مسودة تخلت عنها في منتصف الفكر

**صوت إلى نص** - تملي مباشرة على المحرر باستخدام أي API نسخ متوافقة مع Whisper، أو Wit.ai. جيد لإسقاط أول مسودة فوضوية بسرعة عندما يتحول الطباعة إلى طريق التفكير.

**الإضاءة و المظلمة** - العديد من خيارات الموضوع حتى يكون المحرر مريحا خلال جلسات الكتابة الأطول.

**أتمتة النشرة الإخبارية** - نشر منشور وإبلاغ المشتركين تلقائياً عبر [Newsy](/docs/newsletter-newsy). لا حاجة إلى خدمة النشرة الإخبارية لطرف ثالث.

## ما لا يفعله [LightCMS](https://www.lightcms.me)

إنها لا تستضيف محتوياتك أو تخدم قراءتك، وهذا عن طريق التصميم. إذا كنت قادماً من WordPress أو Ghost، فإن نظام CMS هو ما اعتدت عليه. هنا العلاقة مختلفة: [LightCMS](https://www.lightcms.me) هي أداة كتابة، وليس بنية تحتية. منشئ الموقع الثابت الخاص بك يبني المخرج، موفر الاستضافة الخاص بك يخدمه، وتملك كل ملف. تبديل المحررين أو المولدات أو المضيفين لا يعني ترحيل قاعدة بيانات.

كما أنه لا يحل محل إعداد النشر الخاص بك. إنها تعمل مع أي خط أنابيب لديك بالفعل.

## الخطوات التالية

- [لماذا LightCMS؟](/docs/why-lightcms) - فلسفة التصميم وراء النشر المدعوم من Git
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [الاستضافة الذاتية LightCMS](/docs/self-hosting-lightcms) - قم بتشغيل المثيل الخاص بك
- [Newsletter automation](/docs/newsletter-newsy) — send posts to subscribers automatically with Newsy
- [بناء ويب أخضر](/docs/building-a-greener-web) - لماذا النشر الثابت هو الخيار الأقل كربون
