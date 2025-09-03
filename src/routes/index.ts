import { Router } from "express";
import { getAppConfig } from "../config";
import healthRoutes from "./health.routes";
import scrapeRoutes from "./scrape.routes";

const router = Router();
const config = getAppConfig();

// Health routes
router.use("/health", healthRoutes);

// Scrape routes
router.use("/scrape", scrapeRoutes);

// Root endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Rate Limiting Scraper API",
    version: config.apiVersion,
    status: "running",
    environment: config.nodeEnv,
    endpoints: {
      health: "GET /api/health",
      scrape: "POST /api/scrape",
    },
  });
});

export default router;
