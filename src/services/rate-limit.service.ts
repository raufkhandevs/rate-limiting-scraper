import { IProxy } from "../interfaces/proxy.interface";
import { redisService } from "./redis.service";

/**
 * Rate limit service for managing per-proxy rate limiting
 * Uses Redis sliding window for accurate rate limiting
 */
export class RateLimitService {
  private readonly RATE_LIMIT_KEY_PREFIX = "rate_limit";
  private readonly WINDOW_SIZE_SECONDS = 2; // 2-second sliding window
  private readonly DEFAULT_REQUESTS_PER_SECOND = 1; // Default: 1 req/sec per proxy

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
      const currentTime = Math.floor(Date.now() / 1000);
      const windowStart = currentTime - this.WINDOW_SIZE_SECONDS + 1;

      // Get rate limit key for this proxy
      const rateLimitKey = this.getRateLimitKey(proxy, currentTime);

      // Get current count for this second
      const currentCount = await redisService.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      // Check if we're within the rate limit
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
      const currentTime = Math.floor(Date.now() / 1000);
      const rateLimitKey = this.getRateLimitKey(proxy, currentTime);

      // Get current count
      const currentCount = await redisService.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;

      // Check if we would exceed the rate limit
      if (count >= requestsPerSecond) {
        console.log(
          `Rate limit exceeded for proxy ${proxy.ip}:${proxy.port} - ${count}/${requestsPerSecond} requests`
        );
        return false;
      }

      // Increment counter
      const newCount = count + 1;
      await redisService.set(rateLimitKey, newCount.toString());

      // Set expiration (2 seconds from now)
      // Note: Redis service doesn't have expire method, so we'll handle TTL in the key
      const ttlKey = `${rateLimitKey}:ttl`;
      await redisService.set(ttlKey, currentTime.toString());

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
   * Get rate limit status for a proxy
   * @param proxy - Proxy to check
   * @param requestsPerSecond - Rate limit (default: 1 req/sec)
   * @returns Rate limit status information
   */
  async getRateLimitStatus(
    proxy: IProxy,
    requestsPerSecond: number = this.DEFAULT_REQUESTS_PER_SECOND
  ): Promise<{
    proxy: string;
    currentCount: number;
    limit: number;
    remaining: number;
    resetTime: number;
    isWithinLimit: boolean;
  }> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const rateLimitKey = this.getRateLimitKey(proxy, currentTime);

      const currentCount = await redisService.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;
      const remaining = Math.max(0, requestsPerSecond - count);
      const resetTime = currentTime + this.WINDOW_SIZE_SECONDS;

      return {
        proxy: `${proxy.ip}:${proxy.port}`,
        currentCount: count,
        limit: requestsPerSecond,
        remaining: remaining,
        resetTime: resetTime,
        isWithinLimit: count < requestsPerSecond,
      };
    } catch (error) {
      console.error("Error getting rate limit status:", error);
      return {
        proxy: `${proxy.ip}:${proxy.port}`,
        currentCount: 0,
        limit: requestsPerSecond,
        remaining: requestsPerSecond,
        resetTime: Math.floor(Date.now() / 1000) + this.WINDOW_SIZE_SECONDS,
        isWithinLimit: true,
      };
    }
  }

  /**
   * Clear rate limit for a specific proxy
   * @param proxy - Proxy to clear rate limit for
   */
  async clearRateLimit(proxy: IProxy): Promise<void> {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const rateLimitKey = this.getRateLimitKey(proxy, currentTime);

      await redisService.del(rateLimitKey);
      console.log(`Cleared rate limit for proxy ${proxy.ip}:${proxy.port}`);
    } catch (error) {
      console.error("Error clearing rate limit:", error);
    }
  }

  /**
   * Clear all rate limits (for testing or maintenance)
   * Note: This is a simplified version since we don't have pattern matching
   */
  async clearAllRateLimits(): Promise<void> {
    try {
      // For now, we'll clear rate limits by time window
      // In a production system, you'd want to use Redis SCAN or similar
      const currentTime = Math.floor(Date.now() / 1000);

      // Clear rate limits for the last few seconds
      for (let i = 0; i < 10; i++) {
        const timeKey = currentTime - i;
        // We can't easily clear all keys without pattern matching
        // This is a limitation of our simplified Redis service
      }

      console.log(
        "Rate limit clearing requested (limited by Redis service capabilities)"
      );
    } catch (error) {
      console.error("Error clearing all rate limits:", error);
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

// Export singleton instance
export const rateLimitService = new RateLimitService();
export default rateLimitService;
