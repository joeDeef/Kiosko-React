import { app, BrowserWindow, ipcMain } from 'electron';
import { AssetManager, WindowManager } from '../shared/utils';
import started from 'electron-squirrel-startup';
import path from "node:path";
import fs from "fs";

// Manejo de shortcuts en Windows
if (started) app.quit();


let windowManager: WindowManager;
let assetManager: AssetManager;
let lastLicenseValid = true; // Valor por defecto

// Función simulada para validar licencia
function isLicenseValid(): boolean {
  // Cambia a false para probar la pantalla de licencia
  return true;
}

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

    // 4 Validar licencia
    const licenseValid = isLicenseValid();
    lastLicenseValid = licenseValid;

    // 5 Crear ventana principal
    windowManager = new WindowManager();
    const mainWindow = windowManager.createMainWindow();
// Handler IPC para consultar el estado de la licencia desde el renderer
ipcMain.handle("get-license-status", async () => {
  return lastLicenseValid;
});
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


ipcMain.handle("save-temp-image", async (_event, buffer: ArrayBuffer, ext: string) => {
  try {
    const tempDir = path.join(app.getPath("userData"), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const fileName = `logo_${Date.now()}.${ext.replace(/[^a-zA-Z0-9]/g, "")}`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return fileName;
  } catch (err) {
    console.error("Error guardando imagen temporal:", err);
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
