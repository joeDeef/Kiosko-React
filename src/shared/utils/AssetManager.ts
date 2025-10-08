import { app, protocol } from 'electron';
import path from 'node:path';
import fs from 'fs';
import fse from 'fs-extra';

class AssetManager {
    private isDev: boolean;
    private userDataPath: string;

    constructor(isDev: boolean, userDataPath: string) {
        this.isDev = isDev;
        this.userDataPath = userDataPath;
    }

    copyAssets() {
        const target = path.join(this.userDataPath, 'assets');
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

    copyData() {
        const target = path.join(this.userDataPath, 'data');
        if (fs.existsSync(target) && fs.readdirSync(target).length > 0) return;

        const source = this.isDev
            ? path.join(process.cwd(), 'data')
            : path.join(process.resourcesPath, 'data');

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

    copyAllToUserData() {
        this.copyAssets();
        this.copyData();
    }

    /** Obtiene el MIME type basado en la extensión del archivo */
    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            // Imágenes
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
            // Videos
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.ogg': 'video/ogg',
            '.ogv': 'video/ogg',
            '.mov': 'video/quicktime',
            '.avi': 'video/x-msvideo',
            '.mkv': 'video/x-matroska',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    /** 
     * Registra protocolo con soporte para streaming (videos)
     * Usa registerStreamProtocol para soportar Range requests
     */
    private registerStreamProtocolHandler(protocolName: string, subfolder: string) {
        protocol.registerStreamProtocol(protocolName, (request, callback) => {
            const url = request.url.replace(`${protocolName}://`, '').replace(/^\/+/, '');
            const filePath = path.join(this.userDataPath, subfolder, url);
            
            console.log(`\n📁 [${protocolName}] ===== PROTOCOL REQUEST =====`);
            console.log(`🔗 URL original: ${request.url}`);
            console.log(`📝 URL limpio: ${url}`);
            console.log(`🗂️ Ruta completa: ${filePath}`);
            console.log(`📂 UserData: ${this.userDataPath}`);
            console.log(`📁 Subfolder: ${subfolder}`);

            // Verificar si el archivo existe
            if (!fs.existsSync(filePath)) {
                console.error(`❌ Archivo no encontrado: ${filePath}`);
                console.log(`📋 Contenido del directorio ${path.dirname(filePath)}:`);
                try {
                    const files = fs.readdirSync(path.dirname(filePath));
                    console.log('   Files:', files);
                } catch (dirError) {
                    console.error('   Error leyendo directorio:', dirError);
                }
                callback({ statusCode: 404, data: null as any });
                return;
            }

            try {
                const stat = fs.statSync(filePath);
                const mimeType = this.getMimeType(filePath);
                const fileSize = stat.size;

                console.log(`✅ Archivo encontrado!`);
                console.log(`📊 Tamaño: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
                console.log(`🎭 MIME: ${mimeType}`);

                // Parsear headers de Range si existen
                const range = request.headers['Range'] || request.headers['range'];
                
                if (range) {
                    // Manejo de Range requests para streaming de video
                    const parts = range.replace(/bytes=/, '').split('-');
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    const chunksize = (end - start) + 1;

                    console.log(`📊 Range request: bytes ${start}-${end}/${fileSize}`);

                    const fileStream = fs.createReadStream(filePath, { start, end });

                    callback({
                        statusCode: 206, // Partial Content
                        headers: {
                            'Content-Type': mimeType,
                            'Content-Length': chunksize.toString(),
                            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                            'Accept-Ranges': 'bytes',
                        },
                        data: fileStream as any
                    });
                    
                } else {
                    // Request completo (imágenes o primera carga)
                    console.log(`📄 Request completo`);
                    
                    const fileStream = fs.createReadStream(filePath);

                    callback({
                        statusCode: 200,
                        headers: {
                            'Content-Type': mimeType,
                            'Content-Length': fileSize.toString(),
                            'Accept-Ranges': 'bytes',
                        },
                        data: fileStream as any
                    });
                }
                console.log(`🏁 Callback ejecutado exitosamente\n`);
            } catch (error) {
                console.error(`❌ Error al leer archivo:`, error);
                callback({ statusCode: 500, data: null as any });
            }
        });
    }

    /** Registra los protocolos app-assets y app-temp con soporte para streaming */
    registerAssetsProtocol() {
        console.log('🔧 Registrando protocolos...');
        
        try {
            // Crear carpeta temp si no existe
            const tempDir = path.join(this.userDataPath, 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
                console.log('📁 Carpeta temp creada:', tempDir);
            }
            
            this.registerStreamProtocolHandler('app-assets', 'assets');
            this.registerStreamProtocolHandler('app-temp', 'temp');
            
            console.log('✅ Protocolos registrados: app-assets://, app-temp://');
        } catch (error) {
            console.error('❌ Error registrando protocolos:', error);
        }
    }

    getAssetPath(...parts: string[]) {
        return path.join(this.userDataPath, 'assets', ...parts);
    }

    getDataPath(...parts: string[]) {
        return path.join(this.userDataPath, 'data', ...parts);
    }
}

export default AssetManager;