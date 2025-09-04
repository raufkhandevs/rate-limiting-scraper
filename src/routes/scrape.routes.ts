import { Router } from "express";
import { asyncWrapper } from "../middlewares";
import { scrapeUrl } from "../controllers/scrape.controller";

const router = Router();

/**
 * POST /scrape
 * Scrape a URL using proxy rotation and rate limiting
 * Body: { url: string, timeout?: number, requestsPerSecond?: number }
 */
router.post("/", asyncWrapper(scrapeUrl));

export default router;
