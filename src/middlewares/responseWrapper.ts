import { Request, Response, NextFunction } from "express";

/**
 * Response wrapper middleware
 * Makes all API responses consistent with standard format
 */
export const responseWrapper = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const originalJson = res.json;

  // Override json method to wrap responses
  res.json = function (body: any) {
    if (body && typeof body === "object" && body.hasOwnProperty("status")) {
      return originalJson.call(this, body);
    }

    const wrappedResponse = {
      status: "ok",
      data: body,
      message: "Success",
      timestamp: new Date().toISOString(),
    };

    return originalJson.call(this, wrappedResponse);
  };

  next();
};
