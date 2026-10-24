# Infinite Commons: Portal Plaza + the Grand Roundtable (v0.1)

**Status:** public, original, story-first React experience. Offline-capable in the browser once its static assets load. **No live world crossing, multi-agent inference, peer federation, public accounts, identity access, or network-backed collaboration.**

## Vision

**Many worlds. Many minds. One Commons. No thrones.**

Infinite Commons is the shared arrival hub. Each original world owns its story, look, and future runtime. The Commons controls only a small, explicit public presentation registry, not the authority or internal data of those worlds.

The Roundtable Hall is another Commons destination, with a long-term vision of independently governed councils assembled through existing systems such as ThinkTank, Commonline, Crane Fly and Reality Gate. **No new ThinkTank integration is claimed in this release.**

## Implemented in this first milestone

The optional React Pages app now presents a **Portal Plaza** below the original Midnight Sierra arrival scene and accessible from the new header navigation. It contains four fixed original story previews:

| Portal | Gateway | Current behavior |
|---|---|---|
| ΞΦWorld | Nested Bubble Gate | In-page comic-fantasy vignette featuring BrakeWind and Lil' Gassy |
| Nevora | Resonance Mirror | In-page imagined restoration/exploration vignette |
| BLACKOUT | The Midnight Door | In-page noir vignette |
| Mikey & Ori | Workshop Threshold | In-page lighthearted inventor adventure vignette |

All portal actions are native HTML buttons. Clicking a portal opens a small in-page story preview and offers a clear return. **None of the entries invent or silently open an unverified external URL.** As real world runtimes are deployed and verified, a later separately reviewed release can explicitly add navigation while preserving each world's authority.

The **Grand Roundtable Hall** features an illustrated CSS circular table and five seats, with an explicit small offline practice council. The user enters an agenda, chooses when to hear the next **deterministic fixture** turn, and sees five transparent roles: Dreamer, Builder, Challenger, Archivist and Vessie Prime. The example turns are fixed text and do not change in response to the entered agenda. A typed question is a visible label and never triggers model inference.

### STATION!

**STATION** is the ceremonial conclusion of a fully heard local council. The button stays disabled until the five roles have taken turns. Calling STATION records a *local in-memory ceremony marker* carrying the agenda, count, fixed source classification and declaration:

> LEDGER ABOVE EGO · MANY MINDS, NO THRONES

It displays **STATIONNNNN!!!** as the Hall's first celebratory ritual. The marker is NOT a cryptographic signature, durable event ledger, model decision, human authorization, publication, actual Xi/ThinkTank interaction, or grant. Page refresh clears the ceremony and its session. A new council can be convened from the same view.

## Security and preservation

- The original `web/packs.mjs` four semantic Commons nodes and 20 appearance styles remain unchanged.
- Original Arrival scene, optional Living City/WebGL, offline BBS, PhiSpace preview/withdraw and Python bootstrap contract are not replaced.
- Portals are immutable, built-in content entries. Their public registry holds **no URL**, account credentials, model identities, authorization grants or executable commands.
- Accessible semantic links, buttons and regions; keyboard-visible focus and reduced-motion preference.
- Visitors get explicit **ORIGINAL STORY PREVIEW** labels and **0 LIVE TRANSFERS**. Role responses explicitly display **OFFLINE FIXTURE**.
- STATION never conveys truth, authority, consent, privileged access, verified provenance or durable sealing.

## Verify

From the repository root:

    node --test apps/commons-react/tests/*.test.mjs
    npm install --prefix apps/commons-react --no-audit --no-fund
    npm run build --prefix apps/commons-react
    npm run test:browser --prefix apps/commons-react
    python -m pytest

GitHub CI also runs original legacy tests, Ruff, and real Chromium smoke tests including portal traversal and the STATION ceremony. GitHub Pages deployment is **main-only**, so merging this feature does not imply a verified production deployment; check the deployed smoke run separately.

## Planned future rungs

1. Introduce a versioned world launch registry **only after actual public destinations and ownership are verified**. Add explicit opt-in navigation, disabled/preview states, and a trusted return link.
2. Make the Portal Plaza spatially explorable in the existing optional 3D renderer, while keeping identical keyboard-accessible HTML controls and low-spec modes.
3. Wire Roundtable to a separately authenticated, human-operated ThinkTank session protocol with clear sim/live provenance. Never insert provider keys into the browser.
4. Provide an optional cross-world creator admission and permissions model with actual verified provenance, revocation and safe public publishing. Do not treat a portal listing as authorization.

This feature is intentionally **additive**: it evolves Commons into a place to explore, not an all-powerful runtime or monolith.

**LEDGER ABOVE EGO. NO THRONES. STATIONNNNN!!!**
