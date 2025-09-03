import { Request, Response } from "express";

/**
 * 404 Not Found middleware
 * Handles routes that don't exist
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    status: "error",
    data: null,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
};
