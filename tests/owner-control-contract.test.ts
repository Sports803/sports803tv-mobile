import { describe, expect, it } from "vitest";

import { asRecord, asStringList, featuredIds, ownerAnnouncement, ownerPromotion } from "../lib/owner-control-contract";

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
});
