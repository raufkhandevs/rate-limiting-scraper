import { Request, Response, NextFunction } from "express";

/**
 * Async wrapper middleware
 * Wraps async controller functions to catch errors automatically
 * No need for try-catch in every controller
 * Only wraps async functions, leaves sync functions alone
 */
export const asyncWrapper = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = fn(req, res, next);

    // If the function returns a Promise (async), wrap it
    if (result instanceof Promise) {
      result.catch(next);
    }
    // If it's sync, just let it run normally
  };
};
