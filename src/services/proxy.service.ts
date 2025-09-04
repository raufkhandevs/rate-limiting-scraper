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
  private readonly CACHE_KEY = "proxies:active";

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
    if (this.proxies.length === 0) {
      throw new Error(
        "No proxies available. ProxyService not properly initialized."
      );
    }

    // Round-robin selection
    const proxy = this.proxies[this.currentIndex % this.proxies.length];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

    return proxy;
  }

  /**
   * Get all available proxies
   * @returns Array of available proxies
   */
  async getAvailableProxies(): Promise<IProxy[]> {
    if (this.proxies.length === 0) {
      throw new Error(
        "No proxies available. ProxyService not properly initialized."
      );
    }

    return [...this.proxies];
  }

  /**
   * Initialize proxies on startup
   */
  private async initializeProxies(): Promise<void> {
    try {
      await this.loadProxiesFromRedis();

      if (this.proxies.length === 0) {
        await this.loadProxiesFromProvider();
      } else {
        console.log(`Loaded ${this.proxies.length} proxies from cache`);
      }
    } catch (error) {
      console.error("Failed to initialize proxies:", error);
      await this.loadProxiesFromProvider();
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
   * Load proxies from provider
   */
  private async loadProxiesFromProvider(): Promise<void> {
    try {
      const provider = proxyProviderFactory.getProvider(this.currentProvider);
      const freshProxies = await provider.getProxies();

      this.proxies = freshProxies;

      await redisService.set(this.CACHE_KEY, JSON.stringify(freshProxies));

      console.log(
        `Loaded ${freshProxies.length} proxies from ${this.currentProvider} provider`
      );
    } catch (error) {
      console.error("Failed to load proxies from provider:", error);
      throw error;
    }
  }
}

export const proxyService = new ProxyService();
export default proxyService;
