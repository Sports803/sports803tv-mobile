import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("Expo Go native-module safeguards", () => {
  it("skips AdMob custom native modules in the Expo Go store client and preserves them for builds", () => {
    const bannerSource = readFileSync(resolve(projectRoot, "components/ad-slot.native.tsx"), "utf8");
    const interstitialSource = readFileSync(resolve(projectRoot, "lib/interstitial.native.ts"), "utf8");

    for (const source of [bannerSource, interstitialSource]) {
      expect(source).toContain('Constants.executionEnvironment === "storeClient"');
      expect(source).toContain('require("react-native-google-mobile-ads")');
      expect(source).not.toMatch(/import\s+\{[^}]*\}\s+from\s+"react-native-google-mobile-ads"/);
    }
  });
});
