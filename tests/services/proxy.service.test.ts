import { ProxyService } from "../../src/services/proxy.service";
import { redisService } from "../../src/services/redis.service";

// Mock the Redis service
jest.mock("../../src/services/redis.service");
const mockRedisService = redisService as jest.Mocked<typeof redisService>;

// Mock the proxy provider factory
jest.mock("../../src/providers", () => ({
  proxyProviderFactory: {
    getProvider: jest.fn().mockReturnValue({
      getProxies: jest.fn().mockResolvedValue([
        { ip: "192.168.1.1", port: 8080, protocol: "http", provider: "free" },
        { ip: "192.168.1.2", port: 8080, protocol: "http", provider: "free" },
        { ip: "192.168.1.3", port: 8080, protocol: "http", provider: "free" },
      ]),
    }),
  },
}));

describe("ProxyService", () => {
  let proxyService: ProxyService;

  beforeEach(() => {
    proxyService = new ProxyService();
    jest.clearAllMocks();
  });

  describe("getNextProxy", () => {
    it("should return proxies in round-robin order", async () => {
      await proxyService.initialize();

      const proxy1 = await proxyService.getNextProxy();
      const proxy2 = await proxyService.getNextProxy();
      const proxy3 = await proxyService.getNextProxy();
      const proxy4 = await proxyService.getNextProxy();

      expect(proxy1.ip).toBe("192.168.1.1");
      expect(proxy2.ip).toBe("192.168.1.2");
      expect(proxy3.ip).toBe("192.168.1.3");
      expect(proxy4.ip).toBe("192.168.1.1"); // Should cycle back
    });

    it("should throw error when no proxies are loaded", async () => {
      // Don't initialize, so proxies array is empty
      await expect(proxyService.getNextProxy()).rejects.toThrow(
        "No proxies available. ProxyService not properly initialized."
      );
    });
  });

  describe("getAvailableProxies", () => {
    it("should return all available proxies", async () => {
      await proxyService.initialize();

      const proxies = await proxyService.getAvailableProxies();

      expect(proxies).toHaveLength(3);
      expect(proxies[0].ip).toBe("192.168.1.1");
      expect(proxies[1].ip).toBe("192.168.1.2");
      expect(proxies[2].ip).toBe("192.168.1.3");
    });

    it("should throw error when no proxies are loaded", async () => {
      await expect(proxyService.getAvailableProxies()).rejects.toThrow(
        "No proxies available. ProxyService not properly initialized."
      );
    });
  });

  describe("initialize", () => {
    it("should load proxies from provider when no cache", async () => {
      mockRedisService.get.mockResolvedValue(null); // No cache

      await proxyService.initialize();

      expect(mockRedisService.get).toHaveBeenCalledWith("proxies:active");
      expect(mockRedisService.set).toHaveBeenCalledWith(
        "proxies:active",
        expect.any(String)
      );
    });

    it("should load proxies from cache when available", async () => {
      const cachedProxies = JSON.stringify([
        { ip: "192.168.1.1", port: 8080, protocol: "http", provider: "free" },
      ]);
      mockRedisService.get.mockResolvedValue(cachedProxies);

      await proxyService.initialize();

      expect(mockRedisService.get).toHaveBeenCalledWith("proxies:active");
      expect(mockRedisService.set).not.toHaveBeenCalled();
    });
  });
});
