# Composite Actions — SSOT CI/CD

Fase 1–3 de la refactorización (`C:\Users\d_mas\Workspace\pinax\.github\actions/`).

| ID | Action | SSOT que protege | Fase |
|---|---|---|---|
| D1 | `detect-packages` | Parseo `.changeset/*.md` → `["pinax-desktop","pinax-landing"]` (filtra `config.json/README.md/commit.mjs`, `status: removed`, patch truncado) | 1 |
| D2 | `setup-node-pnpm` | `pnpm/action-setup@v4` + `actions/setup-node@v4@24` + `ensure-main` + `pnpm install --frozen-lockfile` | 1 |
| P3 | `resolve-desktop-matrix` | `macos-26` pin + 4 filas desktop matrix + scoping `win11|linux|mac` | 2 |
| P4 | `get-version` | `VERSION=$(node -p "JSON.parse…")` → `extraMetadata.version` | 2 |

## `compute-release-plan` — decisión Fase 3: permanece inline

`_build-artifacts.yaml:compute` (140 líneas, `changeset status` + variantes `alpha`/`rc`/`official` + G5) **no se extrae** a composite.

| Criterio | Peso | Evidencia |
|---|---|---|
| Reutilización | alto | **1 consumidor único** (`_build-artifacts:compute`). `trigger-release:prepare` tiene bloque distinto (30 líneas, solo official) — no deduplica. |
| Acoplamiento | alto | Requiere `checkout(fetch-depth:0)+setup-node-pnpm(ensure-main)+trap cs.tmp.json+git tag -l+package.json+CHANGELOG+GITHUB_OUTPUT` en mismo job. Extraer obligaría a replicar plumbing de 6 outputs + 3 inputs sin ganancia. |
| Riesgo cambio | medio | `node -e` con quoting anidado ya probado inline; mover a composite añade capa de interpolación `inputs → env` y dificulta `actionlint`/`yaml.safe_load` debug. |
| Coste vs beneficio | bajo ROI | ~40 líneas de composite + mapeo + tests vs 0 líneas ahorradas (sigue un solo call-site). Evaluación Fase 2 confirmada Fase 3. |
| Documentación | compensado | Pulido Fase 3: READMEs D1–P4 + comentarios inline + tabla decisión en este README y en `AGENTS.md:CI gotchas`. |

**Pulido Fase 3 en su lugar:** `ensure-main` cableado (`prerelease != ''` solo alpha/rc), G5 doble capa (`compute` filtra + `_publish-release` safety net + `trigger-release:prepare` pre-filtro), `setup-node-pnpm` en los 11 jobs, `get-version` sin fuga de literales, `macos-26` solo en P3, y `trap rm -f cs.tmp.json` + `.gitignore` `cs.tmp.json`.

## Uso rápido
```yaml
- uses: ./.github/actions/setup-node-pnpm
  with: { cache: pnpm, install: "true", ensure-main: "false" }

- uses: ./.github/actions/detect-packages
  with: { pr-number: "123", repo: "fortisuno/pinax", token: "${{ secrets.GITHUB_TOKEN }}", fallback: both }

- uses: ./.github/actions/resolve-desktop-matrix
  with: { os-arg: "win11" }

- uses: ./.github/actions/get-version
  with: { versions-json: '{"pinax-desktop":"0.2.0-alpha.1+abc1234"}', package: pinax-desktop }
```
