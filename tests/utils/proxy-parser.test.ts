import { getProxies } from '../../src/utils/proxy-parser';

// Mock fs to avoid file system dependencies in tests
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(`
# This is a comment
192.168.1.1:8080
192.168.1.2:8080
invalid-line
192.168.1.3:443
192.168.1.4:3128
`),
}));

describe('Proxy Parser', () => {
  describe('getProxies', () => {
    it('should parse valid proxy lines', () => {
      const proxies = getProxies();

      expect(proxies).toHaveLength(4);
      expect(proxies[0]).toEqual({
        ip: '192.168.1.1',
        port: 8080,
        protocol: 'http',
      });
      expect(proxies[1]).toEqual({
        ip: '192.168.1.2',
        port: 8080,
        protocol: 'http',
      });
    });

    it('should detect HTTPS protocol for port 443', () => {
      const proxies = getProxies();
      const httpsProxy = proxies.find(p => p.port === 443);

      expect(httpsProxy).toEqual({
        ip: '192.168.1.3',
        port: 443,
        protocol: 'https',
      });
    });

    it('should filter out invalid lines', () => {
      const proxies = getProxies();

      // Should not include the invalid line
      expect(proxies).not.toContainEqual(
        expect.objectContaining({ ip: 'invalid-line' })
      );
    });

    it('should filter out comments', () => {
      const proxies = getProxies();

      // Should not include comment lines
      expect(proxies).not.toContainEqual(
        expect.objectContaining({ ip: '# This is a comment' })
      );
    });
  });
});
