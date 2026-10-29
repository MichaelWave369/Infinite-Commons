# Grand Roundtable V2 · visual foundation (candidate)

**Status:** optional, public, read-only visual interface. NOT a live Xi chat client, shared authentication layer, connected AI council, or permission grant.

## What is implemented

The Commons React page displays a new galactic chamber immediately before the existing five-seat council. It provides:

- A responsive 12-station circular hall, with up to eight visual rings (96 positions). More stations do not imply more logged-in people.
- Separate **Commons Council** and **Xi Table** presentations. The selected mode is saved only in this browser's local storage.
- Clickable, keyboard-focusable stations with accessible holographic dials. Escape closes the selected dial.
- Five authentic *fixture roles* in Commons ring 1, mapped exactly to the existing Dreamer / Builder / Challenger / Archivist / Vessie Prime order.
- The seven other stations and all higher-ring stations are labeled unassigned. The Xi presentation currently displays **no** identities or presence because there is no authorized live Xi adapter.
- A council action that scrolls/focuses the real existing agenda input; **the original session state, event records, STATION, ThinkTank handoff and trust gates are not duplicated or altered.**
- An explicit public Xi bridge link reusing the already reviewed `xiCommonsDoor.mjs` record; it is an external *static public site*, not a private-room crossing.
- A self-contained original SVG hall at `public/images/galactic-roundtable.svg` so the build does not depend on image-generation services, remote CDN images or additional packages.

## Integrating the commissioned full-resolution artwork

The SVG is a provisional fallback while the approved galactic chamber image is staged as a reviewed, versioned binary. The artwork used in the design session is **not** contained in this PR. Do not claim that it is.

To substitute the approved artwork:

1. Export a web-optimized 1672 × 941 WebP or AVIF master with a documented license/provenance.
2. Commit it separately as `apps/commons-react/public/images/galactic-roundtable.webp` and update the decorative `GalacticRoundtable.jsx` image expression to use `import.meta.env.BASE_URL + "images/galactic-roundtable.webp"`.
3. Review the seat locations in `galacticRoundtableModel.mjs` against the source image at desktop and 375px viewport widths. The coordinates are normalized percentages, so they remain anchored regardless of rendered size.
4. Check text contrast, graphics compression and loading fallback. The image must remain decorative; all actual controls are HTML, not baked into pixels.

The visual layer and the roles are deliberately separate, so changing artwork does not change authority or persistence.

## Compatibility and security rules

- Never hard-code Xi private names, messages, tokens or browser session keys.
- The visual-mode switch is **not** consent to connect, authenticate or publish.
- The Xi view is explicitly disconnected until Hunter provides a reviewed, authenticated read adapter and separately authorizes scopes. Any future adapter must use authenticated session state and not infer presence from old message history.
- An outgoing link to the public Xi bridge does not establish a live Xi connection.
- Existing local practice council and STATION must remain accessible even if graphics fail or JS cannot load the image.
- All UI-only preferences stored in localStorage must use allowlisted enum values. Never cache private messages in those preferences.
- The original council's event sequence, five roles, and STATION controls are not modified in this rung.

## Tests

```sh
npm install --prefix apps/commons-react --no-audit --no-fund
npm test --prefix apps/commons-react
npm run build --prefix apps/commons-react
npm run test:browser --prefix apps/commons-react
```

New `galacticRoundtable.test.mjs` tests twelve stable coordinates, the original five-role boundary, no fabricated Xi seats, higher-ring non-presence, and invalid-mode fallback.

**Manual preview checklist:** visit `#galactic-roundtable`; switch modes; open each seat dial; choose ring 2; confirm all chairs are unassigned; return to Commons ring 1; open role dial and focus the original agenda; complete all five original practice turns and STATION as before; reload to confirm only view mode was saved; inspect mobile width and keyboard controls.

## Later rung, explicitly out of scope

An independent, authorized Xi read-only adapter could eventually populate only the seats backed by verified Xi participant records. Writing messages, streaming, exports, cross-room search and shared control actions would each need separate capability review and host permission. The Xi sovereign bridge's documented external pilot remains blocked until proven otherwise.

**Rule:** Many minds. Many tables. No thrones. A picture is not evidence of a connection.
