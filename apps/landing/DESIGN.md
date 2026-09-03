---
name: Pinax Desktop — Landing
description: Landing canónica para la app de escritorio de cálculo de notas ponderadas. Sistema shadcn/ui alineado con apps/desktop/.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.145 0 0)"
  primary: "oklch(0.52 0.105 223.128)"
  primary-foreground: "oklch(0.984 0.019 200.873)"
  secondary: "oklch(0.967 0.001 286.375)"
  secondary-foreground: "oklch(0.21 0.006 285.885)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  accent: "oklch(0.967 0.001 286.375)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
  dark-background: "oklch(0.145 0 0)"
  dark-foreground: "oklch(0.985 0 0)"
  dark-card: "oklch(0.205 0 0)"
  dark-card-foreground: "oklch(0.985 0 0)"
  dark-primary: "oklch(0.715 0.143 215.221)"
  dark-border: "oklch(1 0 0 / 10%)"
typography:
  scale:
    "5rem": "5rem"
    "2.7rem": "2.7rem"
    "2.6rem": "2.6rem"
    "2.4rem": "2.4rem"
    "2rem": "2rem"
    "1.9rem": "1.9rem"
    "1.45rem": "1.45rem"
    "1.35rem": "1.35rem"
    "1.18rem": "1.18rem"
    "1.06rem": "1.06rem"
    "1rem": "1rem"
    "0.96rem": "0.96rem"
    "0.82rem": "0.82rem"
    "0.78rem": "0.78rem"
    "0.74rem": "0.74rem"
    "0.68rem": "0.68rem"
    "0.66rem": "0.66rem"
  display:
    fontFamily: "Source Serif 4, Iowan Old Style, Apple Garamond, Georgia, serif"
    fontSize: "clamp(2.6rem, 7vw, 5rem)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Source Serif 4, Iowan Old Style, Apple Garamond, Georgia, serif"
    fontSize: "clamp(1.9rem, 4vw, 2.4rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "IBM Plex Sans, Helvetica Neue, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Sans, Helvetica Neue, system-ui, sans-serif"
    fontSize: "0.82rem"
    letterSpacing: "0.18em"
    textTransform: "uppercase"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.78rem"
rounded:
  sm: "calc(var(--radius) * 0.6)"
  md: "calc(var(--radius) * 0.8)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) * 1.4)"
  radius-base: "0.625rem"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
  section: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "calc(var(--radius) * 0.8)"
    padding: "0.875rem 1.75rem"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "calc(var(--radius) * 0.8)"
    padding: "0.875rem 1.75rem"
    opacity: "0.9"
  button-secondary:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-foreground}"
    rounded: "calc(var(--radius) * 0.8)"
    border: "1px solid {colors.border}"
    padding: "0.875rem 1rem"
  button-secondary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.foreground}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "calc(var(--radius) * 1.4)"
    border: "1px solid {colors.border}"
    padding: "1.75rem"
  nav-link:
    typography: "{typography.label}"
    textColor: "{colors.muted-foreground}"
  nav-link-hover:
    textColor: "{colors.foreground}"
---

# Design System: Pinax Desktop — Landing

## Overview

**Creative North Star: "El mismo producto, leído en el navegador."**

Landing canónica para Pinax Desktop. La decisión fundacional de esta iteración es que la landing hereda el sistema de tokens shadcn/ui de `apps/desktop/`: oklch, fondo neutro claro/oscuro, primario azul, tarjetas con borde y radio `0.625rem`. La landing debe poder leerse como un documento del mismo producto que la app, no como una marca visual distinta.

Antes de esta iteración la landing era monocroma (papel + tinta) como延续 del icono de marca. Ese compromiso se sustituye por shadcn — la promesa de privacidad y consistencia con la app pesa más que la coherencia con el cuadrado negro del icono. El icono sigue siendo el cuadrado negro con el glifo de gráfico de barras; el resto de la landing se apoya en el sistema shadcn.

La forma es deliberadamente convencional: hero con icono + wordmark + tagline + CTA principal, tres pilares cortos, secciones por feature con un diagrama SVG cada una, footer con repo y enlaces. Sin ironía, sin quirk colado, sin reinvención del formato.

**Key Characteristics:**
- Sistema shadcn/ui (oklch) alineado con `apps/desktop/`.
- Primario azul (`oklch(0.52 0.105 223.128)` claro / `oklch(0.715 0.143 215.221)` oscuro).
- Tarjetas con borde + radio `0.625rem` y sombra suave (`shadow-sm`).
- Tipografía con peso: Source Serif 4 para titulares, IBM Plex Sans para cuerpo, IBM Plex Mono para microcopy.
- Diagramas SVG autorales que muestran el mecanismo (rúbrica, datos locales, PDF).

## Colors

El sistema sigue los tokens canónicos shadcn/ui. Modo claro: blanco puro como fondo, gris-cálido muy sutil para `muted`, primario azul saturado pero contenido. Modo oscuro: casi-negro como fondo, tarjetas un escalón más claras que el fondo, primario azul más claro y saturado para asegurar contraste sobre fondo oscuro.

