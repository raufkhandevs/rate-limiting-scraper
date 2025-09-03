import {
  IProxyProvider,
  IProxyProviderFactory,
  ProxyProviderType,
} from "../interfaces/proxy.interface";

/**
 * Provider factory for creating proxy providers
 * Currently only supports free provider
 *
 * TODO: Future providers (premium, rotating) can be added here
 */
class ProxyProviderFactory implements IProxyProviderFactory {
  private providers: Map<ProxyProviderType, IProxyProvider> = new Map();

  constructor() {
    // Initialize only the free provider
    this.initializeProviders();
  }

  /**
   * Get provider by type with type safety
   * @param type - Provider type (currently only 'free' is supported)
   * @returns Provider instance
   */
  getProvider(type: ProxyProviderType): IProxyProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`Provider '${type}' not found`);
    }
    return provider;
  }

  /**
   * Initialize providers
   * Currently only initializes the free provider
   */
  private initializeProviders(): void {
    // Import free provider
    const { FreeProxyProvider } = require("./free-proxy-provider");

    // Only add the free provider
    this.providers.set("free", new FreeProxyProvider());

    // TODO: Add premium and rotating providers in the future
    // this.providers.set("premium", new PremiumProxyProvider());
    // this.providers.set("rotating", new RotatingProxyProvider());
  }
}

// Export singleton instance
export const proxyProviderFactory = new ProxyProviderFactory();
export default proxyProviderFactory;
