/**
 * Health service
 * Handles health-related business logic
 */

/**
 * Get application health status
 * @returns Health status object
 */
export const getHealthStatus = () => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
};
