import { Request, Response } from "express";
import { scrapeService } from "../services/scrape.service";
import { IScrapeRequest, IScrapeRequestBody } from "../interfaces";
import { BadRequestError, ScrapingError } from "../errors/custom-errors";
import { isValidUrl } from "../utils/validation";

/**
 * Scrape a URL using proxy rotation and rate limiting
 * POST /scrape
 * Body: { url: string }
 */
export const scrapeUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url }: IScrapeRequestBody = req.body;

    if (!url) {
      throw new BadRequestError("URL is required");
    }

    if (!isValidUrl(url)) {
      throw new BadRequestError("Invalid URL format");
    }

    const result = await scrapeService.scrapeUrl({ url } as IScrapeRequest);

    if (result.success) {
      res.status(200).json({
        html: result.html,
        headers: result.headers,
      });
    } else {
      throw new ScrapingError(result.error || "Scraping failed");
    }
  } catch (error) {
    throw error;
  }
};
