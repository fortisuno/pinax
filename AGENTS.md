# AGENTS.md

Pinax — pnpm-workspace monorepo with two private packages: `@pinax/desktop`
(apps/desktop, Electron + React + Vite) and `@pinax/landing` (apps/landing,
Astro). Docs/UI product copy are Spanish-first. There are **no tests** in the
repo: verification is `pnpm lint` + typecheck/build.

## Commands

- `pnpm dev` / `pnpm dev:desktop` — Vite + Electron dev for desktop. `pnpm dev:landing` — Astro dev.
- `pnpm build` / `pnpm build:desktop` — compiles **and packages** installers via electron-builder (slow, OS-bound). For a fast compile-only check use `pnpm --filter @pinax/desktop dist` (tsc + vite build only).
- `pnpm build:landing` — `astro build` → `apps/landing/dist`.
- `pnpm lint` — lints all workspaces (`eslint` for desktop, `astro check` for landing). `--no-bail`.
- shadcn CLI must run **inside** `apps/desktop`: `pnpm exec shadcn add <component>` (it's a workspace dependency there, not in root).
- Root workflow: install → lint → dist/build. CI forces `pnpm install --frozen-lockfile` and Node 24.

## Changesets & versioning

- Every feature/fix PR **must** include ≥1 `.changeset/*.md`; enforced by a required status check (`changeset-required`). Docs-only PRs use `pnpm changeset add --empty`. Exemption for the release PR is handled in-workflow, don't remove it.
- `.changeset/commit.mjs` defines only `getAddMessage`. `getVersionMessage` is intentionally absent → `pnpm version-packages` (`changeset version`) never auto-commits; version bumps + CHANGELOG edits stay uncommitted for review.
- **Never hand-edit `version` in `apps/*/package.json`.** Versions are bumped only by `changesets/action` on its `changeset-release/main` branch.
- `changeset status --output=<tmp>.json` writes a file; use temp paths (`.gitignore`d) and never commit status output (root `changeset-status.json` was removed for this reason).
- Changesets versioning runs on `main` only (baseBranch `main`).

## Release pipeline

See `docs/DFA_CICD_DESIGN.md` (design/DFA source of truth) and the workflows in
`.github/workflows/`:

- `/prerelease [win11|linux|mac]` comment on a PR → alpha release. Optional OS arg scopes the desktop matrix; omitted = all 4. Version `X.Y.Z-alpha.N+<sha7>` (N = max existing tag counter + 1).
- Merge feature PR → RC release `X.Y.Z-rc.N` + "Version Packages" PR (changesets/action creates/updates it).
- Merge "Version Packages" PR → official releases `X.Y.Z` per changed package.
- Release **tags are named `pinax-desktop@<V>` / `pinax-landing@<V>`**, not `v<V>` (legacy `v0.1.x` tags are history). One release per changed package; `pinax-landing@<V>` ships `pinax-landing-<V>.zip`, `pinax-desktop@<V>` ships installers for all 3 OS.
- Versions are computed from `changeset status` (target next version), never from the working tree; package.json is left untouched on `main`/feature branches. All builds pin an exact SHA (`github.sha`, PR head sha, `merge_commit_sha`) — never branch tips.
- Publishing a tag that already exists is an idempotent skip (G5), by design.
- Branch protection (manual, GitHub Settings): required PR, checks `changeset-required` + `lint-build`, "branches up to date" OFF.

## Desktop app rules (`apps/desktop`)

- **Unidirectional imports, never inverted:** `src/lib` + `src/stores` (domain) → `src/components/{criteria,students}` (features) → `src/components/ui` (pure, domain-agnostic primitives) → shell (`App.tsx` + `Sidebar`).
- State lives in Zustand stores with `persist` middleware → localStorage keys `pinax-evaluation` and `pinax-students`. Mutations must be immutable.
- All inputs validated with Zod (grades 0–10, one decimal; weight percentages; names). Forms via TanStack Form.
- UI text is Spanish-first.
- Electron: strict context isolation, minimal IPC surface — `window.api.savePdf` ↔ `pdf:save` channel (see `electron/main.ts`, `electron/preload.ts`). Never enable `nodeIntegration`.
- macOS builds are **ad-hoc signed** (no Developer ID cert). Keep `hardenedRuntime: false` in `electron-builder.json5` — flipping it without a cert causes Gatekeeper "damaged" rejections.
- DMG `title` must include `${arch}` or concurrent x64+arm64 mounts corrupt each other. Build one arch per electron-builder invocation (via `dist` + direct `electron-builder --mac --x64|--arm64`), not through the `build` script.
- CI mac jobs are pinned to `macos-26`, never floating `latest`. Keep that pin; never "fix" the new release matrix into using latest.

## Landing (`apps/landing`)

- Astro + Tailwind v4, output `apps/landing/dist`. Deployed to GitHub Pages at base path `/pinax` manually via `deploy-landing.yml` (`workflow_dispatch`). Pages source must stay "GitHub Actions".
- Landing releases (zip) are versioned snapshots; Pages deploy is the live site — they are independent.

## CI gotchas

- All jobs explicitly use `actions/setup-node@v4` with `node-version: 24` — don't rely on runner defaults.
- Reusable `publish-release.yml` is invoked from `prerelease.yml`, `release-candidates.yml`, `publish-official.yml` via `uses: ./.github/workflows/...`.
- Local subagents exist for scoped work: `.opencode/agents/pinax-desktop-engineer.md` (desktop architecture compliance) and `.opencode/agents/gitops-cicd-engineer.md` (workflows/releases).