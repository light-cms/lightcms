---
title: Introduction
serial: 1
date: 09.09.2026T16:44:00Z
draft: Faux
tags:
  - lightcms
  - cms
  - git
  - ssg
  - statique
  - site
  - générateur
keywords:
  - lightcms
  - débuter
  - introduction
  - wysiwyg
  - markdown
  - basé sur git
---

[LightCMS](https://www.lightcms.me) est un éditeur géré par Git pour les sites statiques. Vous écrivez dans un éditeur riche, cliquez sur Publier et [LightCMS](https://www.lightcms.me) communique le nettoyage de Markdown dans votre dépôt. Votre pipeline de déploiement — Cloudflare Pages, Netlify, Vercel, GitHub Pages — le prend de là.

Votre contenu réside dans votre propre dépôt Git en tant que fichiers Markdown simples, lisibles et déployables par n'importe quel générateur de site statique que que vous utilisez déjà.

## Comment ça marche

1. Connectez-vous avec votre compte GitHub.
2. Connectez le référentiel qui contient votre site statique. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — tout ce qui lit Markdown.
3. Écrire et éditer le contenu dans l'éditeur intégré. Créez des publications, modifiez des messages existants, téléchargez des images et remplissez les champs de la matière première sans toucher à un terminal.
4. Appuyer sur publier. [LightCMS](https://www.lightcms.me) communique votre contenu dans le chemin que vous avez configuré — par exemple, `content/blog/my-post.md` à la racine de votre dépôt.
5. Votre pipeline de construction se déploie automatiquement. Le poste est en direct dans une minute ou deux, selon votre hôte.

C'est la boucle complète. [LightCMS](https://www.lightcms.me) fonctionne uniquement pendant que vous écrivez. Les lecteurs sont servis par votre CDN, pas par [LightCMS](https://www.lightcms.me).

## Ce qui se trouve dans l'éditeur

**Editeur riche à base de TipTap** — écrit le texte de front de Markdown. Ce que vous voyez, c'est ce qui est engagé. Si vous avez déjà ouvert un fichier `.md` et trouvé une soupe de balises HTML, c'est l'alternative.

**AI copilot** — connecté à n'importe quelle API compatible OpenAI. Utile lorsqu’un paragraphe n’atterrit pas : demandez-lui de resserrer la formulation, d’élargir un point ou de ramasser un projet que vous avez abandonné au milieu de la pensée.

**Voix au texte** — dictez directement dans l'éditeur en utilisant une API de transcription compatible Whisper ou Wit.ai. Bon pour obtenir un premier brouillon désordonné rapidement lorsque la frappe entrave la réflexion.

**Thèmes clairs et sombres** — plusieurs options de thème pour que l'éditeur soit à l'aise lors de sessions d'écriture plus longues.

**Automatisation de la newsletter** — publiez un message et avertissez automatiquement les abonnés via [Newsy](/docs/newsletter-newsy). Aucun service de newsletter tiers requis.

## Ce que [LightCMS](https://www.lightcms.me) ne fait pas

Il n'héberge pas votre contenu ni ne sert vos lecteurs, et c'est par conception. Si vous venez de WordPress ou Ghost, le CMS étant l'hôte est ce que vous avez l'habitude. Ici, la relation est différente : [LightCMS](https://www.lightcms.me) est un outil d'écriture et non une infrastructure. Votre générateur de site statique construit la sortie, votre hébergeur la dessert et vous possédez chaque fichier. Changer d'éditeur, de générateur ou d'hôte ne signifie pas la migration d'une base de données.

Il ne remplace pas non plus votre configuration de déploiement. Il fonctionne avec n'importe quel pipeline que vous possédez déjà.

## Étapes suivantes

- [Why LightCMS?](/docs/why-lightcms) — the design philosophy behind Git-backed publishing
- [How to start a blog](/docs/how-to-start-a-blog) — pick a template and go from zero to published
- [Self-hosting LightCMS](/docs/self-hosting-lightcms) — exécutez votre propre instance privée
- [Automatisation de la newsletter](/docs/newsletter-newsy) - envoie automatiquement des messages aux abonnés avec Newsy
- [Building a greener web](/docs/building-a-greener-web) — why static publishing is the lower-carbon choice
