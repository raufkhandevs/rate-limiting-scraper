import { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service";

/**
 * Health controller
 * Handles health check endpoints
 */
export const getHealth = async (req: Request, res: Response): Promise<void> => {
  const healthStatus = await getHealthStatus();
  res.json(healthStatus);
};
