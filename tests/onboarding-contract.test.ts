import { describe, expect, it } from "vitest";

import { ONBOARDING_AUTO_SKIP_MS, onboardingSkipLabel } from "../lib/onboarding-contract";

describe("optional onboarding contract", () => {
  it("keeps the automatic continuation short and communicates the remaining time", () => {
    expect(ONBOARDING_AUTO_SKIP_MS).toBeLessThanOrEqual(5_000);
    expect(onboardingSkipLabel(3)).toBe("Continue without onboarding (3)");
    expect(onboardingSkipLabel(0)).toBe("Continue without onboarding");
  });
});
