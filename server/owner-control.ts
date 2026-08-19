import type { Express, Request, Response } from "express";
import {
  isOwnerControlKey,
  listOwnerControlAudit,
  listOwnerControlConfig,
  upsertOwnerControlConfig,
} from "./db";
import { sdk } from "./_core/sdk";

export const MAX_CONFIG_BYTES = 20_000;

async function requireOwner(req: Request, res: Response) {
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
