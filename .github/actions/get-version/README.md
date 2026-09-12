# get-version (P4)

SSOT para inyección de `VERSION` sin duplicar `VERSION=$(node -p "JSON.parse…")`.

## Por qué existe
Unifica el literal `node -p "JSON.parse(process.env.VERSIONS_JSON)[process.env.PKG]"` que antes estaba duplicado en `build-desktop` y `build-landing` de `_build-artifacts.yaml`. Asegura que la versión computada centralmente (alpha/rc/official + G5) sea la que llega a `electron-builder --config.extraMetadata.version="$VERSION"` y al zip de landing.

## Inputs / Outputs
| Input | Req | Descripción |
|---|---|---|
| `versions-json` | sí | JSON `{"pinax-desktop":"X.Y.Z...", "pinax-landing":"X.Y.Z"}` (output `needs.compute.outputs.versions-json`) |
| `package` | sí | `pinax-desktop` o `pinax-landing` |

Output `version`: string `X.Y.Z[-alpha.N+sha][-rc.N]`.

## Uso
```yaml
- uses: ./.github/actions/get-version
  id: version
  with:
    versions-json: ${{ needs.compute.outputs.versions-json }}
    package: pinax-desktop

- run: pnpm --filter @pinax/desktop exec electron-builder --mac --x64 --config.extraMetadata.version="$VERSION"
  env:
    VERSION: ${{ steps.version.outputs.version }}
```

## Cableado verificado Fase 3
- `_build-artifacts:build-desktop` → `package: pinax-desktop`
- `_build-artifacts:build-landing` → `package: pinax-landing`
- No queda ningún `VERSION=$(node -p ...)` fuera de este composite (grep `VERSION=` → solo `env: VERSION: ${{ steps.version.outputs.version }}`).

## Notas
- No muta `package.json`; la versión se inyecta vía `extraMetadata.version` (desktop) o `zip` name (landing).
- G5: si el tag `pkg@version` ya existe, el compute filtra y `has-desktop/has-landing` evita que estos jobs corran; no hay fallback aquí.
