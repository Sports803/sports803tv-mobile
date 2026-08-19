import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";

const listOwnerControlConfig = vi.fn(async () => [{ key: "announcement", value: { message: "Welcome" } }]);

vi.mock("../server/db", () => ({
  isOwnerControlKey: (value: string) => ["announcement", "homeLayout"].includes(value),
  listOwnerControlAudit: vi.fn(),
  listOwnerControlConfig,
  upsertOwnerControlConfig: vi.fn(),
}));

vi.mock("../server/_core/sdk", () => ({ sdk: { authenticateRequest: vi.fn() } }));

const { MAX_CONFIG_BYTES, registerOwnerControlRoutes, validOwnerControlPayload } = await import("../server/owner-control");
const { isOwnerControlKey } = await import("../server/db");

let server: ReturnType<ReturnType<typeof express>["listen"]> | undefined;

afterEach(async () => {
  if (server) await new Promise<void>((resolve) => server?.close(() => resolve()));
  server = undefined;
  listOwnerControlConfig.mockClear();
});

describe("owner-control API safeguards", () => {
  it("accepts only registered owner control keys and enforces the JSON payload limit", () => {
    expect(isOwnerControlKey("announcement")).toBe(true);
    expect(isOwnerControlKey("unrecognized-control")).toBe(false);
    expect(validOwnerControlPayload({ text: "safe" })).toBe(true);
    expect(validOwnerControlPayload({ text: "x".repeat(MAX_CONFIG_BYTES) })).toBe(false);
  });

  it("exposes the public configuration endpoint without authentication", async () => {
    const app = express();
    registerOwnerControlRoutes(app);
    server = app.listen(0);
    await new Promise<void>((resolve) => server?.once("listening", () => resolve()));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind a TCP port");

    const response = await fetch(`http://127.0.0.1:${address.port}/api/public/control-config`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ config: [{ key: "announcement", value: { message: "Welcome" } }] });
    expect(listOwnerControlConfig).toHaveBeenCalledWith("public");
  });
});
