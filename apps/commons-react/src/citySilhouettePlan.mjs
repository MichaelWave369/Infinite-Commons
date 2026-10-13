import { livingCityBlueprint } from "./livingCityBlueprint.mjs";

// Deterministic, capped visual ornamentation. These are silhouettes,
// not rooms, accounts, accessible doors or real street locations.
export function citySilhouettePlan(seed = 369, count = 145) {
  const { buildings } = livingCityBlueprint(seed, count);
  const roofs = [];
  const crowns = [];
  const balconies = [];
  const antennae = [];
  for (let i = 0; i < buildings.length; i += 1) {
    const b = buildings[i];
    const roof = -7 + b.height;
    const kind = (i * 7 + 3) % 5;
    roofs.push({
      x: b.x, y: roof + 0.11, z: b.z,
      width: b.width + 0.22, height: 0.22, depth: b.depth + 0.22,
      kind
    });
    if (i % 3 === 0) {
      crowns.push({
        x: b.x, y: roof + 0.34 + (kind % 3) * 0.14, z: b.z,
        width: b.width * 0.72, height: 0.40 + (kind % 3) * 0.28,
        depth: b.depth * 0.67
      });
    }
    if (i % 11 === 0) {
      antennae.push({
        x: b.x + b.width * 0.12, y: roof + 0.9, z: b.z,
        width: 0.05, height: 1.75, depth: 0.05
      });
    }
    if (i % 7 === 0 && b.height > 7) {
      for (const f of [0.33, 0.66]) {
        balconies.push({
          x: b.x, y: -7 + b.height * f, z: b.z + b.depth / 2 + 0.24,
          width: b.width * 0.66, height: 0.14, depth: 0.55
        });
      }
    }
  }
  return { roofs, crowns, balconies, antennae };
}

export function cityDetailBudget(plan) {
  return Object.fromEntries(Object.entries(plan).map(([key, array]) => [key, array.length]));
}
