# Pinax Desktop

Aplicación de escritorio para gestión de criterios de evaluación. Monorepo gestionado con pnpm workspaces.

## Estructura

```
├── apps/
│   └── desktop/     # App Electron (@pinax/desktop): React + Vite + Tailwind v4 + shadcn/ui
├── release/         # Artefactos generados por electron-builder
└── pnpm-workspace.yaml
```

## Comandos

| Comando       | Descripción                                            |
| ------------- | ------------------------------------------------------ |
| `pnpm install`| Instala las dependencias de todos los workspaces       |
| `pnpm dev`    | Modo desarrollo (Vite + Electron)                      |
| `pnpm build`  | Compila y empaqueta (tsc + vite + electron-builder)    |
| `pnpm lint`   | ESLint en todos los workspaces                         |

## shadcn

El CLI de shadcn debe ejecutarse dentro del workspace de la app:

```bash
cd apps/desktop
pnpm exec shadcn add [componente]
```
