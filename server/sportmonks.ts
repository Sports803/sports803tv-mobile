type SportmonksFixture = Record<string, unknown>;

type CachedFixture = { expiresAt: number; data: SportmonksFixture };
const cache = new Map<string, CachedFixture>();
const CACHE_TTL_MS = 60_000;

export async function fetchSportmonksFixture(fixtureId: string) {
  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) return { available: false as const, reason: "Sportmonks is not configured for this project." };

  const cached = cache.get(fixtureId);
  if (cached && cached.expiresAt > Date.now()) return { available: true as const, fixture: cached.data, cached: true };

  const endpoint = new URL(`https://api.sportmonks.com/v3/football/fixtures/${encodeURIComponent(fixtureId)}`);
  endpoint.searchParams.set("include", "participants;events;statistics;lineups;standings");
  const response = await fetch(endpoint, { headers: { Authorization: token } });
  if (!response.ok) return { available: false as const, reason: "Detailed fixture data is temporarily unavailable." };

  const payload = await response.json() as { data?: SportmonksFixture };
  if (!payload.data || typeof payload.data !== "object") return { available: false as const, reason: "The provider returned no fixture data." };
  cache.set(fixtureId, { data: payload.data, expiresAt: Date.now() + CACHE_TTL_MS });
  return { available: true as const, fixture: payload.data, cached: false };
}
