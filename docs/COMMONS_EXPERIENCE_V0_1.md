# Commons Experience v0.1: Midnight Sierra

## Purpose

A **public-safe, original, dependency-free visual prototype** for the existing
Infinite Commons project. It adds a separate `web/` presentation surface,
**not** a replacement for the deterministic Python bootstrap or proof CLI.

The world model is deliberately tiny: one arrival terrace and three sample
destinations. Every style uses the exact same four destination IDs. All
individual Porch data, permissions, network grants and identity remain out of
scope and untouched.

## Run it

From the repository root:

```sh
python -m http.server 8000 --directory web
```

Open **http://127.0.0.1:8000/** in a browser.

No registration, external API, tracker, third-party CSS/font, CDN or build
process is required. The only local persistence is the selected theme under
`commons.demo.style` in browser localStorage. If storage is disallowed, theme
switching still works for the current visit.

### Checks

```sh
node --test web/tests/experience.test.mjs
python -m pytest
ruff check .
```

Node 22 or newer is recommended for the frontend test. Python test and CLI
behavior remain unchanged. The GitHub CI workflow runs both test suites.

## Two complete scene treatments

- **Midnight Sierra**: cobalt blue hour, geometric terrace, amber doorway,
  distant city lights, dramatic mountains, sculptural lounge chair.
- **Cloudgarden**: floating planted islands, sky paths and soft atmospheric
  colors. The same terrace and hotspots remain in place.

Eighteen additional catalog entries are *palette previews*. They adjust
appearance but do not yet ship distinct models, custom architecture or
original audio. All twenty themes are functional choices. Preview labeling
must remain honest.

The illustration is procedural original SVG/DOM markup and color-driven CSS,
not an imported third-party game background or copyrighted Sierra asset.

## Style bible: Midnight Sierra

- **Emotional target:** the warmth and mystery of a hand-painted adventure game,
  with modern architectural restraint. Never a flood of random neon.
- **Colors:** deep cobalt (#052b5b), blue horizon (#0877b1), amber lighting
  (#ffad65), cyan accents (#6bdcff), inky shadow (#061a39).
- **Shapes:** strong terraces, distant city grid, a glowing threshold, low
  designer lounge furniture and still mountain silhouettes.
- **Typography:** readable system sans for navigation; restrained literary
  serif for the atmosphere copy.
- **Audio (future):** original instrumental synthesizers, soft city noise,
  jazz-tinted melodic touches. Never autoplay without consent.
- **Motion:** optional and minimal. Respect reduced-motion preference.
- **Narration:** lightly mischievous, optional, never a required audio channel.
- **VR aspiration:** Quest-friendly immersive traversal via WebXR only after
  the shared semantic world contract and accessibility fallback are proven.

## Canonical semantic IDs

`web/packs.mjs` fixes four locally illustrative IDs:

- `commons.arrival`
- `commons.plaza`
- `commons.bbs`
- `phispace.example`

Names, permissions and identities **must not be controlled by a theme pack**.
Themes only contain title, mood, scene selection and eight allowlisted hex
colors. No executable user theme files or remote asset URLs are accepted.
The prototype does not yet load community-submitted packs or federate nodes.

## Community contributions: future governed protocol

Before accepting a third-party pack, design a separate proposal format that
includes:

1. Creator attribution, license, asset provenance and review status.
2. A content-only manifest with versioned compatibility.
3. Safely packaged local artwork and sound with hashes and bounded size.
4. Real accessibility testing: contrast, reduced motion, color dependence and
   non-visual alternatives.
5. Device budgets for low-spec desktop and standalone VR; graceful fallbacks.
6. Moderated review and a clear distinction between original works,
   references, and submissions.

Never grant user-created themes JavaScript execution, Porch capabilities,
private storage access, dynamic remote asset fetching or automatic publishing.

## Milestone ledger

| Capability | Status |
| --- | --- |
| Original arrival terrace scene | Implemented in browser prototype |
| Twenty style selections | Implemented (2 scene treatments + 18 palette previews) |
| Theme selection persists on same browser | Implemented, best-effort localStorage |
| BBS, promenade and PhiSpace hotspots | Implemented as explicitly labeled sample panels |
| Semantic world invariants | Automated tests |
| Live Porch node / PhiPie integration | Not implemented |
| Community accounts, BBS, sharing or guestbooks | Not implemented |
| Multiplayer presence | Not implemented |
| VR/WebXR traversal | Not implemented |
| Public hosted deployment | Not implemented |

## Next independent milestone

Build a small, **read-only, permission-checked published PhiSpace manifest**
adapter to local test fixtures first. That adapter must never accept file paths
or LAN addresses chosen by an untrusted theme pack. Only after reviewing the
real Infinite Porch API and threat model should we consider a network bridge.

Anti-M completion boundary: this PR is DONE only when the page works locally,
the suite is green, the existing Python bootstrap proof is unaffected, and the
demo disclaimers reflect actual runtime behavior.
