import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("fullscreen player contract", () => {
  it("keeps explicit full-screen modal controls on both player routes", () => {
    const eventPlayer = readFileSync("app/player.tsx", "utf8");
    const channelPlayer = readFileSync("app/channel-player.tsx", "utf8");
    for (const source of [eventPlayer, channelPlayer]) {
      expect(source).toContain("supportedOrientations");
      expect(source).toContain("Full screen");
      expect(source).toContain("IframePlayer");
    }
  });
});
