import { getAppConfig } from "./config";
import { redisService, proxyService } from "./services";
import app from "./app";

/**
 * Setup graceful shutdown handlers
 */
const setupGracefulShutdown = (server: any): void => {
  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    server.close(async () => {
      try {
        await redisService.disconnect();
        console.log("Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        console.error("Error during graceful shutdown:", error);
        process.exit(1);
      }
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

/**
 * Start the server
 */
export const startServer = async (): Promise<void> => {
  try {
    await redisService.connect();
    console.log("Redis connected successfully");

    await proxyService.initialize();
    console.log("ProxyService initialized successfully");

    const config = getAppConfig();

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });

    setupGracefulShutdown(server);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}
