import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAppConfig } from "./config";
import appRoutes from "./routes";
import { notFound, errorHandler, responseWrapper } from "./errors";

// Load environment variables
dotenv.config();

/**
 * Create Express application
 */
const createApp = (): express.Application => {
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

  return app;
};

export default createApp();
