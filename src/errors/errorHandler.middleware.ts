import { Request, Response, NextFunction } from "express";
import { isDevelopment } from "../config";
import { AppError } from "./custom-errors";

/**
 * Global error handling middleware
 * Handles all unhandled errors
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Unhandled error:", error);

  // Check if it's our custom AppError
  if (error instanceof AppError) {
    const response = {
      status: "error",
      data: null,
      message: error.message,
      timestamp: new Date().toISOString(),
      ...(isDevelopment() && { stack: error.stack }),
    };

    res.status(error.statusCode).json(response);
    return;
  }

  // Handle generic errors
  const response = {
    status: "error",
    data: null,
    message: isDevelopment() ? error.message : "Something went wrong",
    timestamp: new Date().toISOString(),
    ...(isDevelopment() && { stack: error.stack }),
  };

  res.status(500).json(response);
};
