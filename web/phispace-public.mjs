/**
 * PhiSpace public-publishing read boundary, v0.1.
 *
 * This is deliberately NOT a Porch networking client, an authorization engine,
 * or a file-system adapter. It accepts only a tightly allowlisted public JSON
 * manifest and obtains the example from a fixed same-origin fixture path.
 */
export const PUBLIC_SCHEMA = "commons.phispace.public.v0.1";
export const EXAMPLE_SPACE_ID = "phispace.example";
export const FIXTURE_PATH = "./fixtures/phispace-public.json";
export const MAX_MANIFEST_BYTES = 16384;

const SECTION_KINDS = new Set(["about", "music", "gallery", "projects", "guestbook"]);
const ID_PATTERN = /^phispace\.[a-z0-9][a-z0-9-]{0,63}$/;
const SECTION_ID_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u;

function reject(reason) {
  throw new TypeError("Invalid public PhiSpace manifest: " + reason);
}

function exactKeys(value, names) {
  return value !== null && typeof value === "object" &&
    !Array.isArray(value) && Object.keys(value).sort().join("|") === [...names].sort().join("|");
}

function approvedText(value, maxLength) {
  return typeof value === "string" && value.trim().length > 0 &&
    value.length <= maxLength && !CONTROL_CHARACTERS.test(value);
}

/**
 * Checks the shape only. Manifest fields and a public visibility flag are
 * publisher claims, NOT evidence of owner consent, signatures or authorization.
 */
export function validatePublicPhiSpace(raw) {
  if (!exactKeys(raw, ["schema", "space_id", "visibility", "publication_mode", "profile", "sections"])) {
    reject("unexpected or missing top-level fields");
  }
  if (raw.schema !== PUBLIC_SCHEMA) reject("unsupported schema");
  if (typeof raw.space_id !== "string" || !ID_PATTERN.test(raw.space_id)) reject("unsafe space ID");
  if (raw.visibility !== "public") reject("only explicit public publications are renderable");
  if (raw.publication_mode !== "example-fixture") {
    reject("v0.1 accepts reviewed example fixtures only; live publication is not enabled");
  }
  if (!exactKeys(raw.profile, ["display_name", "tagline", "welcome"])) {
    reject("profile has unexpected or missing fields");
  }
  if (!approvedText(raw.profile.display_name, 72) ||
      !approvedText(raw.profile.tagline, 140) ||
      !approvedText(raw.profile.welcome, 500)) {
    reject("profile text is empty, oversized, or contains control characters");
  }
  if (!Array.isArray(raw.sections) || raw.sections.length < 1 || raw.sections.length > 6) {
    reject("sections must contain between one and six entries");
  }

  const found = new Set();
  for (const section of raw.sections) {
    if (!exactKeys(section, ["id", "kind", "title", "body"])) {
      reject("section has unexpected or missing fields");
    }
    if (typeof section.id !== "string" || !SECTION_ID_PATTERN.test(section.id) ||
        found.has(section.id)) reject("invalid or duplicate section ID");
    found.add(section.id);
    if (!SECTION_KINDS.has(section.kind)) reject("unsupported section type");
    if (!approvedText(section.title, 72) || !approvedText(section.body, 500)) {
      reject("section text is invalid");
    }
  }

  // Return a detached, immutable view; never hand a caller the source object.
  return Object.freeze({
    schema: raw.schema,
    space_id: raw.space_id,
    visibility: raw.visibility,
    publication_mode: raw.publication_mode,
    profile: Object.freeze({
      display_name: raw.profile.display_name,
      tagline: raw.profile.tagline,
      welcome: raw.profile.welcome
    }),
    sections: Object.freeze(raw.sections.map((section) => Object.freeze({
      id: section.id, kind: section.kind, title: section.title, body: section.body
    })))
  });
}

export function parsePublicPhiSpace(content) {
  if (typeof content !== "string") reject("content must be JSON text");
  if (new TextEncoder().encode(content).byteLength > MAX_MANIFEST_BYTES) {
    reject("manifest exceeds the 16 KiB limit");
  }
  let raw;
  try {
    raw = JSON.parse(content);
  } catch {
    reject("malformed JSON");
  }
  return validatePublicPhiSpace(raw);
}

/**
 * The only v0.1 reader: same-origin, fixed path, no cookies, no redirects.
 * Do NOT add an arbitrary URL or host selected from an untrusted manifest.
 */
export async function loadExamplePhiSpace(fetcher = globalThis.fetch) {
  if (typeof fetcher !== "function") throw new TypeError("No browser fetch available");
  const response = await fetcher(FIXTURE_PATH, {
    credentials: "omit", redirect: "error", mode: "same-origin", cache: "no-store"
  });
  if (!response || !response.ok || typeof response.text !== "function") {
    throw new Error("Public PhiSpace fixture is unavailable");
  }
  const manifest = parsePublicPhiSpace(await response.text());
  if (manifest.space_id !== EXAMPLE_SPACE_ID) {
    reject("fixture is not mapped to the expected example doorway");
  }
  return manifest;
}

export function phiSpacePanel(manifest) {
  const safe = validatePublicPhiSpace(manifest);
  if (safe.space_id !== EXAMPLE_SPACE_ID || safe.publication_mode !== "example-fixture") {
    reject("unrecognized public destination");
  }
  return {
    kind: "PHISPACE · PUBLIC-FIXTURE DEMO",
    title: safe.profile.display_name,
    description: safe.profile.tagline + " · " + safe.profile.welcome,
    cards: [
      ["LOCAL SAMPLE PUBLICATION", "Fictional, curated JSON displayed as plain text. Not a real person's Porch or live account."],
      ...safe.sections.map((section) => [section.title, section.body])
    ]
  };
}
