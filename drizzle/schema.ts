import { index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Remote configuration that controls safe, public-facing Sports803TV presentation.
 * Values are JSON strings so the dashboard can evolve controls without schema churn.
 * Private credentials are deliberately excluded from this model.
 */
export const ownerControlConfig = mysqlTable("ownerControlConfig", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull(),
  scope: mysqlEnum("scope", ["public", "private"]).default("public").notNull(),
  updatedByOpenId: varchar("updatedByOpenId", { length: 64 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Minimal audit trail for privileged configuration changes; it never stores secret values. */
export const ownerControlAudit = mysqlTable("ownerControlAudit", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 64 }).notNull(),
  configKey: varchar("configKey", { length: 80 }).notNull(),
  actorOpenId: varchar("actorOpenId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Consented product telemetry. The database stores a server-side hash of an
 * anonymous installation token, never an account identifier, email, IP address,
 * precise location, stream URL, or free-form user input.
 */
export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  anonymousInstallHash: varchar("anonymousInstallHash", { length: 64 }).notNull(),
  eventName: varchar("eventName", { length: 48 }).notNull(),
  dateKey: varchar("dateKey", { length: 10 }).notNull(),
  surface: varchar("surface", { length: 48 }),
  contentId: varchar("contentId", { length: 160 }),
  countryCode: varchar("countryCode", { length: 2 }),
  platform: varchar("platform", { length: 16 }),
  properties: text("properties"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("analytics_date_idx").on(table.dateKey),
  index("analytics_event_idx").on(table.eventName),
  index("analytics_country_idx").on(table.countryCode),
]);

export type OwnerControlConfig = typeof ownerControlConfig.$inferSelect;
export type InsertOwnerControlConfig = typeof ownerControlConfig.$inferInsert;