### Primary
- **Azul Pinax** (`oklch(0.52 0.105 223.128)` en claro, `oklch(0.715 0.143 215.221)` en oscuro): CTA primarios, el recuadro de la "Nota final" en el diagrama de rúbrica, los valores destacados en la tabla del PDF, los bordes que quieren decir "esto está activo". Saturado pero contenido — el primario nunca decora, siempre actúa.

### Secondary / Accent
- **Secundario** (`oklch(0.967 0.001 286.375)` en claro, `oklch(0.274 0.006 286.033)` en oscuro): estado neutro elevado. Usado en hover de botones secundarios.
- **Acento** (`oklch(0.967 0.001 286.375)` / `oklch(0.269 0 0)`): misma familia que secundario; sirve para estados sutiles de hover.

### Neutral
- **Fondo** (`oklch(1 0 0)` en claro, `oklch(0.145 0 0)` en oscuro): la página misma.
- **Foreground** (`oklch(0.145 0 0)` / `oklch(0.985 0 0)`): texto principal.
- **Tarjeta** (`oklch(1 0 0)` / `oklch(0.205 0 0)`): fondo de figuras, pilares, vista previa del PDF. Un escalón más profundo que la página en oscuro, igual al fondo en claro.
- **Muted foreground** (`oklch(0.556 0 0)` / `oklch(0.708 0 0)`): texto secundario, captions, microcopy.
- **Borde** (`oklch(0.922 0 0)` / `oklch(1 0 0 / 10%)`): línea de borde en figuras, tarjetas, divisores de tabla.

### Destructive
- **Rojo destructivo** (`oklch(0.577 0.245 27.325)` / `oklch(0.704 0.191 22.216)`): reservado para errores y la línea tachada del diagrama de privacidad.

### Named Rules
**The Primary Acts Rule.** El primario azul aparece sólo donde hace algo: el botón de descarga, la "Nota final" del diagrama, los valores destacados de la tabla. Nunca decora, nunca rellena un área inactiva. Su rareza es el punto.

**The Border-First Rule.** Antes de añadir cualquier sombra o fondo elevado, considera un borde `var(--border)`. La sombra `shadow-sm` queda reservada para tarjetas que la necesitan (pilares, PDF preview).

## Typography

**Display Font:** Source Serif 4 con fallback a Iowan Old Style / Georgia.
**Body Font:** IBM Plex Sans con fallback a system-ui.
**Mono Font:** IBM Plex Mono para microcopy, captions y figuras dentro de SVG.

**Character:** Una serif humanista contemporánea para titulares (no display exuberante; no revival) acompañada de un grotesk institucional de IBM para cuerpo. La serif tiene peso y variación óptica, lo que le da presencia sin pomposidad. El sans es neutro, técnico, serio — habla como un manual, no como un brochure.

### Hierarchy
- **Display** (Source Serif 4, weight 500, `clamp(2.6rem, 7vw, 5rem)`, line-height 1.04, tracking `-0.025em`): solo el wordmark "Pinax Desktop" en el hero.
- **Display final** (Source Serif 4, weight 500, `clamp(2rem, 5vw, 2.7rem)`, line-height 1.06, tracking `-0.025em`): titular de la sección de cierre (CTA final). Un escalón menor que el wordmark del hero.
- **Headline** (Source Serif 4, weight 500, `clamp(1.9rem, 4vw, 2.4rem)`, line-height 1.1, tracking `-0.025em`): titulares de sección. Sin eyebrow.
- **Headline-hero** (IBM Plex Sans, weight 400, `clamp(1.06rem, 1.5vw, 1.18rem)`, line-height 1.55): tagline bajo el wordmark — el único paso del cuerpo entre el display y el cuerpo estándar.
- **Title** (Source Serif 4, weight 500, 1.35–1.45 rem, line-height 1.2): titulares de pilares.
- **Body** (IBM Plex Sans, weight 400, 1 rem, line-height 1.6): párrafos. Medida ≤ 75ch.
- **Body-CTA** (IBM Plex Sans, weight 500, 0.96 rem): texto de botones primarios y secundarios (un escalón más pequeño que body estándar para alinear con la altura de los iconos 16 px).
- **Label** (IBM Plex Sans, weight 400, 0.82 rem, tracking 0.18em, uppercase): navegación, captions de figuras.
- **Label-tight** (IBM Plex Mono, weight 400, 0.74 rem): microcopy técnico (header del repo tree, captions secundarios del PDF preview).
- **Caption** (IBM Plex Mono, weight 400, 0.66–0.68 rem): notas al pie dentro de figuras (cabecera del PDF, footer de página).

### Named Rules
**The No-Kicker Rule.** Ningún titular lleva eyebrow, kicker ni label numeral encima. El heading carga su propio peso.

## Layout

Una rejilla vertical con ritmo generoso entre secciones (`py-20` → `py-28` → `py-32`). Contenedor `max-w-5xl` (64 rem) en pilares y secciones; `max-w-3xl` (48 rem) en hero y CTA final. Las figuras que comparten sección con texto se ordenan en grid 12 columnas: header en `md:col-span-5`, figura en `md:col-span-7`, alternando orden visual. En `md` y superiores las rejillas se duplican o triplican; en `sm` se apilan en columna única.

