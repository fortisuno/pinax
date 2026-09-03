# Pinax

Monorepo gestionado con pnpm workspaces: aplicación de escritorio para gestión de criterios de evaluación y landing page.

## Estructura

```
├── apps/
│   ├── desktop/     # App Electron (@pinax/desktop): React + Vite + Tailwind v4 + shadcn/ui
│   └── landing/     # Landing page (@pinax/landing): Astro + Tailwind v4
├── release/         # Artefactos generados por electron-builder
└── pnpm-workspace.yaml
```

## Comandos

| Comando               | Descripción                                            |
| --------------------- | ------------------------------------------------------ |
| `pnpm install`        | Instala las dependencias de todos los workspaces       |
| `pnpm dev`            | Modo desarrollo de desktop (Vite + Electron)           |
| `pnpm dev:desktop`    | Modo desarrollo de desktop                             |
| `pnpm dev:landing`    | Modo desarrollo de landing (Astro)                     |
| `pnpm build`          | Compila y empaqueta desktop (tsc + vite + electron-builder) |
| `pnpm build:desktop`  | Compila y empaqueta desktop                            |
| `pnpm build:landing`  | Compila landing (Astro)                                |
| `pnpm lint`           | Lint en todos los workspaces                           |

## shadcn

El CLI de shadcn debe ejecutarse dentro del workspace de la app:

```bash
cd apps/desktop
pnpm exec shadcn add [componente]
```
