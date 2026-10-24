# Nested Council Chambers · Infinite Commons Rung 5

**Status:** local, reviewed, deterministic three-chamber demonstration. **Not** live multi-agent deliberation, a registered human vote, evidence verification, authenticated federation, true consensus, or real data retrieval.

## The Inner Hall

Below the existing Grand Roundtable, visitors can select three independently themed, original practice chambers:

| Chamber | Purpose | Rule |
| --- | --- | --- |
| **Inquiry Chamber** | Questions, uncertainty, falsifiable tests and evidence provenance | A compelling claim without independent observations remains a proposal |
| **Forge Chamber** | Reversible engineering, acceptance tests and releases | No build is a release until an independent check can be reproduced |
| **Dreamwell Chamber** | Creative prototypes, fictional universes and imagination | Imagination is welcome; fiction must remain labeled as fiction |

One explicitly supplied **shared agenda** begins three separate but comparable local rehearsals. A visitor chooses any chamber and manually requests each of its **five familiar council seats**, in the canonical order: Dreamer, Builder, Challenger, Archivist, Vessie Prime. Every statement and evidence-boundary note is *static, authored text*. **The contents never adapt to the visitor's agenda.**

After all five turns in each chamber, the visitor writes a **1–240 character human review question** that is displayed as unverified operator input. Only then may the visitor close the *practice* chamber. Switching rooms retains independent local progress within the tab.

After completing and reviewing **all three** chambers with the same agenda, an explicit **Compare the three chambers** action displays each discipline's rule and unverified operator question side-by-side. This is a **comparison of authored fixtures**, *not* a comparison of independent reasoning, an AI consensus, a conclusion validated against external evidence, or authorized advice.

The comparison intentionally does **not** invoke the separate Grand Roundtable's **STATION!** ritual. STATION still requires its own original five-seat practice procedure and generates only its existing ephemeral ceremony marker.

## Implementation and constraints

- `src/councilChambers.mjs` defines frozen, hand-reviewed chamber content and a pure session state machine: begin, hear, review, close, compare.
- `src/NestedCouncilChambers.jsx` displays accessible chamber doors, five-seat timeline, full authored statements, explicit evidence boundaries and the local convergence desk.
- `src/CommonsNexus.jsx` adds the new wing after the Grand Roundtable without changing its existing logic.
- `src/App.jsx` adds a new Commons header anchor. The four canonical world nodes and all 20 appearance styles remain untouched.
- All input is rendered as React text nodes rather than interpreted as HTML, URLs, API commands or prompts to real models.
- No API keys, remote requests, localStorage, external clipboard operations, account identity, persistent publication, signatures, authentication grants or implicit approvals are added. Refresh clears chamber progress and notes; explicit **Discard all local chamber sessions** clears them inside the tab.

## Tests

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

Unit tests cover: exact original five-role order, all three frozen authored content packs, agenda and review input lengths, sequential contribution gating, human question requirements, closure, convergence with *one* shared agenda, and rejection of forged, duplicate, missing or incomplete sessions.

Chromium smoke tests cover all fifteen visible authored contributions and their evidence boundaries, manual review for each chamber, blocked early comparison, working three-room comparison, room switching, mobile layout, explicit reset, session-only persistence, and regression coverage for the original Grand Roundtable, Portal Plaza, Wayfinder, Explorer's Trail, 3D Shasta/City/Courtyard views, and STATION.

## Future (not implemented)

Connection to the existing ThinkTank engine is a separate phase requiring:

1. A reviewed, authenticated, operator-authorized server endpoint, **never keys in client code**.
2. Actual per-seat provenance, real model identifiers, challenge/review records, and explicit failure modes.
3. Human approval boundaries, revocation, audit logs, and evidence labels that cannot confuse fixture text with verified observations.
4. A separate robust interop contract for guest systems if the operator later opts in; no claimed live Xi connection.

**MANY MINDS. MANY TABLES. NO THRONES. LEDGER ABOVE EGO. STATIONNNNN!**
