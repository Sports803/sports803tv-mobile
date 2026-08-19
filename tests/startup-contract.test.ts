import { describe, expect, it } from "vitest";

import { startupRouteFor } from "../lib/startup-contract";

describe("startupRouteFor", () => {
  it("shows onboarding when no completed preference is available", () => {
    expect(startupRouteFor(false)).toBe("/onboarding");
  });

  it("continues into the app once onboarding is complete", () => {
    expect(startupRouteFor(true)).toBeNull();
  });
});
