import { db } from "@/lib/db";
import { credits, users } from "@/db/schema";
import { and, eq, gt, sql } from "drizzle-orm";

/**
 * Get all active credit batches for a user,
 * ordered by soonest expiration.
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
 * Recalculate and persist user's totalCredits
 * based on non-expired credit batches.
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
 * Get a summary of user credits:
 * - total remaining
 * - breakdown of batches
 */
export async function getUserCreditSummary(userId: number) {
  const batches = await getUserCreditBatches(userId);
  const total = batches.reduce((sum, b) => sum + b.amount, 0);

  return {
    total,
    batches,
  };
}

/**
 * Add a new batch of credits.
 * type/source example:
 *  - "PAYG"
 *  - "SUBSCRIPTION:pro_monthly"
 *
 * daysValid: typically 30 for your system.
 */
export async function addCredits(options: {
  userId: number;
  amount: number;
  source: string;
  daysValid?: number;
}) {
  const { userId, amount, source, daysValid = 30 } = options;

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

  // Re-sync user totalCredits
  const total = await syncUserTotalCredits(userId);

  return { success: true, total };
}

/**
 * Consume N credits for a user.
 * Uses FIFO: batches that expire soonest are consumed first.
 *
 * Throws an error if not enough credits.
 */
export async function consumeCredits(userId: number, count: number) {
  if (count <= 0) {
    throw new Error("Count must be > 0");
  }

  const batches = await getUserCreditBatches(userId);
  const available = batches.reduce((sum, b) => sum + b.amount, 0);

  if (available < count) {
    throw new Error("Not enough credits");
  }

  let remainingToUse = count;

  for (const batch of batches) {
    if (remainingToUse <= 0) break;

    const useFromThisBatch = Math.min(batch.amount, remainingToUse);
    const newAmount = batch.amount - useFromThisBatch;

    await db
      .update(credits)
      .set({ amount: newAmount })
      .where(eq(credits.id, batch.id));

    remainingToUse -= useFromThisBatch;
  }

  // Re-sync user totalCredits after consumption
  const total = await syncUserTotalCredits(userId);

  return { success: true, total };
}
