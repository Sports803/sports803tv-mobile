import { describe, expect, it } from "vitest";
import { inviteShareMessage } from "../lib/share-contract";

describe("engagement contracts", () => {
  it("uses a clear share-safe invitation message without a fabricated referral claim", () => {
    expect(inviteShareMessage()).toContain("Sports803TV");
    expect(inviteShareMessage().toLowerCase()).not.toContain("reward");
  });
});
