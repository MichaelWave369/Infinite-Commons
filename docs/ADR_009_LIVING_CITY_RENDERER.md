# ADR-009 · Midnight Sierra Living City v0.2

## Decision (12 October 2026)

The Commons will offer an **optional Three.js/WebGL 2 visual renderer** for the
existing `commons.arrival` scene. Use stable `@react-three/fiber` v9 (compatible
with React 19) as the presentation adapter and `three` as the 3D engine.

Keep the original painted SVG scene as the fast, accessible **default**.
Three.js is dynamically imported only when a visitor explicitly requests 3D.
Do not upgrade the backend, adopt WebGPU-XR or assert Quest 3 support in this PR.

Existing semantic destination IDs and public-content boundaries remain in
`web/packs.mjs` and `web/phispace-*.mjs`. The WebGL canvas is *decorative*
and the original PhiSpace, BBS and Commons HTML hotspot buttons stay intact.

## Technology research snapshot

| Candidate | 2026 reality | Decision |
|---|---|---|
| WebGL 2 | Official Khronos spec; maintained Three.js WebGLRenderer uses WebGL 2 | **Production baseline** |
| WebGL 3 | No officially published Khronos WebGL 3 core API specification | **Do not wait for it** |
| Three.js WebGPURenderer | Experimental, uses WebGPU with WebGL 2 fallback; some APIs differ | **Separate future research spike** |
| React Three Fiber v9 | React 19-compatible declarative Three.js scene integration | **Choose** |
| Babylon.js | Excellent cross-backend engine, physics and WebXR ecosystem | Alternative if game logic substantially grows |
| PlayCanvas | Strong performant 3D/WebXR engine, editor and React bindings | Alternative for asset-heavy authoring |
| WebXR | Supported by Meta Quest Browser in compatible devices, requires HTTPS and per-device verification | **Future VR milestone** |
| Meta IWSDK | 2026 Three.js/ECS-based immersive SDK, recommends device/emulator testing | **Evaluate for Quest mode** |

Sources:
- Khronos WebGL registry: https://registry.khronos.org/webgl/
- Three.js WebGLRenderer: https://threejs.org/docs/pages/WebGLRenderer.html
- Three.js WebGPURenderer migration: https://threejs.org/manual/pages/webgpurenderer
- React Three Fiber: https://r3f.docs.pmnd.rs/
- MDN WebGPU compatibility: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- Meta IWSDK: https://developers.meta.com/vr/documentation/iwsdk/guides/overview/
- Meta WebXR: https://developers.meta.com/vr/documentation/web/webxr-overview/

This is engineering research, not a claim of exhaustive headset/browser validation.

## The vertical slice

- **Architectural depth:** Three.js box geometry for a terraced building,
  inset glowing doorway, parapet, warm stair noses, glass guardrail and
  original lounge chair/radio table.
- **A city beyond the terrace:** bounded seeded geometry for up to 145
  city towers and 2,200 decorative lit windows using instancing. Window
  points are decorative, **not** registered rooms, people, or Porches.
- **Atmosphere:** cobalt night, lit warm portal, low-poly haze/cloud
  forms and stars. Movement limited to slow cloud drift.
- **User control:** a visible **Explore Living City 3D** button on Midnight
  Sierra, a **Return to Painted View** action, and no automatic 3D load.
  Other themes keep their existing painted renderer in this milestone.
- **Fallback:** probe for WebGL 2 before attempting the lazy import; an
  error boundary returns to painted art on renderer initialization errors.
- **Accessibility:** original HTML hotspots stay keyboard-operable.
  `prefers-reduced-motion` stops drift and switches to demand rendering.
  No audio autoplay.
- **Performance:** native geometry/materials, capped instance counts,
  DPR limited to 1–1.5, no shadows or expensive postprocessing. GPU work
  is unmounted when leaving 3D mode.

### Out of scope

Full-resolution painterly textures, panoramic cinematic art, post-processing,
audio, physically navigable VR, avatars, multiplayer, remote interaction,
personal Porch sharing or a world-editor. Those should not be smuggled into a
single graphics patch.

The fixed `commons.arrival` ID is unchanged. This PR adds no URL parsing,
tracking, asset CDNs, identity fields, private file access, or new permissions.

## Proof gates

- [ ] Existing browser scene and PhiSpace preview still work.
- [ ] React production Vite build and the real Chromium smoke tests pass.
- [ ] A WebGL 2-enabled desktop browser can start the living city.
- [ ] A device without WebGL 2 sees the painted scene and explanation.
- [ ] BBS and PhiSpace semantic buttons still work after entering/leaving 3D.
- [ ] No regressions in Python bootstrap or public-export tests.
- [ ] Verify mobile layout, reduced motion and GPU/context handling manually.
- [ ] Merge only after green and visual review.

Next aesthetic passes should introduce original authored textures, deeper
architecture, true curved foreground roads and detailed districts under a
profiled performance budget. Keep scene layers separate from semantic
permissions and user-controlled public publishing.
