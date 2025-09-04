/**
 * Scrape request interface
 */
export interface IScrapeRequest {
  url: string;
}

/**
 * Scrape response interface
 */
export interface IScrapeResponse {
  success: boolean;
  html: string;
  headers: Record<string, string>;
  error?: string;
}

/**
 * Request body interface for scrape endpoint
 */
export interface IScrapeRequestBody {
  url: string;
}
