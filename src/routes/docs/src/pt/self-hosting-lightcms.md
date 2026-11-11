---
title: Auto hospedagem LightCMS
description: Guia para o LightCMS auto-hospedado, cobrindo o aplicativo GitHub, PostgreSQL, variáveis de ambiente opcionais, AI, CDN e e-mail, e implantando para a aresta.
serial: 4
section: Comece Agora
badge: Implantar
date: 2026-09-18T01:45:00Z
draft: Falso
tags:
  - selfhost
  - luzes
  - postgresql
  - implantação
keywords:
  - luzes
  - probot
  - auto-hospedagem
  - github_app
  - Transportadora
  - sveltekit
preview: /og-image.png
---

Deseja LightCMS totalmente sob o seu controle? LightCMS é uma aplicação [SvelteKit](https://svelte.dev) para que possa ser implantada em qualquer lugar, apoiada em um banco de dados PostgreSQL e um aplicativo GitHub (Octokit). Seu conteúdo nunca sai de seus próprios repositórios GitHub.

Este guia leva você através de tudo o que você precisa para executar a sua própria instância: criar o aplicativo GitHub, provisionar PostgreSQL, configurando variáveis de ambiente e implantação.

## Como as Peças Encaixam Juntas

| Componente                           | Objetivo                                                                   | Obrigatório                          |
| ------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------ |
| PostgreSQL                           | Armazena usuários, sessões, senhas e instalações do GitHub                 | sim                                  |
| GitHub App                           | Lê e escreve conteúdo nos seus repositórios e assina os usuários no GitHub | sim                                  |
| Provedor SMTP                        | Envia e-mails de login com link mágico                                     | Sim, para login com link mágico      |
| API compatível com OpenAI-compatível | Força o Copilot IA                                                         | Opcional                             |
| API Speech-to-text                   | Ordem de voz                                                               | Opcional                             |
| CDN da imagem                        | Imagens de host carregadas no editor                                       | Opcional                             |
| Jaqueta                              | Análise de produtos e observação de IA                                     | Necessário apenas em desenvolvimento |

## Pré-requisitos

- **[mise](https://mise.jdx.dev)**: instala e gerencia dependências de tarefas. Este guia presume que você o instalou.
- **PostgreSQL**: um banco de dados que aceita conexões TLS. Provedores de nuvem, como [Neon](https://neon.tech), [Supabase](https://supabase.com) ou [Nile](https://thenile.dev) funcionam bem. Veja [incrível-postgres](https://github.com/alexeyfv/awesome-free-postgres) para opções gratuitas.
- **conta do GitHub**: necessário para registrar o aplicativo GitHub.
- **provedor SMTP** (para links mágicos): Se você tem um domínio, [Reenviar](https://resend.com) é uma boa opção. Caso contrário, use o [Zoho Mail](https://www.zoho.com/mail) e crie uma senha do aplicativo.

> **TLS é obrigatório.** A aplicação conecta ao PostgreSQL com `ssl: "require"`. Uma instância local do PostgreSQL sem TLS habilitado será rejeitada, então use uma base de dados hospedada ou configure TLS no seu próprio servidor.

## 1. Bifurcar o repositório e instalar dependências

Clonar o repositório e instalar dependências:

```bash
cd lightcms
mise trust
mise deps
mise run install
```

## 2. Create the GitHub App

O LightCMS utiliza uma aplicação GitHub para duas coisas: assinar usuários com o GitHub (OAuth) e agir em seu nome através de instalações. Você pode criá-lo com o assistente de configuração do Probot, ou com a mão.

### Opção A: Assistente de configuração do Probot

iniciar o bot com:

```bash
bot de execução mise
```

Sem credenciais em `.env`, o Probot inicia um servidor de configuração em `http://localhost:3000`:

1. Abra `http://localhost:3000` e clique em **Registrar GitHub App**.
2. Escolha sua conta pessoal ou organização.
3. Confirmar. O Probot cria o aplicativo e escreve suas credenciais no arquivo `.env`.

O assistente define a URL do webhook do aplicativo para um canal Smee (ou `http://localhost:3000/`), não para o webhook da LightCMS endpoint. Atualize nas configurações do GitHub App antes de ir ao vivo (consulte [Produção de implantação](#6-production-deployment)).

### Opção B: Configuração manual

Crie o aplicativo em **GitHub Settings → Configurações de desenvolvedor → GitHub Apps → Novo aplicativo** com estes valores:

| Configuração          | Valor                                                             |
| --------------------- | ----------------------------------------------------------------- |
| URL da Página Inicial | `https://<your-domain>`                                     |
| Callback URL          | `https://<your-domain>/api/auth/callback/github`            |
| Setup URL             | `https://<your-domain>/github/setup`                        |
| URL do webhook        | `https://<your-domain>/api/github/webhook`                  |
| Webhook secreto       | Um segredo aleatório (veja [Gerar segredos](#generating-secrets)) |

## Permissões do repositório

| Permisschar@@0o    | Acesso          | Usado para                                         |
| ------------------ | --------------- | -------------------------------------------------- |
| `Conteúdo`         | Ler e escrever  | Leitura e confirmação de arquivos de conteúdo      |
| `Solicitações`     | Ler e escrever  | Revisar comentários e etiquetas em pull requests   |
| `Pull requests`    | Somente leitura | Listando os arquivos alterados em uma pull request |
| `Status de commit` | Ler e escrever  | Reportando validação de conteúdo em pushes         |
| `Metadados`        | Somente leitura | Obrigatório para cada aplicativo do GitHub         |

**Inscreva-se aos eventos:** `Push` e `Pull request`. Eventos de instalação são entregues automaticamente no GitHub Apps.

After creating the app, note the **App ID**, generate a **client secret**, and generate and download a **private key** (`.pem`).

## 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto. O repositório não envia um arquivo de exemplo utilizável, por isso use a referência abaixo.

### Obrigatório

```bash
# -------------------------------------------------------------------------------------------
# Autenticação (Better Auth)
# ---------------------------------------------------------------------------
BETTER_AUTH_SECRET="<output of: openssl rand -hex 32>"
# URL pública desta instância. Deve corresponder à visita dos usuários URL.
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
-----END CHAVE DO RSA PRIVACIDADE -----"
```

`GITHUB_PRIVATE_KEY` é o conteúdo completo de PEM. Mantenha a linha quebrando e envolva o valor em aspas duplas, como o assistente Probot escreve.

### Necessário para desenvolvimento

O LightCMS informa a análise e erros a [PostHog](https://posthog.com). Quando as chaves estão faltando, o app **lança em desenvolvimento** para impedir que eventos sejam silenciosamente descartados. Na produção, elas são opcionais e a telemetria é ignorada quando estão desmarcadas.

```bash
VITE_POSTHOG_PROJECT_TOKEN="phc_xxxxxxxxxxxx"
VITE_POSTHOG_HOST="https://us.i.posthog.com"
```

### E-mail: necessário para login por magic-link

Links mágicos são enviados por SMTP com [Nodemailer](https://nodemailer.com). Envio falhou com um erro de configuração quando `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS` ou `MAIL_FROM` está faltando.

```bash
MAIL_HOST="smtp.resend.com"
# Padrão de 587 quando omitido
MAIL_PORT="465"
# "true", "1", "yes" ou "on" habilita TLS implícitos. Quando omitido, TLS está ativado apenas para a porta 465.
MAIL_SECURE="1"
MAIL_USER="reenviar"
MAIL_PASS="<smtp-password-or-api-key>"
MAIL_FROM="LightCMS <noreply@yourdomain.com>"
```

### Opcional: Copilot IA

O Copilot usa qualquer API de conclusão de chat compatível com OpenAI. Todas as três variáveis são necessárias para que funcione.

```bash
OPEN_AI_ENDPOINT="https://api.openai.com/v1"
OPEN_AI_APIKEY="sk-..."
OPEN_AI_MODEL="gpt-4o-mini"
```

Qualquer provedor que explique uma API compatível com OpenAI, por exemplo [OpenAI](https://platform.openai.com), [OpenRouter](https://openrouter.ai) (`https://openrouter. i/api/v1`) ou [NVIDIA NIM](https://build.nvidia.com).

### Opcional: ditado de fala-texto

LightCMS suporta dois planos de transcrição Quando ambos são configurados, é usada uma backend compatível com OpenAI.

**Transcrição compatível com OpenAI.** é selecionada quando `SPEECH_API_KEY` é definida, e também precisa de `SPEECH_MODEL`:

```bash
SPEECH_API_KEY="<api-key>"
SPEECH_MODEL="sussurro -1"
# URL base do provedor. Omitir para usar o padrão do OpenAI.
SPEECH_ENDPOINT="https://api.openai.com/v1"
```

Ponto `SPEECH_ENDPOINT` em qualquer provedor que implemente a API `/audio/transcrições` , e definir `SPEECH_MODEL` para um modelo que o provedor oferece. Um rastro `/audio/transcrições` no ponto final é removido automaticamente.

**[Wit.ai](https://wit.ai)** é usada quando `SPEECH_API_KEY` não é definido:

```bash
WIT_AI_TOKEN="<wit-ai-server-access-token>"
```

Se não estiver configurada, a ditadura não estará disponível.

### Opcional: uploads de imagens (CDN)

As imagens coladas ou enviadas no editor são enviadas para uma API de upload [Chevereto](https://chevereto.com)-compatível. Opções hospedadas incluem [FreeImage.host](https://freeimage.host) e [ImgBB](https://imgbb.com), ou você pode executar sua própria instância Chevereto.

```bash
CDN_URL="https://freeimage.host/api/1/upload"
CDN_KEY="<cdn-api-key>
```

`CDN_KEY` é enviada como o parâmetro de consulta `key` a menos que `CDN_URL` já contenha um. Se o envio falhar ou as variáveis não estiverem definidas, O LightCMS volta a incorporar a imagem no documento como um dado base64 `:` URL. Isso funciona, mas torna seus arquivos Markdown muito maiores, então configure um CDN para uso real.

### Encaminhamento de Webhook Local (Apenas Desenvolvimento)

```bash
WEBHOOK_PROXY_URL="https://smee.io/<your-channel>"
```

Este é lido pelo Probot, não pelo aplicativo SvelteKet. Veja [Testando webhooks localmente](#testing-webhooks-locally).

### Gerando segredos

Utilize qualquer um destes para gerar `BETTER_AUTH_SECRET` e `GITHUB_WEBHOOK_SECRET`:

```bash
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex')))"
```

## 4. Configurando o banco de dados

O LightCMS utiliza o ORM [Drizzle](https://orm.drizzle.team). O esquema vive no diretório `src/lib/server/db/schema.ts`, e as migrações são geradas no diretório `drizzle`. Com o conjunto `DATABASE_URL` , aplique as migrações:

```bash
rodado db:migrate
```

Durante o desenvolvimento local, você pode, em vez disso, empurrar o esquema diretamente para o banco de dados, sem arquivos de migração:

```bash
corrida de bun db:push
```

Outros scripts do banco de dados:

| Comando                     | Descrição:                                    |
| --------------------------- | --------------------------------------------- |
| `rodado db:generate`        | Gerar uma migração depois de editar o esquema |
| `corrida corrida db:studio` | Navegue e edite seus dados no Drizzle Studio  |

## 5. Executar localmente

```bash
execução de bun
```

![imagebot](https://i.ibb.co/Jw1bjLrr/image.png)

![permissões detalhadas](https://i.ibb.co/0p7tk88V/image.png)

O LightCMS agora está disponível em `http://localhost:5173`. Defina `BETTER_AUTH_URL` para este endereço e faça o login com o GitHub pela primeira vez.

### Testando webhooks localmente

O GitHub não pode entregar webhooks para `localhost`, então encaminhe-os através do [smee.io](https://smee.io):

1. Crie um canal em [smee.io](https://smee.io) e copie sua URL.
2. Definir `WEBHOOK_PROXY_URL` em `.env` para essa URL.
3. Defina a URL **Webhook** nas configurações do GitHub App para a mesma URL.
4. Execute o bot em um segundo terminal:

   ```bash
   bun executar bot:start
   ```

O bot registra os mesmos manipuladores do ponto de extremidade: validação de conteúdo no `push`, revisar os comentários e labels em `pull_request`, e no log `instalação`.

## 6. Deploy da produção

O projeto está configurado com SvelteKit, que é um fornecedor agnostic. [Vercel](https://vercel.com), [Netlify](https://www.netlify.com/) e [Cloudflare Workers](https://www.cloudflare.com/) são todos alvos de implantação suportados por eles.

1. Importe seu repositório Git na plataforma de implantação.
2. Adicione cada variável de ambiente de [passo 3](#3-configure-environment-variables) em **Configurações do projeto → Ambiente Variáveis**. Definir `BETTER_AUTH_URL` para o seu URL de produção.
3. Implantação.

Para verificar a compilação de produção localmente:

```bash
bun run build
bun run preview
```

## Solução de problemas

Faça uma conta com [Wit.ai](https://wit.ai/) é um serviço gratuito feito pela meta ë E qualquer API compatível com o openai para transcrição. | One can use [groq](https://groq.com/) or [assemblyai](https://assemblyai.com/) or | [elevenlabs](https://elevenlabs.io/) or [deepgram](https://deepgram.com/) or [sarvam](https://sarvam.ai/). |

## Credenciais do PostHog

Use o token do projeto de **seu próprio projeto** PostHog (**Configurações do projeto → Chave de API do projeto**). Não reutilize um token desta documentação: eventos enviados com um país do token compartilhado no projeto de outra pessoa, para que suas ideias, alertas e notificações não sejam suas para ler.

```env
VITE_POSTHOG_PROJECT_TOKEN=phc_your_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

[witai](https://wit.ai)

![wit.ai](https://i.ibb.co/MySskPTt/image.png)

```env
WIT_AI_TOKEN="Token de acesso ao servidor"
WIT_AI_CLIENT_TOKEN="Token de acesso ao cliente"
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

![Configuração de Bot](https://i.ibb.co/jP5tgcJH/image.png)
