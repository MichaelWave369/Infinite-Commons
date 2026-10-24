# Living Portal Courtyard / Rung 3

**Status:** original low-poly WebGL art, opt-in and decorative, driven entirely by the existing original-world registry. **No live world runtimes, teleportation, identity sharing, agents, network transfer, or permissions.**

## Visitor experience

Under Midnight Sierra, a third 3D option appears alongside Shasta Campus and the Living City: **◎ Explore Portal Courtyard 3D**. The existing default painted Commons and appearance selection remain untouched.

The optional new vista draws four glowing ceremonial gateway sculptures on a bounded shared courtyard. Its central object is a decorative miniature Roundtable beacon: a promise of the future meeting hall, not an operational live ThinkTank session. The four color palettes and order come from the **same fixed** `PORTALS` original-world registry already used by the Portal Plaza cards.

- **ΞΦWorld:** purple nested bubble gate with BrakeWind and Lil' Gassy story preview.
- **Nevora:** green resonance gateway with the existing authored scene.
- **BLACKOUT:** amber midnight gate with the existing noir scene.
- **Mikey & Ori:** pale blue workshop threshold with the existing playful scene.

Rather than wiring clickable canvases, the courtyard exposes **four semantic HTML buttons** that open the **existing shared Commons story-preview region**. The regular Portal Plaza cards call the same handler. Focus moves to the in-page preview, and visitors may return to the Portal Plaza. The nearby **Visit the Grand Roundtable** link is a same-page anchor to the existing Hall.

From 3D, visitors can opt into Shasta, Living City, or Courtyard, or return to painted mode. On WebGL2-incompatible devices there is a clear fallback message and the regular story portals remain available. The courtyard is excluded from other art style packs in this first iteration, consistent with existing Shasta/City limitations.

## Implementation

- `src/portalCourtyardPlan.mjs`: deterministic, frozen, four-gate geometry and provenance-neutral visuals. An explicit bound to the four original registry IDs. No URLs, credentials, world nodes or authorization.
- `src/PortalCourtyard.jsx`: original shapes, arches, inner glow surfaces, no external geometry, textures, iframe or canvas pointer events. Lightweight bounded geometry. Gentle slow sculpture movement is disabled for reduced-motion preference.
- `src/LivingCity.jsx`: adds `vista="portals"` as an isolated third scene; existing cities, terrace, semantic hotspots and Shasta appear on their original options.
- `src/Scene.jsx`: the opt-in renderer buttons plus accessible HTML courtyard controls. Original Phispace, Commons and BBS hotspots retained.
- `src/App.jsx` and `src/CommonsNexus.jsx`: one shared story selection handler for both regular HTML Portal Plaza cards and 3D courtyard HTML controls. Focus into the same story region; no duplicate runtime, iframe or new backend.

## Explicit boundaries

- The four **canonical** `web/packs.mjs` Commons semantic nodes and the 20 existing theme packs do not change.
- The independently reviewed Wayfinder destinations (Field Atlas, Field Constellation, Nevora Codex) remain governed exclusively by the existing opt-in Wayfinder Desk. A fantasy-world sculpture never becomes an external URL or admission grant.
- The existing five-seat practice Roundtable and **STATION!** ceremony remain unchanged and are still explicitly offline fixture interactions.
- 3D art does not read public or private Porch identity, local files, clipboard, cross-domain storage or user-generated content.
- Pointer navigation is **not** hidden in the WebGL canvas. Keyboard and screen-reader users can access the same HTML controls.

## Validation

Run:

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

Node tests validate deterministic geometry, its correspondence to each canonical original-story ID, negative URL/permission vectors and invariant world-node fingerprints. Playwright tests verify opt-in visual mode, all four portals use the same HTML preview, focus behavior, switching 3D vistas, fallback in headless GPU environments, and mobile/Cloudgarden preservation.

**Next:** Once real story worlds have independently verified playable deployments, route visitors through a separately reviewed versioned *game-world* exit contract. This release adds no external links to original-world portals.

**LEDGER ABOVE EGO. MANY WORLDS. NO THRONES. STATIONNNNN!**
