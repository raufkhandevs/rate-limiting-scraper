/**
 * Application configuration
 * Handles app-related environment variables
 */

export interface AppConfig {
  readonly port: number;
  readonly nodeEnv: string;
  readonly apiVersion: string;
  readonly corsOrigin: string;
  readonly maxRequestSize: string;
  readonly redis: {
    readonly host: string;
    readonly port: number;
  };
}

/**
 * Get application configuration from environment variables
 */
export const getAppConfig = (): AppConfig => {
  return {
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    apiVersion: process.env.API_VERSION || "v1",
    corsOrigin: process.env.CORS_ORIGIN || "*",
    maxRequestSize: process.env.MAX_REQUEST_SIZE || "10mb",
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
    },
  };
};

/**
 * Check if application is in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === "development";
};

/**
 * Check if application is in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === "production";
};
