# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (greenfield, confirmado por el usuario). El detalle de integración con Tailwind, tipografías y generador de assets se decide en new-work; el sitio apunta a despliegue estático (sin backend, sin runtime JS por defecto). Astro 5 es la línea base asumida; islas React sólo si una sección lo justifica.

## Users

Profesores de primaria que oyen sobre Pinax Desktop por un colega, una lista de correo, una búsqueda web o un enlace directo y aterrizan aquí para decidir si lo descargan. La visita típica dura pocos minutos: el docente escanea qué hace, si es de fiar, y si vale la pena instalar. No hay二次 visita esperada: si no convierte a la primera,大概率 no vuelve.

## Product Purpose

El landing existe para **convertir visitantes en descargas**. Centraliza la explicación de qué es Pinax Desktop, por qué importa, y dónde bajarlo. Éxito = el visitante cierra la página con el instalador en su equipo y la confianza de que Pinax hace lo que promete. La landing no es documentación, no es portafolio, no es blog: es el paso previo al `.AppImage` (o equivalente) en disco.

## Positioning

La landing defiende la misma trinidad que el producto, traducida a lenguaje de marketing honesto:

- **Cálculo automático de notas ponderadas.** Tareas + criterios configurados por el docente se combinan en una sola nota final, sin escribir fórmulas. La UI debe hacer visible esa operación aunque el lenguaje visual cambie.
- **Privacidad por diseño.** 100% local; nada de cuentas, ni nube, ni telemetría. Es una promesa ética además de técnica.
- **Sensación de aplicación de escritorio real.** Pinax se instala, abre como ventana propia, sin barra de navegador. La sensación de "app" es parte del producto, no un envoltorio cosmético.

La landing no inventa nuevas promesas. Repite lo que el código ya cumple y lo hace legible en una pantalla. Cualquier afirmación de marketing que el repo no respalde queda prohibida.

## Operating Context

El docente llega desde un enlace corto, un mensaje de WhatsApp, una búsqueda tipo "app para calificar con rúbrica", o una recomendación de un colega. Navega en portátil o tablet, en su mayoría desde el aula o su casa. Tiene poca paciencia con marketing genérico. Necesita ver qué hace Pinax, qué plataforma soporta, y dónde lo descarga, sin registrarse ni leer tres pantallas de copia.

Materiales colaterales disponibles:

- Icono y favicon de la app: `apps/desktop/public/pinax.{png,svg,ico,icns}`.
- Instalador real: `release/0.0.0/pinax-Linux-0.0.0.AppImage` (Linux).
- Código fuente completo en el repo.

Ausencias que la landing **no debe** fabricar: testimonios de usuarios, métricas de uso, capturas de prensa, logos de instituciones, claims de "el más usado". Todo eso es ficticio hasta que exista evidencia.

## Capabilities and Constraints

Capacidades confirmadas:

- Sitio estático de una sola intención (one-pager con secciones ancla), servido sin backend.
- Sección de descarga que apunta a los artefactos reales de `release/`. Hoy sólo hay artefacto Linux (`pinax-Linux-0.0.0.AppImage`); los enlaces a Windows/macOS deben quedar explícitamente como "próximamente" o redirigir al repositorio, no como descargas rotas.
- Enlace al repositorio (GitHub) para que el docente inspeccione el código.
- Copy en español, consistente con el tono de `apps/desktop/PRODUCT.md`: formal pero accesible, sin anglicismos innecesarios.
- Modo oscuro alineado con el de la app (`next-themes`, selector `html.dark`).

Restricciones durables (no se negocian):

- **Sin backend, sin tracking, sin cookies.** El sitio es estático. No se introduce analítica remota; el docente eligió Pinax precisamente por ser local-first.
- **Sin formulario de captura, sin newsletter, sin popups de consentimiento.** El landing informa y enlaza; no recolecta.
- **Idioma español** como idioma por defecto.
- **Identidad visual de la app:** la landing usa los tokens shadcn de `apps/desktop/` (oklch, primario azul, neutros). El icono de marca (`pinax.svg`/`.png`) se mantiene: cuadrado negro con bordes redondeados y glifo de gráfico de barras, sin texto en el logo. El landing no introduce colores adicionales fuera del sistema shadcn.

