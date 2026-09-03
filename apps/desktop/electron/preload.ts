import { ipcRenderer, contextBridge } from 'electron'

export interface SavePdfPayload {
  suggestedName: string
  bytes: number[]
}

export interface SavePdfResult {
  saved: boolean
  path?: string
}

export interface PinaxApi {
  savePdf: (blob: Blob, suggestedName: string) => Promise<SavePdfResult>
}

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('api', {
  async savePdf(blob: Blob, suggestedName: string): Promise<SavePdfResult> {
    const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()))
    const result = await ipcRenderer.invoke('pdf:save', {
      suggestedName,
      bytes,
    } satisfies SavePdfPayload)
    return result as SavePdfResult
  },
} satisfies PinaxApi)
