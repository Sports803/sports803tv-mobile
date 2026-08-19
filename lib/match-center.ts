import type { SportsEvent } from "@/lib/sports";

export type SportsProvider = "firebase" | "espn" | "sportmonks" | "unknown";
export type CanonicalSport = "football" | "basketball" | "nfl" | "hockey" | "baseball" | "motorsport" | "mma" | "other";

const SPORT_ALIASES: Record<CanonicalSport, RegExp> = {
  football: /football|soccer|futbol/i,
  basketball: /basketball|nba|wnba/i,
  nfl: /nfl|american football|gridiron/i,
  hockey: /hockey|nhl/i,
  baseball: /baseball|mlb/i,
  motorsport: /motorsport|formula|f1|nascar|racing/i,
  mma: /mma|boxing|ufc|combat/i,
  other: /.*/i,
};

export function classifySport(value?: string): CanonicalSport {
  const source = value || "";
  return (Object.entries(SPORT_ALIASES).find(([key, expression]) => key !== "other" && expression.test(source))?.[0] || "other") as CanonicalSport;
}

export function classifyProvider(event: SportsEvent): SportsProvider {
  if (event.provider === "sportmonks" || event.fixtureId) return "sportmonks";
  if (event.provider === "espn") return "espn";
  if (event.provider === "firebase") return "firebase";
  return "unknown";
}

export function isEspnSearchCandidate(event: SportsEvent) {
  return ["football", "basketball", "nfl", "hockey", "baseball", "motorsport", "mma"].includes(classifySport(event.category));
}

export function matchCenterAvailability(event: SportsEvent) {
  if (event.fixtureId) return { available: true, provider: "sportmonks" as const, fixtureId: event.fixtureId, reason: "Sportmonks fixture data can be requested for this event." };
  return { available: false, provider: classifyProvider(event), reason: "This event has no Sportmonks fixture ID, so Match Center data is unavailable." };
}

export const matchCenterTabs = ["Summary", "Timeline", "Stats", "Lineups", "Standings"] as const;
export type MatchCenterTab = (typeof matchCenterTabs)[number];
