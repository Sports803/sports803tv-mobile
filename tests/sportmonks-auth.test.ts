import { describe, expect, it } from "vitest";

const token = process.env.SPORTMONKS_API_TOKEN;

describe("Sportmonks private configuration", () => {
  it.skipIf(!token)("authenticates a lightweight server-only fixture request", async () => {
    const response = await fetch("https://api.sportmonks.com/v3/football/fixtures?per_page=1", {
      headers: { Authorization: token! },
    });
    expect(response.ok, `Sportmonks authentication returned HTTP ${response.status}`).toBe(true);
  }, 15_000);
});
