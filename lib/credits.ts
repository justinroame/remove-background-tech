// lib/credits.ts
import { db } from "@/lib/db";
import { credits, users } from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

/**
 * Get active (non-expired, >0) credit batches for a user,
 * sorted by soonest expiration first (FIFO consumption).
 */
export async function getUserCreditBatches(userId: number) {
  const now = new Date();

  const rows = await db
    .select()
    .from(credits)
    .where(
      and(
        eq(credits.userId, userId),
        gt(credits.amount, 0),
        gt(credits.expiresAt, now)
      )
    )
    .orderBy(credits.expiresAt);

  return rows;
}

/**
 * Sync users.totalCredits = sum of non-expired credits (>= 0).
 * This is the single source of truth for the UI credit pill.
 */
export async function syncUserTotalCredits(userId: number) {
  const now = new Date();

  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${credits.amount}), 0)`,
    })
    .from(credits)
    .where(and(eq(credits.userId, userId), gt(credits.expiresAt, now)));

  const total = row?.total ?? 0;

  await db
    .update(users)
    .set({ totalCredits: total })
    .where(eq(users.id, userId));

  return total;
}

/**
 * Summary for UI: total + individual active batches.
 */
export async function getUserCreditSummary(userId: number) {
  const batches = await getUserCreditBatches(userId);
  const total = batches.reduce((sum, b) => sum + b.amount, 0);

  return { total, batches };
}

/**
 * Add a new batch of credits.
 * source example: "PAYG", "SUBSCRIPTION:pro_monthly"
 */
export async function addCredits(options: {
  userId: number;
  amount: number;
  source: string;
  daysValid?: number;
}) {
  const { userId, amount, source, daysValid = 30 } = options;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Credit amount must be a positive number");
  }

  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + daysValid * 24 * 60 * 60 * 1000
  );

  await db.insert(credits).values({
    userId,
    amount,
    source,
    expiresAt,
  });

  const total = await syncUserTotalCredits(userId);

  return { success: true, total };
}

/**
 * Consume N credits FIFO by soonest expiration.
 * Entire operation is wrapped in a single DB transaction
 * to avoid race conditions when multiple requests hit at once.
 */
export async function consumeCredits(userId: number, count: number) {
  if (!Number.isFinite(count) || count <= 0) {
    throw new Error("Count must be > 0");
  }

  return db.transaction(async (tx) => {
    const now = new Date();

    // 1. Load active batches in this transaction
    const batches = await tx
      .select()
      .from(credits)
      .where(
        and(
          eq(credits.userId, userId),
          gt(credits.amount, 0),
          gt(credits.expiresAt, now)
        )
      )
      .orderBy(credits.expiresAt);

    const available = batches.reduce((sum, b) => sum + b.amount, 0);

    if (available < count) {
      throw new Error("Not enough credits");
    }

    // 2. Walk batches and deduct credits FIFO
    let remainingToUse = count;

    for (const batch of batches) {
      if (remainingToUse <= 0) break;

      const useFromThisBatch = Math.min(batch.amount, remainingToUse);
      const newAmount = batch.amount - useFromThisBatch;

      await tx
        .update(credits)
        .set({ amount: newAmount })
        .where(eq(credits.id, batch.id));

      remainingToUse -= useFromThisBatch;
    }

    // 3. Recompute total within the same transaction
    const [row] = await tx
      .select({
        total: sql<number>`COALESCE(SUM(${credits.amount}), 0)`,
      })
      .from(credits)
      .where(and(eq(credits.userId, userId), gt(credits.expiresAt, now)));

    const total = row?.total ?? 0;

    await tx
      .update(users)
      .set({ totalCredits: total })
      .where(eq(users.id, userId));

    return { success: true, total };
  });
}
