import { Request, Response } from "express";
import { scrapeService } from "../services/scrape.service";
import { IScrapeRequest, IScrapeRequestBody } from "../interfaces";
import { BadRequestError, ScrapingError } from "../errors/custom-errors";
import {
  isValidUrl,
  isPositiveNumber,
  isWithinRange,
} from "../utils/validation";

/**
 * Scrape a URL using proxy rotation and rate limiting
 * POST /scrape
 * Body: { url: string, timeout?: number, requestsPerSecond?: number }
 */
export const scrapeUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, timeout, requestsPerSecond }: IScrapeRequestBody = req.body;

    // Validate required fields
    if (!url) {
      throw new BadRequestError("URL is required");
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      throw new BadRequestError("Invalid URL format");
    }

    // Validate optional parameters
    if (timeout !== undefined && !isPositiveNumber(timeout)) {
      throw new BadRequestError("Timeout must be a positive number");
    }

    if (
      requestsPerSecond !== undefined &&
      !isWithinRange(requestsPerSecond, 1, 10)
    ) {
      throw new BadRequestError(
        "Requests per second must be a number between 1 and 10"
      );
    }

    console.log(`Received scrape request for URL: ${url}`);

    // Create scrape request
    const scrapeRequest: IScrapeRequest = {
      url,
      timeout,
      requestsPerSecond,
    };

    // Perform scraping
    const result = await scrapeService.scrapeUrl(scrapeRequest);

    if (result.success) {
      // Success response - return only HTML and headers as per specs
      res.status(200).json({
        html: result.html,
        headers: result.headers,
      });
    } else {
      // Failure response - return 500 as per specs
      throw new ScrapingError(result.error || "Scraping failed");
    }
  } catch (error) {
    // Let the global error handler deal with this
    throw error;
  }
};
