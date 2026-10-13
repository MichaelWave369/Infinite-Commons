/**
 * Local-only PhiSpace visitor preview of explicitly selected, offline-exported
 * artifacts from PR #5. No network, identity verification, public publication,
 * persistent storage, or actual Commons directory registration.
 */
import { MAX_MANIFEST_BYTES, validatePublicPhiSpace } from "./phispace-public.mjs";

export const LOCAL_PUBLICATION_MODE = "owner-curated-export";
const EXPECTED_KEYS = ["schema", "space_id", "visibility", "publication_mode", "profile", "sections"];

function exactKeys(raw, keys) {
  return raw !== null && typeof raw === "object" && !Array.isArray(raw) &&
    Object.keys(raw).sort().join("|") === [...keys].sort().join("|");
}

export function validateLocalExport(raw) {
  if (!exactKeys(raw, EXPECTED_KEYS) || raw.publication_mode !== LOCAL_PUBLICATION_MODE) {
    throw new TypeError("Not a supported owner-curated local export");
  }
  // Reuse strict profile, ID, section, text, field and shape validation from
  // the existing public-fixture reader. It remains locked to example-fixture.
  const checked = validatePublicPhiSpace({ ...raw, publication_mode: "example-fixture" });
  return Object.freeze({ ...checked, publication_mode: LOCAL_PUBLICATION_MODE });
}

export function parseLocalExport(jsonText) {
  if (typeof jsonText !== "string") throw new TypeError("Local export must be JSON text");
  if (new TextEncoder().encode(jsonText).byteLength > MAX_MANIFEST_BYTES) {
    throw new TypeError("Local export exceeds 16 KiB");
  }
  let raw;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new TypeError("Local export contains invalid JSON");
  }
  return validateLocalExport(raw);
}

export async function readSelectedExport(file) {
  if (!file || !Number.isSafeInteger(file.size) ||
      file.size < 1 || file.size > MAX_MANIFEST_BYTES ||
      typeof file.arrayBuffer !== "function") {
    throw new TypeError("Choose a JSON file no larger than 16 KiB");
  }
  const bytes = await file.arrayBuffer();
  if (!(bytes instanceof ArrayBuffer) || bytes.byteLength > MAX_MANIFEST_BYTES) {
    throw new TypeError("Selected file is too large or unreadable");
  }
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new TypeError("Selected file must contain valid UTF-8");
  }
  return parseLocalExport(text);
}

export function localPreviewPanel(manifest) {
  const safe = validateLocalExport(manifest);
  return {
    kind: "PHISPACE · UNVERIFIED LOCAL PREVIEW",
    title: safe.profile.display_name,
    description: safe.profile.tagline + " · " + safe.profile.welcome,
    cards: [
      ["ONLY IN THIS TAB", "Manually selected local file. Not an authenticated owner, live Porch, or published Commons listing."],
      ...safe.sections.map((section) => [section.title, section.body])
    ]
  };
}

/**
 * Version token invalidates pending async reads when a selection is withdrawn.
 * Nothing is sent, cached, persisted or registered beyond this page session.
 */
export function createLocalPreviewController(reader = readSelectedExport) {
  let current = null;
  let generation = 0;
  return Object.freeze({
    async load(file) {
      const request = ++generation;
      current = null;
      try {
        const candidate = validateLocalExport(await reader(file));
        if (request !== generation) return false;
        current = candidate;
        return true;
      } catch (error) {
        if (request !== generation) return false;
        current = null;
        throw error;
      }
    },
    withdraw() {
      generation += 1;
      current = null;
    },
    get() {
      return current;
    }
  });
}
