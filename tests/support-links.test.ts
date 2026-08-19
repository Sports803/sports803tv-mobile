import { describe, expect, it } from "vitest";

const urls = [
  process.env.EXPO_PUBLIC_PATREON_URL,
  process.env.EXPO_PUBLIC_BUYMEACOFFEE_URL,
].filter((url): url is string => Boolean(url));

describe("Sports803TV public support links", () => {
  it("are configured and resolve to an HTTP destination", async () => {
    expect(urls).toHaveLength(2);
    for (const url of urls) {
      const response = await fetch(url, { method: "GET", redirect: "manual" });
      expect(response.status, `Support link returned HTTP ${response.status}`).toBeGreaterThanOrEqual(200);
      expect(response.status, `Support link returned HTTP ${response.status}`).toBeLessThan(400);
    }
  }, 15_000);
});
