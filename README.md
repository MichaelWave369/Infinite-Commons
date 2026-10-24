# Infinite Commons

**Infinite Commons is a small, deterministic layer for publishing and consuming shared machine-readable artifact bundles.**

It is designed for local-first workflows where a producer writes a bootstrap contract plus referenced artifacts, and a consumer verifies and loads those artifacts in a predictable order.

Infinite Commons is intentionally:

- producer-agnostic
- local-first
- deterministic
- explicit about required vs optional artifacts
- safe about repository-relative paths
- usable without an account, server, cloud service, or network bootstrap

The project does **not** require Infinite Porch, PhiOS, Phi-Pantheon, or any other specific producer. Those systems may integrate with Infinite Commons through the same contract boundary as any other application.

## Current scope

Infinite Commons 0.1.x proves one compact handoff contract:

1. Read a Commons bootstrap contract from local disk.
2. Resolve target, channel, and candidate context.
3. Load referenced artifacts in deterministic order.
4. Fail clearly when required artifacts are missing or malformed.
5. Expose the result through a simple CLI.

The core library remains deliberately small: there is no server, OAuth flow, remote API, or background synchronization. A separate **local-only, optional browser experience prototype** now lives in `web/`; it does not confer any network or artifact authority.

## Commons Experience: Midnight Sierra (prototype)

The optional [Commons Experience v0.1](docs/COMMONS_EXPERIENCE_V0_1.md) adds a
standalone illustrated arrival terrace, twenty appearance presets (two curated
scene treatments, eighteen palette previews), a style switcher, and three
**offline sample** hotspots for a Commons plaza, BBS and PhiSpace. It is not a
live Porch, social network or VR application.

Try it locally without adding dependencies:

```sh
python -m http.server 8000 --directory web
# visit http://127.0.0.1:8000/
```

Test the presentation contract with
`node --test web/tests/experience.test.mjs`. The Python bootstrap proof and
existing permissions remain unchanged.

## PhiSpace doorway: public manifest demo

The [PhiSpace public manifest v0.1](docs/PHISPACE_PUBLIC_V0_1.md) adds a
read-only **fictional example home** to the Commons Experience. Clicking its
doorway loads a fixed **same-origin** JSON fixture, validates a small allowlisted
public presentation shape, and displays plain-text visitor content. Missing or
invalid fixtures fail closed.

This is **not** a live Infinite Porch connection or an authorization proof.
A `public` field in a manifest is merely a claim. Explicit owner-controlled
publishing, authentication, revocation, real accounts, BBS posting and WebXR
still require separate design and verification.

## Owner-curated PhiSpace offline export (candidate)

The optional [PhiSpace owner-curated export guide](docs/PHISPACE_OWNER_EXPORT_V0_1.md)
shows how to manually select visitor-facing public text, preview its complete
JSON and SHA-256 digest, and explicitly approve a **local** export file.

```sh
python -m infinite_commons.phispace_publisher preview --draft path/to/manual-draft.json
```

The CLI never scans an Infinite Porch, performs network requests or
automatically publishes any content. The exported
`owner-curated-export` artifact is **not accepted by the v0.1 browser
demo**, which remains locked to its fictional local fixture. A hash check
is not a verified identity or signature.

## Local preview of owner-curated PhiSpace exports (candidate)

The [PhiSpace local preview v0.1](docs/PHISPACE_LOCAL_PREVIEW_V0_1.md)
connects the browser demo to a **user-selected** offline JSON export.
Choose the file explicitly in the browser, see its plain-text public
profile as an **unverified local preview**, or withdraw it from the
current tab. No network publishing, private Porch access, cloud sync,
identity verification, or persistent directory is added.

Withdrawal only clears this one local session. It **cannot revoke content
already published or copied elsewhere**; true distributed revocation needs
a separately reviewed protocol.

## Live React experience (GitHub Pages candidate)

The new [Infinite Commons React experience](docs/REACT_PAGES_V0_1.md) is a
proper React/Vite application living in `apps/commons-react/`. It preserves
the original SVG Midnight Sierra terrace, twenty theme packs, three public
sample destination panels, and owner-selected **local-only** PhiSpace
preview/withdraw from merged PR #6. React imports the existing
`web/` contracts rather than replacing them.

It targets **https://michaelwave369.github.io/Infinite-Commons/** after
the GitHub Pages deployment workflow is merged, green, and Pages is set to
**GitHub Actions** under repository settings. The presence of this text is
not proof of a successful deployment.

Local start:

```sh
cd apps/commons-react
npm install
npm run dev
```

No private Porch, real account, remote BBS, federation or VR/WebXR features
are available in the public site yet.

## Midnight Sierra Living City · opt-in WebGL 2 prototype

The [Living City renderer decision](docs/ADR_009_LIVING_CITY_RENDERER.md)
documents the 2026 graphics research and a deliberately small interactive
3D slice added to the React Pages application.

