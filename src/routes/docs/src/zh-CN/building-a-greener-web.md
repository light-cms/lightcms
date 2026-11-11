---
title: "静态站点和CO2：建立一个绿色网络"
description: 为什么静态网站减少碳排放，CDN缓存如何削减能源使用，以及绿色网站的形式。
date: 2026-10-14T13:30Z
draft: false
tags:
  - 可持续性
  - 静态站点
  - 绿色网络
  - 二极管
  - ssg
keywords: 闪光
preview: /og-image.png
serial: 3
---

加载页面需要花费很多钱。有时一个页面无法从缓存中加载数据库被多次打击，每个查询都使用大量能量释放公斤CO2。据说2%-4%的炼焦厂排放来自网上。

如同航空业一样，网络也可能损害地球。你所选择的布局让你显示你对地球的多么关心。分享信息的生态友好方式是一个静态站点生成器，一次构建您的站点，然后从CDN为它服务。

## 为什么静态站点Emit Carbon

每次有人交互时，要给出一个被动效果的网站，通常执行渲染工作：他们运行代码询问数据库并从服务器发送完整页面。因此，即使没有人访问，服务器也必须始终保持在线状态。

- 一个静态站点构建一次。已完成的 HTML 已复制到全世界CDN 边缘节点。从缓存中服务：

- 每个请求无需计算。服务于内建文件的能量与平面渲染页面相比非常小。

- 数据库上并非总是如此。没有服务器和数据库一直在运行。静态站点不需要服务器来运行 24/7。没有进行数据库查询，从而减少了碳排放。

- 默认缓存。命中边缘缓存的请求不会在网络连接之外移动能量。

- 小型有效载荷。来自Markdown 的 HTML 是很小的。没有重的 JavaScript 或 fat CSS 被发送到客户端。客户端总是收到文件，所以它加载得更快。

你都可能听到了这个研究 [毫秒使得数以百万计的](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

回波效果：持久性是可持续性

2016年建造的雨果项目或Astro Starlight 项目仍然可以。 2036年服务，因为内容是纯粹的Markdown，始终是及时的。整个工具链是源源和供应商中立的，输出只是文件夹和文件。

在 Git 中以Markdown 形式拥有您的内容是持久的，可以节省时间。

如何测量您的网站。碳排放

如果你不测量它，你不能改进它做什么：

- [网站 Carbon Calculator](https://www.websitecarbon.com/) - 估计每页视图排放的CO2克，并将您的网站与平均值进行比较。

- 生态降级器——率页面体验、无障碍访问、绿色托管和碳排放量估算。

- 绿色框架——模拟用户假设情景和多步骤互动，以衡量应用水平的碳足迹和能耗。

- 网页测试 — 提供深度性能诊断，同时提供碳足迹估计和核心网络Vits细目。

- 绿色网络检查器——检查托管基础设施的域名是否使用可再生能源。

- 真实用户度量表 & 核心网络Vitals — — 诸如最大内容绘画(LCP) 等度量，以及每次访问时任何新用户下载的初始捆包的全部传输。

如何构建绿色网络

1. **Serve statically from a CDN** – the way to cut energy for content sites.

2. 静态站点建造一次。然后由CDN提供服务，使它成为建立网站的最友好方式。

3. JavaScript飞船。每千字节必须读、解析、执行并存储在访客电池和带宽上。

4. Cache images. 媒体通常是一个页面的最大部分，因此通过CDN提供服务，并使用诸如WebP等现代格式。

LightCMS 适合的位置

> LightCMS正是通过这些方式工作的：

- 内容以Markdown 的形式提交到您自己的仓库， 由静态站点生成器发布，并且从您的主机提供商边缘网络中被编译成已编译的文件。

- CMS只在您写入时运行。没有生产数据库为读者服务，因为读者是CDN服务。

## 静态站点运行成本

静态站点通常更便宜，甚至免费提供宿舍。

- [GitHub Pages](https://pages.github.com/)
- [Codeberg 页面](https://codeberg.org/pages)
- [云端页面](https://pages.cloudflare.com/)
- [Vercel](https://vercel.com/)
- [网络化](https://www.netlify.com/)
- [Bitbucket 页面](https://bitbucket.org/pages)
- [渲染](https://render.com/)
- [增量](https://surge.sh/)

您甚至可以从自定义 S3 桶服务一个静态站点。
