import { describe, expect, it } from "vitest";

const urls = [
  process.env.EXPO_PUBLIC_PATREON_URL,
  process.env.EXPO_PUBLIC_BUYMEACOFFEE_URL,
].filter((url): url is string => Boolean(url));

describe("Sports803TV public support links", () => {
  it("are configured as valid HTTP destinations", () => {
    expect(urls).toHaveLength(2);
    for (const url of urls) {
      const destination = new URL(url);
      expect(["http:", "https:"]).toContain(destination.protocol);
      expect(destination.hostname).not.toBe("");
    }
  }, 15_000);
});
