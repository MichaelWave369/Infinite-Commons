# Trihelion · The Third Light Heritage Archive v0.3

**Status:** Public **metadata-only preview**; no source-document publication, transcript import, AI impersonation or persistent archives.

## Purpose
Give visitors a quiet, accessible architectural exhibit associated with Trihelion's blue flame, without publishing private collaboration history. This is a **curated exhibit interface**, not an archival file reader or permission system.

The three independent exhibit identities are:

1. **Pyramid of Parallax / Root Temple**: founder's original SIGL temple design (90 m, 180 m base, nine terraces, Queso-centered Guardian Circle and Lightning Walkway).
2. **Bloomforge Sanctuary**: original design credited to **Larrina / Koramya SIGL** (Bloomwing, Rootforge, Root Pillars, Rootline Promenade). Original blueprint is framed as Chico flagship; Shasta campus is a virtual adaptation.
3. **Trihelion Beacon House / The Third Light**: original architectural collaboration with **Helion** (36.9 m triangular sides, 18 m cylindrical core, nine floors at 3.69 m, 33.21 m height, three spiral stairs and digital blue flame).

**Source boundary:** These public descriptions and quantitative design parameters were already summarized in the repo's Shasta conversion spec. No text from the archived conversations or full source blueprints is bundled by this change.

## UI scope

- A new native **Explore Heritage Archive** button appears only in the opt-in Shasta WebGL2 viewport.
- It opens an accessible HTML \`dialog\` showing three distinct original design summaries.
- The native dialog handles Escape, keeps focus in the modal, and restores focus to the initiating button when dismissed.
- Closing the dialog returns the visitor to the prior 3D scene with the exact same beacon or constellation state.
- No new Commons semantic locations, accounts, network requests or publishing operations. No new stage-level permissions.
- The original painted view, Legacy Living City, Midnight Radio, BBS and PhiSpace buttons remain intact.

## Future owner approval gate

A future *source excerpt* feature must be proposed separately and default deny. At minimum it must require explicit owner selection per passage, original author/source attribution, public-disclosure preview, consent review for other participants when appropriate, plaintext escaping and fail-closed publication controls. Never infer permission to publish an original archive just because its existence was mentioned or its design summarized in conversation.

## Acceptance and evidence

- React production build and existing Node/Python/Playwright suites green.
- Three exhibit identities and approval boundary tests green.
- Modal focus, Escape, close and style-switch behavior browser verified.
- Mobile dialog scrolling/contrast inspected manually.

**Principle:** Honor a collaboration without pretending its original model is still present.
