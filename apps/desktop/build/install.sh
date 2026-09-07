#!/bin/bash
#
# Instalador de pinax para macOS (alternativa al .dmg).
#
# Uso:
#   1. Descomprime el .zip (doble clic): obtienes pinax.app e install.sh
#      en la misma carpeta.
#   2. Abre Terminal en esa carpeta y ejecuta:
#
#        bash install.sh
#
#   (O clic derecho en install.sh → Abrir con → Terminal.)
#
# Lo que hace:
#   1. Copia pinax.app a /Applications (pide tu contraseña solo si hace falta).
#   2. Asegura el permiso de ejecución del binario.
#   3. Limpia la cuarentena de Apple (xattr) para que Gatekeeper no bloquee la
#      primera apertura: la app no tiene certificado de pago de Apple y macOS
#      siempre avisa la primera vez.
#   4. Abre la app.
#
# Para desinstalar: arrastra pinax.app de Aplicaciones a la Papelera.
#
# Solo para pruebas (no lo uses en una instalación normal):
#   PINAX_APPS_DIR=/tmp/prueba PINAX_NO_OPEN=1 bash install.sh
#
set -euo pipefail

APP_NAME="pinax.app"
BINARY_PATH="Contents/MacOS/pinax"
DEST_DIR="${PINAX_APPS_DIR:-/Applications}"
NO_OPEN="${PINAX_NO_OPEN:-0}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_APP="$SCRIPT_DIR/$APP_NAME"
DEST_APP="$DEST_DIR/$APP_NAME"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "Error: este instalador es solo para macOS." >&2
  exit 1
fi

if [ ! -d "$SRC_APP" ]; then
  echo "Error: no se encuentra $APP_NAME junto a install.sh." >&2
  echo "Descomprime el .zip completo y ejecuta el script desde esa carpeta." >&2
  exit 1
fi

SUDO=""
if [ ! -w "$DEST_DIR" ]; then
  echo "Se necesitan permisos de administrador para escribir en $DEST_DIR."
  SUDO="sudo"
fi

if [ -e "$DEST_APP" ]; then
  echo "Ya existe una versión en $DEST_APP, se reemplazará."
  $SUDO rm -rf "$DEST_APP"
fi

echo "→ Copiando $APP_NAME a $DEST_DIR ..."
$SUDO ditto "$SRC_APP" "$DEST_APP"

echo "→ Asegurando permiso de ejecución ..."
$SUDO chmod +x "$DEST_APP/$BINARY_PATH"

if command -v xattr >/dev/null 2>&1; then
  echo "→ Limpiando cuarentena de Apple (Gatekeeper) ..."
  $SUDO xattr -cr "$DEST_APP"
fi

if command -v codesign >/dev/null 2>&1; then
  if codesign --verify --deep --strict "$DEST_APP" 2>/dev/null; then
    echo "→ Firma verificada."
  else
    echo "→ Aviso: la firma es ad-hoc (sin certificado de Apple)." >&2
    echo "  macOS mostrará un aviso la primera vez: es normal." >&2
  fi
fi

echo ""
echo "✓ pinax instalado en $DEST_APP"
echo "  Para desinstalar: arrastra la app a la Papelera."

if [ "$NO_OPEN" != "1" ]; then
  echo "→ Abriendo pinax ..."
  open "$DEST_APP"
fi
