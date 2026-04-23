import { SavedSearch, UserSettings, DEFAULT_SETTINGS, ChatMessage, ScoredApartment, FeedbackTag, FeedbackMap, StructuredFilters } from "./types";

const KEYS = {
  searches: "apt_searches_v2",
  activeSearchId: "apt_active_search_v2",
  settings: "apt_settings_v2",
  migrated: "apt_migrated_v1_to_v2",
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function genId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Searches ──────────────────────────────────────────────────
export function getAllSearches(): SavedSearch[] {
  return safeGet<SavedSearch[]>(KEYS.searches, []);
}

export function getSearchById(id: string): SavedSearch | null {
  return getAllSearches().find((s) => s.id === id) || null;
}

export function saveAllSearches(searches: SavedSearch[]) {
  safeSet(KEYS.searches, searches);
}

export function upsertSearch(search: SavedSearch) {
  const list = getAllSearches();
  const idx = list.findIndex((s) => s.id === search.id);
  search.updatedAt = Date.now();
  if (idx >= 0) list[idx] = search;
  else list.unshift(search);
  saveAllSearches(list);
}

export function deleteSearch(id: string) {
  const list = getAllSearches().filter((s) => s.id !== id);
  saveAllSearches(list);
  if (getActiveSearchId() === id) setActiveSearchId(null);
}

export function newSearch(name: string, freeText: string, filters: StructuredFilters): SavedSearch {
  return {
    id: genId(),
    name: name.trim() || "חיפוש חדש",
    freeText: freeText.trim(),
    filters,
    results: [],
    hiddenIds: [],
    feedback: {},
    insights: "",
    chatHistory: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastSearchedAt: null,
    searchCount: 0,
    pushEnabled: false,
  };
}

// ─── Active search ─────────────────────────────────────────────
export function getActiveSearchId(): string | null {
  return safeGet<string | null>(KEYS.activeSearchId, null);
}

export function setActiveSearchId(id: string | null) {
  safeSet(KEYS.activeSearchId, id);
}

// ─── Per-search mutations (convenience) ────────────────────────
export function updateSearch(id: string, patch: Partial<SavedSearch>): SavedSearch | null {
  const s = getSearchById(id);
  if (!s) return null;
  const updated = { ...s, ...patch, updatedAt: Date.now() };
  upsertSearch(updated);
  return updated;
}

export function addChatMessage(searchId: string, msg: ChatMessage) {
  const s = getSearchById(searchId);
  if (!s) return;
  const history = [...s.chatHistory, msg].slice(-50); // cap history
  upsertSearch({ ...s, chatHistory: history });
}

export function setFeedback(searchId: string, aptId: string, tag: FeedbackTag) {
  const s = getSearchById(searchId);
  if (!s) return;
  const cur = s.feedback[aptId] || [];
  const next: FeedbackMap = {
    ...s.feedback,
    [aptId]: cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag],
  };
  upsertSearch({ ...s, feedback: next });
}

export function hideApartment(searchId: string, aptId: string) {
  const s = getSearchById(searchId);
  if (!s) return;
  if (s.hiddenIds.includes(aptId)) return;
  upsertSearch({ ...s, hiddenIds: [...s.hiddenIds, aptId] });
}

export function hideMany(searchId: string, aptIds: string[]) {
  const s = getSearchById(searchId);
  if (!s) return;
  const set = new Set([...s.hiddenIds, ...aptIds]);
  upsertSearch({ ...s, hiddenIds: Array.from(set) });
}

export function unhideAll(searchId: string) {
  updateSearch(searchId, { hiddenIds: [] });
}

export function mergeResults(searchId: string, fresh: ScoredApartment[]): { newOnes: ScoredApartment[]; merged: ScoredApartment[] } {
  const s = getSearchById(searchId);
  if (!s) return { newOnes: [], merged: fresh };
  const existingIds = new Set(s.results.map((a) => a.id));
  const newOnes = fresh.filter((a) => !existingIds.has(a.id));
  const merged = [...newOnes, ...s.results].slice(0, 80);
  upsertSearch({
    ...s,
    results: merged,
    lastSearchedAt: Date.now(),
    searchCount: s.searchCount + 1,
  });
  return { newOnes, merged };
}

// ─── Settings ──────────────────────────────────────────────────
export function getSettings(): UserSettings {
  return safeGet<UserSettings>(KEYS.settings, DEFAULT_SETTINGS);
}

export function saveSettings(settings: UserSettings) {
  safeSet(KEYS.settings, settings);
}

// ─── v1 → v2 migration ─────────────────────────────────────────
export function migrateV1IfNeeded(): SavedSearch | null {
  if (typeof window === "undefined") return null;
  const alreadyMigrated = safeGet<boolean>(KEYS.migrated, false);
  if (alreadyMigrated) return null;
  const existing = getAllSearches();
  if (existing.length > 0) {
    safeSet(KEYS.migrated, true);
    return null;
  }

  // Read v1 keys
  const q = safeGet<string>("apt_query", "");
  if (!q) {
    safeSet(KEYS.migrated, true);
    return null;
  }
  const feedback = safeGet<FeedbackMap>("apt_feedback", {});
  const results = safeGet<ScoredApartment[]>("apt_results", []);
  const insights = safeGet<string>("apt_insights", "");

  const migrated: SavedSearch = {
    id: genId(),
    name: q.slice(0, 50),
    freeText: q,
    filters: {},
    results,
    hiddenIds: [],
    feedback,
    insights,
    chatHistory: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastSearchedAt: null,
    searchCount: 0,
    pushEnabled: false,
  };
  upsertSearch(migrated);
  safeSet(KEYS.migrated, true);
  return migrated;
}
