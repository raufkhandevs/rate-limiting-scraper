import { getAppConfig, isDevelopment } from "./config";
import { redisService } from "./services";
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
    // Connect to Redis
    await redisService.connect();
    console.log("Redis connected successfully");

    const config = getAppConfig();

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`API Version: ${config.apiVersion}`);
      if (isDevelopment()) {
        console.log(`CORS Origin: ${config.corsOrigin}`);
      }
    });

    setupGracefulShutdown(server);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}
