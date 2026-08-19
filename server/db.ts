import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  ownerControlAudit,
  ownerControlConfig,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

export const OWNER_CONTROL_KEYS = [
  "homeLayout",
  "featuredEvents",
  "featuredChannels",
  "channelOverrides",
  "promotionBanner",
  "adPlacements",
  "supportLinks",
  "reliabilityOverrides",
  "notificationCampaign",
  "announcement",
] as const;

export type OwnerControlKey = (typeof OWNER_CONTROL_KEYS)[number];

export function isOwnerControlKey(value: string): value is OwnerControlKey {
  return (OWNER_CONTROL_KEYS as readonly string[]).includes(value);
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

function parseControlValue(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function listOwnerControlConfig(scope: "public" | "private" = "public") {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(ownerControlConfig)
    .where(eq(ownerControlConfig.scope, scope))
    .orderBy(ownerControlConfig.key);
  return rows.map((row) => ({
    key: row.key as OwnerControlKey,
    value: parseControlValue(row.value),
    updatedAt: row.updatedAt,
  }));
}

export async function upsertOwnerControlConfig(input: {
  key: OwnerControlKey;
  value: unknown;
  actorOpenId: string;
  scope?: "public" | "private";
}) {
  const db = await getDb();
  if (!db) throw new Error("Owner controls require the configured database");

  const serialized = JSON.stringify(input.value);
  await db
    .insert(ownerControlConfig)
    .values({
      key: input.key,
      value: serialized,
      scope: input.scope ?? "public",
      updatedByOpenId: input.actorOpenId,
    })
    .onDuplicateKeyUpdate({
      set: {
        value: serialized,
        scope: input.scope ?? "public",
        updatedByOpenId: input.actorOpenId,
        updatedAt: new Date(),
      },
    });

  await db.insert(ownerControlAudit).values({
    action: "upsert",
    configKey: input.key,
    actorOpenId: input.actorOpenId,
  });
}

export async function listOwnerControlAudit(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ownerControlAudit).orderBy(desc(ownerControlAudit.createdAt)).limit(limit);
}
