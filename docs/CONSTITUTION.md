# Constitución Pinax
1. Monorepo pnpm: solo `apps/desktop` y `apps/landing`; verifica `pnpm-workspace.yaml`.
2. Desktop: Electron ^30 + React ^19 + Vite ^5 + TS ^5.2 (ES2020); verifica `apps/desktop/package.json`.
3. Landing estática: Astro ^7.3.1 + Tailwind ^4.3.3, sin backend ni tracking; verifica `apps/landing/package.json` + `astro build`.
4. Local-first: solo `localStorage` (`pinax-evaluation`, `pinax-students`); prohibido backend/sync/telemetría.
5. Notas 0–10 un decimal con Zod (`gradeSchema`); rango nunca ampliable.
6. Rúbrica docente configurable (cantidad/peso/criterios); prohibida ponderación fija.
7. PDF es el entregable: `jsPDF` en renderer, único IPC `pdf:save`, `contextIsolation` on.
8. Verde = `pnpm lint` + `tsc` + build; sin framework de tests por decisión explícita.
9. Español UI/copy/errores, código inglés; prohibidos claims sin evidencia.
10. PR con changeset (`--empty` si docs); nunca editar `version` a mano.
