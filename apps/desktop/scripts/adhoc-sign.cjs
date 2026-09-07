// electron-builder afterPack hook.
//
// When no Developer ID certificate is available (local builds / CI without an
// Apple Developer certificate) electron-builder skips real signing. On Apple
// Silicon (arm64) that leaves the repackaged bundle unlaunchable, so we apply
// an ad-hoc signature to make the .app runnable on the build machine.
//
// IMPORTANT: ad-hoc signing (`codesign -s -`) does NOT satisfy Gatekeeper on
// other Macs. A DMG downloaded from the internet carries a quarantine flag and
// macOS will still show "Apple could not verify ... free of malware" until the
// app is signed with a Developer ID Application certificate AND notarized +
// stapled by Apple (see scripts/notarize.cjs). That dialog is expected for
// ad-hoc builds and cannot be fixed from electron-builder config alone.
//
// This hook therefore:
// - leaves Developer ID-signed bundles untouched,
// - force re-signs anything else ad-hoc with Hardened Runtime + entitlements.
const { execFileSync, execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

function getCodesignDetail(appPath) {
  try {
    return execSync(`codesign -dv --verbose=4 "${appPath}" 2>&1`, {
      encoding: 'utf8',
    })
  } catch (err) {
    return (err.stdout || '') + (err.message || '')
  }
}

function hasDeveloperIdSignature(appPath) {
  const detail = getCodesignDetail(appPath)
  // Genuine distribution signature carries a Developer ID authority.
  // Electron's prebuilt framework signature or a bare ad-hoc signature does not.
  return /Authority=Developer ID Application/i.test(detail)
}

function resolveEntitlements() {
  const candidate = path.join(__dirname, '..', 'build', 'entitlements.mac.plist')
  return fs.existsSync(candidate) ? candidate : null
}

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)
  if (!fs.existsSync(appPath)) return

  if (hasDeveloperIdSignature(appPath)) {
    console.log(`  • ad-hoc sign  skipped=${appName}.app already Developer ID signed`)
    return
  }

  const entitlements = resolveEntitlements()
  const args = ['--force', '--deep', '--options', 'runtime', '--sign', '-']
  if (entitlements) {
    args.push('--entitlements', entitlements)
  }
  args.push(appPath)

  console.log(
    `  • ad-hoc sign  file=${appPath}` +
      (entitlements ? ` entitlements=${entitlements}` : ' (no entitlements file)'),
  )
  execFileSync('codesign', args, { stdio: 'inherit' })
  execFileSync(
    'codesign',
    ['--verify', '--deep', '--strict', '--verbose=2', appPath],
    { stdio: 'inherit' },
  )
}
