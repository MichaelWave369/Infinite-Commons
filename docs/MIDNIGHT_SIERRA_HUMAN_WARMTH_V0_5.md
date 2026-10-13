# Midnight Sierra v0.5 · Human Warmth + Story Depth

## Source and objective

This is the screenshot-driven follow-on to merged v0.4 (#11). The working
WebGL2 terrace finally has architectural depth, but the mood needs
inhabited **human-scale detail** and the skyline needs genuine neighborhood
depth. The aim: *a little sanctuary overlooking a city full of stories*.

This is a visual and local-fiction milestone, **not** real human presence,
multiplayer, a new public PhiSpace service or audio broadcasting.

## Implementation

- `LivingCityWarmth.jsx` builds a muted woven rug, warm lantern, notebook,
  coffee mug, small succulent, subtle facade ribs, an interior shelf hint,
  and a restrained amber seating-area light. All use original primitive
  geometry/materials; no image textures are downloaded.
- `livingCityDistrictPlan.mjs` defines **three bounded seeded bands**:
  25 near, 23 middle, 18 far low-rise buildings, with one decorative
  illuminated window-strip on alternate buildings. These objects are
  **decorative**. They are not user homes, people, or registered Commons nodes.
- `LivingCityDistricts.jsx` renders those buildings and light strips with
  just six instanced meshes to limit draw calls.
- `LivingCityMotion.jsx` gives the existing doorway, tabletop radio,
  one far window and a tiny far navigation light very slow, subtle motion.
  The original slow cloud drift remains. `prefers-reduced-motion` bypasses
  these animation updates, and the existing R3F Canvas uses demand framing.
- `Scene.jsx` adds a keyboard/touch-accessible **TUNE RADIO** hotspot
  **only while 3D mode is active**. It opens an original fictional local
  narrative in the existing dialog. No audio autoplay, stream, player,
  microphone, recording, claim of live traffic, person, or network connection.

The 20 style packs, fixed semantic destinations, ownership boundaries,
local-file PhiSpace preview/withdraw, original painted mode, 3D opt-in,
low-power WebGL2 renderer and GitHub Pages process are unchanged.

## Anti-M completion contract

- [ ] All Python, Node contract, Vite build and Chromium tests green on PR head.
- [ ] Desktop screenshot in 3D mode confirms rug is visible, lantern/table
  do not clash, plants/facade fit and skyline reads in three depth bands.
- [ ] Test the radio story dialog, BBS, Commons, PhiSpace and return to painted.
- [ ] Cloudgarden remains in its own existing painted scene.
- [ ] Reduced-motion setting stops decorative light and aircraft motion.
- [ ] Profile a modest laptop as well as desktop before declaring performance.
- [ ] No outside files, user data, user identities, internet streams, remote
  URLs, private Porch state or extra permissions are introduced.
- [ ] Merge only after visual review. Green tests alone do not validate art.

## Testing

Node.js 22+:

```sh
node --test apps/commons-react/tests/*.test.mjs
node --test web/tests/*.test.mjs
cd apps/commons-react
npm install
npm run build
npm run test:browser
```

GitHub CI runs these browser, build and Python checks and attempts to
preserve `midnight-sierra-v05.png` if Chromium provides WebGL2. The desktop
GPU screenshot is the most important visual approval evidence.

## Further directions

Do not expand this PR into Quest WebXR, multiplayer or remote PhiSpace
publication. Further artistic passes can study authored detailed materials,
audio played only with consent, lighting quality and cinematic camera
composition. All future network integrations require separate provenance,
permission and revocation reviews.
