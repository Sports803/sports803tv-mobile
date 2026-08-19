import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

export type OwnerControlConfig = typeof ownerControlConfig.$inferSelect;
export type InsertOwnerControlConfig = typeof ownerControlConfig.$inferInsert;
