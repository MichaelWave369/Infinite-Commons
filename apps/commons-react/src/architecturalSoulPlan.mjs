/**
 * Midnight Sierra v0.6 · Architectural Soul
 * Original, deterministic visual ornamentation. None of these structures
 * represent real Porches, accounts, published rooms, or traversable links.
 */
import { livingCityBlueprint } from "./livingCityBlueprint.mjs";
import { districtPlan } from "./livingCityDistrictPlan.mjs";
import { citySilhouettePlan } from "./citySilhouettePlan.mjs";

function piece(x, y, z, width, height, depth) {
  return { x, y, z, width, height, depth };
}

export function architecturalSoulPlan(seed = 369, count = 145) {
  const { buildings } = livingCityBlueprint(seed, count);
  const { balconies } = citySilhouettePlan(seed, count);
  const districts = districtPlan(seed);
  const facadeFins = [];
  const cornices = [];
  const warmBands = [];
  const balconyRails = [];
  const roofPlanters = [];
  const rooftopLeaves = [];
  const skybridges = [];

  for (let index = 0; index < buildings.length; index += 1) {
    const building = buildings[index];
    const { x, z, width, depth, height } = building;
    const front = z + depth / 2 + 0.065;
    const roofY = -7 + height;
    // Recessed vertical piers and a crown give selected towers a recognizable
    // Art-Deco face, instead of applying random objects to every window.
    if (index % 9 === 0) {
      const pierHeight = height * 0.84;
      for (const side of [-1, 1]) {
        facadeFins.push(piece(
          x + side * width * 0.34,
          -7 + pierHeight / 2 + height * 0.07,
          front, 0.10, pierHeight, 0.095
        ));
      }
      cornices.push(piece(x, roofY - 0.36, front, width * 0.90, 0.17, 0.12));
      if (height > 7.0) {
        for (const fraction of [0.34, 0.69]) {
          warmBands.push(piece(x, -7 + height * fraction, front + 0.04,
            width * 0.62, 0.095, 0.05));
        }
      }
    }
    // A small number of planters/roof gardens, not greenery on every tower.
    if (index % 13 === 0 && width > 1.5) {
      const roofDepth = Math.min(depth * 0.45, 1.6);
      roofPlanters.push(piece(x, roofY + 0.17, z, width * 0.64, 0.28, roofDepth));
      for (const side of [-1, 0, 1]) {
        rooftopLeaves.push(piece(x + side * width * 0.18, roofY + 0.58,
          z, 0.41, 0.62 + (side === 0 ? 0.2 : 0), 0.43));
      }
    }
  }

  // Existing v0.4 balcony slabs now have thin visible guard rails.
  for (const b of balconies) {
    balconyRails.push(piece(b.x, b.y + 0.37, b.z + b.depth * 0.38,
      b.width * 0.94, 0.075, 0.09));
  }

  // These lighted walkways connect decorative low-rise shapes only.
  // They are visual city texture, NOT interactive transit destinations.
  for (const [band, a, b] of [
    [districts.near, 3, 4],
    [districts.near, 15, 16],
    [districts.middle, 9, 10],
  ]) {
    const from = band.buildings[a];
    const to = band.buildings[b];
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const length = Math.hypot(dx, dz);
    if (length > 0.25 && length < 25) {
      skybridges.push({
        x: (from.x + to.x) / 2,
        y: -7 + Math.min(from.height, to.height) * 0.76,
        z: (from.z + to.z) / 2,
        length,
        angle: -Math.atan2(dz, dx)
      });
    }
  }

  return { facadeFins, cornices, warmBands, balconyRails,
    roofPlanters, rooftopLeaves, skybridges };
}

export function architecturalSoulBudget(plan) {
  return Object.fromEntries(Object.entries(plan).map(([name, items]) => [name, items.length]));
}
