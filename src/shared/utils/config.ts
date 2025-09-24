/**
 * Configuración general de la aplicación
 */

export const DEFAULT_SETTINGS = {
  theme: 'light',
  windowSize: { width: 800, height: 600 }
};

// Configuración de seguridad (movido desde keytar default)
export const ADMIN_PIN = "4321";

// Configuración única para la ventana principal de Electron
export const MAIN_WINDOW_CONFIG = {
  width: 1920,
  height: 1080,
  frame: false,
  resizable: false,
  fullscreen: true,
  kiosk: true,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    enableRemoteModule: false,
    webSecurity: true,
  }
};
