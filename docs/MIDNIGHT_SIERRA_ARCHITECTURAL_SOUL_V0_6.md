# Midnight Sierra v0.6 · Architectural Soul

## Why this pass exists

The v0.5 screenshot shows a convincing, welcoming porch but a city mostly
composed of flat-sided towers. The radio button floats over the planter, and
the round chair cushion is disproportionately large. This is a focused
**architectural personality and composition correction**, not a new renderer
or a social-network feature.

## Changes

- Original Art Deco-inspired **vertical piers, crown detailing, subtle
  amber horizontal lines** on selected towers, not every building.
- **Balcony guardrails** on the existing v0.4 slabs.
- Small **roof gardens** with original low-poly planters and foliage.
- Three **decorative illuminated skywalks** between nearby low-rise shapes.
  These are *not* navigable routes, actual bridges to other users, or
  privately owned rooms. Future real locations must be authorized separately.
- Additional architectural facade breaks and a warm recessed transom on the
  arrival building.
- Chair back cushion reduced in size so the silhouette feels more like
  human-scale furniture than a giant rounded orange object.
- A less intense main doorway lamp, while keeping the intimate warm interior.
- The native HTML **Tune Radio** marker moves left toward the physical radio
  table. The BBS plaque moves farther right in optional 3D mode, so those
  controls remain separate and keyboard-operable.

The scene remains original, procedural, and a hand-styled WebGL 2 prototype;
it is not a claim of photorealism or genuine Sierra On-Line artwork.

## Implementation and budgets

- `architecturalSoulPlan.mjs`: seeded, count-bounded data only, composed from
  the v0.2 building layout, v0.4 balcony plan and v0.5 district bands.
- `LivingCityArchitecture.jsx`: instanced facade, garden and balcony
  geometry, plus three small hand-authored pedestrian-style skywalk
  sculptures. No new APIs, asset imports, data fetches, shaders or identity
  fields.
- `LivingCityFinishes.jsx`: chair proportion edit.
- `LivingCity.jsx`: one additive architectural layer and mild doorway
  intensity reduction.
- `react.css`: 3D-only hotspot adjustments. Painted-mode positions remain.

The additions are limited to a few instanced groups and three small walkway
assemblies; they do not add extra animation loops or continuously update
geometry. The optional scene is still lazy loaded, DPR-limited and reverts
to painted mode if WebGL 2 is unavailable. Reduced-motion behavior is
unchanged.

## Tests and completion evidence

CI executes the existing Python, Node and **real Chromium** production build
checks, plus:

- New unit tests for deterministic and finite instance transforms, structural
  caps, and unchanged four semantic world nodes.
- An interactive browser test of painted default, optional 3D, radio modal,
  PhiSpace/BBS controls and the return-to-painted action.
- Radio/BBS nonoverlap assertion at the desktop test viewport.
- An optional browser screenshot artifact:
  `midnight-sierra-v06.png` when WebGL 2 renders in CI.

**Visual sign-off remains a human step:** inspect the screenshot on the
actual desktop GPU, compare with v0.5 at the same viewport, check skyline
legibility, materials, overdraw/occlusion and real runtime performance.

## Explicit non-goals

No new Commons network node, portal authorization, identity, tracking, user
uploads, private Porch API, multiplayer, social presence, guestbook write
or genuine skywalk navigation. The city buildings and glowing windows are
only imagined visual places.

A future independent PR can implement authored street-level environments,
a distinct PhiSpace room renderer, richer original artist-made materials or
optional Quest/WebXR. Each requires its own performance and permission gates.

## Anti-M merge gate

- [ ] Latest PR head: CI green and screenshot artifact reviewed if present.
- [ ] Desktop WebGL2 review: distinct skyline facades and gardens are visible.
- [ ] Skywalks do not obscure the terrace or signal navigable false doors.
- [ ] Radio marker aligns nearer the real table than the large planter.
- [ ] Chair proportions and doorway light are visually improved.
- [ ] Painted view, Cloudgarden, PhiSpace, BBS, radio and reduced-motion
  behavior are still functional.
- [ ] Merge only after review. A green browser run is not visual approval.
