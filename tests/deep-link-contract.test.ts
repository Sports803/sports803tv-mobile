import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

describe("Sports803TV deep-link compatibility", () => {
  it("retains the authenticated callback route and the event player query contract", () => {
    const appConfig = readFileSync(resolve(projectRoot, "app.config.ts"), "utf8");
    const playerScreen = readFileSync(resolve(projectRoot, "app/player.tsx"), "utf8");
    const notificationHelpers = readFileSync(resolve(projectRoot, "lib/notifications.ts"), "utf8");

    expect(existsSync(resolve(projectRoot, "app/oauth/callback.tsx"))).toBe(true);
    expect(appConfig).toContain("scheme: env.scheme");
    expect(appConfig).toContain('projectId: "4b81361d-7506-414c-9678-f0384fe2d69d"');
    expect(playerScreen).toContain("useLocalSearchParams<{ eventId: string }>()");
    expect(notificationHelpers).toContain("/player?eventId=");
  });
});
