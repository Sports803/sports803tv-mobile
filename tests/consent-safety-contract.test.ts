import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({ Platform: { OS: "test" } }));
vi.mock("../constants/oauth", () => ({ getApiBaseUrl: () => "" }));
vi.mock("../lib/local", () => ({
  getAnalyticsConsent: vi.fn(),
  getAnonymousAnalyticsInstallId: vi.fn().mockResolvedValue("s803-test-install"),
  getAnalyticsActivationReported: vi.fn(),
  setAnalyticsActivationReported: vi.fn(),
}));

import { trackAnalytics } from "../lib/analytics";
import { getAnalyticsConsent } from "../lib/local";

describe("consent safety contracts", () => {
  it("keeps analytics events behind the persisted consent decision", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
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
    expect(banner).toContain("onAdImpression");
    expect(banner).toContain("onAdClicked");
    expect(interstitial).toContain("AdEventType.OPENED");
    expect(interstitial).toContain("AdEventType.CLICKED");
  });
});
