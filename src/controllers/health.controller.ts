import { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";

/**
 * Health controller
 * Handles health check endpoints
 */
export const getHealth = (req: Request, res: Response): void => {
  const healthStatus = getHealthStatus();
  res.json(healthStatus);
};
