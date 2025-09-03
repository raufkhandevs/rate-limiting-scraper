import { IProxy, IScrapeRequest, IScrapeResponse } from "../interfaces";
import { proxyService } from "./proxy.service";
import { rateLimitService } from "./rate-limit.service";
import { httpClientService } from "./http-client.service";
import { getAppConfig } from "../config";
import { SUCCESS_STATUS_RANGE } from "../constants";

/**
 * Scrape service for orchestrating proxy selection, rate limiting, and HTTP requests
 * Implements timeout-based retry logic with different proxies
 */
export class ScrapeService {
  private readonly config = getAppConfig();

  /**
   * Scrape a URL using proxy rotation and rate limiting
   * @param request - Scrape request parameters
   * @returns Scrape response with HTML, headers, and metadata
   */
  async scrapeUrl(request: IScrapeRequest): Promise<IScrapeResponse> {
    const startTime = Date.now();
    const {
      url,
      timeout = this.config.scraping.timeout,
      requestsPerSecond = this.config.scraping.requestsPerSecond,
    } = request;

    console.log(`Starting scrape for URL: ${url}`);
    console.log(
      `Timeout: ${timeout}ms, Rate limit: ${requestsPerSecond} req/sec`
    );

    let lastError: string = "";

    try {
      // Try different proxies until timeout is reached
      let attempt = 1;
      const MAX_ATTEMPTS = 100; // Safety limit to prevent infinite loops

      while (attempt <= MAX_ATTEMPTS) {
        const attemptStartTime = Date.now();

        // Check if we've exceeded total timeout
        if (attemptStartTime - startTime > timeout) {
          console.log(`Total timeout of ${timeout}ms exceeded`);
          break;
        }

        let currentProxy: IProxy | null = null;

        try {
          console.log(`\n--- Attempt ${attempt} ---`);

          // Get next available proxy
          currentProxy = await proxyService.getNextProxy();
          console.log(
            `Selected proxy: ${currentProxy.ip}:${currentProxy.port} (${currentProxy.protocol})`
          );

          // Check rate limit for this proxy
          const isWithinRateLimit = await rateLimitService.isWithinRateLimit(
            currentProxy,
            requestsPerSecond
          );

          if (!isWithinRateLimit) {
            console.log(
              `Proxy ${currentProxy.ip}:${currentProxy.port} is rate limited, trying next proxy`
            );
            await proxyService.markProxyFailed(currentProxy);
            continue;
          }

          // Increment rate limit counter
          const rateLimitIncremented =
            await rateLimitService.incrementRateLimit(
              currentProxy,
              requestsPerSecond
            );

          if (!rateLimitIncremented) {
            console.log(
              `Failed to increment rate limit for proxy ${currentProxy.ip}:${currentProxy.port}`
            );
            await proxyService.markProxyFailed(currentProxy);
            continue;
          }

          // Make HTTP request through proxy
          const response = await httpClientService.makeRequest(
            url,
            currentProxy,
            {
              timeout: this.config.scraping.proxyTimeout,
            }
          );

          // Check if response is successful
          if (
            response.status >= SUCCESS_STATUS_RANGE.min &&
            response.status <= SUCCESS_STATUS_RANGE.max
          ) {
            const totalTime = Date.now() - startTime;
            console.log(
              `✅ Scrape successful on attempt ${attempt} in ${totalTime}ms`
            );

            return {
              success: true,
              html: response.data,
              headers: response.headers,
            };
          } else {
            // Non-successful status code
            const error = `HTTP ${response.status}: ${response.statusText}`;
            console.log(`❌ Scrape failed on attempt ${attempt}: ${error}`);

            await proxyService.markProxyFailed(currentProxy);
            lastError = error;
            continue; // Try next proxy
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(
            `❌ Scrape failed on attempt ${attempt}: ${errorMessage}`
          );

          // Mark proxy as failed if we have one
          if (currentProxy && currentProxy.ip) {
            await proxyService.markProxyFailed(currentProxy);
          }

          lastError = errorMessage;
          attempt++;
          continue; // Try next proxy
        }
      }

      // All attempts failed
      const totalTime = Date.now() - startTime;
      if (attempt > MAX_ATTEMPTS) {
        console.log(
          `❌ Maximum attempts (${MAX_ATTEMPTS}) reached after ${totalTime}ms`
        );
      } else {
        console.log(`❌ All attempts failed after ${totalTime}ms`);
      }

      return {
        success: false,
        html: "",
        headers: {},
        error:
          attempt > MAX_ATTEMPTS
            ? `Maximum attempts (${MAX_ATTEMPTS}) reached`
            : lastError || "All proxy attempts failed",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ Scrape service error: ${errorMessage}`);

      return {
        success: false,
        html: "",
        headers: {},
        error: errorMessage,
      };
    }
  }
}

// Export singleton instance
export const scrapeService = new ScrapeService();
export default scrapeService;
