---
title: Introducción
serial: 1
date: 2026-09-01T16:44:00Z
draft: falso
tags:
  - luces
  - cms
  - git
  - ssg
  - estático
  - sitio
  - generador
keywords:
  - luces
  - iniciando
  - introducción
  - wysiwyg
  - markdown
  - basado en git
---

[LightCMS](https://www.lightcms.me) es un editor respaldado por Git para sitios estáticos. Escribe en un editor enriquecido, pulsa en Publicar y [LightCMS](https://www.lightcms.me) compromete a limpiar Markdown en tu repositorio. Su pipeline de despliegue — Cloudflare Pages, Netlify, Vercel, GitHub Pages — la toma de allí.

Su contenido vive en su propio repositorio Git como archivos Markdown planos, legibles e implementables por cualquier generador estático de sitios que ya está utilizando.

## Cómo funciona

1. Inicia sesión con tu cuenta de GitHub.
2. Conecte el repositorio que contiene su sitio estático. Astro, Hugo, SvelteKit, Jekyll, Next.js, enty — cualquier cosa que lea Markdown.
3. Escriba y edite contenido en el editor incorporado. Crea mensajes, edita las existentes, sube imágenes y rellena los campos de la materia principal sin tocar una terminal.
4. Pulsar publicar. [LightCMS](https://www.lightcms.me) compromete su contenido a la ruta que ha configurado, por ejemplo, `content/blog/my-post.md` en la raíz de su repositorio.
5. Tu pipeline de construcción se despliega automáticamente. El mensaje está en vivo dentro de un minuto o dos, dependiendo de tu anfitrión.

Ese es el bucle completo. [LightCMS](https://www.lightcms.me) solo se ejecuta mientras está escribiendo. Los lectores son servidos por su CDN, no por [LightCMS](https://www.lightcms.me).

## Qué hay en el editor

**TipTap-based rich editor** — writes clean Markdown with front matter. Lo que ves es lo que se compromete. Si alguna vez has abierto un archivo `.md` y has encontrado una sopa de etiquetas HTML, esta es la alternativa.

**AI copilot** — conectado a cualquier API compatible con OpenAI. Útil cuando un párrafo no aterriza: pídele que apriete la palabra, amplíe un punto o recoja un borrador que abandonaste a medias.

**Voice a texto** — dicta directamente al editor usando cualquier API de transcripción de Whisper-compatible o Wit.ai. Bueno para conseguir un borrador desordenado rápidamente cuando escribir se interpone en el modo de pensar.

**Temas claros y oscuros** — varias opciones de tema para que el editor se sienta cómodo durante largas sesiones de escritura.

**Automatización de boletines** — publicar una publicación y notificar automáticamente a los suscriptores a través de [Newsy](/docs/newsletter-newsy). No se requiere un servicio de boletines de terceros.

## Qué [LightCMS](https://www.lightcms.me) no hace

No contiene su contenido o sirve a sus lectores, y eso por diseño. Si usted viene de WordPress o Ghost, el CMS ser el anfitrión es a lo que estás acostumbrado. Aquí la relación es diferente: [LightCMS](https://www.lightcms.me) es una herramienta de escritura, no una infraestructura. Su generador de sitio estático construye la salida, su proveedor de alojamiento la sirve, y usted posee cada archivo. Cambiar editores, generadores o hosts no significa migrar una base de datos.

Tampoco reemplaza tu configuración de implementación. Funciona con cualquier tubería que ya tenga.

## Siguientes pasos

- [¿Por qué LightCMS?](/docs/why-lightcms) — la filosofía de diseño detrás de la publicación respaldada por Git
- [Cómo iniciar un blog](/docs/how-to-start-a-blog) — elige una plantilla y ve de cero a publicado
- [LightCMS](/docs/self-hosting-lightcms) auto-alojamiento: ejecuta tu propia instancia privada
- [Automatización de boletines](/docs/newsletter-newsy) — envía mensajes a los suscriptores automáticamente con Newsy
- [Building a greener web](/docs/building-a-greener-web) — why static publishing is the lower-carbon choice
