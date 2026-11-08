import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Quaternion, Raycaster, Vector3 } from "three";
import { BACKSPIN_URL, MORE_BOUNCE_ORIGIN, XR_CHANNEL, XR_VERSION, COMMONS_VENUE_ID,
  makeXRCommand, mayConnectBooth, validBoothReply } from "./moreBounceProtocol.mjs";
import "./more-bounce.css";

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function XRControllerActions({ send, enterRef, setNotice }) {
  const { gl, scene } = useThree();
  const held = useRef(new Map());
  const raycaster = useRef(new Raycaster());
  const origin = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const rotation = useRef(new Quaternion());
  const point = useRef(new Vector3());

  useEffect(() => {
    gl.xr.enabled = true;
    gl.xr.setReferenceSpaceType("local-floor");
    const enter = async () => {
      try {
        if (!navigator.xr) throw new Error("WebXR is not supported by this browser.");
        const session = await navigator.xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor"] });
        await gl.xr.setSession(session);
        setNotice("VR venue open. Aim a controller and press trigger. Audio remains in the opt-in Backspin booth.");
        session.addEventListener("end", () => setNotice("Returned from VR. The Backspin booth stays mounted."));
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Unable to enter VR on this device.");
      }
    };
    enterRef.current = enter;
    const controllers = [gl.xr.getController(0), gl.xr.getController(1)];
    function pick(controller) {
      controller.updateMatrixWorld();
      controller.getWorldPosition(origin.current);
      controller.getWorldQuaternion(rotation.current);
      direction.current.set(0, 0, -1).applyQuaternion(rotation.current).normalize();
      raycaster.current.set(origin.current, direction.current);
      return raycaster.current.intersectObjects(scene.children, true)
        .find((hit) => hit.object.userData.xrAction)?.object.userData;
    }
    const onStarts = controllers.map((controller) => () => {
      const control = pick(controller);
      if (!control) return;
      if (control.xrAction === "platter") {
        controller.getWorldPosition(point.current);
        held.current.set(controller, { deck: control.xrDeck, lastX: point.current.x,
          lastAt: performance.now(), moved: false });
      } else if (control.xrAction === "cue") send("cue", { deck: control.xrDeck });
      else if (control.xrAction === "crossfade") send("crossfade", { value: control.xrValue });
    });
    const onEnds = controllers.map((controller) => () => {
      const value = held.current.get(controller);
      if (!value) return;
      held.current.delete(controller);
      if (value.moved) send("release", { deck: value.deck });
      else send("play", { deck: value.deck });
    });
    controllers.forEach((controller, index) => {
      scene.add(controller);
      controller.addEventListener("selectstart", onStarts[index]);
      controller.addEventListener("selectend", onEnds[index]);
    });
    return () => {
      enterRef.current = null;
      controllers.forEach((controller, index) => {
        controller.removeEventListener("selectstart", onStarts[index]);
        controller.removeEventListener("selectend", onEnds[index]);
        scene.remove(controller);
      });
      held.current.clear();
    };
  }, [gl, scene, send, enterRef, setNotice]);

  useFrame(() => {
    if (!gl.xr.isPresenting) return;
    for (const [controller, value] of held.current) {
      controller.getWorldPosition(point.current);
      const now = performance.now();
      const delta = point.current.x - value.lastX;
      const dt = Math.max(0.008, (now - value.lastAt) / 1000);
      value.lastX = point.current.x;
      value.lastAt = now;
      if (Math.abs(delta) > 0.002 && now - (value.lastSent || 0) > 32) {
        value.moved = true;
        value.lastSent = now;
        send("scratch", { deck: value.deck, value: clamp((delta / dt) * 2.2, -4, 4) });
      }
    }
  });
  return null;
}

function Platter({ deck, x, send }) {
  return (
    <group position={[x, 1.05, -2.3]}>
      <mesh position={[0, -0.12, 0]} castShadow>
        <boxGeometry args={[1.45, 0.22, 1.4]} />
        <meshStandardMaterial color="#202538" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}
        userData={{ xrAction: "platter", xrDeck: deck }}
        onClick={() => send("play", { deck })}>
        <cylinderGeometry args={[0.54, 0.54, 0.055, 64]} />
        <meshStandardMaterial color="#10121d" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.01, 32]} />
        <meshStandardMaterial color={deck === "A" ? "#15d6fa" : "#f782ca"} emissive={deck === "A" ? "#025d75" : "#85245e"} />
      </mesh>
      <mesh position={[0.46, 0.06, 0.53]} userData={{ xrAction: "cue", xrDeck: deck }}
        onClick={() => send("cue", { deck })}>
        <boxGeometry args={[0.19, 0.09, 0.18]} />
        <meshStandardMaterial color="#fabb65" emissive="#925018" />
      </mesh>
    </group>
  );
}

