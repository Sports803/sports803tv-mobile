import { describe, expect, it } from "vitest";

import { classifyProvider, classifySport, isEspnSearchCandidate, matchCenterAvailability } from "../lib/match-center";
import { eventSharePath } from "../lib/share-contract";
import { normalizeChannel, normalizeEvent, type SportsEvent } from "../lib/sports";

const baseEvent: SportsEvent = { id: "event-803", category: "Soccer", homeName: "KCCA", awayName: "Vipers", channels: [] };

describe("Sports803TV provider and Match Center contracts", () => {
  it("normalizes ESPN football aliases without treating them as a different sport", () => {
    const event = normalizeEvent("espn-1", { provider: "ESPN", sport: "soccer", home: "Arsenal", away: "Chelsea" });
    expect(event?.provider).toBe("espn");
    expect(classifySport(event?.category)).toBe("football");
    expect(event && isEspnSearchCandidate(event)).toBe(true);
  });

  it("prioritizes a Sportmonks fixture ID and exposes a safe Match Center availability boundary", () => {
    const event = normalizeEvent("fixture-88", { provider: "Firebase", fixture_id: 88, sport: "football", home: "A", away: "B" });
    expect(classifyProvider(event!)).toBe("sportmonks");
    expect(matchCenterAvailability(event!)).toMatchObject({ available: true, provider: "sportmonks", fixtureId: "88" });
    expect(matchCenterAvailability(baseEvent)).toMatchObject({ available: false, provider: "unknown" });
  });

  it("preserves Firebase iframe URLs exactly and marks the channel as embedded", () => {
    const channel = normalizeChannel("uganda-live", { title: "Uganda Live", iframeUrl: "https://player.example.com/embed?id=803" });
    expect(channel).toMatchObject({ sourceKind: "embed", src: "https://player.example.com/embed?id=803" });
    expect(normalizeChannel("unsafe", { iframeUrl: "javascript:alert(1)" })).toBeNull();
  });

  it("keeps the share-event URL contract scoped to the event ID", () => {
    expect(eventSharePath("fixture/803?x=1")).toBe("share-event?eventId=fixture%2F803%3Fx%3D1");
  });
});
