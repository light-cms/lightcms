---
title: "Sitios estáticos y CO2: Construir una Web Greener"
description: '¿Por qué los sitios estáticos emiten menos carbono, cómo el almacenamiento en caché de CDN reduce el uso de energía y qué aspecto tiene una web más verde.'
date: 2026-10-14T13:30:00Z
draft: falso
tags:
  - sostenibilidad
  - sitios estáticos
  - verde-web
  - con2
  - ssg
keywords: luces
preview: /og-image.png
serial: 3
---

Cuesta mucho cargar una página. A veces una página falla al cargar de la memoria caché la base de datos se golpea varias veces y cada consulta utiliza una gran cantidad de energía que emite kilogramos de CO2. Se dice que entre el 2% y el 4% de las emisiones de CO2 proceden de la red.

Al igual que la industria de las líneas aéreas, la web puede dañar el planeta. El diseño que elijas te permite mostrar cuánto te preocupa la Tierra. La manera ecológica de compartir información es un generador estático de sitios que construye su sitio una vez y luego sirve a partir de un CDN.

## Por qué los sitios estáticos emiten carbono

Para dar un efecto reactivo, los sitios generalmente realizan el trabajo de renderizado cada vez que alguien interactúa: ejecutan código preguntar a la base de datos y enviar una página completa desde el servidor. Así que el servidor debe permanecer en línea todo el tiempo, incluso cuando nadie visita.

- Un sitio estático se construye una vez. El HTML terminado se copia a los nodos de borde CDN en todo el mundo. Realizado desde el caché:

- No se necesita calcular para cada petición. El hecho de que un archivo construido consume muy poca energía en comparación con el renderizado de una página sobre la marcha.

- No siempre en bases de datos. No hay servidores ni bases de datos que funcionen todo el tiempo. Los sitios estáticos no necesitan que un servidor esté funcionando 24/7. No se hacen consultas con bases de datos que resulten en menos emisiones de carbono.

- Caché por defecto. Una petición que llega a un caché de borde no mueve energía más allá del salto de red.

- payloads pequeños. El HTML hecho con Markdown es pequeño. No se envía al cliente ningún JavaScript pesado o CSS graso. El cliente recibe siempre el archivo para que se cargue más rápido.

Es posible que todos hayan escuchado el estudio [milisegundos hacen millones](https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html)

El efecto colapso: La durabilidad es sostenibilidad

Un proyecto Hugo o Astro Starlight realizado en 2016 todavía puede serlo. En 2036 porque el contenido es simplemente Markdown, que permanece intemporal. Todo el toolchain es fuente y proveedor neutral y la salida es sólo carpetas y archivos.

La posesión de tu contenido como Markdown en Git es duradera y ahorra tiempo.

Cómo medir las emisiones de carbono de sus sitios web

No se puede mejorar lo que se hace si no se mide:

- [Calculador de Carbono del Sitio web](https://www.websitecarbon.com/) – calcula los gramos de CO2 emitidos por vista de página y compara su sitio con el promedio.

- Eco grader – experiencia de páginas de tarifas, accesibilidad, alojamiento ecológico y estimaciones de emisiones de carbono.

- Fotograma verde – simula escenarios de usuario e interacciones de múltiples pasos para medir el nivel de huella de carbono y consumo de energía.

- WebPage Test – proporciona diagnósticos de rendimiento en profundidad junto con estimaciones de huella de carbono y desglose Core Web Vitals.

- Green Web Checker – comprueba si una infraestructura de alojamiento de dominios funciona con energía renovable.

- Mediciones de usuario reales & Core Web Vitals – métricas como Pintura contenida más grande (LCP) y transferencia total del paquete inicial descargado por cualquier usuario nuevo en cada visita.

Cómo construir una web verde

1. **Servir estáticamente desde un CDN** – la manera de reducir la energía para sitios de contenido.

2. Los sitios estáticos se construyen una vez. Luego sirvió desde un CDN haciendo que sea la manera más amigable de construir un sitio web.

3. JavaScript de la nave. Cada kilobyte debe ser leído, analizado, ejecutado y almacenado en la batería y el ancho de banda de los visitantes.

4. Cache images. Los medios suelen ser la mayor parte de una página, así que sirven a través del CDN y utilizan formatos modernos como WebP.

Donde se ajusta LightCMS

> LightCMS funciona, exactamente de estas maneras:

- El contenido está comprometido como Markdown en tu propio repositorio, publicado por un generador estático de sitios y servido como archivos minificados compilados de su red de proveedores de hosting.

- El CMS sólo se ejecuta mientras escribe. Ninguna base de datos de producción sirve a los lectores porque los lectores son atendidos por un CDN.

## Costo de sitios estáticos en ejecución

Los sitios estáticos son generalmente más baratos o incluso gratuitos para alojar.

- [GitHub Pages](https://pages.github.com/)
- [Páginas Codeberg](https://codeberg.org/pages)
- [Páginas de Cloudflare](https://pages.cloudflare.com/)
- [Vércel](https://vercel.com/)
- [Red](https://www.netlify.com/)
- [Páginas de Bitbucket](https://bitbucket.org/pages)
- [Procesar](https://render.com/)
- [oleada](https://surge.sh/)

Incluso puede servir un sitio estático desde un cubo S3 personalizado.
