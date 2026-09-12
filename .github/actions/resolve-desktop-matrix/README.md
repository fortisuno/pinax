# resolve-desktop-matrix (P3)

SSOT del matrix de `apps/desktop` (pin `macos-26`, nunca `latest`) con scoping opcional por comentario `/prerelease`.

## Por qué existe
Evita duplicar el literal `macos-26` y la definición de 4 filas en `trigger-prerelease`, `trigger-rc`, `trigger-release`. El comentario `/prerelease [win11|linux|mac]` se resuelve aquí en un único lugar.

## Inputs / Outputs
| Input | Default | Descripción |
|---|---|---|
| `os-arg` | `""` | `win11|windows` → solo Windows, `linux` → solo Linux, `mac|macos|darwin` → ambas archs mac, vacío → full matrix 4 filas |

Output `matrix`: JSON array para `fromJSON(inputs.desktop-matrix)` en `_build-artifacts`.

## Matrices
- `win11`: `[{"platform":"windows","os":"windows-latest","arch":"x64"}]`
- `linux`: `[{"platform":"linux","os":"ubuntu-latest","arch":"x64"}]`
- `mac`: `[{"platform":"macos-intel","os":"macos-26","arch":"x64"},{"platform":"macos-arm64","os":"macos-26","arch":"arm64"}]`
- full (default): las 4 filas anteriores orden `linux, windows, macos-intel, macos-arm64`

## Uso
```yaml
- uses: ./.github/actions/resolve-desktop-matrix
  id: mtx
  with:
    os-arg: ${{ steps.parse.outputs.os-arg }} # trigger-prerelease
    # os-arg: ""                              # trigger-rc / trigger-release (full)

# Luego:
uses: ./.github/workflows/_build-artifacts.yaml
with:
  desktop-matrix: ${{ steps.mtx.outputs.matrix }}
```

## Cableado
- `trigger-prerelease:parse` → matriz scoped por `os-arg` del comentario.
- `trigger-rc:resolve` y `trigger-release:resolve` → sin `os-arg` → full siempre (RC/official nunca scoping).

## Notas
- Pin `macos-26` intencional; no migrar a `macos-latest`. Si Apple retira `26`, fallar loud y actualizar aquí.
- Case-insensitive, `tr '[:upper:]' '[:lower:]'` interno.
