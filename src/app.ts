import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAppConfig, isDevelopment } from "./config";
import appRoutes from "./routes";
import { notFound, errorHandler, responseWrapper } from "./errors";
import { redisService } from "./services";

// Load environment variables
dotenv.config();

const app = express();
const config = getAppConfig();

// Basic middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: config.maxRequestSize }));

// Response wrapper middleware (must be before routes)
app.use(responseWrapper);

// API routes
app.use("/api", appRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await redisService.connect();
    console.log("Redis connected successfully");

    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`API Version: ${config.apiVersion}`);
      if (isDevelopment()) {
        console.log(`CORS Origin: ${config.corsOrigin}`);
      }
    });

    // Graceful shutdown
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
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
