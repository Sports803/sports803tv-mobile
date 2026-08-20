import { desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analyticsEvents,
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
  "newsFeed",
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

const ALLOWED_ANALYTICS_EVENTS = new Set([
  "app_activate", "app_open", "screen_view", "tab_view", "search", "category_filter",
  "event_open", "player_open", "stream_start", "stream_error", "source_switch",
  "favorite_toggle", "share_event", "match_center_open", "support_tap", "ad_impression",
  "ad_tap", "prediction_set", "reminder_set", "app_invite_share", "notification_open",
]);

function limitedText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) || null : null;
}

export type AnalyticsIngestInput = {
  anonymousInstallHash: string;
  eventName: string;
  surface?: string;
  contentId?: string;
  countryCode?: string;
  platform?: string;
  properties?: Record<string, string | number | boolean>;
};

export async function recordAnalyticsEvent(input: AnalyticsIngestInput) {
  if (!ALLOWED_ANALYTICS_EVENTS.has(input.eventName)) throw new Error("Unsupported analytics event");
  const db = await getDb();
  if (!db) throw new Error("Analytics storage is unavailable");
  const countryCode = limitedText(input.countryCode, 2)?.toUpperCase();
  const properties = input.properties && Object.keys(input.properties).length
    ? JSON.stringify(Object.fromEntries(Object.entries(input.properties).slice(0, 12).map(([key, value]) => [key.slice(0, 40), typeof value === "string" ? value.slice(0, 120) : value])))
    : null;
  await db.insert(analyticsEvents).values({
    anonymousInstallHash: input.anonymousInstallHash,
    eventName: input.eventName,
    dateKey: new Date().toISOString().slice(0, 10),
    surface: limitedText(input.surface, 48),
    contentId: limitedText(input.contentId, 160),
    countryCode: countryCode && /^[A-Z]{2}$/.test(countryCode) ? countryCode : null,
    platform: limitedText(input.platform, 16),
    properties,
  });
}

function rankedCounts(values: Array<string | null>, limit = 12) {
  const counts = new Map<string, number>();
  values.filter((value): value is string => Boolean(value)).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return Array.from(counts, ([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)).slice(0, limit);
}

/** Owner-only aggregate report. It deliberately contains no raw analytics rows or installation hashes. */
export async function getAnalyticsSummary(days = 30) {
  const db = await getDb();
  if (!db) throw new Error("Analytics storage is unavailable");
  const safeDays = Math.max(1, Math.min(Math.floor(days), 90));
  const since = new Date(Date.now() - (safeDays - 1) * 86_400_000).toISOString().slice(0, 10);
  const rows = await db.select().from(analyticsEvents).where(gte(analyticsEvents.dateKey, since)).orderBy(desc(analyticsEvents.createdAt)).limit(20_000);
  const daily = new Map<string, { date: string; events: number; activeDevices: Set<string>; streamStarts: number; playerOpens: number; searches: number }>();
  rows.forEach((row) => {
    const value = daily.get(row.dateKey) ?? { date: row.dateKey, events: 0, activeDevices: new Set<string>(), streamStarts: 0, playerOpens: 0, searches: 0 };
    value.events += 1; value.activeDevices.add(row.anonymousInstallHash);
    if (row.eventName === "stream_start") value.streamStarts += 1;
    if (row.eventName === "player_open") value.playerOpens += 1;
    if (row.eventName === "search") value.searches += 1;
    daily.set(row.dateKey, value);
  });
  return {
    days: safeDays,
    totalEvents: rows.length,
    activeDevices: new Set(rows.map((row) => row.anonymousInstallHash)).size,
    activations: rows.filter((row) => row.eventName === "app_activate").length,
    streamStarts: rows.filter((row) => row.eventName === "stream_start").length,
    playerOpens: rows.filter((row) => row.eventName === "player_open").length,
    daily: Array.from(daily.values()).map(({ activeDevices, ...row }) => ({ ...row, activeDevices: activeDevices.size })).sort((a, b) => a.date.localeCompare(b.date)),
    byEvent: rankedCounts(rows.map((row) => row.eventName)),
    byCountry: rankedCounts(rows.map((row) => row.countryCode)),
    bySurface: rankedCounts(rows.map((row) => row.surface)),
    topContent: rankedCounts(rows.map((row) => row.contentId)),
  };
}