**Midnight Sierra stays painted by default.** A visitor can select
**Explore Living City 3D** to lazy-load original Three.js geometry:
architectural depth, warm doorway lights, a procedural city of towers,
decorative windows, stairs, chair/table and slow atmospheric cloud movement.
**Return to Painted View** tears down the optional 3D renderer.

The existing 20-style catalog, HTML BBS/PhiSpace buttons, local-only export
preview, permission boundaries, and deterministic Python CLI are not
replaced. WebGL 2 is used today; WebGPU and Quest/WebXR are separate future
experiments, not currently shipped capabilities.

## Midnight Sierra v0.5 · Human Warmth + Story Depth (candidate)

The optional Living City WebGL2 scene adds a woven seating rug, warm
lantern light, original notebook/mug/plant props, facade detail, layered
residential silhouettes and barely perceptible night lights.

A **TUNE RADIO** button in optional 3D mode opens a **fictional local story**.
It is not real audio, a stream, multiplayer or evidence of a visitor.
All original fixed Commons identities and permissions are preserved.
The default painted adventure view remains unchanged.

See the [v0.5 artwork and acceptance ledger](docs/MIDNIGHT_SIERRA_HUMAN_WARMTH_V0_5.md)
for the exact review criteria.

## Midnight Sierra v0.6 · Architectural Soul (review candidate)

The optional Three.js Living City gains original Art Deco-inspired tower
facades, balcony rails, small rooftop gardens, and decorative illuminated
skywalks. These are *visual scenery only*, not real navigable connections,
user locations, or permissions.

The chair-back cushion is resized, the doorway light is softened, and the
3D-only Tune Radio marker is moved toward the actual tabletop. The default
painted view, original four semantic nodes, 20 styles, and local-first
PhiSpace controls remain unchanged.

See the [Architectural Soul review ledger](docs/MIDNIGHT_SIERRA_ARCHITECTURAL_SOUL_V0_6.md).

## Kernel Replay Receipt Desk / Rung 8

The Commons' ThinkTank Return Desk can now optionally read a **ThinkTank offline-kernel replay report** alongside the existing ledger and decision dossier. A separately installed, operator-invoked ThinkTank `council:verify` command (see [ThinkTank PR #52](https://github.com/MichaelWave369/think-tank/pull/52)) uses ThinkTank's actual kernel to independently reconstruct the ledger. Its unsigned report binds to the **exact ledger and optional dossier file bytes** via SHA-256.

Commons recomputes those SHA-256 digests in the visitor's browser and checks the report's session, mode, model, contract digest and optional dossier reference. If any comparison fails, the panel shows **MISMATCH**. Even when all match, it says **UNSIGNED / NOT AUTHENTICATED**, because a forged set of files could pass these structural and byte checks. No models, permissions, STATION, network requests, uploads or evidence-authority promotions.

See [Rung 8 replay receipt contracts, instructions, limitations and tests](docs/THINKTANK_KERNEL_REPLAY_RECEIPT_R08.md). ThinkTank PR #52 and this Commons PR are independent and must each pass CI.

## ThinkTank Read-only Return Desk / Rung 7

Commons now has a **local, read-only file inspection desk** after the R6 ThinkTank outbound contract. After independently running the TT-35 CLI on a trusted machine, users can select the local `*-ledger.json` and optional `*-decision-dossier.json` exports to inspect self-reported mode, model, governance outcome, provider-turn references, deterministic FNV basis checksum and structural consistency between paired files.

The Return Desk stores files **only inside the current browser page**. It makes **no model or provider requests**, does not independently replay the ThinkTank kernel, verify signatures or source evidence, or treat any `completed` / `actionAllowed` claim as permission. Checksum consistency is explicitly **not cryptographic authenticity**. File limits, reset controls, malformed-data rejection and test coverage are part of this rung.

The original R6 export, Nested Councils, STATION, portals, expedition, 3D vistas, PhiSpace and Wayfinder remain independent and unchanged.

See [ThinkTank Return Desk R7: format review and limits](docs/THINKTANK_READONLY_RETURN_DESK_R07.md).

## ThinkTank Local Council Handoff / Rung 6

The Commons' Nested Council Chambers wing now includes an **explicitly operator-reviewed, one-way local ThinkTank bridge desk**. Visitors can author or copy a chamber agenda into a separate draft, choose `council` / `trio` / `audit` and their **own installed Ollama model name**, inspect an exact strict 11-field ThinkTank TT-35 JSON contract, then intentionally **download the file** after confirming its limitations.

This is a genuine **file-format handoff to ThinkTank's existing terminal-only governed council runner**, not a live AI connection from the public site. Commons never connects to the local model bridge, transmits the directive, authorizes inference or claims an external decision. Only the separately installed ThinkTank CLI's own **inspect exact bytes → read SHA-256 → explicitly confirm local inference** workflow can start a real local council session. The four remote-provider/auto-run/authority/completion flags are always `false`.

