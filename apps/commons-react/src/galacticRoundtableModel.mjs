/**
 * Living Council R1 · presentation-only seat model.
 * Coordinates target the center of each circular holographic station in the
 * approved 1672x941 galactic chamber image, not the backs of the chairs.
 * Percentages are relative to the complete UNCROPPED 1672:941 image.
 * Order: noon clockwise. On smaller viewports we scroll the unscaled-ratio
 * stage horizontally rather than cropping/distorting this coordinate system.
 *
 * Neither a visible station nor a "heard" practice turn indicates live presence.
 */
export const GALACTIC_RING_SIZE = 12;
export const GALACTIC_MAX_RING = 7;
export const GALACTIC_MODES = Object.freeze(["commons", "xi"]);
export const GALACTIC_ART_ASPECT_RATIO = 1672 / 941;
export const GALACTIC_SEAT_POINTS = Object.freeze([
  [50, 27.5], [64, 29.5], [76, 33.5], [84, 42],
  [82.5, 56], [70, 68], [50, 72], [30, 68],
  [17.5, 56], [15, 42], [24, 33.5], [36, 29.5]
].map(([x, y]) => Object.freeze({ x, y })));

export function normalizeGalacticMode(value) {
  return GALACTIC_MODES.includes(value) ? value : "commons";
}
export function clampGalacticRing(value) {
  return Number.isSafeInteger(value)
    ? Math.min(GALACTIC_MAX_RING, Math.max(0, value)) : 0;
}
export function galacticSeats(mode, ring, councilRoles) {
  const safeMode = normalizeGalacticMode(mode);
  const safeRing = clampGalacticRing(ring);
  const roles = Array.isArray(councilRoles)
    ? councilRoles.slice(0, GALACTIC_RING_SIZE) : [];
  return GALACTIC_SEAT_POINTS.map((point, index) => {
    const role = safeMode === "commons" && safeRing === 0 ? roles[index] : undefined;
    return Object.freeze({
      id: safeMode + ":" + safeRing + ":" + index,
      index,
      number: safeRing * GALACTIC_RING_SIZE + index + 1,
      label: role ? role.name : "Unassigned seat",
      detail: role?.subtitle ?? "",
      roleIndex: role ? index : null,
      source: role ? "offline-practice-role" : "unassigned",
      x: point.x, y: point.y
    });
  });
}
