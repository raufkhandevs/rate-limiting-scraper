/**
 * Validation utility functions
 */
import isNumber from "lodash/isNumber";
import inRange from "lodash/inRange";

/**
 * Validate if a string is a valid URL
 * @param url - URL string to validate
 * @returns true if valid URL, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate if a number is within a range
 * @param value - Value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns true if within range, false otherwise
 */
export const isWithinRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return isNumber(value) && inRange(value, min, max + 1);
};

/**
 * Validate if a value is a positive number
 * @param value - Value to validate
 * @returns true if positive number, false otherwise
 */
export const isPositiveNumber = (value: number): boolean => {
  return isNumber(value) && value > 0;
};

/**
 * Validate if a value is a non-negative number
 * @param value - Value to validate
 * @returns true if non-negative number, false otherwise
 */
export const isNonNegativeNumber = (value: number): boolean => {
  return isNumber(value) && value >= 0;
};
