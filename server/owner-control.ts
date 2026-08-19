import type { Express, Request, Response } from "express";
import { timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import {
  isOwnerControlKey,
  listOwnerControlAudit,
  listOwnerControlConfig,
  upsertOwnerControlConfig,
} from "./db";
import { sdk } from "./_core/sdk";
import { ENV } from "./_core/env";

export const MAX_CONFIG_BYTES = 20_000;
const DASHBOARD_TOKEN_HEADER = "x-owner-dashboard-token";
const DASHBOARD_TOKEN_LIFETIME = "12h";

type OwnerActor = { openId: string };

function configuredDashboardCredentials() {
  return Boolean(ENV.adminDashboardUsername && ENV.adminDashboardPassword && ENV.cookieSecret);
}

function constantTimeEqual(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export function hasValidDashboardCredentials(username: unknown, password: unknown) {
  return configuredDashboardCredentials()
    && typeof username === "string"
    && typeof password === "string"
    && constantTimeEqual(username, ENV.adminDashboardUsername)
    && constantTimeEqual(password, ENV.adminDashboardPassword);
}

async function createDashboardToken() {
  return new SignJWT({ scope: "owner-dashboard", username: ENV.adminDashboardUsername })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(DASHBOARD_TOKEN_LIFETIME)
    .sign(new TextEncoder().encode(ENV.cookieSecret));
}

async function dashboardActor(req: Request): Promise<OwnerActor | null> {
  const token = req.header(DASHBOARD_TOKEN_HEADER);
  if (!token || !configuredDashboardCredentials()) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(ENV.cookieSecret), {
      algorithms: ["HS256"],
    });
    if (payload.scope !== "owner-dashboard" || payload.username !== ENV.adminDashboardUsername) return null;
    return { openId: `dashboard:${ENV.adminDashboardUsername}` };
  } catch {
    return null;
  }
}

async function requireOwner(req: Request, res: Response) {
  const dashboard = await dashboardActor(req);
  if (dashboard) return dashboard;

  try {
    const user = await sdk.authenticateRequest(req);
    if (user.role !== "admin") {
      res.status(403).json({ error: "Owner access is required" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ error: "Owner authentication is required" });
    return null;
  }
}

export function validOwnerControlPayload(value: unknown) {
  try {
    return JSON.stringify(value).length <= MAX_CONFIG_BYTES;
  } catch {
    return false;
  }
}

/**
 * REST endpoints intentionally use cookie/Bearer auth rather than dashboard-embedded secrets.
 * GitHub Pages can call them with a signed-in owner session, while public clients only receive
 * the public configuration overlay.
 */
export function registerOwnerControlRoutes(app: Express) {
  app.post("/api/admin/dashboard-login", async (req, res) => {
    const { username, password } = req.body ?? {};
    if (!configuredDashboardCredentials()) {
      res.status(503).json({ error: "Owner dashboard credentials are not configured" });
      return;
    }
    if (!hasValidDashboardCredentials(username, password)) {
      res.status(401).json({ error: "Incorrect username or password" });
      return;
    }
    res.json({ token: await createDashboardToken(), expiresIn: DASHBOARD_TOKEN_LIFETIME });
  });

  app.get("/api/public/control-config", async (_req, res) => {
    res.json({ config: await listOwnerControlConfig("public") });
  });

  app.get("/api/admin/control-config", async (req, res) => {
    const owner = await requireOwner(req, res);
    if (!owner) return;
    res.json({ config: await listOwnerControlConfig("public") });
  });

  app.put("/api/admin/control-config/:key", async (req, res) => {
    const owner = await requireOwner(req, res);
    if (!owner) return;
    const key = req.params.key;
    if (!isOwnerControlKey(key) || !validOwnerControlPayload(req.body?.value)) {
      res.status(400).json({ error: "Unsupported configuration key or invalid value" });
      return;
    }

    await upsertOwnerControlConfig({
      key,
      value: req.body.value,
      actorOpenId: owner.openId,
    });
    res.json({ ok: true });
  });

  app.get("/api/admin/control-audit", async (req, res) => {
    const owner = await requireOwner(req, res);
    if (!owner) return;
    res.json({ audit: await listOwnerControlAudit() });
  });
}
