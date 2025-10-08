// preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  loadData: () => ipcRenderer.invoke("load-data"),
  isLicenseValid: () => ipcRenderer.invoke("get-license-status"),
  saveTempImage: (buffer: ArrayBuffer, ext: string, preNombre: string) => ipcRenderer.invoke("save-temp-image", buffer, ext, preNombre),
  removeTempFile: (fileName: string) => ipcRenderer.invoke("remove-temp-file", fileName),
  openFileDialog: () => ipcRenderer.invoke("open-file-dialog"),
  saveTempVideo: (filePath: string, ext: string, preNombre: string) => ipcRenderer.invoke("save-temp-video", filePath, ext, preNombre),
});
