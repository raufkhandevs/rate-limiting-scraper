import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAppConfig, isDevelopment } from "./config";

// Load environment variables
dotenv.config();

const app = express();
const config = getAppConfig();

// Basic middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: config.maxRequestSize }));

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Rate Limiting Scraper API",
    version: config.apiVersion,
    status: "running",
    environment: config.nodeEnv,
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API Version: ${config.apiVersion}`);
  if (isDevelopment()) {
    console.log(`CORS Origin: ${config.corsOrigin}`);
  }
});

export default app;
