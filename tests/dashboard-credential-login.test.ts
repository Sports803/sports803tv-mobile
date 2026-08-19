import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";

const listOwnerControlConfig = vi.fn(async () => []);

vi.mock("../server/db", () => ({
  isOwnerControlKey: () => true,
  listOwnerControlAudit: vi.fn(async () => []),
  listOwnerControlConfig,
  upsertOwnerControlConfig: vi.fn(),
}));

vi.mock("../server/_core/sdk", () => ({ sdk: { authenticateRequest: vi.fn() } }));

const { registerOwnerControlRoutes } = await import("../server/owner-control");

let server: ReturnType<ReturnType<typeof express>["listen"]> | undefined;

afterEach(async () => {
  if (server) await new Promise<void>((resolve) => server?.close(() => resolve()));
  server = undefined;
});

describe("owner dashboard credential login", () => {
  it("accepts the configured secret credentials and uses the issued token for protected reads", async () => {
    const username = process.env.ADMIN_DASHBOARD_USERNAME;
    const password = process.env.ADMIN_DASHBOARD_PASSWORD;
    expect(username).toBeTruthy();
    expect(password).toBeTruthy();

    const app = express();
    app.use(express.json());
    registerOwnerControlRoutes(app);
    server = app.listen(0);
    await new Promise<void>((resolve) => server?.once("listening", () => resolve()));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind a TCP port");
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const login = await fetch(`${baseUrl}/api/admin/dashboard-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    expect(login.status).toBe(200);
    const { token } = await login.json() as { token: string };
    expect(typeof token).toBe("string");

    const protectedRead = await fetch(`${baseUrl}/api/admin/control-config`, {
      headers: { "X-Owner-Dashboard-Token": token },
    });
    expect(protectedRead.status).toBe(200);
    expect(listOwnerControlConfig).toHaveBeenLastCalledWith("public");
  });
});
