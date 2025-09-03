/**
 * Common utility functions
 */
import isEmpty from "lodash/isEmpty";
import random from "lodash/random";

/**
 * Sleep for a specified number of milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generate a random number between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number between min and max
 */
export const randomBetween = (min: number, max: number): number => {
  return random(min, max, true); // true for floating point, false for integer
};

/**
 * Safely parse JSON string
 * @param jsonString - JSON string to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed object or default value
 */
export const safeJsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

// Re-export lodash utilities we're using
export { isEmpty };