function ClubWorld({ send, enterRef, setNotice }) {
  return (
    <>
      <XRControllerActions send={send} enterRef={enterRef} setNotice={setNotice} />
      <color attach="background" args={["#080b1a"]} />
      <fog attach="fog" args={["#080b1a", 12, 25]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[-3.5, 4, -2]} intensity={45} color="#ff45c6" distance={14} />
      <pointLight position={[3.5, 4, -2]} intensity={45} color="#32c6ff" distance={14} />
      <spotLight position={[0, 5, 1]} angle={0.65} penumbra={0.8} intensity={50} color="#ffe0b2" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, -2.3]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#12142a" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.24, -3.5]}>
        <boxGeometry args={[8.5, 0.48, 3.3]} />
        <meshStandardMaterial color="#26213c" roughness={0.62} />
      </mesh>
      <mesh position={[0, 2.7, -5.1]}>
        <boxGeometry args={[11, 5.4, 0.15]} />
        <meshStandardMaterial color="#0d132d" />
      </mesh>
      {[-4.2, 4.2].map(x => (
        <group key={x} position={[x, 1.75, -3.85]}>
          <mesh><boxGeometry args={[1.0, 2.7, 0.9]} /><meshStandardMaterial color="#151526" metalness={0.3}/></mesh>
          {[0.6, -0.65].map(y => <mesh key={y} position={[0, y, 0.47]}>
            <circleGeometry args={[0.35, 32]} /><meshStandardMaterial color="#151824" emissive="#09263a" />
          </mesh>)}
        </group>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(col - 1.5) * 1.7, 0.005, 1.0 + row * 1.6]}>
          <planeGeometry args={[1.59, 1.48]} />
          <meshStandardMaterial color={(col + row) % 2 ? "#132e4b" : "#31214b"}
            emissive={(col + row) % 2 ? "#06213a" : "#220a31"} />
        </mesh>;
      })}
      <mesh position={[0, 0.92, -2.3]}>
        <boxGeometry args={[1.1, 0.2, 1.25]} />
        <meshStandardMaterial color="#26203b" metalness={0.45} />
      </mesh>
      {[-0.32, 0, 0.32].map((x, i) =>
        <mesh key={i} position={[x, 1.1, -2.15]}
          userData={{ xrAction: "crossfade", xrValue: i - 1 }}
          onClick={() => send("crossfade", { value: i - 1 })}>
          <boxGeometry args={[0.19, 0.12, 0.21]} />
          <meshStandardMaterial color={i === 1 ? "#fcba58" : "#28cfff"} emissive={i === 1 ? "#543413" : "#05344a"} />
        </mesh>)}
      <Platter deck="A" x={-1.45} send={send} />
      <Platter deck="B" x={1.45} send={send} />
      {[-5.0, 5.0].map(x => <mesh key={x} position={[x, 2.2, -3.2]}>
        <boxGeometry args={[0.16, 3.7, 0.16]} />
        <meshStandardMaterial color="#6c3ac7" emissive="#5627b4" emissiveIntensity={1.5} />
      </mesh>)}
      {[ -1, 0, 1 ].map((i) => <group key={i} position={[3.8 + i * 0.9, 0.75, 1.4]}>
        <mesh><boxGeometry args={[0.7, 1.5, 0.72]} /><meshStandardMaterial color="#1d233d" /></mesh>
        <mesh position={[0, 0.25, 0.37]}><planeGeometry args={[0.52, 0.6]} />
          <meshBasicMaterial color={i === 0 ? "#f581c8" : "#3fdbda"} /></mesh>
      </group>)}
    </>
  );
}

// Never take the wider Commons down because a device cannot allocate WebGL.
class ClubGraphicsBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <p role="status" className="more-bounce-note">
      WebGL is unavailable here. The original Backspin booth and desktop controls remain accessible below.
    </p>;
    return this.props.children;
  }
}

