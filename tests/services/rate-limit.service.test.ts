import { RateLimitService } from "../../src/services/rate-limit.service";
import { redisService } from "../../src/services/redis.service";

// Mock the Redis service
jest.mock("../../src/services/redis.service");
const mockRedisService = redisService as jest.Mocked<typeof redisService>;

describe("RateLimitService", () => {
  let rateLimitService: RateLimitService;
  const mockProxy = {
    ip: "192.168.1.1",
    port: 8080,
    protocol: "http" as const,
    provider: "free" as const,
  };

  beforeEach(() => {
    rateLimitService = new RateLimitService();
    jest.clearAllMocks();
  });

  describe("isWithinRateLimit", () => {
    it("should return true when under rate limit", async () => {
      mockRedisService.get.mockResolvedValue("0"); // No requests yet

      const result = await rateLimitService.isWithinRateLimit(mockProxy, 1);

      expect(result).toBe(true);
      expect(mockRedisService.get).toHaveBeenCalledWith(
        expect.stringContaining("rate_limit:192.168.1.1:8080:")
      );
    });

    it("should return false when at rate limit", async () => {
      mockRedisService.get.mockResolvedValue("1"); // Already at limit

      const result = await rateLimitService.isWithinRateLimit(mockProxy, 1);

      expect(result).toBe(false);
    });

    it("should return true when Redis fails (fail open)", async () => {
      mockRedisService.get.mockRejectedValue(new Error("Redis error"));

      const result = await rateLimitService.isWithinRateLimit(mockProxy, 1);

      expect(result).toBe(true);
    });
  });

  describe("incrementRateLimit", () => {
    it("should increment counter when under limit", async () => {
      mockRedisService.get.mockResolvedValue("0"); // Under limit
      mockRedisService.set.mockResolvedValue(undefined);

      const result = await rateLimitService.incrementRateLimit(mockProxy, 1);

      expect(result).toBe(true);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.stringContaining("rate_limit:192.168.1.1:8080:"),
        "1",
        2 // 2 seconds expiry
      );
    });

    it("should not increment when at limit", async () => {
      mockRedisService.get.mockResolvedValue("1"); // At limit

      const result = await rateLimitService.incrementRateLimit(mockProxy, 1);

      expect(result).toBe(false);
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });

    it("should return true when Redis fails (fail open)", async () => {
      mockRedisService.get.mockRejectedValue(new Error("Redis error"));

      const result = await rateLimitService.incrementRateLimit(mockProxy, 1);

      expect(result).toBe(true);
    });
  });

  describe("getUnixTimestamp", () => {
    it("should return current Unix timestamp in seconds", () => {
      const timestamp = rateLimitService.getUnixTimestamp();
      const expected = Math.floor(Date.now() / 1000);

      expect(timestamp).toBeCloseTo(expected, 1); // Within 1 second
    });
  });
});
