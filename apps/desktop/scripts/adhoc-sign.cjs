// electron-builder afterPack hook.
//
// When no code signing identity is available (local builds / CI without an
// Apple Developer certificate) electron-builder skips signing entirely. On
// Apple Silicon (arm64) macOS that leaves the repackaged bundle with a stale
// signature and no sealed resources, so the kernel kills the app on launch
// ("code has no resources but signature indicates they must be present").
//
// This hook applies an ad-hoc signature in that case so the packaged .app is
// runnable on the build machine. If a real identity signed the bundle, the
// app already verifies and we leave it untouched.
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

function isSigned(appPath) {
  try {
    execFileSync('codesign', ['--verify', '--deep', '--strict', appPath], {
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)
  if (!fs.existsSync(appPath)) return

  if (isSigned(appPath)) {
    console.log(`  • ad-hoc sign  skipped=${appName}.app already validly signed`)
    return
  }

  console.log(`  • ad-hoc sign  file=${appPath}`)
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
    stdio: 'inherit',
  })
  execFileSync(
    'codesign',
    ['--verify', '--deep', '--strict', '--verbose=2', appPath],
    { stdio: 'inherit' },
  )
}
