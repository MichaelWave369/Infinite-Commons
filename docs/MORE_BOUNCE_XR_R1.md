# More Bounce XR · venue rung 1

## Scope and ownership
More Bounce is an optional **live 3D / experimental WebXR venue** inside the Commons React presentation. It is **not** one of the original four fictional portal destinations; the existing Commons semantic IDs, CLI, permissions, style pack and trust machinery are unchanged.

- Commons owns the Three.js venue visualization and XR controller input.
- MoreBounceLabs owns the existing Backspin '96 audio engine, file/crate handling, recording and PWA.
- The actual musician must manually load the embedded original Backspin booth, click **Start Dual Audio**, import authorized local tracks, then check **Allow Infinite Commons XR controls in this session**. Until those actions, the venue makes no audio claims.
- Only the canonical GitHub Pages origin `https://michaelwave369.github.io` uses the versioned control bridge. Local development and alternate hosts intentionally fall back to the standalone DJ booth link.
- There is **no automatic streaming of a DJ's private files to other visitors**. Human avatars, multiplayer, synthetic performers, public broadcast and persistent worlds are future milestones.

## Experience
A user chooses **Enter More Bounce** from a new optional entry after the Commons Nexus. This lazy-loads a small original Three.js room featuring a dance floor, stage, two visual turntables, cue buttons, three mixer-cut pads, speaker towers and arcade silhouettes.

On desktop, clicking a platter sends a Play/Pause intent to the user-enabled Backspin session. The cue cube and three mixer buttons send allowlisted commands. The embedded Backspin booth provides all actual controls and file imports.

On a compatible HTTPS WebXR browser (Quest 3 target), **Enter Quest / WebXR** requests `immersive-vr` from a user click. With a Touch controller, aim at the platter and tap trigger to Play/Pause. Hold trigger while moving sideways across the platter to send bounded scratch speed commands, then release to send the engine's **release** call. Trigger cue or mixer pads to choose corresponding commands. Exact scratching feel, controller ray alignment, posture and latency must be checked on Quest 3 hardware; this is not a certified production DJ interface.

## Wire contract
`phi.commons.backspin-xr.v1` matches the opt-in protocol in the companion MoreBounceLabs PR. The only commands are `hello`, `snapshot`, `play`, `cue`, `scratch`, `release` and `crossfade`. All numeric controls must be finite and in bounded ranges. The receiver requires `event.source === parent`, an exact origin match, a parent route under `/Infinite-Commons/`, and a deliberately enabled session checkbox. All file import, audio-unlock, download, media scraping, recording, arbitrary selectors and third-party control remain out of scope. No browser storage is used for permission.

## Deployment order
1. Review and merge the MoreBounceLabs control bridge PR first. Verify its original Backspin booth is published, and run its protocol tests plus existing Pages checks.
2. Review and merge this Commons PR. Make sure both branches' CI is green before merging. Enable GitHub Pages Actions if required.
3. In a desktop browser, visit the published Commons site, open More Bounce, then explicitly load the Backspin booth. Start audio with a user click, load local media, grant the checkbox and verify Play/Cue/Cut and denied/disabled cases.
4. Test on Quest 3 HTTPS browser: session entry/exit, real audio unlock, controller selection, scratch and release, 10-minute performance without glitches, reduced-motion user experience and accidental page changes while mixing. Check that leaving the venue unmounts both venue and booth.
5. Test on an alternate host that commands are refused and the standalone link remains accessible.

## Expected limitations
- WebXR requires compatible headset/browser and HTTPS. Desktop remains supported.
- The canvas is the **XR view**; the existing 2D HTML Backspin controls are not automatically a readable floating browser window *inside* immersive VR. Import and audio setup happen beforehand in the webpage.
- Head/hand locomotion and avatar presence are not implemented; this is a compact performance-room prototype with controller targeting.
- An external link can play Backspin standalone but cannot remotely control an unrelated origin.
- Shader/scene performance and real Quest 3 audio latency remain field-validation tasks, not completed guarantees.