export function MoreBounceXR() {
  const [show, setShow] = useState(false);
  const [boothLoaded, setBoothLoaded] = useState(false);
  const [boothRequested, setBoothRequested] = useState(false);
  const [canXR, setCanXR] = useState(false);
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [notice, setNotice] = useState("Venue preview only. Music begins only in the opt-in original Backspin booth.");
  const booth = useRef(null);
  const enter = useRef(null);
  const originReady = typeof window !== "undefined" && mayConnectBooth(window.location.origin);
  const send = useCallback((type, payload = {}) => {
    const value = makeXRCommand(type, payload);
    if (!value || !booth.current?.contentWindow || !mayConnectBooth(window.location.origin)) return false;
    booth.current.contentWindow.postMessage(value, MORE_BOUNCE_ORIGIN);
    return true;
  }, []);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    navigator.xr?.isSessionSupported?.("immersive-vr")
      .then(ok => { if (!cancelled) setCanXR(ok); })
      .catch(() => { if (!cancelled) setCanXR(false); });
    return () => { cancelled = true; };
  }, [show]);

  useEffect(() => {
    if (!show || !originReady) return;
    const onMessage = (event) => {
      if (event.source !== booth.current?.contentWindow || !validBoothReply(event.origin, event.data)) return;
      if (event.data.type === "hello") {
        setConnected(true);
        setEnabled(Boolean(event.data.enabled));
      } else if (event.data.type === "snapshot" && event.data.snapshot) {
        setSnapshot(event.data.snapshot);
      } else if (event.data.type === "blocked") {
        setNotice(String(event.data.reason || "Backspin denied the command."));
      }
    };
    window.addEventListener("message", onMessage);
    const timer = window.setInterval(() => {
      if (boothLoaded) {
        send("hello");
        send("snapshot");
      }
    }, 1200);
    if (boothLoaded) send("hello");
    return () => { window.removeEventListener("message", onMessage); window.clearInterval(timer); };
  }, [show, boothLoaded, send, originReady]);

  return (
    <section id="more-bounce-club" className="more-bounce-venue" aria-label="More Bounce experimental club">
      <div className="more-bounce-head">
        <div>
          <p className="more-bounce-kicker">INFINITE COMMONS · EXPERIMENTAL VENUE / RUNG 1</p>
          <h2>MORE BOUNCE <em>XR</em></h2>
          <p>The interdimensional funk club. Original Backspin '96 decks meet a walk-in 3D room.</p>
        </div>
        {!show && <button type="button" onClick={() => setShow(true)}>Enter the club</button>}
      </div>
      {show && (
        <>
          <div className="more-bounce-actions">
            <button type="button" onClick={() => enter.current?.()} disabled={!canXR}>
              {canXR ? "Enter Quest / WebXR" : "WebXR unavailable · Desktop view"}
            </button>
            <a href={BACKSPIN_URL} target="_blank" rel="noopener noreferrer">Open original Backspin '96 ↗</a>
            <button type="button" onClick={() => {
              setShow(false); setBoothRequested(false); setBoothLoaded(false); setSnapshot(null); setConnected(false); setEnabled(false);
            }}>Leave the venue</button>
          </div>
          <div className="more-bounce-viewport">
            <ClubGraphicsBoundary>
              <Canvas camera={{ position: [0, 2.45, 5.8], fov: 63 }} dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: "high-performance" }}>
                <ClubWorld send={send} enterRef={enter} setNotice={setNotice} />
              </Canvas>
            </ClubGraphicsBoundary>
          </div>
          <p className="more-bounce-note" role="status">{notice}</p>
          <p className="more-bounce-note">
            Desktop: click turntables for Play/Pause and colored buttons for Cue or cuts.
            In VR: trigger a platter to play, or hold the trigger and move sideways to scratch;
            trigger the cue and crossfade pads. These controls only work after you enable
            Commons XR control inside the embedded Backspin booth and initialize its audio.
          </p>
          <div className="more-bounce-controls">
            <p><strong>Backspin connection:</strong> {!originReady ? "Standalone studio only; live bridge requires the canonical GitHub Pages origin."
              : connected ? (enabled ? "XR controls permitted for this session" : "Connected; opt-in required inside Backspin")
              : "Awaiting embedded Backspin"}. <strong>Audio:</strong> {snapshot?.ready ? "Initialized" : "Not initialized"}.</p>
            <div className="more-bounce-buttons" role="group" aria-label="Backspin battle controls">
              {["A", "B"].map(deck => <React.Fragment key={deck}>
                <button type="button" disabled={!enabled || !snapshot?.ready} onClick={() => send("play", { deck })}>Play/Pause {deck}</button>
                <button type="button" disabled={!enabled || !snapshot?.ready} onClick={() => send("cue", { deck })}>Cue {deck}</button>
              </React.Fragment>)}
              {[-1, 0, 1].map(value => <button type="button" key={value} disabled={!enabled || !snapshot?.ready}
                onClick={() => send("crossfade", { value })}>{value < 0 ? "Cut A" : value > 0 ? "Cut B" : "Center"}</button>)}
            </div>
          </div>
          <div className="more-bounce-booth">
            <h3>Original Backspin '96 performance controls</h3>
            <p>Import your own authorized tracks, press Start Dual Audio and tick the optional Commons XR checkbox here. The real audio engine remains in MoreBounceLabs.</p>
            {originReady ? (
              boothRequested ? (
                <iframe ref={booth} title="Artist-owned Backspin '96 DJ booth" src={BACKSPIN_URL}
                  loading="eager" allow="autoplay; fullscreen" onLoad={() => setBoothLoaded(true)} />
              ) : <button type="button" onClick={() => setBoothRequested(true)}>
                Load original Backspin booth (user initiated)
              </button>
            ) : <a href={BACKSPIN_URL} target="_blank" rel="noopener noreferrer">Use the standalone DJ booth on its canonical site</a>}
          </div>
        </>
      )}
      <p className="more-bounce-disclaimer">World ID: {COMMONS_VENUE_ID}. Single visitor prototype.
        No live avatars, guests, public audio broadcast, agent performers or private Porch access.
        WebXR is optional. The original Commons semantic nodes and permissions are unchanged.</p>
    </section>
  );
}

export default MoreBounceXR;
