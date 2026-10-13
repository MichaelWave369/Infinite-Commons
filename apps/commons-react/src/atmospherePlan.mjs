/**
 * Original Midnight Sierra painterly atmosphere recipe.
 * Pure deterministic data; does not inspect any device, Porch or user content.
 * Canvas is composed locally at runtime, with no remote textures.
 */
export const SKY_WIDTH = 1024;
export const SKY_HEIGHT = 512;

export function atmospherePlan(seed = 369) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const strokes = Array.from({ length: 650 }, (_, i) => ({
    x: Math.round(random() * SKY_WIDTH),
    y: Math.round(random() * SKY_HEIGHT),
    radius: 0.5 + random() * 2.0,
    alpha: 0.012 + random() * 0.038,
    warm: i % 13 === 0,
  }));
  const bands = Array.from({ length: 22 }, (_, i) => ({
    x: random() * SKY_WIDTH,
    y: 90 + random() * 260,
    width: 100 + random() * 310,
    height: 2 + random() * 8,
    alpha: 0.009 + random() * 0.025,
  }));
  const distantRidge = Array.from({ length: 16 }, (_, i) => ({
    x: i * (SKY_WIDTH / 15),
    y: 318 + random() * 55 + Math.sin(i * 1.5) * 10,
  }));
  const foregroundRidge = Array.from({ length: 16 }, (_, i) => ({
    x: i * (SKY_WIDTH / 15),
    y: 368 + random() * 31,
  }));
  return Object.freeze({ strokes, bands, distantRidge, foregroundRidge });
}

export function atmosphereBudget(plan) {
  return {
    canvasWidth: SKY_WIDTH,
    canvasHeight: SKY_HEIGHT,
    strokes: plan.strokes.length,
    bands: plan.bands.length,
    mountainVertices: plan.distantRidge.length + plan.foregroundRidge.length,
  };
}
