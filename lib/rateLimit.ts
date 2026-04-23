import { redis } from "./redis";

// Brave free tier: 2,000 searches / month
const MONTHLY_BUDGET = 2000;
// Leave headroom for user-initiated searches (manual "🔍" clicks)
const CRON_BUDGET_RATIO = 0.8;

function currentMonthKey(): string {
  const d = new Date();
  return `brave_usage:${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Increment the usage counter for the current month.
 * Safe to call after each Brave call.
 */
export async function recordBraveCalls(n: number): Promise<number> {
  try {
    const key = currentMonthKey();
    const count = await redis.incrby(key, n);
    // 40-day expiry — safely covers month rollover
    await redis.expire(key, 60 * 60 * 24 * 40);
    return count as number;
  } catch (err) {
    console.error("recordBraveCalls failed:", err);
    return 0;
  }
}

export async function getBraveUsage(): Promise<{ used: number; remaining: number; monthKey: string }> {
  const key = currentMonthKey();
  try {
    const used = ((await redis.get(key)) as number) || 0;
    return { used, remaining: Math.max(0, MONTHLY_BUDGET - used), monthKey: key };
  } catch {
    return { used: 0, remaining: MONTHLY_BUDGET, monthKey: key };
  }
}

/**
 * Can the cron afford a batch of `n` calls this month?
 * Cron is capped at 80% of the monthly budget to leave room for manual searches.
 */
export async function cronCanAfford(n: number): Promise<boolean> {
  const { used } = await getBraveUsage();
  const cronCap = MONTHLY_BUDGET * CRON_BUDGET_RATIO;
  return used + n <= cronCap;
}
