import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAppConfig, isDevelopment } from "./config";
import appRoutes from "./routes";
import { notFound, errorHandler, responseWrapper } from "./errors";

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
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API Version: ${config.apiVersion}`);
  if (isDevelopment()) {
    console.log(`CORS Origin: ${config.corsOrigin}`);
  }
});

export default app;
