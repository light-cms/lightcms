---
title: Autoalojando LightCMS
description: Guía para LightCMS, que cubre la aplicación de GitHub, PostgreSQL, variables de entorno, IA opcional, CDN y correo electrónico, e implementando en el borde.
serial: 4
section: Empezar
badge: Desplegar
date: 2026-09-18T01:45:00Z
draft: falso
tags:
  - selfhost
  - luces
  - postgresql
  - despliegue
keywords:
  - luces
  - probot
  - auto alojamiento
  - github_app
  - vértice
  - sveltekit
preview: /og-image.png
---

¿Quieres LightCMS completamente bajo tu control? LightCMS es una aplicación [SvelteKit](https://svelte.dev) , por lo que puede ser desplegada en cualquier lugar, respaldada por una base de datos PostgreSQL y una aplicación de GitHub (kit de octubre). Su contenido nunca abandona sus propios repositorios de GitHub.

Esta guía le guiará a través de todo lo que necesita para ejecutar su propia instancia: crear la aplicación de GitHub, provisionando PostgreSQL, configurar variables de entorno y desplegar.

## Cómo encajan las piezas juntas

| Componente                | Propósito                                                               | Requerido                                    |
| ------------------------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| PostgreSQL                | Almacena instalaciones de usuarios, sesiones, claves de acceso e GitHub | Sí                                           |
| GitHub App                | Lee y escribe contenido en tus repositorios y firma usuarios con GitHub | Sí                                           |
| Proveedor SMTP            | Envía correos electrónicos de inicio de sesión de enlaces mágicos       | Sí, para inicio de sesión de enlaces mágicos |
| API compatible con OpenAI | Potenciar el Copilote de IA                                             | Opcional                                     |
| API de voz a texto        | Poder dictado de voz                                                    | Opcional                                     |
| Imagen CDN                | Imágenes de hosts cargadas en el editor                                 | Opcional                                     |
| PostHog                   | Análisis de productos y observabilidad de IA                            | Requerido sólo en el desarrollo              |

## Prerrequisitos

- **[mise](https://mise.jdx.dev)**: instala y gestiona las dependencias de tareas. Esta guía asume que la tiene instalada.
- **PostgreSQL**: una base de datos que acepta conexiones TLS. Proveedores de nube como [Neon](https://neon.tech), [Suprimir](https://supabase.com) o [Nilo](https://thenile.dev) funcionan bien. Vea [increíbles postgres](https://github.com/alexeyfv/awesome-free-postgres) para opciones gratis.
- **cuenta de GitHub**: necesario para registrar la aplicación de GitHub.
- **proveedor SMTP** (para enlaces mágicos): Si tienes un dominio, [Reenviar](https://resend.com) es una buena opción. De lo contrario, utilice [Zoho Mail](https://www.zoho.com/mail) y cree una contraseña de la aplicación.

> **TLS es obligatorio.** La aplicación se conecta a PostgreSQL con `ssl: "require"`. Una instancia local de PostgreSQL sin activar TLS será rechazada, así que utilice una base de datos alojada o configure TLS en su propio servidor.

## 1. Fork las dependencias del repositorio e instalación

Clonar el repositorio e instalar dependencias:

```bash
cd lightcms
mise trust
mise deps
mise run install install
```

## 2. Create the GitHub App

LightCMS utiliza una aplicación de GitHub para dos cosas: firmar usuarios con GitHub (OAuth), y actuar en su nombre a través de instalaciones. Puedes crearlo con el asistente de configuración de Probot, o a mano.

### Opción A: Asistente de configuración de Probot

inicia el bot con:

```bash
bot de ejecución mise
```

Sin credenciales en `.env`, Probot inicia un servidor de configuración en `http://localhost:3000`:

1. Abre `http://localhost:3000` y haz clic en **Registrar la aplicación de GitHub**.
2. Elige tu cuenta personal o una organización.
3. Confirmar. Probot crea la aplicación y escribe sus credenciales en tu archivo `.env`.

El asistente establece la URL del webhook de la aplicación a un canal Smee (o `http://localhost:3000/`), no al punto final del webhook de LightCMS. Actualízalo en la configuración de la aplicación de GitHub antes de activarlo en vivo (ver [despliegue de producción](#6-production-deployment)).

### Opción B: Configuración manual

Cree la aplicación en **Configuración de GitHub → Configuración del desarrollador → Aplicaciones de GitHub → Nueva aplicación de GitHub** con estos valores:

| Ajustes            | Valor                                                                |
| ------------------ | -------------------------------------------------------------------- |
| URL de la página   | `https://<your-domain>`                                              |
| Callback URL       | `https://<your-domain>/api/auth/callback/github`                     |
| Setup URL          | `https://<your-domain>/github/setup`                                 |
| URL de Webhook     | `https://<your-domain>/api/github/webhook`                           |
| Secreto de Webhook | Un secreto aleatorio (ver [Generando secretos](#generating-secrets)) |

## Permisos de repositorio

| Permiso                 | Acceder         | Usado para                                       |
| ----------------------- | --------------- | ------------------------------------------------ |
| `Contenido`             | Leer y escribir | Leyendo y confirmando archivos de contenido      |
| `Problemas`             | Leer y escribir | Revisar comentarios y etiquetas en pull requests |
| `Desplegar solicitudes` | Sólo lectura    | Listar los archivos cambiados en un pull request |
| `Estados del commit`    | Leer y escribir | Reportando validación de contenido en push       |
| `Metadatos`             | Sólo lectura    | Mandatorio para cada aplicación de GitHub        |

**Suscríbete a los eventos:** `Push` y `Pull request`. Los eventos de instalación se entregan automáticamente a las aplicaciones de GitHub.

Después de crear la aplicación, tenga en cuenta el **ID de la aplicación**, genere un **secreto de cliente**, y generar y descargar una clave **privada** (`. em`).

## 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto. El repositorio no envía un archivo de ejemplo utilizable, así que utilice la referencia a continuación.

### Requerido

```bash
# -------------------------------------------------------------------
# Autenticación (Mejor Autoridad)
# -------------------------------------------------------------------
BETER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# URL pública de esta instancia. Debe coincidir con la visita de los usuarios de URL.
BETTER_AUTH_URL="http://localhost:5173"

# -------------------------------------------------------------------
# Base de datos (PostgreSQL, TLS requerido)
# -----------------------------------------------------------
DATABASE_URL="postgresql://user:password@host:5432/lightcms? slmode=require"

# -------------------------------------------------------------------
# GitHub App
# -----------------------------------------------------------
GITHUB_APP_ID="123456"
GITHUB_CLIENT_ID="Iv1. xxxxxxxxxxx"
GITHUB_CLIENT_SECRET="<github-app-client-secret>"
GITHUB_WEBHOOK_SECRET="<webhook-secret>"
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
```

`GITHUB_PRIVATE_KEY` es el contenido PEM completo. Mantenga los saltos de línea y envuelva el valor en comillas dobles, que es como lo escribe el asistente de Probot.

### Requerido para el desarrollo

LightCMS reporta análisis y errores a [PostHog](https://posthog.com). Cuando las claves faltan, la aplicación **arroja en el desarrollo** para evitar que los eventos sean silenciosamente soltados. En la producción son opcionales, y la telemetría se omite cuando no están configuradas.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### Correo electrónico: requerido para inicio de sesión mágico

Los enlaces mágicos se envían sobre SMTP con [Nodemailer](https://nodemailer.com). El envío falla con un error de configuración cuando falta `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` o `MAIL_FROM`.

```bash
MAIL_HOST="smtp.resend.com"
# Por defecto es 587 cuando se omite
MAIL_PORT="465"
# "true", "1", "yes" o "on" habilita TLS implícito. Cuando se omite, TLS está habilitado sólo para el puerto 465.
MAIL_SECURE="1"
MAIL_USER="resend"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Opcional: Copilot de IA

El Copilot utiliza cualquier API de terminación de chat compatible con OpenAI. Las tres variables son necesarias para que funcione.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Cualquier proveedor que exponga una API compatible con OpenAI, funciona, por ejemplo [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) o [NVIDIA NIM](https://build.nvidia.com).

### Opcional: dictado de voz a texto

LightCMS soporta dos backends de transcripción. Cuando ambos están configurados, se utiliza el backend compatible con OpenAI.

**transcripción compatible con OpenAI.** Se selecciona cuando se establece `SPEECH_API_KEY` y también necesita `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="whisper-1"
# URL base del proveedor. Omita que para usar el valor predeterminado de OpenAI.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Punto `SPEECH_ENDPOINT` en cualquier proveedor que implemente la API `/audio/transcriptions` , y establezca `SPEECH_MODEL` a un modelo que ofrezca el proveedor. Una `/audio/transcriptions` en el endpoint se quita automáticamente.

**[Wit.ai](https://wit.ai)** se utiliza cuando `SPEECH_API_KEY` no está establecido:

```bash
► _AI_TOKEN="<wit-ai-server-access-token>"
```

Si ninguna de las dos está configurada, la dictación no está disponible.

### Opcional: subidas de imágenes (CDN)

Las imágenes pegadas o cargadas en el editor se envían a una API de subida compatible con [Chevereto](https://chevereto.com). Las opciones alojadas incluyen [FreeImage.host](https://freeimage.host) y [ImgBB](https://imgbb.com), o puedes ejecutar tu propia instancia de Chevereto.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>"
```

`CDN_KEY` es enviado como el parámetro `clave` de consulta a menos que `CDN_URL` ya contenga uno. Si la carga falla o las variables no están configuradas, LightCMS vuelve a incrustar la imagen en el documento como un base64 `datos:` URL. Esto funciona, pero hace que tus archivos Markdown sean mucho más grandes, así que configura un CDN para uso real.

### Desvío de Webhook local (Sólo desarrollo)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Esto es leído por Probot, no por la aplicación SvelteKit. Vea [Testing de webhooks localmente](#testing-webhooks-locally).

### Generando secretos

Utilice cualquiera de estos para generar `BETTER_AUTH_SECRET` y `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# o
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Configurar la base de datos

LightCMS utiliza [ORM Drizzle](https://orm.drizzle.team). El esquema vive en `src/lib/server/db/schema.ts`, y las migraciones se generan en el directorio `drizzle`. Con `DATABASE_URL` establecido, aplicar las migraciones:

```bash
ejecutar db:migrate
```

Durante el desarrollo local puede empujar el esquema directamente a la base de datos, sin archivos de migración:

```bash
ejecutar db:push
```

Otros scripts de base de datos:

| Comando               | Descripción                                        |
| --------------------- | -------------------------------------------------- |
| `ejecutar db:generar` | Generar una migración después de editar el esquema |
| `ejecutar db:studio`  | Navega y edita tus datos en Drizzle Studio         |

## 5. Ejecutar localmente

```bash
ejecutar dev
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![permisos detallados](https://i.ibb.co/0p7tk88V/image.png)

LightCMS ya está disponible en `http://localhost:5173`. Establezca `BETTER_AUTH_URL` a esta dirección e inicie sesión con GitHub por primera vez.

### Probando webhooks localmente

GitHub no puede entregar webhooks a `localhost`, así que reenvíalos a través de [smee.io](https://smee.io):

1. Crear un canal en [smee.io](https://smee.io) y copiar su URL.
2. Establecer `WEBHOOK_PROXY_URL` en `.env` a esa URL.
3. Set the **Webhook URL** in your GitHub App settings to the same URL.
4. Ejecutar el bot en una segunda terminal:

   ```bash
   ejecutar bun bot:start
   ```

The bot registers the same handlers as the production endpoint: content validation on `push`, review comments and labels on `pull_request`, and `installation` logging.

## 6. Despliegue de producción

El proyecto está configurado con SvelteKit, que es un proveedor agnóstico. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) y [Noudbare Workers](https://www.cloudflare.com/) son todos soportados objetivos de despliegue desde serie.

1. Importe su repositorio Git en la plataforma de implementación.
2. Añade cada variable de entorno desde [paso 3](#3-configure-environment-variables) en **Configuración del proyecto → Entorno Variables**. Establezca `BETTER_AUTH_URL` a su URL de producción.
3. Desplegar.

Para verificar la construcción de producción localmente:

```bash
bun run build
bun run preview
```

## Solución de problemas

Hacer una cuenta con [Wit.ai](https://wit.ai/) es un servicio gratuito por meta | Y cualquier API de openai compatible para la transcripción. | Uno puede usar [groq](https://groq.com/) o [ensamblyai](https://assemblyai.com/) o | [elevenlabs](https://elevenlabs.io/) o [de profundo gramo](https://deepgram.com/) o [sarvam](https://sarvam.ai/). |

## Credenciales de PostHog

Utilice el token del proyecto de **su propio proyecto** PostHog (**Configuración del proyecto → Clave API del proyecto**). No reutilizar un token de esta documentación: eventos enviados con una tierra de token compartida en el proyecto de otra persona, así que sus insights, alertas y notificaciones no son tuyas para leer.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
► _AI_TOKEN="Token de acceso al servidor"
a_AI_CLIENT_TOKEN="Token de acceso al cliente"
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

![Configuración del bot](https://i.ibb.co/jP5tgcJH/image.png)
