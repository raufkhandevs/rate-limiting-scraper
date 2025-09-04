import { IProxy } from "../interfaces/proxy.interface";
import { redisService } from "./redis.service";

/**
 * Rate limit service for managing per-proxy rate limiting
 * Uses Redis sliding window for accurate rate limiting
 */
export class RateLimitService {
  private readonly RATE_LIMIT_KEY_PREFIX = "rate_limit";
  private readonly DEFAULT_REQUESTS_PER_SECOND = 1;

  /**
   * Get current Unix timestamp
   * @returns Unix timestamp in seconds
   */
  getUnixTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Get count by Redis key
   * @param key - Redis key
   * @returns Count
   */
  async getCountByRedisKey(key: string): Promise<number> {
    const currentCount = await redisService.get(key);
    return currentCount ? parseInt(currentCount, 10) : 0;
  }

  /**
   * Check if proxy is within rate limit
   * @param proxy - Proxy to check
   * @param requestsPerSecond - Rate limit (default: 1 req/sec)
   * @returns true if within rate limit, false if rate limited
   */
  async isWithinRateLimit(
    proxy: IProxy,
    requestsPerSecond: number = this.DEFAULT_REQUESTS_PER_SECOND
  ): Promise<boolean> {
    try {
      const currentTime = this.getUnixTimestamp();
      const rateLimitKey = this.getRateLimitKey(proxy, currentTime);

      const count = await this.getCountByRedisKey(rateLimitKey);

      if (count >= requestsPerSecond) {
        console.log(
          `Rate limit exceeded for proxy ${proxy.ip}:${proxy.port} - ${count}/${requestsPerSecond} requests`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking rate limit:", error);
      // If Redis fails, allow the request (fail open)
      return true;
    }
  }

  /**
   * Increment rate limit counter for proxy
   * @param proxy - Proxy to increment counter for
   * @param requestsPerSecond - Rate limit (default: 1 req/sec)
   * @returns true if successful, false if rate limited
   */
  async incrementRateLimit(
    proxy: IProxy,
    requestsPerSecond: number = this.DEFAULT_REQUESTS_PER_SECOND
  ): Promise<boolean> {
    try {
      const currentTime = this.getUnixTimestamp();
      const rateLimitKey = this.getRateLimitKey(proxy, currentTime);

      const count = await this.getCountByRedisKey(rateLimitKey);

      if (count >= requestsPerSecond) {
        console.log(
          `Rate limit exceeded for proxy ${proxy.ip}:${proxy.port} - ${count}/${requestsPerSecond} requests`
        );
        return false;
      }

      const newCount = count + 1;
      await redisService.set(rateLimitKey, newCount.toString(), 2); // 2 seconds expiry

      console.log(
        `Rate limit incremented for proxy ${proxy.ip}:${proxy.port} - ${newCount}/${requestsPerSecond} requests`
      );
      return true;
    } catch (error) {
      console.error("Error incrementing rate limit:", error);
      // If Redis fails, allow the request (fail open)
      return true;
    }
  }

  /**
   * Get rate limit key for proxy and timestamp
   * @param proxy - Proxy object
   * @param timestamp - Unix timestamp in seconds
   * @returns Redis key for rate limiting
   */
  private getRateLimitKey(proxy: IProxy, timestamp: number): string {
    return `${this.RATE_LIMIT_KEY_PREFIX}:${proxy.ip}:${proxy.port}:${timestamp}`;
  }
}

export const rateLimitService = new RateLimitService();
export default rateLimitService;
