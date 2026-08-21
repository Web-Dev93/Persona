import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (consultant photos, etc.)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/api/static/uploads", express.static(uploadDir));

// API router
app.use("/api", router);

// Find static dist directory
const candidates = [
  path.resolve(process.cwd(), "artifacts/lead-catcher/dist/public"),
  path.resolve(process.cwd(), "artifacts/lead-catcher/dist"),
  path.resolve(process.cwd(), "dist/public"),
  path.resolve(process.cwd(), "dist"),
  path.resolve(import.meta.dirname, "../../lead-catcher/dist/public"),
  path.resolve(import.meta.dirname, "../../lead-catcher/dist"),
];

let staticDir: string | null = null;
for (const dir of candidates) {
  if (fs.existsSync(path.join(dir, "index.html"))) {
    staticDir = dir;
    console.log(`[Server] Found static frontend build at: ${staticDir}`);
    break;
  }
}

if (staticDir) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(staticDir!, "index.html"));
  });
} else {
  console.warn("[Server] WARNING: No static frontend build found in candidate paths:", candidates);
}

export default app;