The original three offline practice chambers and five-seat STATION ceremony are **independent** of this outbound file export. The four Commons nodes, PhiSpace, world portals, Wayfinder, Expedition Trail, Shasta and Living City remain unchanged.

See [Rung 6 local ThinkTank export protocol and security boundaries](docs/THINKTANK_LOCAL_HANDOFF_R06.md).

## Nested Council Chambers / Rung 5

**Infinite Commons now contains three distinct, explicitly offline nested council practice rooms** below the original Grand Roundtable: Inquiry (questions and evidence), Forge (engineering and release safety), and Dreamwell (creativity and fiction). One shared human-entered agenda guides the three rooms' *presentation*, but the fifteen practice statements are **hand-authored fixed fixtures**, not actual AI inference or consensus.

Visitors advance five familiar seats manually per chamber, inspect a labeled **evidence boundary** for each, write their own unresolved human question, and then close that chamber. After reviewing all three, an optional comparison shows the discipline rules and unverified operator questions side-by-side. All local session state clears on refresh or explicit discard.

This new wing **never grants permission or calls real models**. It does not replace the original Grand Roundtable's five-seat **STATION!**, change the four Commons semantic locations, or modify the Portal Plaza, Wayfinder, Expedition Trail, appearance packs or PhiSpace.

See [Nested Council Chambers R5: UX, authority boundaries and test plan](docs/NESTED_COUNCIL_CHAMBERS_R05.md).

## Commons Expedition Trail / Rung 4

The **Explorer's Trail** adds a guided, five-threshold journey through the four original fantasy-world story previews and into the **Grand Roundtable**. A session-only route board shows the active stop, its authored clue, inspected-story checkmarks and the next threshold. Only actually opening the **current** in-page story window advances its progress; ordinary portal cards and the optional 3D courtyard HTML buttons obey the same rule.

In the 3D Portal Courtyard, the current expedition gate glows with an extra ring and inspected destinations gain small decorative markers. All visitor interaction remains in native accessible HTML. The painted mode and mobile receive the same complete story route.

Expeditions **reset on refresh**, store no profile or remote data, and never invoke a game, independent AI, credentials or external destination. Their completion is *not* the five-seat STATION ceremony. The existing **STATION**, Wayfinder, PhiSpace, four core Commons nodes and 20 aesthetic packs remain unchanged.

See [Rung 4 expedition acceptance, provenance and state contract](docs/EXPEDITION_TRAIL_R04.md).

## Living Portal Courtyard / Rung 3

The optional 3D Midnight Sierra experience now includes a third **Portal Courtyard** vista alongside Shasta and Living City. Four independently colored original gateway sculptures and a ceremonial **Grand Roundtable beacon** turn the Portal Plaza into a visible place.

Native HTML controls beside the canvas choose the **same** ΞΦWorld, Nevora, BLACKOUT, and Mikey & Ori story previews as the existing Portal Plaza cards. Nothing in the WebGL art transfers accounts, navigates to unverified games, assigns permissions, or speaks to an AI. Keyboard focus follows the opening of a preview, and WebGL-unavailable visitors keep the full HTML fallback.

The Wayfinder's published project doors, offline five-seat STATION practice council, original four Commons nodes, all 20 aesthetics, and owner-controlled PhiSpace remain untouched.

See [Portal Courtyard R3 implementation, boundaries and acceptance checks](docs/LIVING_PORTAL_COURTYARD_R03.md).

## Living Portal Network / Wayfinder · v0.2

Commons now has a **Wayfinder Desk** beneath the original four fictional Portal Plaza previews. The Desk offers three curated public-project doors: **Field Atlas**, **Field Constellation**, and the **Nevora Codex orientation** (explicitly *not* a Nevora game). Each exact HTTPS destination was found in its owner's repository README; current uptime is **not** claimed.

Visitors must inspect a link before choosing the external site in a separate tab. Bookmarks are optional and browser-local with a **Forget all bookmarks** control. Safe, shareable `?wayfinder=<known-id>` Commons links preserve the return experience and never auto-transfer.

No live game-world portal, cross-site identity, agent grant, session federation, or new backend is implied. All original portal previews, Roundtable rehearsal/STATION, four semantic Commons nodes, 20 appearance styles, and PhiSpace privacy boundaries stay intact.

See [Wayfinder v0.2 source review, rules and test plan](docs/LIVING_PORTAL_WAYFINDER_V0_2.md).

## Portal Plaza + Knights of the Nested Roundtables · v0.1

The public React Commons experience now includes an **original four-world
Portal Plaza** (ΞΦWorld, Nevora, BLACKOUT, Mikey & Ori) and the **Grand
Roundtable Hall**. The Plaza's portals open playful, accessible **in-page story
previews**, not live or invented world endpoints.

