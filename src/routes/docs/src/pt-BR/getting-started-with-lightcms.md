---
title: Introdução
serial: 1
date: 2026-09-01T16:44:00Z
draft: Falso
tags:
  - luzes
  - SMS
  - git
  - ssg
  - estático
  - Site
  - gerador
keywords:
  - luzes
  - como começar
  - introdução
  - wysiwyg
  - markdown
  - git baseado
---

[LightCMS](https://www.lightcms.me) é um editor apoiado pelo GitLab para sites estáticos. Você escreve em um editor rico, clique em publicar e [LightCMS](https://www.lightcms.me) commits clean Markdown para seu repositório. Seu pipeline de deploy — Páginas do Cloudflare, Netlify, Vercel, GitHub Pages — o leva de lá.

Seu conteúdo vive em seu próprio repositório Git como arquivos Markdown, legíveis e implantáveis por qualquer gerador de site estático que você já está usando.

## Como funciona

1. Entre com sua conta no GitHub.
2. Conecte o repositório que contém seu site estático. Astro, Hugo, SvelteKit, Jekyll, Next.js, Eleventy — qualquer coisa que leia Markdown.
3. Gravar e editar conteúdo no editor embutido. Crie postagens, edite os existentes, carregue imagens e preencha campos na conta frontal, sem tocar no terminal.
4. Acertar publicação. [LightCMS](https://www.lightcms.me) submete seu conteúdo para o caminho que você configurou — por exemplo, `content/blog/minha-post.md` na raiz do repositório.
5. Seu build pipeline implementa automaticamente. A postagem estará disponível dentro de um minuto ou dois, dependendo do seu host.

Esse é o laço completo. [LightCMS](https://www.lightcms.me) só é executado enquanto você está escrevendo. Leitores são servidos pela sua CDN, não pela [LightCMS](https://www.lightcms.me).

## O que há no editor

**TipTap-rich editor** - escreve uma versão limpa de Markdown com a matéria frontal. O que você vê é o que se compromete. Se você já abriu um arquivo `.md` e encontrou uma sopa de tags HTML, esta é a alternativa.

**Copilot AI** - conectado a qualquer API compatível com OpenAI. Útil quando um parágrafo não poupo: peça-lhe que aperte a redação, expanda um ponto ou pegue um projecto que você abandonou no meio da reflexão.

**Voz em texto** - ditar diretamente para o editor usando qualquer API de transcrição compatível com sussurro ou Wit.ai. Bom para conseguir um primeiro rascunho bagunçado rapidamente quando a digitação começa a pensar.

**Temas claro e escuro** - várias opções de temas, então o editor fica confortável durante sessões mais longas.

**Automação da Newsletter** - publicar e notificar os assinantes automaticamente via [Newsy](/docs/newsletter-newsy). Não é necessário boletim informativo de terceiros.

## O que [LightCMS](https://www.lightcms.me) não faz

Não hospeda seu conteúdo nem sirva seus leitores, e isso é por design. Se você está vindo do WordPress ou do Ghost, o CMS como anfitrião é o que você está acostumado. Aqui a relação é diferente: [LightCMS](https://www.lightcms.me) é uma ferramenta de escrita e não infraestrutura. Seu gerador de site estático constrói a saída, seu provedor de hospedagem serve e você possui cada arquivo. Mudar editores, geradores ou hosts não significa migrar um banco de dados.

Ele também não substitui a configuração de implantação. Funciona com qualquer pipeline que você já tenha.

## Próximos passos

- [Why LightCMS?](/docs/why-lightcms) — the design philosophy behind Git-backed publishing
- [Como iniciar um blog](/docs/how-to-start-a-blog) - escolha um modelo e vá de zero para publicado
- [Autohospedagem LightCMS](/docs/self-hosting-lightcms) - execute sua própria instância privada
- [Automação da Newsletter](/docs/newsletter-newsy) - enviar mensagens aos assinantes automaticamente com Novidades
- [Construindo um web](/docs/building-a-greener-web) - por que publicação estática é a escolha de baixo carbono
