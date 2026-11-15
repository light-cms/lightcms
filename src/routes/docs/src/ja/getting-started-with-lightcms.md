---
title: はじめに
serial: 1
date: 2026-09-01T16:44:00Z
draft: false
tags:
  - lightcms
  - cms
  - git
  - ssg
  - static
  - サイト
  - ジェネレーター|ジェネレーター
keywords:
  - lightcms
  - 始めよう
  - 紹介
  - wysiwyg
  - markdown
  - git based
---

[LightCMS](https://www.lightcms.me) は、静的サイト用の Git-backed エディタです。リッチエディタに書き込み、パブリッシュを押して、 [LightCMS](https://www.lightcms.me) がリポジトリにマークダウンを削除することを約束します。デプロイパイプライン(Cloudflare Pages, Netlify, Vercel, GitHub Pages)はそこから取っていきます。

コンテンツは、既に使用している静的サイトジェネレータによって読み取り可能で展開可能なプレーンな Markdown ファイルとして、独自の Git リポジトリに保存されます。

## 仕組み

1. GitHub アカウントでサインインします。
2. 静的サイトを含むリポジトリを接続します。 Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — Markdown を読むものは何でも。
3. 内蔵エディタでコンテンツを書き、編集します。端末に触れることなく、投稿の作成、既存の投稿の編集、画像のアップロード、フロントマテリアルのフィールドに入力します。
4. 公開してください。 [LightCMS](https://www.lightcms.me) は、リポジトリルートの `content/blog/my-post.md` のように、設定したパスにコンテンツをコミットします。
5. ビルドパイプラインは自動的にデプロイされます。投稿は、ホストによって異なり、1〜2分以内にライブです。

それが完全なループです。 [LightCMS](https://www.lightcms.me) は書き込み中にのみ実行されます。読者はCDNによって提供され、 [LightCMS](https://www.lightcms.me) ではありません。

## エディタにあるもの

**TipTapベースのリッチエディタ** — フロントマターでクリーンマークダウンを書き込みます。あなたが見るものは、コミットされるものです。 `.md` ファイルを開いてHTMLタグのスープを見つけたことがあれば、これが代替案です。

**AI copilot** — 任意の OpenAI 互換の API に接続しました。段落が着陸しない場合に便利です:言葉を締めたり、ポイントを拡大したり、中途半端な考えを捨てたドラフトを拾ったりするように頼みます。

**Voice-to-text** — Whisper互換のトランスクリプションAPIまたはWit.aiを使用してエディタに直接指示します。入力が考え方に入ったときに、厄介な最初のドラフトをすばやく下げるのに良い。

**ライトテーマとダークテーマ** — 長いセッションでエディタが快適に書き込めるように、いくつかのテーマオプション。

**ニュースレター自動化** — 投稿を公開し、購読者に [Newsy](/docs/newsletter-newsy) を介して自動的に通知します。サードパーティのニュースレターサービスは必要ありません。

## [LightCMS](https://www.lightcms.me) が行わないこと

それはあなたの内容を催したり、あなたの読者に役立たない、そしてそれは設計によってである。 WordPressや幽霊から来ている場合は、CMSがホストであることはあなたが慣れているものです。 [LightCMS](https://www.lightcms.me) は、インフラストラクチャではなく、ライティングツールです。静的サイトジェネレータが出力をビルドし、ホスティングプロバイダがそれを提供し、すべてのファイルを所有します。エディタ、ジェネレータ、またはホストを切り替えることは、データベースを移行することを意味しません。

デプロイの設定も置き換えられません。それはあなたがすでに持っているどんなパイプラインでも動作します。

## 次のステップ

- [なぜLightCMSなのか？](/docs/why-lightcms) — Gitに裏付けられたパブリッシングの設計理念
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [LightCMS](/docs/self-hosting-lightcms) — 独自のプライベートインスタンスを実行
- [ニュースレター自動化](/docs/newsletter-newsy) — Newsyで自動的に購読者に投稿を送る
- [Building a greener web](/docs/building-a-greener-web) — why static publishing is the lower-carbon choice
