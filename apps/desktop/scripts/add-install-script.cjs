// electron-builder afterAllArtifactBuild hook.
//
// Injects build/install.sh at the root of the macOS .zip artifacts so users
// get a guided alternative to the .dmg: unzip → bash install.sh
// The script moves pinax.app to /Applications, ensures the executable bit
// and clears the Apple quarantine flag (Gatekeeper bypass for ad-hoc builds).
//
// - Only macOS zip artifacts are touched (name + platform guard), so the
//   linux/windows jobs are unaffected even though this hook runs there too.
// - Uses the system `zip` CLI (always present on macOS runners).
// - The stale electron-updater .blockmap (if any) is deleted: it describes
//   the pre-injection bytes and this repo ships no updater.
const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

function isMacZip(artifactPath) {
  return (
    process.platform === 'darwin' &&
    /^pinax-Mac-.*\.zip$/.test(path.basename(artifactPath))
  )
}

exports.default = async function afterAllArtifactBuild(buildResult) {
  const artifacts = (buildResult && buildResult.artifactPaths) || []
  const targets = artifacts.filter(
    (artifact) => typeof artifact === 'string' && isMacZip(artifact),
  )
  if (targets.length === 0) return

  const scriptSrc = path.join(__dirname, '..', 'build', 'install.sh')
  if (!fs.existsSync(scriptSrc)) {
    console.warn('  • install.sh  skipped (build/install.sh not found)')
    return
  }

  // Stage a copy with the executable bit set: `zip` preserves unix perms,
  // so install.sh is runnable right after the user unzips.
  const stageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pinax-install-'))
  try {
    const staged = path.join(stageDir, 'install.sh')
    fs.copyFileSync(scriptSrc, staged)
    fs.chmodSync(staged, 0o755)

    for (const zipPath of targets) {
      if (!fs.existsSync(zipPath)) {
        console.warn(`  • install.sh  skipped (missing artifact ${zipPath})`)
        continue
      }
      try {
        console.log(`  • install.sh  injecting into ${zipPath}`)
        execFileSync('zip', ['-j', '-q', zipPath, staged], {
          stdio: 'inherit',
        })
        const listing = execFileSync('unzip', ['-l', zipPath], {
          encoding: 'utf8',
        })
        if (!/^.*install\.sh\s*$/m.test(listing)) {
          throw new Error('install.sh not found in archive after injection')
        }
        fs.rmSync(`${zipPath}.blockmap`, { force: true })
        console.log('  • install.sh  done')
      } catch (err) {
        console.warn(
          `  • install.sh  WARNING: injection into ${zipPath} failed (${err.message}); shipping zip without it`,
        )
      }
    }
  } finally {
    fs.rmSync(stageDir, { recursive: true, force: true })
  }
}
