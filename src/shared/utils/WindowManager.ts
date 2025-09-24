import { BrowserWindow, screen, app } from "electron";
import path from "node:path";
import fs from "fs";
import { MAIN_WINDOW_CONFIG } from "./config";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

class WindowManager {
    private mainWindow: BrowserWindow | null;

    constructor() {
        this.mainWindow = null;
    }

    /**
     * Crea la única ventana principal de la aplicación
     */
    createMainWindow(): BrowserWindow {
        if (this.mainWindow) {
            this.mainWindow.focus();
            return this.mainWindow;
        }

        const { width, height } = screen.getPrimaryDisplay().bounds;

        const windowConfig = {
            ...MAIN_WINDOW_CONFIG,
            width: MAIN_WINDOW_CONFIG.width || width,
            height: MAIN_WINDOW_CONFIG.height || height,
            show: false,
            webPreferences: {
                ...MAIN_WINDOW_CONFIG.webPreferences,
                preload: app.isPackaged
                    ? path.join(__dirname, "preload.js") // producción
                    : path.join(process.cwd(), ".vite", "build", "preload.js"), // desarrollo
            },
        };

        this.mainWindow = new BrowserWindow(windowConfig);

        // Cargar React App
        this.loadReactApp();

        this.mainWindow.once("ready-to-show", () => {
            this.mainWindow?.show();

            /*if (!app.isPackaged) {
                this.mainWindow?.webContents.openDevTools();
            }*/
        });

        this.mainWindow.on("closed", () => {
            this.mainWindow = null;
        });

        return this.mainWindow;
    }

    /**
     * Carga la aplicación React (dev o prod)
     */
    private loadReactApp(): void {
        if (!this.mainWindow) return;

        if (!app.isPackaged && MAIN_WINDOW_VITE_DEV_SERVER_URL) {
            // Desarrollo: servidor Vite
            this.mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        } else {
            // Producción: buscar index.html en posibles rutas
            const possiblePaths = [
                path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
                path.join(__dirname, `../../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
                path.join(process.resourcesPath, "app.asar", ".vite", "renderer", MAIN_WINDOW_VITE_NAME, "index.html"),
                path.join(app.getAppPath(), ".vite", "renderer", MAIN_WINDOW_VITE_NAME, "index.html"),
            ];

            let foundPath: string | null = null;

            for (const testPath of possiblePaths) {
                if (fs.existsSync(testPath)) {
                    foundPath = testPath;
                    break;
                }
            }

            if (foundPath) {
                this.mainWindow.loadFile(foundPath);
            } else {
                console.error("No se encontró index.html en ninguna ubicación");
            }

            // Para debug en prod
            this.mainWindow.webContents.openDevTools();
        }
    }

    getMainWindow(): BrowserWindow | null {
        return this.mainWindow;
    }

    closeMainWindow(): void {
        this.mainWindow?.close();
    }

    reload(): void {
        this.mainWindow?.reload();
    }

    toggleFullscreen(): void {
        if (this.mainWindow) {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        }
    }

    sendToRenderer(channel: string, ...args: any[]): void {
        this.mainWindow?.webContents.send(channel, ...args);
    }

    setKioskMode(enable: boolean): void {
        this.mainWindow?.setKiosk(enable);
    }

    hasWindow(): boolean {
        return this.mainWindow !== null && !this.mainWindow.isDestroyed();
    }
}

export default WindowManager;
