import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id"),
  totalCredits: integer("total_credits").default(0),
  pro: boolean("pro").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  source: text("source").notNull(), // "payg" or "subscription"
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
