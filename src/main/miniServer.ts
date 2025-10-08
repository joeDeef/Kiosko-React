// main/miniServer.ts
import http from "http";
import fs from "fs";
import path from "path";
import { app } from "electron";

export function startMiniServer() {
  const PORT = 3001;
  const userDataPath = app.getPath("userData");

  const server = http.createServer((req, res) => {
    // Ejemplo de URL: /videos/video1.mp4 o /temp/video2.mp4
    const urlPath = decodeURIComponent(req.url || "").replace(/^\/+/, "");
    const [folder, ...fileParts] = urlPath.split("/");
    const fileName = fileParts.join("/");

    let baseFolder: string;
    if (folder === "videos") {
      baseFolder = path.join(userDataPath, "assets/videos");
    } else if (folder === "temp") {
      baseFolder = path.join(userDataPath, "temp");
    } else {
      res.writeHead(400);
      res.end("Carpeta inválida");
      return;
    }

    const filePath = path.join(baseFolder, fileName);

    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end("Archivo no encontrado");
      return;
    }

    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      // Soporte streaming / seek
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const stream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
        "Content-Type": "video/mp4", // puedes mejorar con getMimeType si quieres
      });
      stream.pipe(res);
    } else {
      // Carga completa
      const stream = fs.createReadStream(filePath);
      res.writeHead(200, {
        "Content-Length": stat.size,
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
      });
      stream.pipe(res);
    }
  });

  server.listen(PORT, () => console.log(`Mini server corriendo en http://localhost:${PORT}`));
  return PORT;
}
