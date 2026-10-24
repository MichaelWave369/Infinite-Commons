# Commons Wayfinder · Living Portal Network v0.2

**Status:** An additive, reviewed public-site doorway directory, entirely in the Commons browser. It is **not** a cross-world authentication system, not a live game portal, and not an automatic external redirect.

## Why the two portal layers stay separate

**Portal Plaza (v0.1):** ΞΦWorld, Nevora, BLACKOUT and Mikey & Ori are *original fictional world previews*. None has a verified released game endpoint in the Commons registry, so all four retain the same authored, offline-safe vignettes. The Grand Roundtable and STATION local council remain untouched.

**Wayfinder Desk (v0.2):** Three *independently deployed, owner-documented public project experiences* appear as separately labeled exits. Their owner READMEs were inspected on 2026-10-23; the link review is not an uptime test or claim that a game exists.

| Public experience | Exact public link | Owner README evidence | What it is |
| --- | --- | --- | --- |
| Field Atlas | https://michaelwave369.github.io/FieldAtlas/ | MichaelWave369/FieldAtlas/README.md | A living library of public projects |
| Field Constellation | https://michaelwave369.github.io/FieldConstellation/ | MichaelWave369/FieldConstellation/README.md | A project observatory |
| Nevora Codex | https://michaelwave369.github.io/nevora-codex/ | MichaelWave369/nevora-codex/README.md | A public orientation / draft reader, **not the Nevora game** |

A public README can be stale or a deployment can be offline. The desk always displays **OWNER-DOCUMENTED · UPTIME NOT CHECKED** instead of misleadingly claiming real-time availability.

## The explicit crossing contract

1. Visitor selects **Inspect public doorway**, which stays within Commons and displays the known destination, its provenance and a notice about moving to an independently hosted site.
2. Visitor **chooses** the real HTTPS external link. The destination opens in a new tab with `rel="noopener noreferrer"`.
3. No automatic navigation, user identity, grant, site data, context, memory capsule or secret token is embedded in the link. No iframe is created. The original Commons tab remains home.

The allowed HTTPS host and **three exact paths** are hardcoded in `src/wayfinderPlan.mjs`; unknown IDs, protocol schemes, untrusted query values and duplicate `wayfinder` parameters never select a destination. No network-supplied portal manifest can override them. A separate reviewed PR is required to add a destination.

## Optional browser-local Passport

A visitor can explicitly **Bookmark on this browser**, remove that bookmark, or **Forget all bookmarks**. These commands read/write only `localStorage` under `commons.wayfinder.bookmarks.v0.2`. Merely viewing a portal does not store it; no telemetry and no shared cross-project passport. Corrupt saved values and unknown IDs are discarded. Storage-disabled browsers remain usable without saved bookmarks.

Public Commons selections can be shared with a simple `?wayfinder=<known-id>#portal-wayfinder` link. The URL contains only a known public registry ID and preserves unrelated parameters; a direct link opens the **Commons inspection panel**, never the external site. Browser Back/Forward restores selection, and local share links do not change permissions.

## Validation

- `node --test apps/commons-react/tests/*.test.mjs` covers fixed destinations, URI gating, malicious IDs, bookmark sanitation, and query history logic.
- `npm run build --prefix apps/commons-react` validates the unchanged bundled React app.
- `npm run test:browser --prefix apps/commons-react` covers deliberate opt-in exit, accessibility, mobile, local bookmarks and known/unknown deep links.
- Existing legacy Python and 3D scene CI gates remain in effect.

## Later rungs

- After each fictional world's *actual* published runtime is verified by its owner and smoke-tested, extend the **fantasy-world portal** itself with an explicit inspected exit and evidence of its release. Do not substitute a project README for a playable destination.
- Add an optional visual Wayfinder gateway in the existing 3D city while preserving the native HTML controls.
- For real cross-world sessions, use the future signed admission and human-approval boundary through the existing Commonline/ThinkTank ecosystem. A public website link is never a federation grant.

**LEDGER ABOVE EGO. NO THRONES. STATIONNNNN!!!**
