// Bounded, deterministic, geometry-only decorative neighborhoods.
// Nothing here is a real city address, PhiSpace, Porch, chat, or identity.
const MAX_PER_BAND = 40;
const BANDS = Object.freeze([
  { id: "near", count: 25, startZ: -23, spanZ: 17, minHeight: 1.6, maxHeight: 4.7 },
  { id: "middle", count: 23, startZ: -43, spanZ: 25, minHeight: 3.0, maxHeight: 8.0 },
  { id: "far", count: 18, startZ: -77, spanZ: 20, minHeight: 3.0, maxHeight: 10.0 },
]);

export function districtPlan(seed = 369) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const result = {};
  for (const band of BANDS) {
    if (band.count > MAX_PER_BAND) throw new RangeError("Decorative district budget exceeded");
    const buildings = [];
    const lights = [];
    for (let i = 0; i < band.count; i += 1) {
      const width = 1.8 + random() * (band.id === "near" ? 3.9 : 3.0);
      const depth = 1.3 + random() * 2.6;
      const height = band.minHeight + random() * (band.maxHeight - band.minHeight);
      const x = -39 + (i + 0.5) / band.count * 81 + (random() - 0.5) * 2.0;
      const z = band.startZ - random() * band.spanZ;
      const y = -7 + height / 2;
      buildings.push({ x, y, z, width, height, depth });
      if (i % 2 === 0) {
        // One illuminated neighborhood ribbon per selected low-rise.
        lights.push({
          x, y: -7 + height * 0.69,
          z: z + depth / 2 + 0.04,
          width: width * 0.48, height: 0.065, depth: 0.04
        });
      }
    }
    result[band.id] = { buildings, lights };
  }
  return result;
}

export function districtBudget(plan) {
  return Object.fromEntries(Object.entries(plan).map(([name, band]) =>
    [name, { buildings: band.buildings.length, lights: band.lights.length }]
  ));
}
