import { describe, expect, it } from "vitest";

import { asRecord, asStringList, featuredIds, ownerAdEnabled, ownerAnnouncement, ownerChannelOverride, ownerHomeLayout, ownerNewsFeed, ownerPromotion, ownerRankedChannels } from "../lib/owner-control-contract";

describe("owner control client contract", () => {
  it("only accepts safe public value shapes for presentation controls", () => {
    expect(asStringList(["event-1", 2, "event-2"])).toEqual(["event-1", "event-2"]);
    expect(asRecord(null)).toEqual({});
    expect(featuredIds({ featuredEvents: { ids: ["event-2"] } }, "featuredEvents")).toEqual(["event-2"]);
  });

  it("renders only configured announcement and promotion payloads", () => {
    expect(ownerAnnouncement({ announcement: { title: "Stream notice", message: "A channel was moved." } })).toMatchObject({ title: "Stream notice" });
    expect(ownerPromotion({ promotionBanner: { title: "Support Sports803TV", message: "Keep streams available" } })).toMatchObject({ title: "Support Sports803TV" });
    expect(ownerPromotion({ promotionBanner: {} })).toBeNull();
  });

  it("applies channel visibility, feature ranking, reliability notices, and opt-out ad placements", () => {
    const controls = {
      featuredChannels: ["channel-b"],
      channelOverrides: {
        "channel-a": { hidden: true },
        "channel-b": { reliability: "issues", note: "Provider is restarting", priority: 2 },
        "channel-c": { priority: 1 },
      },
      adPlacements: { liveTvBanner: { enabled: false } },
    };
    expect(ownerRankedChannels([{ id: "channel-a" }, { id: "channel-c" }, { id: "channel-b" }], controls).map((channel) => channel.id)).toEqual(["channel-b", "channel-c"]);
    expect(ownerChannelOverride(controls, "channel-b")).toMatchObject({ featured: true, reliability: "issues", note: "Provider is restarting" });
    expect(ownerAdEnabled(controls, "liveTvBanner")).toBe(false);
    expect(ownerAdEnabled(controls, "homeBanner")).toBe(true);
  });

  it("normalizes bounded Home layout and safe owner editorial configuration", () => {
    const controls = {
      homeLayout: { showHero: false, heroLimit: 100, liveLimit: 0, fixtureLimit: 18 },
      newsFeed: {
        sourceUrl: "https://sports803tv.blogspot.com/feeds/posts/default?alt=json",
        maxItems: 50,
        curated: [
          { title: "Top fixture", href: "https://sports803tv.blogspot.com/p/top-fixture.html", imageUrl: "javascript:bad" },
          { title: "Blocked", href: "http://example.test" },
        ],
      },
    };
    expect(ownerHomeLayout(controls)).toMatchObject({ showHero: false, heroLimit: 6, liveLimit: 1, fixtureLimit: 18 });
    expect(ownerNewsFeed(controls)).toMatchObject({ maxItems: 20, curated: [{ title: "Top fixture", imageUrl: "" }] });
  });
});
