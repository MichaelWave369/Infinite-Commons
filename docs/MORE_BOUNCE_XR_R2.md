# More Bounce XR · Rung 2: Living Club, Vinyl Hands and Arcade

**Scope:** Single-visitor prototype inside Infinite Commons React. No new identity, account, agent, network, broadcasting, file, microphone or Porch permissions. Existing four Commons semantic locations and the MoreBounceLabs Backspin engine remain unchanged.

## Playable features
- Original **Breakbeat Reaction Cabinet**: twelve locally scored 600 ms beats, Perfect (±100 ms) and Good (±230 ms) windows, per-round combo and misses. Crate roulette shows original genre labels but DOES NOT generate, download, mix, capture or stream music. The on-screen button works with mouse, touch and keyboard; XR controller trigger can select the in-world cabinet. No persistent highscores.
- **Comfort-bounded XR walking**: Quest left controller thumbstick for slow gaze-relative travel, clamped to the venue's stage/arcade footprint; right thumbstick for a 30° snap when crossing an edge threshold. Two controller ray visuals aid targeting. No roomscale teleport, collision mesh, full locomotion comfort certification or physical-world boundary substitution.
- **OverStrings actual hand joint integration**: review-pinned MIT copies of `web/gesture.mjs` and `web/calibration.mjs` from `MichaelWave369/OverStrings`, with original MIT license preserved under `src/vendor/overstrings/`. Only live `XRFrame.getJointPose` data from `XRInputSource.hand` can feed the gesture tracker. On the DJ's explicit hand-input checkbox, a debounced pinch that **begins within 43 cm of an actual platter** can send bounded scratch control; release or tracking loss sends release. A pinch away from the equipment does not control Backspin. Left and right hands are supported; controller fallback remains.
- The Backspin audio controls remain gated by the original **separate** MoreBounceLabs checkbox and physical audio/media setup. Gesture consent is not audio capability consent.
- **No automatic biometric capture:** hand positions are used in transient per-frame memory only, not stored, exported, broadcast or trained on. No synthetic hand gestures are passed to the club.
- Existing Commons React app and original R1 bridge unchanged apart from additive venue improvements.

## Provenance
The two copied modules are byte-identical with the OverStrings default branch fetched for R2 (2026-11-08):
- `web/gesture.mjs` Git blob: `7eda0ed5a24414ecd3e090dfcd76f4f6c2c46711`
- `web/calibration.mjs` Git blob: `e433d8e24d0e86dc25f04162a6075af1a17e4711`
- License source: `MichaelWave369/OverStrings/LICENSE`.
Updates must be separately reviewed and verified, not fetched dynamically from GitHub Pages in XR. Gesture thresholds are heuristics **not** calibrated physical confidence scores.

## User walk-through
1. Open published Infinite Commons over HTTPS and select **More Bounce**. Verify the original Commons plaza and portals still work.
2. **Desktop arcade:** select Start challenge and tap the button as the pulse reaches the end. Try too early, Perfect, Good, missed rounds and restart. No account or audio required.
3. **Desktop DJ:** opt-in to load the original Backspin booth in the page; press Start Dual Audio and load your own authorized files. Explicitly grant the existing Commons XR bridge checkbox if needed. The original Backspin app remains operational independently.
4. **Quest 3 controller:** enter WebXR from the explicit button; walk slowly with left thumbstick; snap-turn with the right stick; aim a ray at a platter/cue/crossfader and confirm real Backspin action; aim at a cabinet screen to start/tap the arcade.
5. **Quest 3 hands:** enable the new experimental OverStrings checkbox, switch to hand tracking, place a tracked index finger close to the vinyl surface, pinch deliberately and move sideways to scratch, then unpinch. Verify left and right separately. Test occlusion, disappearance, rapid motion, hand-controller transition and returning to the Commons.
6. **Failure cases:** leave the Backspin bridge disabled; turn off the hand checkbox mid-scratch; leave/return to the room; deny WebXR session; use a browser without XR/WebGL; verify no background audio starts, no unauthorized files are touched and no accidental scratches persist.

## Hard hardware gates before calling it production-ready
Track device name, headset firmware version, browser version, FPS and observed AudioWorklet glitches. Test for 10 minutes on Quest 3 with two locally imported authorized tracks and save a human-written field report. Measure whether grab-to-scratch latency is musically tolerable; avoid claiming quantified latency without instrumentation. Confirm forward locomotion doesn't move users into obstacles and snap turn respects comfort; reduce speed or remove movement if simulator discomfort occurs.

**This PR is an implementation and CI candidate, not proof of Quest 3 hand tracking performance.** If there is no `XRHand` runtime source, the game stays with controllers and reports waiting for real joint poses. The desktop arcade remains available without WebGL and no XR input is ever simulated for the live DJ bridge.
