import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(compression());

app.use(
  express.static(path.join(__dirname, "dist"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`[server] Allergen Matrix app running on http://${HOST}:${PORT}`);
});
