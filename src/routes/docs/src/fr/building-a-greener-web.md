---
title: "Sites statiques et CO2 : Construire un Web plus vert"
description: Pourquoi les sites statiques émettent moins de carbone, comment la mise en cache de CDN réduit la consommation d'énergie et à quoi ressemble un web plus vert.
date: 2026-10-14T13:30:00Z
draft: Faux
tags:
  - durabilité
  - sites statiques
  - Toile verte
  - co2
  - ssg
keywords: lightcms
preview: /og-image.png
serial: 3
---

Le chargement d'une page coûte cher. Parfois, une page échoue à charger à partir du cache la base de données est frappée plusieurs fois et chaque requête utilise beaucoup de puissance émettant des kilogrammes de CO2. On dit que de 2 à 4 % des émissions de co2 proviennent de l'internet.

Comme l'industrie aérienne, le web peut nuire à la planète. La mise en page que vous choisissez vous permet de montrer combien vous vous souciez de la Terre. La façon écologique de partager des informations est un générateur de site statique qui construit votre site une fois puis le sert à partir d'un CDN.

## Pourquoi les sites statiques avec du carbone

Pour donner un effet réactif, les sites effectuent généralement le travail de rendu chaque fois que quelqu'un interagit : ils exécutent du code demander à la base de données et envoyer une page complète à partir du serveur. Ainsi, le serveur doit rester en ligne tout le temps, même lorsque personne ne visite.

- Un site statique se construit une fois. Le HTML fini est copié vers les noeuds de bord CDN dans le monde entier. Servi à partir de la cache:

- Aucun calcul nécessaire pour chaque requête. Servir un fichier construit consomme très peu d'énergie par rapport au rendu d'une page à la volée.

- Pas toujours sur les bases de données. Aucun serveur ni base de données ne fonctionne en permanence. Les sites statiques n'ont pas besoin d'un serveur pour fonctionner 24/7. Aucune requête de base de données n'est faite, ce qui entraîne une réduction des émissions de carbone.

- Cache par défaut. Une requête qui touche un cache de bord ne déplace aucune énergie au-delà du saut réseau.

- Petits blocs. Le HTML fabriqué à partir de Markdown est minuscule. Aucun JavaScript ou CSS gras n'est envoyé au client. Le client reçoit toujours le fichier pour qu'il se charge plus rapidement.

Vous avez tous peut-être entendu l'étude [millisecondes faire des millions](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

L'effet d'ondulation: La durabilité est la durabilité

Un projet Hugo ou Astro Starlight réalisé en 2016 peut encore l'être. Servi en 2036 parce que le contenu est simple Markdown, qui reste intemporel. Toute la chaîne de compilation est source et neutre pour le vendeur, et la sortie n'est que des dossiers et des fichiers.

Posséder votre contenu en tant que Markdown in Git est durable et permet de gagner du temps.

Comment mesurer vos sites Web en carbone

Vous ne pouvez pas améliorer ce que vous faites si vous ne le mesurez pas:

- [Website Carbon Calculator](https://www.websitecarbon.com/) – estime les grammes de CO2 émises par page et compare votre site avec la moyenne.

- Eco grader – évalue l’expérience de la page, l’accessibilité, l’hébergement vert et les estimations des émissions de carbone.

- Cadre vert – simule les scénarios utilisateur et les interactions multiétapes pour mesurer l'empreinte carbone et la consommation d'énergie au niveau de l'application.

- WebPage Test – fournit des diagnostics de performance en profondeur en plus des estimations de l'empreinte carbone et des pannes Web Vitals du noyau.

- Vert Web Checker – vérifie si un domaine d'infrastructure d'hébergement fonctionne avec des énergies renouvelables.

- Les métriques & Core Web Vitals – des métriques comme la plus grande peinture de contenu (LCP) et le transfert total du paquet initial téléchargé par tout nouvel utilisateur à chaque visite.

Comment construire un Web plus vert

1. **Serve statically from a CDN** – the way to cut energy for content sites.

2. Les sites statiques sont construits une fois. Puis servi à partir d'un CDN ce qui en fait la façon la plus écologique de construire un site Web.

3. JavaScript du vaisseau. Chaque kilo-octets doit être lu, analysé, exécuté et stocké sur la batterie et la bande passante des visiteurs.

4. Cache images. Les médias sont en général la plus grande partie d'une page, alors servez-les à travers le CDN et utilisez des formats modernes comme WebP.

Où LightCMS s'adapte

> LightCMS fonctionne, exactement de cette manière:

- Le contenu est livré en tant que Markdown dans votre propre dépôt, publié par un générateur de site statique et servi sous forme de fichiers minifiés compilés à partir de votre réseau de fournisseurs d'hébergement.

- Le CMS ne fonctionne que pendant que vous écrivez. Aucune base de données de production ne sert les lecteurs parce que les lecteurs sont servis par un CDN.

## Coût des sites statiques en cours d'exécution

Les sites statiques sont généralement moins chers ou même libres d'hébergement.

- [GitHub Pages](https://pages.github.com/)
- [Pages Codeberg](https://codeberg.org/pages)
- [Pages de la fusée éclairante nuageuse](https://pages.cloudflare.com/)
- [Collier](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Pages Bitbucket](https://bitbucket.org/pages)
- [Rendu](https://render.com/)
- [poussée](https://surge.sh/)

Vous pouvez même servir un site statique à partir d'un seau S3 personnalisé.
