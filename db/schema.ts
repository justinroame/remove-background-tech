// db/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"), // null for Google users
  stripeCustomerId: text("stripe_customer_id"),
  totalCredits: integer("total_credits").default(3).notNull(),
  pro: boolean("pro").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  source: text("source").notNull(), // "signup", "stripe", "promo"
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// -------------------------
// NEW: PASSWORD RESET TOKENS
// -------------------------
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
