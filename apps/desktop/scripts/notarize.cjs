// electron-builder afterSign hook: notarize macOS builds with Apple.
//
// - No Apple credentials in env -> no-op (ad-hoc / unsigned CI builds keep working).
// - Credentials present -> notarize + staple via @electron/notarize (requires a
//   Developer ID Application signature, Hardened Runtime + entitlements).
//
// Required env for Apple ID auth:
//   APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID
// Alternative (API key auth):
//   APPLE_API_KEY (path to .p8), APPLE_API_KEY_ID, APPLE_API_ISSUER
const fs = require('node:fs')
const path = require('node:path')

function hasAppleIdAuth() {
  return Boolean(
    process.env.APPLE_ID &&
      process.env.APPLE_APP_SPECIFIC_PASSWORD &&
      process.env.APPLE_TEAM_ID,
  )
}

function hasApiKeyAuth() {
  return Boolean(
    process.env.APPLE_API_KEY &&
      process.env.APPLE_API_KEY_ID &&
      process.env.APPLE_API_ISSUER,
  )
}

exports.default = async function afterSign(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)
  if (!fs.existsSync(appPath)) return

  if (!hasAppleIdAuth() && !hasApiKeyAuth()) {
    console.log(
      '  • notarize  skipped (no APPLE_ID/APPLE_APP_SPECIFIC_PASSWORD/APPLE_TEAM_ID or APPLE_API_KEY in env)',
    )
    return
  }

  let notarize
  try {
    ;({ notarize } = require('@electron/notarize'))
  } catch {
    console.warn(
      '  • notarize  skipped (@electron/notarize is not installed; add it to devDependencies to enable notarization)',
    )
    return
  }

  console.log(`  • notarize  file=${appPath}`)

  const options = { appPath }
  if (hasAppleIdAuth()) {
    options.appleId = process.env.APPLE_ID
    options.appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD
    options.teamId = process.env.APPLE_TEAM_ID
  } else {
    options.appleApiKey = process.env.APPLE_API_KEY
    options.appleApiKeyId = process.env.APPLE_API_KEY_ID
    options.appleApiIssuer = process.env.APPLE_API_ISSUER
  }

  await notarize(options)
  console.log('  • notarize  done (electron-builder staples the ticket onto the image)')
}