Las tarjetas usan `rounded-xl` (≈ `calc(var(--radius) * 1.4)` ≈ 14px) con `border` + `bg-card` + `shadow-sm`. Los pilares usan exactamente esta fórmula. Las figuras dentro de las secciones usan la misma fórmula. El radio `--radius: 0.625rem` (≈ 10px) controla el resto: botones `rounded-md`, inputs `rounded-md`, PDF preview `rounded-lg`.

## Elevation & Depth

La profundidad usa el sistema shadcn:
1. **Borde** `var(--border)` — el mecanismo dominante. Cualquier separación entre regiones.
2. **Fondo de tarjeta** `var(--card)` — para figuras, pilares, vista previa del PDF. Un escalón por encima de la página en modo oscuro.
3. **Sombra `shadow-sm`** — aplicada a pilares y al PDF preview. Sutil, estructural, no decorativa.
4. **`bg-muted` o `bg-muted/30` para bandas alternas** — privacidad y código abierto usan un fondo muted suave como banda de separación.

No hay sombras duras con offset. No hay `box-shadow` con valores manuales fuera del sistema Tailwind.

### Named Rules
**The Border-First Rule.** Antes de añadir cualquier sombra, considera un borde. La sombra `shadow-sm` queda reservada para tarjetas que la necesitan para sentirse "elevadas" sobre la página (pilares, PDF preview).

## Shapes

- **Botones primarios y secundarios:** `rounded-md` (≈ 8px). El radio nunca es cero (eso sería la doctrina del periodo anterior, ya retirada).
- **Tarjetas (pilares, figuras, PDF preview):** `rounded-xl` (≈ 14px).
- **Icono Pinax:** `rx="80"` sobre la plaza de `1024 px`. Se mantiene como el elemento de mayor radio — es la firma de la marca.
- **No formas orgánicas, no máscaras circulares para ilustrar, no `clip-path` decorativo.**

## Components

### Buttons
- **Primary:** `bg-primary`, texto `text-primary-foreground`, `rounded-md`, padding `0.875rem 1.75rem`, font-weight 500, sombra `shadow-sm`. Hover: `opacity: 0.9`.
- **Secondary (ghost con borde):** `bg-card`, texto `text-muted-foreground`, `border border-border`, `hover:bg-accent hover:text-foreground`.
- **Focus:** outline visible estándar del navegador. Navegación por teclado accesible por defecto.

### Navigation
- **Tipo:** label uppercase (`0.18em` tracking).
- **Estilo:** links de texto muted → foreground en hover. Sin fondo, sin underline.
- **Mobile:** el link "Descargar" del nav se oculta por debajo de `md` y queda redundante con el CTA del hero.

### Figures / Diagram cards
- **Background:** `bg-card`.
- **Border:** `1px solid var(--border)`.
- **Radius:** `rounded-xl`.
- **Shadow:** `shadow-sm`.
- **Padding:** `1.75–2 rem`.

### Pillar cards
- **Background:** `bg-card`.
- **Border + radius + shadow:** igual que las figuras.
- **Padding:** `1.75–2 rem` (responsive).
- **Sin número, sin kicker, sin icono decorativo encima del titular.**

### Signature component: vista previa del PDF
- **Background:** `bg-card` (igual que el resto de tarjetas).
- **Border:** `1px solid var(--border)`.
- **Radius:** `rounded-lg`.
- **Shadow:** `shadow-md` (un escalón más fuerte que las tarjetas estándar, anclando el artefacto como "entregable").
- **Valores destacados** en la columna Final en `text-primary` y font-medium.

## Do's and Don'ts

### Do:
- **Do** usa el sistema de tokens shadcn (`bg-background`, `text-foreground`, `bg-card`, `text-primary`, `border-border`, etc.) — nunca introduzcas valores cromáticos fuera de la paleta.
- **Do** mantén el primario azul reservado para acciones y para destacar valores en datos (la columna Final del PDF, la "Nota final" del diagrama).
- **Do** usa `rounded-xl` para tarjetas y figuras, `rounded-md` para botones.
- **Do** mantén el icono de marca (`pinax.svg`) sin alterar — sigue siendo el cuadrado negro con el glifo de gráfico de barras.

### Don't:
- **Don't** introduzcas un color saturado fuera del primario azul. La jerarquía se gana con tokens semánticos y peso tipográfico.
- **Don't** uses sombras blandas decorativas (`shadow-2xl`, drop shadows, glow). El sistema se queda en `shadow-sm` / `shadow-md`.
- **Don't** uses cards como contenedor perezoso de la página para secciones enteras; las secciones son secciones, las cards son regiones dentro de una sección.
- **Don't** uses emoji como iconos. Los iconos se dibujan (línea 1.5–1.8px, `lucide`-style) o se extraen del glifo de `pinax.svg`.
- **Don't** uses eyebrow / kicker / section numerals arriba de los titulares. El heading carga su propio peso.
- **Don't** devuelvas la paleta a monochromo o a valores personalizados. El compromiso actual es shadcn.