# detect-packages (D1)

SSOT para detectar qué packages (`pinax-desktop` / `pinax-landing`) toca un PR a partir de sus `.changeset/*.md`.

## Por qué existe
Centraliza el parseo de changesets vía `gh api` (con fallback a `gh api contents` si el patch está truncado). Evita duplicar lógica de filtrado `config.json/README.md/commit.mjs` y `status: removed` en `trigger-prerelease` y `check-lint-builds`.

## Inputs / Outputs
| Input | Req | Default | Descripción |
|---|---|---|---|
| `pr-number` | no | `""` | Nº de PR. Vacío en `push` (ej. `check-lint-builds: push:main`) → skip `gh api`, usa `fallback` |
| `repo` | sí | — | `owner/repo` |
| `token` | sí | — | `GITHUB_TOKEN` para `gh` |
| `fallback` | no | `both` | `both` → `["pinax-desktop","pinax-landing"]` si no detecta; `empty` → `[]` (prerelease) |

Output `packages`: JSON array `["pinax-desktop","pinax-landing"]`.

## Uso
```yaml
- uses: ./.github/actions/detect-packages
  id: pkgs
  with:
    pr-number: ${{ github.event.pull_request.number }}
    repo: ${{ github.repository }}
    token: ${{ secrets.GITHUB_TOKEN }}
    fallback: both   # check-lint-builds
    # fallback: empty # trigger-prerelease (no fantasma en alpha)
```

## Cableado actual
- `trigger-prerelease:parse` → `fallback: empty` (alpha no debe filtrar por cambios de `main`)
- `check-lint-builds:detect` → `fallback: both` (push→ambos paquetes, PR sin changeset→lint ambos por seguridad)

## Notas
- Requiere `actions/setup-node@v4` interno solo para `node -p`/`node -e` (sin `pnpm`). No instala deps.
- Idempotente: warning si `packages==[]` y fallback `empty`, notice si `fallback==both`.
