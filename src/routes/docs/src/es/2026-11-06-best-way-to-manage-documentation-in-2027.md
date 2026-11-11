---
title: La mejor manera de administrar la documentación en 2027
date:
draft: falso
weight: 0
tags:
  - cms
  - luces
  - verde-web
isCJKLanguage: falso
headless: falso
keywords: ""
preview: ""
description: ""
serial: 0
section: ""
badge: ""
---

La documentación es parte de un proyecto que todo el mundo está de acuerdo y nadie está totalmente de acuerdo en cómo gestionar. Mira cinco proyectos de código abierto y encontrarás cinco configuraciones diferentes. Algunos funcionan bien. La mayoría de ellos se derivan hacia el abandono.

Así es como se ven los patrones comunes en la práctica, y por qué algunos se sostienen mejor que otros a lo largo del tiempo.

## El enfoque de la Wiki: Rápido de empezar, lento de morir

Los wikis y Confluence de GitHub son el predeterminado para muchos equipos. Son rápidos de configurar, no se requiere ninguna configuración, y cualquiera puede añadir una página.

El problema es que wikis acumulan páginas más rápido de lo que se mantienen. Un espacio de Confluencia para un proyecto de dos años típicamente tiene páginas que son exactas, que están desfasadas y no hay una forma fiable de determinar cuál es cuál. La búsqueda sobrepasa todo por igual. No hay proceso de revisión. Nadie posee nada.

Los wikis de GitHub tienen el mismo problema con una restricción añadida: viven en un repositorio separado de su código. Una pull request que cambia una API no pide automáticamente a nadie que actualice la documentación. La brecha entre código y documentación se amplía silenciosamente.

Los equipos que utilizan bien wikis son la excepción. Normalmente tienen un escritor técnico dedicado que hace cumplir los estándares. La mayoría de los equipos no.

## Noción y herramientas similares: excelente para equipos internos, malo para la longevidad

La noción es genuinamente buena para la documentación interna: guías de incorporación, libros de correo, procesos de equipo, notas de reunión. El editor es flexible, los permisos son granulares, y es bastante fácil que los colaboradores no técnicos realmente lo usen.

Para la documentación del proyecto que está destinada a vivir junto al código, se queda corta de varias maneras.

Tus documentos están en la base de datos de Notion, no en tu repositorio. No hay diferencia, no hay revisión de relaciones públicas, no hay despliegue automatizado. Si la Noción cambia su precio, desaprueba una característica o simplemente desaparece, la migración es un trabajo de exportación y reformateo manual.

La cuestión más profunda es la capacidad de descubrimiento. Los documentos que viven en Noción no están indexados junto a tu base de código. Un desarrollador que busca un nombre de función no encontrará la página de Noción que explica por qué funciona como funciona. Los dos sistemas no hablan entre sí.

## Dirigido por README: honesto pero difícil de escalar

Muchos proyectos más pequeños — y muchos de código abierto — dependen casi por completo del README. Un archivo, se mantuvo actualizado, cubriendo las pautas de instalación, uso y contribución.

Esto funciona sorprendentemente bien para herramientas enfocadas con una API estable. La restricción de un archivo fuerza la priorización. No hay documentación sprawl porque no hay lugar a donde ir.

Se rompe cuando un proyecto crece más allá de una cierta complejidad. Un README que cubre quince opciones de configuración diferentes, tres objetivos de implementación, y una guía de migración de v1 a v2 deja de ser legible. En ese punto, los equipos o bien permiten que se pudra o que empiece a construir otra cosa.

## Código de documentos: el patrón que escala

Los proyectos con documentación consistentemente buena tienden a usar el mismo patrón básico: archivos Markdown en el repositorio, compilado por un generador estático de sitios, desplegado junto a cada lanzamiento.

Los documentos de Kubernetes están en el mismo monorepo que el código base, revisado en el mismo flujo de trabajo de pull request. El Rust Book es un proyecto Markdown en GitHub con cientos de colaboradores. La documentación de Astro es un sitio de Astro Starlight comprometido junto con el propio framework.

