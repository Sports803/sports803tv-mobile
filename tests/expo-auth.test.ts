import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";

describe("new Expo account authentication", () => {
  it("accepts the securely supplied EXPO_TOKEN without disclosing it", () => {
    const token = process.env.EXPO_TOKEN;

    expect(token).toBeTruthy();

    const identity = execFileSync("pnpm", ["exec", "expo", "whoami", "--non-interactive"], {
      cwd: process.cwd(),
      env: process.env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    expect(identity.trim()).not.toBe("");
  });
});
