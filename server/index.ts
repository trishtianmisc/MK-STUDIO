import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import productsRoutes from "./routes/products.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import imagesRoutes from "./routes/images.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Body parsing
  app.use(express.json());

  // CORS for local development
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/images", imagesRoutes);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Handle client-side routing - serve index.html for all non-API routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;

// Only start the HTTP server when running locally (not on Vercel)
if (!process.env.VERCEL) {
  const server = createServer(app);
  server.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}/`);
  });
}
