import { Router } from "express";
import { getAppConfig } from "../config";
import healthRoutes from "./health.routes";

const router = Router();
const config = getAppConfig();

// Health routes
router.use("/health", healthRoutes);

// Root endpoint
router.get("/", (req, res) => {
  res.json({
    message: "Rate Limiting Scraper API",
    version: config.apiVersion,
    status: "running",
    environment: config.nodeEnv,
  });
});

export default router;
