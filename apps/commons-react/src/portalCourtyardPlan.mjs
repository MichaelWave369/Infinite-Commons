/**
 * The Portal Courtyard is a bounded, deterministic decorative map.
 * Four portals are visual projections of the existing original story registry,
 * never new world nodes, remote websites, privileges or identity endpoints.
 */
import { PORTALS } from "./commonsPortalRegistry.mjs";

export const PORTAL_COURTYARD_VERSION = "commons.portal-courtyard.visual-v0.3";
export const PORTAL_COURTYARD_LIMIT = 4;
const X_POSITIONS = Object.freeze([-12.2, -4.1, 4.1, 12.2]);
const BASE_Z = -22;
const CENTER_Z = -14.0;

/** Published scene geometry must be independently testable without WebGL. */
export function portalCourtyardPlan() {
  if (PORTALS.length !== PORTAL_COURTYARD_LIMIT) throw new RangeError("The reviewed courtyard requires exactly four original story portals.");
  const gates = PORTALS.map((portal, index) => Object.freeze({
    id: portal.id,
    name: portal.name,
    color: portal.color,
    symbol: portal.symbol,
    x: X_POSITIONS[index],
    y: 0,
    z: BASE_Z,
    width: 3.8,
    height: 4.6,
    story_only: true
  }));
  return Object.freeze({
    version: PORTAL_COURTYARD_VERSION,
    arrival: Object.freeze({ x: 0, y: -1.2, z: -8 }),
    centralTable: Object.freeze({ x: 0, y: 0.45, z: CENTER_Z, radius: 2.2, function: "decorative-roundtable" }),
    gates: Object.freeze(gates),
    action: "existing-html-portal-preview-only",
    hasRemoteURLs: false,
    grantsPermission: false
  });
}

/** Only the same reviewed registry IDs may be invoked from the HTML overlay. */
export function scenePortalById(id) {
  if (typeof id !== "string") return null;
  return portalCourtyardPlan().gates.find(gate => gate.id === id) ?? null;
}
