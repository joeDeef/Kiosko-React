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
            console.log('Assets copiados a userData:', target);
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
            console.log('Data copiada a userData:', target);
        } catch (err) {
            console.error('Error copiando data:', err);
        }
    }

    /** Copia todo (assets + data) solo si es necesario */
    copyAllToUserData() {
        this.copyAssets();
        this.copyData();
    }

    /** Registra el protocolo app-assets para leer desde userData/assets */
    registerAssetsProtocol() {
        protocol.registerFileProtocol('app-assets', (request, callback) => {
            const relativePath = request.url.replace('app-assets://', '');
            const filePath = path.join(this.userDataPath, 'assets', relativePath);

            if (fs.existsSync(filePath)) {
                callback({ path: filePath });
            } else {
                console.error('Archivo no encontrado:', filePath);
                callback({ error: -6 });
            }
        });
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
