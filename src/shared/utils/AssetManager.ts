import { app, protocol } from 'electron';
import path from 'node:path';
import fs from 'fs';
import fse from 'fs-extra';

class AssetManager {
    private isDev: boolean;
    private userDataPath: string;

    constructor(isDev: boolean, userDataPath: string) {
        this.isDev = isDev;
        this.userDataPath = userDataPath; // Ruta base: userData/
    }

    /** Copia la carpeta assets al userData solo si no existe o está vacía */
    copyAssets() {
        const target = path.join(this.userDataPath, 'assets');

        // Verificar si ya existe y tiene contenido
        if (fs.existsSync(target) && fs.readdirSync(target).length > 0) return;

        const source = this.isDev
            ? path.join(process.cwd(), 'public/assets')
            : path.join(app.getAppPath(), '.vite/renderer/main_window/assets');

        if (!fs.existsSync(source)) {
            console.warn('Carpeta assets no encontrada:', source);
            return;
        }

        try {
            fse.copySync(source, target, { overwrite: true });
        } catch (err) {
            console.error('Error copiando assets:', err);
        }
    }

    /** Copia la carpeta data al userData solo si no existe o está vacía */
    copyData() {
        const target = path.join(this.userDataPath, 'data');

        if (fs.existsSync(target) && fs.readdirSync(target).length > 0) return;

        const source = this.isDev
            ? path.join(process.cwd(), 'data')
            : path.join(process.resourcesPath, 'data'); // desde extraResources en producción

        if (!fs.existsSync(source)) {
            console.warn('Carpeta data no encontrada:', source);
            return;
        }

        try {
            fse.copySync(source, target, { overwrite: true });
        } catch (err) {
            console.error('Error copiando data:', err);
        }
    }

    /** Copia todo (assets + data) solo si es necesario */
    copyAllToUserData() {
        this.copyAssets();
        this.copyData();
    }

    /** Registra protocolos personalizados para servir archivos desde subcarpetas de userData */
    private registerFileProtocol(protocolName: string, subfolder: string, errorMsg: string) {
        protocol.registerFileProtocol(protocolName, (request, callback) => {
            const relativePath = request.url.replace(`${protocolName}://`, '');
            const filePath = path.join(this.userDataPath, subfolder, relativePath);

            if (fs.existsSync(filePath)) {
                callback({ path: filePath });
            } else {
                console.error(`${errorMsg}:`, filePath);
                callback({ error: -6 });
            }
        });
    }

    /** Registra los protocolos app-assets y app-temp */
    registerAssetsProtocol() {
        this.registerFileProtocol('app-assets', 'assets', 'Archivo no encontrado');
        this.registerFileProtocol('app-temp', 'temp', 'Archivo temporal no encontrado');
    }

    /** Obtiene la ruta de un asset dentro de userData */
    getAssetPath(...parts: string[]) {
        return path.join(this.userDataPath, 'assets', ...parts);
    }

    /** Obtiene la ruta de un archivo de data dentro de userData */
    getDataPath(...parts: string[]) {
        return path.join(this.userDataPath, 'data', ...parts);
    }
}

export default AssetManager;
