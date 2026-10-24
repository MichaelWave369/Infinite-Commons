/**
 * Wayfinder v0.2: owner-documented published project doors.
 *
 * These are CURATED, public HTTPS links found in the owner's repository
 * READMEs as of 2026-10-23. The review confirms documentation only, NOT
 * uptime, current build health, user consent, live multiplayer, or a game.
 * No URL comes from a query, remote JSON, or browser storage.
 */
export const WAYFINDER_VERSION = "commons.wayfinder.reviewed-v0.2";
export const WAYFINDER_BOOKMARK_KEY = "commons.wayfinder.bookmarks.v0.2";
export const WAYFINDER_MAX_BOOKMARKS = 16;

const records = [
  {
    id: "field-atlas",
    title: "The Field Atlas",
    subtitle: "Living Library",
    kind: "Public project explorer",
    detail: "Browse an independent living book of public creative, research and engineering projects.",
    url: "https://michaelwave369.github.io/FieldAtlas/",
    evidence: "MichaelWave369/FieldAtlas README: documented public Atlas link",
    symbol: "▤",
    color: "#b6aaff"
  },
  {
    id: "field-constellation",
    title: "Field Constellation",
    subtitle: "Living Architecture",
    kind: "Public project explorer",
    detail: "Explore the public project observatory, its directory, relationships, and guided journeys.",
    url: "https://michaelwave369.github.io/FieldConstellation/",
    evidence: "MichaelWave369/FieldConstellation README: production map link",
    symbol: "✧",
    color: "#81dded"
  },
  {
    id: "nevora-codex",
    title: "The Nevora Codex",
    subtitle: "Public Orientation",
    kind: "Public draft reader, NOT the Nevora game",
    detail: "Enter Nevora's separate public Codex orientation and reading experience. This is not an interactive RPG portal.",
    url: "https://michaelwave369.github.io/nevora-codex/",
    evidence: "MichaelWave369/nevora-codex README: documented interactive orientation site",
    symbol: "◇",
    color: "#88e2ad"
  }
];

const allowed = new Map(records.map(record => [record.id, record.url]));

/** Fail closed for unexpected schemes, origins, paths, ports or redirects. */
export function reviewedDestination(id) {
  if (typeof id !== "string" || !allowed.has(id)) return null;
  const raw = allowed.get(id);
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "michaelwave369.github.io" ||
        url.username || url.password || url.port || url.search || url.hash) return null;
    if (!["/FieldAtlas/", "/FieldConstellation/", "/nevora-codex/"].includes(url.pathname)) return null;
    return raw;
  } catch {
    return null;
  }
}
export const WAYFINDER_DESTINATIONS = Object.freeze(records.map(record => {
  if (reviewedDestination(record.id) !== record.url) throw new Error("Unreviewed wayfinder destination: " + record.id);
  return Object.freeze({ ...record, verification: "OWNER-DOCUMENTED · UPTIME NOT CHECKED" });
}));

export function wayfinderById(id) {
  return WAYFINDER_DESTINATIONS.find(record => record.id === id) ?? null;
}

/** Only a literal known ID; strips guessed identifiers, full URLs, and fragments. */
export function parseWayfinderId(search) {
  if (typeof search !== "string" || search.length > 2048) return null;
  try {
    const params = new URLSearchParams(search);
    const matches = params.getAll("wayfinder");
    if (matches.length !== 1) return null;
    return wayfinderById(matches[0])?.id ?? null;
  } catch {
    return null;
  }
}

export function wayfinderSharePath(locationPath, queryString, id) {
  if (!wayfinderById(id)) return null;
  // The path is supplied by window.location.pathname, never by a remote link.
  const safePath = typeof locationPath === "string" && locationPath.startsWith("/") &&
    !locationPath.startsWith("//") && !/[?#\s\\]/.test(locationPath) ? locationPath : "/";
  const params = new URLSearchParams(typeof queryString === "string" ? queryString : "");
  params.delete("wayfinder");
  params.append("wayfinder", id);
  return safePath + "?" + params.toString() + "#portal-wayfinder";
}

export function wayfinderClearPath(locationPath, queryString) {
  const path = typeof locationPath === "string" && locationPath.startsWith("/") &&
    !locationPath.startsWith("//") && !/[?#\s\\]/.test(locationPath) ? locationPath : "/";
  const params = new URLSearchParams(typeof queryString === "string" ? queryString : "");
  params.delete("wayfinder");
  const query = params.toString();
  return path + (query ? "?" + query : "") + "#portal-wayfinder";
}

export function parseBookmarks(text) {
  if (typeof text !== "string" || text.length > 4096) return Object.freeze([]);
  try {
    const input = JSON.parse(text);
    if (!Array.isArray(input)) return Object.freeze([]);
    return Object.freeze([...new Set(input.filter(id => typeof id === "string" && wayfinderById(id)))].slice(0, WAYFINDER_MAX_BOOKMARKS));
  } catch {
    return Object.freeze([]);
  }
}
export function toggleBookmark(current, id) {
  if (!wayfinderById(id)) return Object.freeze([...current]);
  const next = current.includes(id) ? current.filter(key => key !== id) : [...current, id];
  return Object.freeze(next.slice(0, WAYFINDER_MAX_BOOKMARKS));
}