Hechos explícitamente no decididos: capturas de pantalla oficiales de Pinax Desktop (¿se generan antes de publicar?), dominio público final, hosting/CDN concreto, multi-idioma activo (EN/ES), instaladores para Windows y macOS.

## Brand Commitments

- **Nombre:** Pinax Desktop en marketing; la app interna sigue llamándose `pinax` (`app.setName('pinax')` en `electron/main.ts`).
- **Icono y favicon:** `pinax.svg` y `pinax.png` desde `apps/desktop/public/`. Sin palabra escrita en el logo.
- **Paleta:** sistema shadcn/ui basado en tokens `oklch` alineado con `apps/desktop/`: fondos neutros, azul primario (`--primary`), tarjetas con borde y radio. La landing comparte el lenguaje visual de la app. El icono de la marca (`pinax.svg`) sigue siendo el cuadrado negro con el glifo de gráfico de barras — sin texto en el logo.
- **Idioma:** español. Copy dirigido al docente, no al ingeniero.
- **Personalidad:** herramienta seria de aula, no landing de startup gamificada ni portfolio de diseñador.
- **Posición de mercado (standing preference, fijada por el usuario):** el landing de Pinax se sitúa junto a landings canónicos de aplicaciones de escritorio open-source y local-first. Referencias de craft confirmadas por el usuario: **Obsidian** (`obsidian.md`) y **Joplin** (`joplinapp.org`). El landing debe ejecutar ese canon a fidelidad plena — sin ironía, sin quirk colado, sin reinvención del formato. Hero + tagline + CTA principal, pilares de valor, secciones por feature con una imagen cada una, prensa (si existe), footer con repo y redes. La marca se gana en los detalles tipográficos y de microcopy, no en desviarse del formato.
- **Tema de color (standing preference, override del monochromo inicial):** la landing hereda los tokens shadcn de `apps/desktop/` (oklch, `--background`, `--foreground`, `--primary` azul, `--muted`, `--border`, etc.) en lugar de un monochromo personalizado. El landing debe poder leerse como un documento del mismo producto que la app, no como una marca visual distinta.

## Evidence on Hand

- Icono y favicon de la app: `apps/desktop/public/pinax.{png,svg,ico,icns}`.
- Instalador real: `release/0.0.0/pinax-Linux-0.0.0.AppImage` (Linux).
- Código fuente completo en el repo, abierto.
- Ausencias que la landing **no debe** fabricar: testimonios de usuarios, métricas de uso, capturas de prensa, logos de instituciones, claims de "el más usado". Todo eso es ficticio hasta que exista evidencia.

## Product Principles

1. **El instalador es el producto.** Cada elemento de la landing acerca al docente a "descargar y abrir". Lo que no acerca a la descarga sobra.
2. **Honestidad radical.** No se promete lo que el código no entrega. La landing refleja lo que Pinax Desktop es hoy.
3. **Español, en serio.** Copy, etiquetas y microcopy leen como español natural para un profesor de primaria.
4. **Respeto por defecto.** Sin popups de consentimiento, sin cookies, sin formularios. Un sitio que respeta al visitante tanto como la app respeta sus datos.
5. **Local-first también en la web.** La landing es estática, no rastrea, no loguea. La promesa de privacidad empieza antes del primer byte de la app.

## Accessibility & Inclusion

Igual que en `apps/desktop/PRODUCT.md`, no se ha confirmado un estándar formal (WCAG 2.x AA). El sitio debe partir de base accesible: HTML semántico, contraste suficiente, foco visible, respeto de `prefers-reduced-motion`, navegación por teclado en CTAs y enlaces. Pendiente de confirmar con el usuario el nivel objetivo antes de auditar.