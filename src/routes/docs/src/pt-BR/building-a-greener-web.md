---
title: "Sites Estáticos e CO2: Construindo uma rede de Greener"
description: Por que sites estáticos emitem menos carbono, como CDN em cache corta o uso de energia e como uma web mais verde.
date: 2026-10-14T13:30:00Z
draft: Falso
tags:
  - sustentabilidade
  - estático-sítios
  - web-verde
  - co2
  - ssg
keywords: luzes
preview: /og-image.png
serial: 3
---

Custa muito para carregar uma página. Às vezes, uma página não consegue carregar do cache, o banco de dados é atingido várias vezes e cada consulta usa muita energia emitindo quilogramas de CO2. Diz-se que 2–4% das emissões de co2 provêm da Internet.

Tal como a indústria das companhias aéreas, a Internet pode prejudicar o planeta. O layout que você escolhe permite mostrar o quanto você se importa com a Terra. A maneira amigável de compartilhar informações é um gerador de site estático que constrói seu site uma vez e então o serve de uma CDN.

## Porque Sites Estáticos Emit Carbon

Para dar a um site de efeito reativo geralmente realiza o trabalho de renderização toda vez que alguém interagir: eles executam o código, pedem o banco de dados e enviam uma página inteira do servidor. Então o servidor deve permanecer on-line o tempo todo, mesmo quando ninguém visita.

- Um site estático constrói uma vez. O HTML finalizado foi copiado para os nós de arestas CDN em todo o mundo. Servido do cache:

- Nenhuma computação necessária para cada requisição. Servir um arquivo compilado usa muito pouca energia comparada a renderizar uma página em tempo real.

- Nem sempre nos bancos de dados. Nenhum servidor e banco de dados são executados o tempo todo. Sites estáticos não precisam de um servidor para rodar 24/7. Não são feitas quaisquer perguntas à base de dados que resultem em menos emissões de carbono.

- Cache por padrão. Uma solicitação que atinge um cache de borda não move energia para além do pulo da rede.

- Carga pequena. O HTML feito de Markdown é minúsculo. Nenhum JavaScript ou CSS de gordura é enviado para o cliente. O cliente sempre recebe o arquivo para que ele carregue mais rápido.

Tudo você pode ter ouvido o estudo de [milissegundos faz milhões](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

O Efeito Ripple: Durabilidade é Sustentabilidade

Um projeto Hugo ou Astro Starlight feito em 2016 ainda pode ser. Servido em 2036 porque o conteúdo está sem espaço, o que permanece intemporal. Toda a cadeia de ferramentas é uma fonte e um fornecedor neutro e a saída é apenas pastas e arquivos.

Possuir seu conteúdo como Markdown no Git é durável e economiza tempo.

Como medir as emissões de carbono dos seus sites

Você não pode melhorar o que faz se não medir isso:

- [Website Carbon Calculator](https://www.websitecarbon.com/) — estima gramas de CO2 emitidos por exibição de página e compara seu site com a média.

- Eco grader - taxa de experiência de página, acessibilidade, hospedagem verde e estimativas de emissões de carbono.

- Frame Verde - simula cenários de usuário e interações em várias etapas para medir a aplicação de pegada de carbono e o consumo de energia.

- Teste de WebPage – fornece diagnósticos de desempenho em profundidade ao lado de estimativas de pegada de carbono e problemas nos principais vitais da Web.

- Green Web Checker - verifica se um domínio que hospeda infraestrutura funciona com energia renovável.

- As métricas do usuário & Core Web Vitals – métricas como a maior contentful Paint (LCP) e a transferência total do pacote inicial baixado por qualquer usuário novo em cada visita.

Como criar uma rede verde

1. **Serve estaticamente de um CDN** – a maneira de reduzir energia para sites de conteúdo.

2. Locais estáticos são construídos uma vez. Então serviu de um CDN fazendo dele a maneira mais ecológica de construir um site.

3. JavaScript do navio. Cada kilobyte deve ser lido, analisado, executado e armazenado na bateria e na largura de banda dos visitantes.

4. Cache images. A mídia geralmente é a maior parte de uma página, por isso serve-o através do CDN e use formatos modernos, como WebP.

Onde os CM5 da Luz são ajustados

> O CMS funciona exatamente das seguintes formas:

- Conteúdo é confirmado como Markdown no seu próprio repositório, publicado por um gerador de site estático e servido como arquivos minificados de sua rede de acesso de provedores.

- O CMS é executado somente durante a redação. Nenhum banco de dados de produção serve leitores porque os leitores são servidos por uma CDN.

## Custo dos Sites Estáticos

Os sítios estáticos são geralmente mais baratos ou até mesmo mais livres de acolher.

- [GitHub Pages](https://pages.github.com/)
- [Páginas de Codeberg](https://codeberg.org/pages)
- [Páginas do Cloudflare](https://pages.cloudflare.com/)
- [Transportadora](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Páginas do Bitbucket](https://bitbucket.org/pages)
- [Renderizar](https://render.com/)
- [aumento](https://surge.sh/)

Você pode até servir um site estático a partir de um bucket S3 personalizado.
