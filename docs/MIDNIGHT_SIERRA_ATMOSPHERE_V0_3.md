# Midnight Sierra · Atmosphere Pass v0.3

## What changes

A deliberately small cinematic/painterly treatment of the **optional** Living
City renderer from PR #9. The original painted SVG and all 20 appearance
selections are untouched. In Midnight Sierra, selecting
**Explore Living City 3D** now adds:

- A one-time, original **1024 × 512** painted procedural sky image held in a
  Three.js `CanvasTexture` with a cobalt-blue gradient and diffuse amber
  horizon; generated entirely in the user's browser.
- Two layers of mountain silhouettes, subtle cloud-like bands, and soft brush
  grain. All seeded and deterministic.
- Warm building wall sconces, gently luminous stair edges and two planters,
  using simple bounded geometry and materials.
- No new HTTP requests, external asset files, paid dependencies, imported
  artwork, WebGPU pipeline, new animation loops or identity permissions.

The atmosphere texture is disposed on unmount. Reduced-motion behavior,
instanced city/lighting budgets, WebGL2 fallback, HTML PhiSpace/BBS hotspots,
and the "Return to Painted View" control from #9 remain in force.

## Visual direction

**Midnight Sierra** is less "everything glows neon" and more
hand-painted 1990s adventure-game background:
deep blue sky, amber human-scale lighting, quiet architecture and distant
mystery. The texture is a lightweight procedural art study, not a licensed
Sierra On-Line asset or a claimed photorealistic painting.

The prior procedural geometry still needs a proper authored composition,
a tuned camera angle, material studies, exterior/interior art direction and
performance review. Avoid overclaiming a finished AAA/VR world.

## Tests

```sh
cd apps/commons-react
npm install
npm test
npm run build
npm run test:browser
```

The normal GitHub PR CI installs dependencies, runs the Python/Node contract
suites, compiles the production app, and opens it in a real Chromium browser
on the correct `/Infinite-Commons/` path.

The new `atmosphere.test.mjs` verifies deterministic skies, maximum grain
and ridge budgets, and unchanged semantic location IDs.

## Anti-M completion ledger

- [ ] Exact-head CI green including Chromium and current Python checks
- [ ] WebGL2 desktop manual screenshot, no broken perspective or obscured UI
- [ ] Return-to-painted transition works
- [ ] Cloudgarden stays the existing experience
- [ ] FPS/thermals acceptable on a modest device
- [ ] No private Porch content or external files accidentally requested

Next *informed* step: use real screenshot feedback from the WebGL2 scene to
tune composition and hand-authored material treatment. Later Quest 3 testing
belongs to a separately reviewed WebXR milestone, not this atmosphere PR.
