# REEL House XR Rung 1: the Infinite Commons cinema

**Venue ownership:** Infinite Commons is responsible for the spatial venue, audience seats, and optional WebXR presentation. Existing independent [ReelCommons](https://github.com/MichaelWave369/ReelCommons) is the REEL Network editorial/catalog system. Existing [ReelTheater](https://github.com/MichaelWave369/ReelTheater) is the standalone living-room player. This work does not move media rights or streaming authority between repositories.

## Delivered in this rung

- A separately lazy-loaded **REEL House** entry next to the More Bounce club, with a native jump link in the Commons header.
- A modeled 3D cinema with screen, curtains, aisles, seating, lights and desktop seat camera selection.
- A genuine browser video element, mirrored as a Three.js video texture on the cinema screen, with ordinary user-controlled playback and no startup media request.
- Two explicit sources only: the MDN CC0 flower video, loaded on click, or a *manually selected* local MP4, WebM or Ogg file using a tab-scoped object URL. The media is not uploaded; local object URLs are revoked when replaced or when leaving the venue.
- Optional headset WebXR session request, only after a device reports support and the visitor presses Enter VR. Standard desktop video controls remain the reliable baseline.
- Direct navigation to both existing REEL projects. No cross-origin iframe, cross-origin video scraping, unofficial stream mirroring, auto-queueing or invented REEL programming.
- A no-WebGL fallback: local playback and REEL links remain usable.

## Try it

1. Open the Infinite Commons GitHub Pages experience after this PR merges, and select **REEL HOUSE**.
2. Press **Enter REEL House**. In the venue, choose a seat, then press **Load CC0 demo** to select the genuine MDN sample, or choose an authorized local video. Press play on the browser video controls.
3. Watch the same user-selected media projected onto the model's screen. If 3D is unavailable, use the accessible HTML video directly.
4. With a WebXR-capable headset, start playback in the HTML player if desired, then press **Enter headset VR**. Native VR player controls, teleport and social co-viewing are **not** implemented in this rung.
5. Press **Leave REEL House** to unmount the scene, stop playback and release selected local-file URLs. More Bounce and original Commons destinations remain unchanged.

## Integrity, copyright and scope

- The demo source is explicitly identified as a CC0 browser sample, not a full-length film, an original REEL episode, or user-authorized REEL Network programming. Network delivery of it depends on availability/CORS/device codec support.
- Local-file type and size screening is only a browser UX boundary, not malware inspection or proof of ownership.
- **This is not a live multi-visitor screening.** There are no avatars, synchronized clocks, chat, network sessions, rights claims, public broadcasts, or REEL Network channel data APIs in Rung 1.
- Existing Commons semantic node IDs, local Porch boundaries, and More Bounce interfaces are untouched.
- Future bridge: a reviewed read-only screening manifest from ReelCommons with explicit media rights, approved playable URL, cache policy, and a sync protocol separate from the venue implementation. No untrusted URL or authority should be accepted from arbitrary postMessage events.

## Validation

Run `npm test --prefix apps/commons-react`, `npm run build --prefix apps/commons-react`, and `npm run test:browser --prefix apps/commons-react`. Real Quest 3 video texture / codec / immersive VR must be tested on hardware; automated Chromium checks are not proof of headset support.
