---
title: 一. 导言
serial: 1
date: 2026-09-01T16:44:00Z
draft: false
tags:
  - 闪光
  - 厘米
  - git
  - ssg
  - 静态的
  - 站点
  - 生成器
keywords:
  - 闪光
  - 开始使用
  - 一. 导言
  - wysiwyg
  - markdown
  - 基于 git
---

[LightCMS](https://www.lightcms.me) 是一个用于静态站点的Git支持编辑器。您写入了一个丰富的编辑器，点击发布和 [LightCMS](https://www.lightcms.me) 将干净的Markdown 提交给您的资源库。你的部署管道——Cloudflare页面、Netlify、Vercel、GitHub 页面——取自那里。

您的内容作为普通Markdown文件存放在您自己的 Git 仓库中，您已经使用的任何静态站点生成器都可以读取和部署。

## 它的工作方式

1. 使用您的 GitHub 帐户登录。
2. 连接包含您静态站点的存储库。 Astro, Hugo, SvelteKit, Jekyl, Next.js, Eleventy - 任何读取Markdown的东西。
3. 在内置编辑器中写入和编辑内容。创建帖子，编辑现有的帖子，上传图像，填写前事项字段而不触摸终端。
4. 点击发布 [LightCMS](https://www.lightcms.me) 将您的内容提交到您配置的路径 — — 例如， `content/blog/my-post.md` 在您的资源库根目录中。
5. 你的构建管道自动部署。帖子在一两分钟内生活，取决于您的主机。

这是整个循环。 [LightCMS](https://www.lightcms.me) 只在您写入时运行。 Readers are served by your CDN, not by [LightCMS](https://www.lightcms.me).

## 编辑器中的内容

**基于 Tapp 的丰富编辑器** — 写干净的Markdown 头部事项。你们看到的是做了什么。如果您已经打开了一个 `.md` 文件并找到了一个 HTML 标签的灵魂，这是一个替代办法。

**AI copilot** — 连接到任何 OpenAI兼容的 API。当一个段落没有着陆时很有用：请它紧缩措辞，扩展一个点，或者收回你放弃中点的草案。

**语音对文本** — 使用任何与Whisper兼容的翻译 API 或Wit.ai直接指向编辑器。当打字妨碍思考时，很好能够很快得到一条消息的初稿。

**浅暗主题** — — 几个主题选项让编辑器在较长的写入会话中感到舒适。

**Newsletter automation** — publish a post and notify subscribers automatically via [Newsy](/docs/newsletter-newsy). 无需第三方通讯服务。

## [LightCMS](https://www.lightcms.me) 没有做什么

它不包含您的内容，也不为您的阅读者服务，这是设计的。如果你来自WordPress或Ghost, 你作为主机的 CMS 就是你习惯的。这里的关系不同： [LightCMS](https://www.lightcms.me) 是一个书写工具，不是基础结构。您的静态站点生成器构建输出、您的托管提供商服务并且您拥有每个文件。切换编辑器、生成器或主机并不意味着迁移数据库。

它也没有替换您的部署设置。它与你已有的管道一起工作。

## 今后的步骤

- [Why LightCMS?](/docs/why-lightcms) — the design philosophy behind Git-backed publishing
- [如何启动博客](/docs/how-to-start-a-blog) - 选择一个模板并从零到发布
- [自托管LightCMS](/docs/self-hosting-lightcms) — 运行您自己的私人实例
- [Newsletter automation](/docs/newsletter-newsy) — send posts to subscribers automatically with Newsy
- [建立一个绿色的网页](/docs/building-a-greener-web) - 为什么静态发布是低碳选择
