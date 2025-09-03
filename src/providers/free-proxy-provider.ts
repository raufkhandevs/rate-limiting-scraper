import {
  IProxy,
  IProxyProvider,
  ProxyProviderType,
} from "../interfaces/proxy.interface";
import { getProxies } from "../utils";

/**
 * Free proxy provider
 * Loads proxies from data/proxies.txt file
 * Fully implemented and functional
 */
export class FreeProxyProvider implements IProxyProvider {
  readonly providerType: ProxyProviderType = "free";
  private proxies: IProxy[] = [];
  private lastRefresh: number = 0;
  private readonly refreshInterval = 5 * 60 * 1000; // 5 minutes

  /**
   * Get proxies from file
   * @returns Array of proxy objects
   */
  async getProxies(): Promise<IProxy[]> {
    // Check if we need to refresh
    const now = Date.now();
    if (
      this.proxies.length === 0 ||
      now - this.lastRefresh > this.refreshInterval
    ) {
      await this.refreshProxies();
    }

    return [...this.proxies]; // Return copy to prevent modification
  }

  /**
   * Refresh proxies from file
   * Loads fresh proxy list from data/proxies.txt
   */
  async refreshProxies(): Promise<void> {
    try {
      console.log("Refreshing free proxy list...");

      // Load proxies using our utility
      const rawProxies = getProxies();

      // Convert to IProxy format with provider metadata
      this.proxies = rawProxies.map((proxy) => ({
        ip: proxy.ip,
        port: proxy.port,
        protocol: proxy.protocol,
        provider: "free" as ProxyProviderType,
        metadata: {
          source: "free-proxy-list.net",
          lastChecked: new Date().toISOString(),
          reliability: "low", // Free proxies are less reliable
        },
      }));

      this.lastRefresh = Date.now();
      console.log(`Loaded ${this.proxies.length} free proxies`);
    } catch (error) {
      console.error("Failed to refresh free proxies:", error);
      throw new Error("Failed to load free proxy list");
    }
  }
}
