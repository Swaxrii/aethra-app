import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  real,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    check("users_status_check", sql`${table.status} in ('active', 'disabled')`),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("sessions_token_unique").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
    index("sessions_expires_idx").on(table.expiresAt),
  ],
);

export const preferences = pgTable(
  "preferences",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    model: varchar("model", { length: 30 }).notNull().default("Aethra 1.0"),
    temperature: real("temperature").notNull().default(0.7),
    responseLength: varchar("response_length", { length: 20 }).notNull().default("Balanced"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("preferences_model_check", sql`${table.model} in ('Aethra 1.0', 'Aethra 1.1')`),
    check("preferences_temperature_check", sql`${table.temperature} between 0 and 2`),
    check(
      "preferences_response_length_check",
      sql`${table.responseLength} in ('Short', 'Balanced', 'Detailed')`,
    ),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 300 }).notNull(),
    legacyId: varchar("legacy_id", { length: 120 }),
    model: varchar("model", { length: 30 }).notNull().default("Aethra 1.0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("conversations_user_updated_idx").on(table.userId, table.updatedAt),
    uniqueIndex("conversations_user_legacy_unique").on(table.userId, table.legacyId),
    check("conversations_title_check", sql`char_length(btrim(${table.title})) between 1 and 300`),
    check("conversations_model_check", sql`${table.model} in ('Aethra 1.0', 'Aethra 1.1')`),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 10 }).notNull(),
    position: integer("position").notNull().default(0),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("messages_conversation_position_unique").on(table.conversationId, table.position),
    check("messages_role_check", sql`${table.role} in ('user', 'ai')`),
    check("messages_content_check", sql`char_length(${table.content}) between 1 and 10000`),
  ],
);

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: varchar("key", { length: 128 }).primaryKey(),
    hits: integer("hits").notNull().default(0),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (table) => [index("rate_limits_reset_idx").on(table.resetAt)],
);
