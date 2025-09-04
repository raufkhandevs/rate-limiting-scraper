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

  /**
   * Get proxies from file
   * @returns Array of proxy objects
   */
  async getProxies(): Promise<IProxy[]> {
    if (this.proxies.length === 0) {
      await this.loadProxies();
    }

    return [...this.proxies];
  }

  /**
   * Load proxies from file
   * Loads proxy list from data/proxies.txt
   */
  private async loadProxies(): Promise<void> {
    try {
      console.log("Loading free proxy list...");

      // Load proxies using our utility
      const rawProxies = getProxies();

      this.proxies = rawProxies.map((proxy) => ({
        ip: proxy.ip,
        port: proxy.port,
        protocol: proxy.protocol,
        provider: "free" as ProxyProviderType,
        metadata: {
          source: "free-proxy-list.net",
          lastChecked: new Date().toISOString(),
          reliability: "low",
        },
      }));

      console.log(`Loaded ${this.proxies.length} free proxies`);
    } catch (error) {
      console.error("Failed to load free proxies:", error);
      throw new Error("Failed to load free proxy list");
    }
  }
}
