// Brave Search API - 2000 free queries/month
// Sign up at: https://brave.com/search/api/

import { recordBraveCalls } from "./rateLimit";

interface BraveResult {
  title: string;
  url: string;
  description: string;
  age?: string;
}

export async function braveSearch(query: string, count = 10): Promise<BraveResult[]> {
  const key = process.env.BRAVE_API_KEY;
  if (!key) throw new Error("BRAVE_API_KEY not set");

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(count));
  url.searchParams.set("country", "ALL");

  const res = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X-Subscription-Token": key,
    },
  });

  // Track usage regardless of success (failed call still counts against quota in some cases)
  recordBraveCalls(1).catch(() => {});

  if (!res.ok) {
    const err = await res.text();
    console.error(`Brave error ${res.status}: ${err}`);
    return [];
  }

  const data = await res.json();
  const results = data?.web?.results || [];
  return results.map((r: any) => ({
    title: r.title || "",
    url: r.url || "",
    description: r.description || "",
    age: r.age,
  }));
}

// Search multiple sites in parallel
export async function braveSearchMulti(queries: string[]): Promise<BraveResult[]> {
  const results = await Promise.allSettled(queries.map((q) => braveSearch(q, 10)));
  const all: BraveResult[] = [];
  results.forEach((r) => {
    if (r.status === "fulfilled") all.push(...r.value);
  });
  // Dedupe by URL
  const seen = new Set<string>();
  return all.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}
