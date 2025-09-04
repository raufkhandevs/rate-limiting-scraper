import axios from "axios";
import { IProxy, IHttpResponse, IHttpRequestOptions } from "../interfaces";
import { getAppConfig } from "../config";
import {
  DEFAULT_MAX_REDIRECTS,
  DEFAULT_USER_AGENT,
  DEFAULT_HEADERS,
} from "../constants";

/**
 * HTTP client service for making requests through proxies
 * Handles HTTP-first, HTTPS fallback strategy
 */
export class HttpClientService {
  private readonly config = getAppConfig();

  /**
   * Make HTTP request through proxy
   * @param url - Target URL
   * @param proxy - Proxy to use
   * @param options - Request options
   * @returns HTTP response
   */
  async makeRequest(
    url: string,
    proxy: IProxy,
    options: IHttpRequestOptions = {}
  ): Promise<IHttpResponse> {
    const startTime = Date.now();

    try {
      this.validateUrl(url);

      // protocol strategy
      const protocols = this.getProtocolsToTry(proxy.protocol);

      for (const protocol of protocols) {
        try {
          console.log(
            `Attempting ${protocol.toUpperCase()} request to ${url} via ${
              proxy.ip
            }:${proxy.port}`
          );

          const response = await this.makeRequestWithProtocol(
            url,
            proxy,
            protocol,
            options
          );

          const responseTime = Date.now() - startTime;

          return {
            status: response.status,
            statusText: response.statusText,
            headers: this.normalizeHeaders(response.headers),
            data: response.data,
            responseTime,
            proxy,
            protocol,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(
            `${protocol.toUpperCase()} request failed via ${proxy.ip}:${
              proxy.port
            }: ${errorMessage}`
          );

          // If this is the last protocol to try, throw the error
          if (protocol === protocols[protocols.length - 1]) {
            throw error;
          }

          // Otherwise, continue to next protocol
          continue;
        }
      }

      throw new Error("All protocol attempts failed");
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `HTTP request failed to ${url} via ${proxy.ip}:${proxy.port} after ${responseTime}ms: ${errorMessage}`
      );
      throw error;
    }
  }

  /**
   * Make request with specific protocol
   * @param url - Target URL
   * @param proxy - Proxy to use
   * @param protocol - Protocol to use (http/https)
   * @param options - Request options
   * @returns Axios response
   */
  private async makeRequestWithProtocol(
    url: string,
    proxy: IProxy,
    protocol: string,
    options: IHttpRequestOptions
  ): Promise<any> {
    const config: any = {
      method: "GET",
      url: url,
      timeout: options.timeout || this.config.scraping.proxyTimeout,
      maxRedirects: options.maxRedirects || DEFAULT_MAX_REDIRECTS,
      validateStatus: (status: number) => status < 500,
      headers: {
        "User-Agent": options.userAgent || DEFAULT_USER_AGENT,
        ...DEFAULT_HEADERS,
      },
      proxy: {
        protocol: protocol,
        host: proxy.ip,
        port: proxy.port,
      },
    };

    // Add additional headers if specified
    if (options.followRedirects === false) {
      config.maxRedirects = 0;
    }

    return await axios(config);
  }

  /**
   * Get protocols to try based on proxy protocol
   * @param proxyProtocol - Proxy protocol
   * @returns Array of protocols to try
   */
  private getProtocolsToTry(proxyProtocol: string): string[] {
    // For free proxies, try HTTP first, then HTTPS
    if (proxyProtocol === "http") {
      return ["http", "https"];
    } else if (proxyProtocol === "https") {
      return ["https", "http"];
    } else {
      return ["http", "https"];
    }
  }

  /**
   * Validate URL format
   * @param url - URL to validate
   */
  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch (error) {
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  /**
   * Normalize headers to string format
   * @param headers - Axios headers object
   * @returns Normalized headers object
   */
  private normalizeHeaders(headers: any): Record<string, string> {
    const normalized: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === "string") {
        normalized[key.toLowerCase()] = value;
      } else if (Array.isArray(value)) {
        normalized[key.toLowerCase()] = value.join(", ");
      } else if (value !== undefined && value !== null) {
        normalized[key.toLowerCase()] = String(value);
      }
    }

    return normalized;
  }
}

export const httpClientService = new HttpClientService();
export default httpClientService;
