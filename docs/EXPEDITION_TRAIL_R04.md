# Commons Expedition Trail · Rung 4

**Status:** implemented deterministic, five-threshold guided story tour for the public React Commons. Entirely local and ephemeral. **Not** a live game, verification of story comprehension, shared passport, agent handoff, network transfer or provenance receipt.

## Visitor journey

The **Explorer's Trail** now appears between the original Portal Plaza and the Wayfinder Desk. The path is an authored linear itinerary through four already-reviewed offline story windows:

1. **ΞΦWorld: A Question of Thrones**, featuring BrakeWind, Lil' Gassy and the law of equal seats
2. **Nevora: The Caretaker's Path**, recalling the invitation to restore and document
3. **BLACKOUT: The Missing Headline**, asking what evidence went missing
4. **Mikey & Ori: A Workshop Warning**, about testing before any grand ceremony
5. **Grand Roundtable: The Fifth Threshold**, concluding at the existing Hall and inviting the separate council practice

Visitors explicitly press **Begin the five-stop expedition**. At each of the first four steps, they press **Inspect this story window** to open the *same original portal vignette*. The shared App handler records a checkmark **only if that selected portal matches the currently active expedition stop**; ordinary cards and 3D HTML controls use the exact same rule. Viewing a different portal never advances the trail. The button for the next stop remains disabled until the matching story has been inspected. Returning from a story preview preserves the journey in the current tab.

The fifth threshold links to `#roundtable-hall`. A deliberate **Complete this local expedition** action closes the session and displays a small, in-memory summary. This is **not STATION**. STATION remains exclusively the existing separate, deliberately convened five-seat practice council conclusion. No live AI is used in the expedition or STATION.

Refresh clears all expedition state and checkmarks. End session resets it. **No localStorage, cookies, credentials, server, network request, unique user ID or analytics event is added** for the expedition. The existing *different* Wayfinder public-project bookmark Passport remains unchanged and opt-in.

## What changes in 3D

When an expedition is active, its current original-world portal has a restrained illuminated base ring in the decorative 3D Portal Courtyard. Already-inspected worlds receive small ornamental markers. The existing HTML 3D operator names the active waypoint and links to the HTML Trail. No camera teleportation, WebGL pointer authority, account transfer or remote renderer asset is added.

The Portal Courtyard remains **optional** on supported Midnight Sierra/WebGL2 environments. In painted mode and on mobile, the complete itinerary and original HTML story windows work identically.

## Contracts and verification

- `src/commonsExpedition.mjs` is the pure, frozen, bounded state machine.
- `src/ExpeditionTrail.jsx` renders the accessible route list, current stop and visitor controls.
- `src/App.jsx` owns one ephemeral expedition instance and the canonical story-selection function.
- `src/CommonsNexus.jsx` hosts the Trail, preserving Wayfinder and Roundtable.
- `src/Scene.jsx`, `src/LivingCity.jsx`, `src/PortalCourtyard.jsx` receive only decorative current/visited portal IDs. Existing 3D navigation labels and tests remain in place.
- The four original Commons semantic nodes, 20 appearance presets, PhiSpace preview/withdraw and Wayfinder reviewed external exits are untouched.
- Unit tests reject forged/unreviewed IDs and premature session completion; browser tests check all four story windows, keyboard focus, Roundtable anchor, absence of automatic STATION, reset-on-refresh and small-screen behavior.

```sh
node --test apps/commons-react/tests/*.test.mjs
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
pytest
```

**Future:** once each creative world independently deploys a playable version, add real-world review and optional crossing gateways *separately*. Do not treat this guided fictional preview route as a game release or federation credential.

**MANY WORLDS. ONE COMMONS. LEDGER ABOVE EGO. NO THRONES. STATIONNNNN!**
