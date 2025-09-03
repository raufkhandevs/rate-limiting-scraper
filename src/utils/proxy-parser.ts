import fs from "fs";
import path from "path";

export interface Proxy {
  ip: string;
  port: number;
  protocol: "http" | "https";
}

/**
 * Parse proxy list from text file
 * @param filePath - Path to the proxy text file
 * @returns Array of proxy objects
 */
export const parseProxiesFromFile = (filePath: string): Proxy[] => {
  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, "utf-8");

    return parseProxiesFromText(content);
  } catch (error) {
    console.error(`Error reading proxy file ${filePath}:`, error);
    return [];
  }
};

/**
 * Parse proxy list from text content
 * @param content - Text content with proxy list
 * @returns Array of proxy objects
 */
export const parseProxiesFromText = (content: string): Proxy[] => {
  const proxies: Proxy[] = [];

  const lines = content.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    // Parse format: "ip:port"
    const parts = trimmedLine.split(":");
    if (parts.length === 2) {
      const ip = parts[0].trim();
      const port = parseInt(parts[1].trim(), 10);

      // Validate IP and port
      if (isValidIP(ip) && !isNaN(port) && port > 0 && port <= 65535) {
        // Determine protocol based on port
        const protocol = port === 443 ? "https" : "http";

        proxies.push({
          ip,
          port,
          protocol,
        });
      }
    }
  }

  return proxies;
};

/**
 * Validate IP address format
 * @param ip - IP address string
 * @returns true if valid IP format
 */
const isValidIP = (ip: string): boolean => {
  // Basic IP validation regex
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

/**
 * Get proxies from the default data/proxies.txt file
 * @returns Array of proxy objects
 */
export const getProxies = (): Proxy[] => {
  const proxyFilePath = path.join(process.cwd(), "data", "proxies.txt");
  return parseProxiesFromFile(proxyFilePath);
};

export default {
  parseProxiesFromFile,
  parseProxiesFromText,
  getProxies,
};
