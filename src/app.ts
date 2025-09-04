import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getAppConfig } from "./config";
import appRoutes from "./routes";
import { notFound, errorHandler, responseWrapper } from "./middlewares";

dotenv.config();

/**
 * Create Express application
 */
const createApp = (): express.Application => {
  const app = express();
  const config = getAppConfig();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: config.maxRequestSize }));

  app.use(responseWrapper);

  app.use("/api", appRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp();
