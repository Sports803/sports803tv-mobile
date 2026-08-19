import { describe, expect, it } from "vitest";

import { normalizeChannel } from "../lib/sports";
import { makeSupportDestinations } from "../lib/support-contract";

describe("Firebase Live TV iframe and support contracts", () => {
  it("preserves iframe query parameters and chooses WebView playback for iframe-oriented Firebase sources", () => {
    const src = "https://stream.example/watch?embed=1&mora=preserved";
    const channel = normalizeChannel("channel-1", { name: "Sports 803", src });
    expect(channel).toMatchObject({ src, sourceKind: "embed" });
  });

  it("keeps direct HLS sources on the native video playback path", () => {
    expect(normalizeChannel("channel-2", { src: "https://stream.example/live.m3u8?token=active" })?.sourceKind).toBe("video");
  });

  it("exposes Patreon and Buy Me a Coffee only when supplied as HTTPS destinations", () => {
    const destinations = makeSupportDestinations(process.env.EXPO_PUBLIC_PATREON_URL, process.env.EXPO_PUBLIC_BUYMEACOFFEE_URL);
    expect(destinations.map((destination) => destination.id)).toEqual(["patreon", "buy-me-a-coffee"]);
    expect(destinations.every((destination) => /^https:\/\//.test(destination.url))).toBe(true);
  });
});
