/**
 * Visual seating model for the optional Grand Roundtable V2 surface.
 * The 12 visual stations are NOT assertions of connected people, agents, or permissions.
 * Real Xi presence may only be supplied by a separately authenticated, consented adapter.
 */
export const GALACTIC_RING_SIZE = 12;
export const GALACTIC_MODES = Object.freeze(["commons", "xi"]);
export const GALACTIC_SEAT_POINTS = Object.freeze([
  [50, 26], [63, 28], [77, 34], [87, 44],
  [83, 56], [69, 68], [50, 74], [30, 68],
  [16, 56], [13, 44], [23, 34], [37, 28]
].map(([x, y]) => Object.freeze({ x, y })));

export function normalizeGalacticMode(value) {
  return GALACTIC_MODES.includes(value) ? value : "commons";
}
export function galacticSeats(mode, ring, councilRoles) {
  const safeMode = normalizeGalacticMode(mode);
  const safeRing = Number.isSafeInteger(ring) && ring >= 0 ? ring : 0;
  const roles = Array.isArray(councilRoles) ? councilRoles.slice(0, GALACTIC_RING_SIZE) : [];
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
