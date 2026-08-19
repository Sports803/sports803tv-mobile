import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("../lib/local", () => ({ getAnalyticsConsent: vi.fn() }));

import { trackAnalytics } from "../lib/analytics";
import { getAnalyticsConsent } from "../lib/local";

describe("consent safety contracts", () => {
  it("keeps analytics events behind the persisted consent decision", async () => {
    vi.mocked(getAnalyticsConsent).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await expect(trackAnalytics("player_open", { sourceCount: 2 })).resolves.toBe(false);
    await expect(trackAnalytics("share_event", { eventId: "803" })).resolves.toBe(true);
  });

  it("requires consent before native banners or interstitials can load", () => {
    const banner = readFileSync("components/ad-slot.native.tsx", "utf8");
    const interstitial = readFileSync("lib/interstitial.native.ts", "utf8");
    expect(banner).toContain("getAnalyticsConsent");
    expect(banner).toContain("if (!hasConsent)");
    expect(interstitial).toContain("getAnalyticsConsent");
    expect(interstitial).toContain("getAnalyticsConsent().then(setHasConsent)");
    expect(interstitial).toContain("hasConsent ? mobileAds?.InterstitialAd.createForAdRequest");
  });
});
