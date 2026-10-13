# Midnight Sierra · The Living City composition pass v0.4

## Screenshot-driven objective

The first public screenshot of v0.3 proved that the optional WebGL 2
scene rendered successfully. It also revealed that the city was dominated
by repetitive rectangular towers, the terrace looked like a flat gray
platform, the bright portal seemed detached from its wall, and the chair
was boxy.

This is a **targeted art-direction correction**, not a new Commons backend
or a move to a heavyweight game engine.

## Implementation

- **City silhouette grammar:** existing deterministic towers gain
  instanced roof caps, stepped upper stories, a bounded number of
  balcony shelves, and slim antennas. Two custom low-poly distant
  landmark towers give the skyline recognizable anchor points.
- **Terrace material:** a single original 512 × 512 locally painted
  stone texture, using muted stone values, subtle seams and seeded
  stipple. The texture is tiled and disposed when the 3D view is unmounted.
- **Doorway:** the left building width is adjusted so the portal sits
  more convincingly inside it. Additional jambs and recess shading,
  a lower-intensity interior panel, a threshold and soft amber floor
  illumination make an architectural entry rather than an isolated sign.
- **Chair:** the original low-poly frame stays, but now has rounded
  cushions and arms so the infamous balcony chair finally looks like a
  chair a person might want to use.
- **Semantics:** the original HTML PhiSpace, BBS and Commons controls
  and fixed world IDs are unchanged. All artwork is decoration and is
  not a node, connected personal room, or identity claim.

## Performance and trust boundaries

- One added local canvas texture, modest Three.js instancing for detail;
  no fetched images, paid asset libraries, heavy postprocessing, shadow
  maps, WebGPU migration, external tracking, new account/login or Porch
  file-system access.
- The 3D scene remains **opt-in** and lazy-loaded. The painted scene
  stays default and is always available as fallback.
- WebGL2 probe, preferring reduced motion, existing low-power GPU request
  and capped device pixel ratio remain in place.
- The sky/atmosphere pass from #10 and all 20 style packs are preserved.

## Acceptance and Anti-M checks

1. GitHub CI green on exact PR head: Python, Node, Vite production
   build, and Chromium browser smoke.
2. The optional 3D browser test may upload a screenshot artifact to CI
   if Chromium exposes WebGL 2. A missing artifact isn't a pass or failure
   of the actual GPU scene; review on a real graphics-capable device.
3. Manually compare v0.3 and v0.4 on the same desktop and viewport;
   inspect landmark depth, doorway placement, material seams and cushion
   geometry for z-fighting or odd occlusion.
4. Confirm BBS, PhiSpace and Return to Painted still work, and
   Cloudgarden remains unchanged.
5. Check mobile dimensions and GPU-unavailable behavior.
6. Merge only after passing the visual review. A successful CI build is
   not a substitute for a real screenshot.

**Still future work:** deeply authored painterly texture sets,
multi-room exploration, panoramic depth cues per district, night
soundscapes, Quest/WebXR traversal, actual publishing/network
connections and user-designed district themes. These require their own
contracts and test gates.
