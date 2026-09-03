import { app, BrowserWindow, Menu, dialog, ipcMain, nativeImage } from 'electron'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.setName('pinax')

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

async function loadWindowIcon() {
  const iconPath = path.join(process.env.VITE_PUBLIC, 'pinax.png')
  try {
    const buffer = await fs.readFile(iconPath)
    return nativeImage.createFromBuffer(buffer)
  } catch {
    return nativeImage.createFromPath(iconPath)
  }
}

async function createWindow() {
  const icon = await loadWindowIcon()

  win = new BrowserWindow({
    title: 'pinax',
    icon,
    width: 1280,
    height: 720,
    show: false,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.once('ready-to-show', () => {
    win?.show()
  })

  Menu.setApplicationMenu(null)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.handle(
  'pdf:save',
  async (
    _event,
    payload: { suggestedName: string; bytes: number[] }
  ): Promise<{ saved: boolean; path?: string }> => {
    if (!win) return { saved: false }
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      defaultPath: payload.suggestedName,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    })
    if (canceled || !filePath) return { saved: false }
    await fs.writeFile(filePath, Buffer.from(payload.bytes))
    return { saved: true, path: filePath }
  }
)

app.whenReady().then(() => {
  createWindow()
})
