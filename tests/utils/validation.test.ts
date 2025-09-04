import { isValidUrl } from "../../src/utils/validation";

describe("Validation Utils", () => {
  describe("isValidUrl", () => {
    it("should return true for valid URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
      expect(isValidUrl("https://api.example.com/path")).toBe(true);
    });

    it("should return false for invalid URLs", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl("just-text")).toBe(false);
      expect(isValidUrl("http://")).toBe(false);
    });
  });
});
