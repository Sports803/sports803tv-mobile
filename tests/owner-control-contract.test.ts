import { describe, expect, it } from "vitest";

import { asRecord, asStringList, featuredIds, ownerAdEnabled, ownerAnnouncement, ownerChannelOverride, ownerPromotion, ownerRankedChannels } from "../lib/owner-control-contract";

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
});
