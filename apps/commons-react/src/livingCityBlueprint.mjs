// Geometry-only, deterministic art layout. No user data or Porch APIs.
export function livingCityBlueprint(seed = 369, count = 145) {
  if (!Number.isInteger(count) || count < 0 || count > 240) {
    throw new RangeError("Living City building budget exceeded");
  }
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const buildings = [];
  const windows = [];
  for (let index = 0; index < count; index += 1) {
    const x = -36 + random() * 75;
    const z = -31 - random() * 62;
    const width = 1.0 + random() * 3.6;
    const depth = 1.0 + random() * 3.4;
    const height = 3.0 + random() * 18.0;
    const y = -7.0 + height / 2;
    const lit = random() > 0.3;
    buildings.push({ x, y, z, width, depth, height, tone: index % 4 });
    // Windows face the camera. These positions are decoration, not rooms.
    const columns = Math.min(8, Math.floor(width / 0.48));
    const floors = Math.min(25, Math.floor(height / 0.85));
    for (let row = 1; row < floors; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        if (!lit || random() < 0.66 || windows.length >= 2200) continue;
        windows.push({
          x: x - width / 2 + (col + 0.5) * width / columns,
          y: -7 + 0.55 + row * 0.85,
          z: z + depth / 2 + 0.025,
          warm: random() > 0.17
        });
      }
    }
  }
  return { buildings, windows };
}
