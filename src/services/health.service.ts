import { redisService } from "./redis.service";

/**
 * Health service
 * Handles health-related business logic
 */

/**
 * Get application health status
 * @returns Health status object
 */
export const getHealthStatus = async () => {
  const redisStatus = await redisService.isHealthy();

  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      redis: redisStatus ? "ok" : "error",
    },
  };
};