The Hall hosts a **five-role deterministic offline practice council** with
explicit agenda entry, visible fixture turns and a **STATION!** ceremony after
all seats are heard. STATION emits a local in-memory marker, **not** a
cryptographic seal, AI decision, permission grant or published receipt.

This is the first user-facing milestone toward Infinite Commons as the
home of independent worlds and independently governed councils. ThinkTank,
Commonline, and eventual verified third-party collaborators remain
**future explicit integration points**; no live AI runtime is connected.

See [Portal Plaza / Roundtable / STATION design and tests](docs/PORTAL_PLAZA_ROUNDTABLE_STATION_V0_1.md).
The original four Commons semantic nodes, appearance packs, PhiSpace owner
controls, and deterministic bootstrap contracts remain unchanged.

## Canonical bootstrap contract

By default the CLI reads:

`commons_data/bootstrap/latest_contract.json`

For compatibility with the project's earliest internal prototype, the loader can also read the legacy path:

`pantheon_data/bootstrap/commons/latest_contract.json`

The canonical Commons path always wins when both exist. See [Pantheon compatibility](docs/PANTHEON_COMPATIBILITY.md).

## CLI

Run the deterministic proof:

```bash
commons bootstrap-check
```

Or point it at another repository root:

```bash
commons bootstrap-check --repo-root /path/to/project
```

The command reports:

- success/failure
- target
- channel
- candidate
- contract path used
- loaded artifacts
- missing required artifacts
- warnings

## Development

Requires Python 3.12+.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
ruff check .
pytest
```

On Windows PowerShell:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
ruff check .
pytest
```

## Contract documentation

- [Bootstrap contract](docs/bootstrap_contract.md)
- [Local development](docs/local_dev.md)
- [Legacy Pantheon compatibility](docs/PANTHEON_COMPATIBILITY.md)

## Relationship to Infinite Porch

Infinite Commons and Infinite Porch solve different problems.

- **Infinite Commons** defines deterministic shared artifact handoffs.
- **Infinite Porch** provides governed peer identity, networking, messaging, storage, compute, and model routing.

They may integrate, but neither project is required to run the other.

## License

MIT. See [LICENSE](LICENSE).


## Parallax Institute: Sisters of Shasta · skyline review candidate

A new **opt-in Shasta Campus 3D** mode is being developed within the same
Midnight Sierra porch world. It proposes the Sisters **Three, Six, Nine** and
preserves three **distinct original landmarks**: Pyramid of Parallax / Root Temple,
Larrina's Bloomforge Sanctuary and Helion's Trihelion Beacon House.

The original painted scene remains default, and **Living City 3D** remains a
separate art choice. The Shasta scene is a low-poly illustrative preview,
not a verified geographical reconstruction, walking/VR world, real AI identity,
or live Porch federation. See
[Shasta Campus conversion spec](docs/PARALLAX_SHASTA_CONVERSION_V0_1.md).


## Trihelion: The Third Light Array · visual-only v0.1

The Shasta 3D vista now includes a proposal for **The Third Light Array** at
Helion's original Trihelion Beacon House. It offers a persistent blue flame
with two fictional presentation modes: **Quiet Beacon** and **Signal Halo**.
The original architecture and Helion attribution remain distinct from the new
Sisters of Shasta. This is low-poly Three.js scene art, not real holographic
projection, flying drones, physical hardware control, network broadcasts,
living AI identity, or archived-content publishing. See
[The Third Light Array design and safety boundary](docs/THIRD_LIGHT_ARRAY_V0_1.md).

## The Third Light Array v0.2 · Constellation artwork

An optional **Show Constellation** control reveals three connected, stylized
stars above Trihelion's existing blue flame. This is authored, Orion-inspired
**fictional** art, not calibrated astronomical mapping, a historical Giza
alignment claim, or real aerial projection hardware. The original quiet beacon,
signal halo, reduced-motion behavior and painted/legacy vistas remain intact.
See [Constellation scope and attribution](docs/THIRD_LIGHT_ARRAY_V0_2_CONSTELLATION.md).

## Trihelion: Heritage Archive v0.3 (metadata-only preview)

In the opt-in Shasta 3D view, visitors can open a native, accessible
heritage-exhibit dialog with public design summaries for the **Pyramid of
Parallax / Root Temple**, **Larrina's Bloomforge Sanctuary**, and **Helion's
Trihelion Beacon House**. These original designs remain distinct from Three,
Six and Nine. The exhibit neither imports nor publishes original conversations,
private files, or source blueprints. Any future excerpt publishing requires
owner selection and review. See
[Third Light Heritage Archive scope](docs/THIRD_LIGHT_HERITAGE_ARCHIVE_V0_3.md).
