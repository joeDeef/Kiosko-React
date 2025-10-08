import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { AssetManager, WindowManager } from '../shared/utils';
import started from 'electron-squirrel-startup';
import path from "node:path";
import fs from "fs";
import { startMiniServer } from './miniServer';
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
    const miniServerPort = startMiniServer();

    // 1️⃣ Inicializar AssetManager TEMPRANO
    assetManager = new AssetManager(isDev, userDataPath);

    // 2️⃣ Registrar protocolos ANTES de cualquier otra cosa
    assetManager.registerAssetsProtocol();

    // 3️⃣ Copiar assets y data al userData
    await assetManager.copyAllToUserData();

    // 4️⃣ Validar licencia
    const licenseValid = isLicenseValid();
    lastLicenseValid = licenseValid;

    // 5️⃣ Crear ventana principal
    windowManager = new WindowManager();
    const mainWindow = windowManager.createMainWindow();
  } catch (error: unknown) {
    console.error("Error inicializando aplicación:", error);
    app.quit();
  }
}

// =====================================
// HANDLERS IPC - Registrados al cargar el módulo
// =====================================

// Handler IPC para consultar el estado de la licencia desde el renderer
ipcMain.handle("get-license-status", async () => {
  return lastLicenseValid;
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

ipcMain.handle("save-temp-image", async (_event, buffer: ArrayBuffer, ext: string, preNombre: string) => {
  try {
    const tempDir = path.join(app.getPath("userData"), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const fileName = `${preNombre}_${Date.now()}.${ext.replace(/[^a-zA-Z0-9]/g, "")}`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return fileName;
  } catch (err) {
    console.error("Error guardando imagen temporal:", err);
    return null;
  }
});

ipcMain.handle("open-file-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Videos", extensions: ["mp4", "mov", "avi", "mkv", "webm"] }],
  });
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle("save-temp-video", async (_event, originalPath: string, ext: string, preNombre: string) => {
  try {
    const tempDir = path.join(app.getPath("userData"), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `${preNombre}_${Date.now()}.${safeExt}`;
    const filePath = path.join(tempDir, fileName);

    // ✅ Copiar archivo directamente
    await fs.promises.copyFile(originalPath, filePath);

    console.log("✅ Video copiado en:", filePath);
    return fileName; // solo nombre
  } catch (err) {
    console.error("❌ Error guardando video temporal:", err);
    return null;
  }
});


ipcMain.handle("remove-temp-file", async (_event, fileName: string) => {
  try {
    const tempDir = path.join(app.getPath("userData"), "temp");
    const filePath = path.join(tempDir, fileName);

    console.log("Intentando eliminar archivo temporal:", filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    } else {
      console.warn("Archivo temporal no encontrado:", filePath);
      return false;
    }
  } catch (err) {
    console.error("Error eliminando archivo temporal:", err);
    return false;
  }
});

/**
 * Ciclo de vida de la aplicación
 */
app.whenReady().then(() => {
  initializeApplication();
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