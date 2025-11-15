import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"), // hashed password (null for Google users)
  stripeCustomerId: text("stripe_customer_id"),
  totalCredits: integer("total_credits").default(0), // sum of non-expired credits
  pro: boolean("pro").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const credits = pgTable("credits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),           // remaining credits in this batch
  source: text("source").notNull(),             // e.g. "PAYG", "SUBSCRIPTION:pro_monthly"
  expiresAt: timestamp("expires_at").notNull(), // when this batch expires
  createdAt: timestamp("created_at").defaultNow(),
});
