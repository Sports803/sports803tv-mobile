import { describe, expect, it } from "vitest";
import { eventStatus, isLive, normalizeChannel, normalizeEvent, playable } from "../lib/sports";

describe("Sports803TV data contract", () => {
  it("normalizes todaysMatches records and accepts stream aliases", () => {
    const event = normalizeEvent("match_1", { homeName: "Arsenal", awayName: "Chelsea", category: "Football", channels: [{ url: "https://example.com/live" }] });
    expect(event?.id).toBe("match_1");
    expect(event?.category).toBe("football");
    expect(playable(event!)).toBe("https://example.com/live");
  });
  it("recognizes Firebase live statuses", () => {
    expect(isLive(normalizeEvent("live", { statusType: "STATUS_LIVE", channels: [] })!)).toBe(true);
    expect(isLive(normalizeEvent("upcoming", { statusType: "STATUS_SCHEDULED", channels: [] })!)).toBe(false);
  });
  it("normalizes Live TV channel aliases without rewriting Firebase data", () => {
    const channel = normalizeChannel("channel_1", { title: "Sports 803", streamUrl: "https://example.com/live.m3u8", isLive: true });
    expect(channel).toMatchObject({ id: "channel_1", name: "Sports 803", src: "https://example.com/live.m3u8", isLive: true });
  });
  it("classifies stale LIVE flags as ended after the event window", () => {
    const kickoff = Date.parse("2026-08-15T10:00:00Z");
    const event = normalizeEvent("stale_live", { kickoff, statusType: "STATUS_LIVE", duration: 120, channels: [] })!;
    expect(eventStatus(event, kickoff + 121 * 60_000)).toBe("ended");
  });
  it("drops invalid channel URLs", () => {
    const event = normalizeEvent("x", { channels: [{ src: "undefined" }, { src: "https://valid.test/hls.m3u8" }] });
    expect(event?.channels).toHaveLength(1);
  });
  it("does not crash when an event has no channels array", () => {
    const event = normalizeEvent("no_stream", { homeName: "Home", awayName: "Away" });
    expect(event?.channels).toEqual([]);
    expect(playable(event)).toBe("");
  });
  it("preserves canonical player iframe URLs exactly", () => {
    const iframe = "https://sports803.github.io/player/?mora=https%3A%2F%2Fhls.live123.fans%2Flive%2F3931376.m3u8";
    const event = normalizeEvent("iframe_event", { channels: [{ src: iframe, type: "embed" }] });
    expect(playable(event)).toBe(iframe);
  });
});
