import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchSportmonksFixture } from "../server/sportmonks";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.unstubAllEnvs();
});

describe("protected Sportmonks fixture boundary", () => {
  it("uses a server-only Authorization header and returns fixture data without exposing the token", async () => {
    vi.stubEnv("SPORTMONKS_API_TOKEN", "test-private-token");
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { id: 803, name: "Sports803 test fixture" } }), { status: 200 }));
    global.fetch = request as typeof fetch;

    const result = await fetchSportmonksFixture("803");

    expect(result).toMatchObject({ available: true, fixture: { id: 803 } });
    const [url, options] = request.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toContain("/fixtures/803");
    expect(url.searchParams.get("include")).toBe("participants;events;statistics;lineups;standings");
    expect(options.headers).toEqual({ Authorization: "test-private-token" });
  });
});
