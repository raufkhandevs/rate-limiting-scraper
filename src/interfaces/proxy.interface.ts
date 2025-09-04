/**
 * Base proxy interface
 */
export interface IProxy {
  ip: string;
  port: number;
  protocol: "http" | "https";
  provider: ProxyProviderType;
  metadata?: Record<string, any>;
}

/**
 * Proxy provider types
 * Currently only 'free' is supported
 * TODO: Add 'premium' and 'rotating' in the future
 */
export type ProxyProviderType = "free" | "premium" | "rotating";

/**
 * Proxy provider interface
 */
export interface IProxyProvider {
  readonly providerType: ProxyProviderType;
  getProxies(): Promise<IProxy[]>;
}

/**
 * Proxy service interface
 */
export interface IProxyService {
  getNextProxy(): Promise<IProxy>;
  getAvailableProxies(): Promise<IProxy[]>;
}

/**
 * Provider factory interface
 */
export interface IProxyProviderFactory {
  getProvider(type: ProxyProviderType): IProxyProvider;
}
