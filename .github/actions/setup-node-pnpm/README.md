# setup-node-pnpm (D2)

SSOT para `pnpm/action-setup` + `actions/setup-node@v4` + `ensure-main` + `pnpm install`.

## Por qué existe
Elimina duplicación de `pnpm/action-setup@v4` / `setup-node@v4` / `node-version: 24` / `fetch main` / `pnpm install` que antes aparecía en 7+ jobs. Unifica `node-version: 24` y el cache del store.

## Inputs
| Input | Default | Descripción |
|---|---|---|
| `node-version` | `24` | Versión Node (pin fijo, no runner default) |
| `cache` | `pnpm` | Valor para `setup-node.cache` (`pnpm` o `""` para skip cache) |
| `install` | `true` | `true` → `pnpm install --frozen-lockfile` |
| `setup-pnpm` | `true` | `false` → skip `pnpm/action-setup` (jobs que solo necesitan `node+gh`, ej. `trigger-prerelease:parse`) |
| `ensure-main` | `false` | `true` → `git branch main origin/main` si no existe local (requerido para `changeset status` que diff contra `main`) |

## Uso
```yaml
# Caso estándar (build / lint)
- uses: ./.github/actions/setup-node-pnpm

# Solo Node+gh, sin pnpm ni install (parse)
- uses: ./.github/actions/setup-node-pnpm
  with:
    cache: ""
    install: "false"
    setup-pnpm: "false"

# Compute alpha/rc (necesita main para changeset status + pnpm install)
- uses: ./.github/actions/setup-node-pnpm
  with:
    cache: pnpm
    install: ${{ inputs.prerelease != '' }}
    ensure-main: ${{ inputs.prerelease != '' }}
```

## Cableado verificado Fase 3
| Job | `cache` | `install` | `ensure-main` | Justificación |
|---|---|---|---|---|
| `_build-artifacts:compute` | `pnpm` | `${{ prerelease != '' }}` | `${{ prerelease != '' }}` | alpha/rc necesita `changeset status` → `main` + deps; official solo lee `package.json` → no install |
| `_build-artifacts:build-desktop/landing` | `pnpm` | `true` | `false` | build siempre instala |
| `_publish-release:publish` | `""` | `false` | `false` | solo `gh release create` |
| `trigger-prerelease:parse` | `""` | `false` | `false` | solo `gh api` + `node -p` |
| `check-*`, `deploy-landing` | `pnpm` | `true` | `false` | build/lint estándar |

## Notas
- `ensure-main` hace `git show-ref --verify refs/heads/main || git branch main origin/main` (asume `fetch-depth: 0` previo). No hace `fetch` adicional.
- Todos los jobs deben seguir usando `node-version: 24` explícito vía este composite; no hardcodear `actions/setup-node@v4` fuera.
