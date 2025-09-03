import { createClient, RedisClientType } from "redis";
import { getAppConfig } from "../config";

/**
 * Redis service
 * Handles Redis connection and operations
 */
class RedisService {
  private client: RedisClientType | null = null;
  private config = getAppConfig();

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this.client) {
      this.client = createClient({
        url: `redis://${this.config.redis.host}:${this.config.redis.port}`,
      });

      this.client.on("error", (err: Error) => {
        console.error("Redis Client Error:", err);
      });

      this.client.on("connect", () => {
        console.log("Redis Client Connected");
      });

      await this.client.connect();
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.client.isOpen) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Check if Redis is healthy
   */
  async isHealthy(): Promise<boolean> {
    try {
      if (!this.client || !this.client.isOpen) {
        return false;
      }
      await this.client.ping();
      return true;
    } catch (error) {
      console.error("Redis health check failed:", error);
      return false;
    }
  }

  /**
   * Get value by key
   */
  async get(key: string): Promise<string | null> {
    if (!this.client || !this.client.isOpen) {
      throw new Error("Redis client not connected");
    }
    return await this.client.get(key);
  }

  /**
   * Set key-value pair
   */
  async set(key: string, value: string): Promise<void> {
    if (!this.client || !this.client.isOpen) {
      throw new Error("Redis client not connected");
    }
    await this.client.set(key, value);
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<boolean> {
    if (!this.client || !this.client.isOpen) {
      throw new Error("Redis client not connected");
    }
    const result = await this.client.del(key);
    return result > 0;
  }
}

// Export singleton instance
export const redisService = new RedisService();
