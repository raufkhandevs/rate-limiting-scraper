import {
  IProxy,
  IProxyService,
  ProxyProviderType,
} from "../interfaces/proxy.interface";
import { proxyProviderFactory } from "../providers";
import { redisService } from "./redis.service";

/**
 * Proxy service for managing proxy selection and caching
 * Implements round-robin selection with Redis caching
 */
export class ProxyService implements IProxyService {
  private currentProvider: ProxyProviderType = "free";
  private currentIndex: number = 0;
  private proxies: IProxy[] = [];
  private failedProxies: Set<string> = new Set();
  private readonly CACHE_KEY = "proxies:active";
  private readonly FAILED_KEY = "proxies:failed";

  /**
   * Initialize the proxy service (call after Redis connection)
   */
  async initialize(): Promise<void> {
    await this.initializeProxies();
  }

  /**
   * Get next proxy using round-robin selection
   * @returns Next available proxy
   */
  async getNextProxy(): Promise<IProxy> {
    // Ensure we have proxies loaded
    if (this.proxies.length === 0) {
      await this.refreshProxies();
    }

    // Filter out failed proxies
    const availableProxies = this.proxies.filter(
      (proxy) => !this.failedProxies.has(this.getProxyKey(proxy))
    );

    if (availableProxies.length === 0) {
      // Reset failed proxies if all are marked as failed
      console.log("All proxies marked as failed, resetting failed list");
      this.failedProxies.clear();
      await this.clearFailedProxiesFromRedis();
      return this.getNextProxy(); // Retry with all proxies
    }

    // Round-robin selection
    const proxy = availableProxies[this.currentIndex % availableProxies.length];
    this.currentIndex = (this.currentIndex + 1) % availableProxies.length;

    return proxy;
  }

  /**
   * Mark a proxy as failed
   * @param proxy - Proxy to mark as failed
   */
  async markProxyFailed(proxy: IProxy): Promise<void> {
    const proxyKey = this.getProxyKey(proxy);
    this.failedProxies.add(proxyKey);

    // Store in Redis for persistence
    await redisService.set(
      `${this.FAILED_KEY}:${proxyKey}`,
      JSON.stringify({
        proxy,
        failedAt: new Date().toISOString(),
      })
    );

    console.log(`Marked proxy as failed: ${proxyKey}`);
  }

  /**
   * Get all available proxies
   * @returns Array of available proxies
   */
  async getAvailableProxies(): Promise<IProxy[]> {
    if (this.proxies.length === 0) {
      await this.refreshProxies();
    }

    return this.proxies.filter(
      (proxy) => !this.failedProxies.has(this.getProxyKey(proxy))
    );
  }

  /**
   * Refresh proxies from provider
   */
  async refreshProxies(): Promise<void> {
    try {
      console.log("Refreshing proxies from provider...");

      const provider = proxyProviderFactory.getProvider(this.currentProvider);
      const freshProxies = await provider.getProxies();

      // Update local cache
      this.proxies = freshProxies;

      // Cache in Redis
      await redisService.set(this.CACHE_KEY, JSON.stringify(freshProxies));

      // Load failed proxies from Redis
      await this.loadFailedProxiesFromRedis();

      console.log(
        `Loaded ${freshProxies.length} proxies from ${this.currentProvider} provider`
      );
    } catch (error) {
      console.error("Failed to refresh proxies:", error);

      // Try to load from Redis cache as fallback
      await this.loadProxiesFromRedis();
    }
  }

  /**
   * Initialize proxies on startup
   */
  private async initializeProxies(): Promise<void> {
    try {
      // Try to load from Redis cache first
      await this.loadProxiesFromRedis();

      if (this.proxies.length === 0) {
        // If no cache, load from provider
        await this.refreshProxies();
      } else {
        // Load failed proxies from Redis
        await this.loadFailedProxiesFromRedis();
        console.log(`Loaded ${this.proxies.length} proxies from cache`);
      }
    } catch (error) {
      console.error("Failed to initialize proxies:", error);
      // Fallback to provider
      await this.refreshProxies();
    }
  }

  /**
   * Load proxies from Redis cache
   */
  private async loadProxiesFromRedis(): Promise<void> {
    try {
      const cachedProxies = await redisService.get(this.CACHE_KEY);
      if (cachedProxies) {
        this.proxies = JSON.parse(cachedProxies);
      }
    } catch (error) {
      console.error("Failed to load proxies from Redis:", error);
    }
  }

  /**
   * Load failed proxies from Redis
   */
  private async loadFailedProxiesFromRedis(): Promise<void> {
    try {
      // Get all failed proxy keys
      const failedKeys = await redisService.get(`${this.FAILED_KEY}:*`);
      if (failedKeys) {
        // Parse and add to failed set
        const failedData = JSON.parse(failedKeys);
        this.failedProxies.add(failedData.proxyKey);
      }
    } catch (error) {
      console.error("Failed to load failed proxies from Redis:", error);
    }
  }

  /**
   * Clear failed proxies from Redis
   */
  private async clearFailedProxiesFromRedis(): Promise<void> {
    try {
      await redisService.del(`${this.FAILED_KEY}:*`);
    } catch (error) {
      console.error("Failed to clear failed proxies from Redis:", error);
    }
  }

  /**
   * Get unique key for proxy
   * @param proxy - Proxy object
   * @returns Unique key string
   */
  private getProxyKey(proxy: IProxy): string {
    return `${proxy.ip}:${proxy.port}`;
  }
}

// Export singleton instance
export const proxyService = new ProxyService();
export default proxyService;
