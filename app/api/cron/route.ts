import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { redis } from "@/lib/redis";
import { parseQuery } from "@/lib/queryParser";
import { searchAndExtract } from "@/lib/searchExtract";
import { scoreApartments } from "@/lib/scorer";
import { cronCanAfford, getBraveUsage } from "@/lib/rateLimit";

export const maxDuration = 60;

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || "noreply@example.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Number of Brave queries per user-search (yad2/homeless/madlan/komo/facebook = 5)
const QUERIES_PER_SEARCH = 5;

export async function GET(req: NextRequest) {
  // Vercel Cron calls this with special headers; also support manual Bearer auth
  const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron");
  const auth = req.headers.get("authorization");
  const authorized = isVercelCron || auth === `Bearer ${process.env.CRON_SECRET}`;
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subKeys = (await redis.smembers("all_subs")) as string[];
    const usageBefore = await getBraveUsage();
    let notificationsSent = 0;
    let searchesRun = 0;
    let skippedDueToQuota = 0;

    for (const key of subKeys) {
      // Check if we can afford another search
      if (!(await cronCanAfford(QUERIES_PER_SEARCH))) {
        skippedDueToQuota++;
        continue;
      }

      const raw = await redis.get(key);
      if (!raw) continue;
      const record = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (!record?.subscription || !record?.userQuery) continue;

      const seenKey = `seen:${key}`;
      const seenIds = ((await redis.smembers(seenKey)) as string[]) || [];

      try {
        const parsed = await parseQuery(record.userQuery);
        const { apartments } = await searchAndExtract(parsed);
        searchesRun++;
        const { scored } = await scoreApartments(apartments, parsed, "", "");

        const newApts = scored.filter((a) => !seenIds.includes(a.id) && a.match_score >= 60);

        if (newApts.length > 0) {
          const best = newApts.sort((a, b) => b.match_score - a.match_score)[0];
          const payload = JSON.stringify({
            title: `🏠 ${newApts.length} דירות חדשות!`,
            body: `${best.title} · ${best.price ? best.price.toLocaleString("he-IL") + " ₪" : ""} · ${best.neighborhood || best.city || ""}`,
            url: best.url || "/",
            tag: "apt-alert",
          });

          try {
            await webpush.sendNotification(record.subscription, payload);
            notificationsSent++;
            const newIds = newApts.map((a) => a.id);
            if (newIds.length > 0) await redis.sadd(seenKey, newIds[0], ...newIds.slice(1));
            await redis.expire(seenKey, 60 * 60 * 24 * 14);
          } catch (err: any) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              await redis.del(key);
              await redis.srem("all_subs", key);
            }
          }
        }
      } catch (userErr: any) {
        console.error(`User ${key} error:`, userErr.message);
      }
    }

    const usageAfter = await getBraveUsage();
    return NextResponse.json({
      checked: subKeys.length,
      searchesRun,
      sent: notificationsSent,
      skippedDueToQuota,
      braveUsageBefore: usageBefore.used,
      braveUsageAfter: usageAfter.used,
      braveRemaining: usageAfter.remaining,
    });
  } catch (err: any) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