Lo que hace que esto funcione no es la herramienta. Es el flujo de trabajo. Los documentos viven al lado del código, por lo que se actualizan cuando el código cambia. Un PR que añade una nueva bandera necesita actualizar la documentación antes de que se fusione. El proceso de revisión lo aplica.

El beneficio secundario es la durabilidad. Los archivos Markdown de 2015 siguen siendo legibles e implementables en 2027. Ninguna migración requerida, ningún formato de exportación propio, ninguna dependencia de la plataforma. El contenido es sólo archivos de texto en una carpeta.

## La fricción que mata a los Docs como código para los colaboradores no técnicos

La única debilidad real del enfoque Markdown-in-Git es que asume que todo el mundo se siente cómodo con un editor de texto y una solicitud de extracción. Para muchos equipos está bien. Para equipos con colaboradores no técnicos — mercadotecnia, soporte de producto — crea fricción que lleva a que los documentos sean ignorados o mantenidos en un sistema paralelo.

Aquí es donde encaja un CMS respaldado por Git. Herramientas como LightCMS se sientan frente al repositorio y dan a los colaboradores una experiencia real del editor mientras siguen comprometiendo los archivos Markdown en el repo. El editor maneja el formato. El CMS maneja el commit. El colaborador nunca ve un terminal.

El resultado es el mismo que docs-as-code — contenido en Markdown, versionado en Git, desplegado por su pipeline existente — pero accesible para personas que no quieren usar Git directamente.

## Lo que funciona actualmente en 2027

El patrón que se sostiene es simple: archivos Markdown en su repositorio, construidos por un generador de sitio estático, revisados en pull requests, desplegados en fusión.

Las herramientas específicas alrededor de ese patrón importan menos que el flujo de trabajo. Si tu equipo usa GitHub, un sitio Starlight o Docusaurus comprometido con el mismo repositorio te da todo: buscar, , una experiencia de lectura adecuada y un proceso de revisión que mantiene la documentación sincronizada con el código.

Si tiene colaboradores no técnicos, ponga un editor respaldado por Git delante de él para que puedan escribir sin tocar la terminal. La configuración subyacente sigue siendo la misma. El contenido permanece en tu repo.

Los proyectos con la mejor documentación no son los que tienen las mejores herramientas. Son los que hicieron de la documentación parte del mismo flujo de trabajo que el código.

---

## FAQs

### ¿Qué es docs-as-code?

Docs-as-code es la práctica de escribir y mantener documentación utilizando las mismas herramientas y flujos de trabajo que el desarrollo de software: archivos de texto plano (normalmente Markdown), control de versiones (generalmente Git), revisión de código, y despliegue automatizado. Mantiene la documentación cerca del código que describe y hace que las actualizaciones sean parte del flujo de trabajo de desarrollo normal.

### ¿Es suficiente con Markdown Bueno para la documentación?

Sí, para la gran mayoría de los proyectos. Markdown maneja encabezados, bloques de código, tablas, imágenes y enlaces. Generadores estáticos de sitios como Starlight, Docusaurus y MkDocs añaden búsqueda, navegación, versiones y una experiencia de lectura adecuada en la parte superior. La restricción del texto plano es una característica: es legible en cualquier editor, grepable, dificil y duradero a lo largo de décadas.

### ¿Cómo contribuyen los escritores no técnicos a la documentación de Markdown?

Las herramientas CMS respaldadas por Git como LightCMS proporcionan un editor enriquecido que envía Markdown a su repositorio sin requerir que los colaboradores utilicen Git directamente. El contenido permanece en tu repositorio en simple Markdown. El editor es sólo una interfaz más accesible a los mismos archivos subyacentes.

### ¿Cuál es el mejor generador estático de sitios para la documentación?

Depende de tu pila. Astro Starlight y Docusaurus son las opciones más completas con una buena búsqueda. MkDocs con Material es excelente para proyectos Python. Si ya estás en Hugo o tándem para tu blog, ellos también pueden manejar documentos. El generador importa menos que mantener los documentos en el mismo repositorio que su código.
