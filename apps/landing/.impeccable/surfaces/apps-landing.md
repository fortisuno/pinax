---
version: 1
slug: "apps-landing"
primary_target: "apps/landing"
related_targets: []
---

# Surface Brief — Landing Pinax Desktop

## Scope and visitor mode

Persuade. Single canonical landing page (`apps/landing/`) that converts a visiting primary school teacher into a desktop installer download. The visitor arrives cold (search, recommendation, link) and decides in minutes whether Pinax is worth installing.

## Audience, job, action, proof, constraints

- **Audience:** profesores de primaria que evalúan con rúbrica ponderada y manejan un grupo en su equipo personal. Comparten idioma (español), herramientas (ordenador propio, sin obligación de red) y dolor (cuaderno u hoja de cálculo para notas finales).
- **Job:** decidir si Pinax vale la pena instalar.
- **Action:** descargar el instalador (Linux AppImage hoy; Windows y macOS próximamente) o visitar el repositorio para verificar.
- **Proof:** los únicos activos verificables son la app misma (código en el repo), el icono (`apps/desktop/public/pinax.{png,svg}`) y el instalador real (`release/0.0.0/pinax-Linux-0.0.0.AppImage`). No hay testimonios, métricas, prensa ni logos de clientes. Toda afirmación que no se sostenga sobre estos activos queda prohibida.
- **Constraints:** sitio estático sin backend, sin tracking, sin cookies, sin formularios. Español. Paleta monocroma heredada de la identidad de la app. Modo oscuro alineado con `next-themes`. Icono sin texto. Sin claims de marketing genérico. Tipografía con carácter (no Impact / Arial Black / system display).

## Chosen direction and memorable moment

**Canon (standing exit) ejecutado a fidelidad plena**, sentándose junto a landings de referencia confirmadas por el usuario: **Obsidian** (`obsidian.md`) y **Joplin** (`joplinapp.org`). El formato canónico es: hero con identidad + tagline + CTA principal, tres pilares cortos de valor, secciones por feature (cada una con una imagen o diagrama), footer con repo y enlaces. Sin ironía, sin quirk colado, sin reinvención del formato. La marca se gana en los detalles tipográficos, la calidad de las ilustraciones SVG y el microcopy en español, no en desviarse del formato.

**Memorable moment:** la sección "Cómo funciona" muestra la rúbrica ponderada como un diagrama SVG nítido (cuatro columnas: tareas, criterios adicionales, pesos, nota final) — el mecanismo que ninguna hoja de cálculo puede replicar sin escribir fórmulas.

## Direction contract (development-only, max 150 words)

**THESIS:** el landing es un documento de open-source local-first ejecutado al craft de Obsidian/Joplin; rechaza el card-grid genérico de SaaS.

**OWN-WORLD:** sistema shadcn/ui basado en tokens oklch alineado con `apps/desktop/`. Primario azul (`oklch(0.52 0.105 223.128)` claro / `oklch(0.715 0.143 215.221)` oscuro). Tarjetas `bg-card` con borde `var(--border)` y radio `rounded-xl`. Tipografía serif con peso para titulares (`Source Serif 4`) + grotesk de trabajo (`IBM Plex Sans`) + mono (`IBM Plex Mono`). Iconografía de línea 1.5–1.8 px, ilustraciones SVG planas, sombras sólo `shadow-sm`/`shadow-md`. Sobrescribe el compromiso monochromo previo.

**STORY:** el visitante entiende en un golpe que Pinax es una app de escritorio seria para profesores de primaria, reconoce el sistema visual shadcn como el mismo de la app de escritorio, cree que la nota ponderada es automática y local, y descarga el AppImage (o visita el repo).

**FIRST VIEWPORT:** viewport completo de escritorio. Centro óptico ocupado por el icono de Pinax (96-128 px). Bajo el icono, el wordmark "Pinax Desktop" en serif grande (~64 px). Debajo, una sola línea de tagline en grotesk. Bajo el tagline, dos botones lado a lado: primario `bg-primary` "Descargar para Linux" + secundario con borde `bg-card` "Ver en GitHub". Bajo los botones, una línea micro "Windows · macOS — próximamente · 100% local, sin cuentas". Sin cards, sin kickers, sin eyebrow labels.

**FORM:** canon (joplin/obsidian) + override de paleta a shadcn-style; picked from standing exit, then refined to match desktop's oklch token system. Seed key `021a8692`.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved decisions

- Capturas reales del producto vs. ilustraciones SVG del mecanismo (depende de si la app arranca headless para captura).
- Capturas de la app para la sección "Cómo se ve": si Playwright/Chromium arranca la build de Vite, capturar; si no, ilustraciones SVG.
- Dominio final y CDN de despliegue (fuera de alcance).
- Multi-idioma (EN/ES) — explícitamente fuera de alcance inicial.
