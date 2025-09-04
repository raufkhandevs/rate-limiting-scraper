import { Router } from "express";
import { getAppConfig } from "../config";
import scrapeRoutes from "./scrape.routes";

const router = Router();
const config = getAppConfig();

// Scrape
router.use("/scrape", scrapeRoutes);

// Root
router.get("/", (req, res) => {
  res.json({
    message: "Rate Limiting Scraper API",
    version: config.apiVersion,
    status: "running",
    environment: config.nodeEnv,
    endpoints: {
      scrape: "POST /api/scrape",
    },
  });
});

export default router;
