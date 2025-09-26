import { app, BrowserWindow, ipcMain } from 'electron';
import { AssetManager, WindowManager } from '../shared/utils';
import started from 'electron-squirrel-startup';
import path from "node:path";
import fs from "fs";

// Manejo de shortcuts en Windows
if (started) app.quit();

let windowManager: WindowManager;
let assetManager: AssetManager;

const isDev = !app.isPackaged;
const userDataPath = app.getPath('userData');

async function initializeApplication(): Promise<void> {
  try {
    // 1️ Inicializar AssetManager
    assetManager = new AssetManager(isDev, userDataPath);

    // 2️ Copiar assets y data al userData
    await assetManager.copyAllToUserData();

    // 3️ Registrar protocolo para app-assets (img/videos)
    assetManager.registerAssetsProtocol();

    // 4 Crear ventana principal
    windowManager = new WindowManager();
    windowManager.createMainWindow();
  } catch (error: unknown) {
    console.error("Error inicializando aplicación:", error);
    app.quit();
  }
}

/**
 * Ciclo de vida de la aplicación
 */
app.whenReady().then(() => {
  initializeApplication();
});

ipcMain.handle("load-data", async () => {
  try {
    const filePath = isDev
      ? path.join(process.cwd(), "data", "content_ui.json") // desarrollo
      : path.join(app.getPath("userData"), "data", "content_ui.json"); // producción

    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error("Error cargando content_ui.json:", err);
    return null;
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on("activate", () => {
  // En macOS, recrear ventana si no hay ninguna abierta
  if (BrowserWindow.getAllWindows().length === 0) {
    if (windowManager && !windowManager.hasWindow()) {
      windowManager.createMainWindow();
    }
  }
});
