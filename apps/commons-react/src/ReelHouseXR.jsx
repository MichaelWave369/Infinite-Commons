import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { LinearFilter, SRGBColorSpace, VideoTexture } from "three";
import {
  REEL_HOUSE_WORLD_ID, REEL_NETWORK_URL, REEL_THEATER_URL,
  DEMO_VIDEO_URL, SEATS, seatById, validateLocalVideo
} from "./reelHouseModel.mjs";
import "./reel-house.css";

function ProjectedScreen({ videoElement, active }) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    if (!videoElement) return;
    const next = new VideoTexture(videoElement);
    next.colorSpace = SRGBColorSpace;
    next.minFilter = LinearFilter;
    setTexture(next);
    return () => { next.dispose(); setTexture(null); };
  }, [videoElement]);
  return (
    <group position={[0, 3.8, -9.06]}>
      <mesh position={[0, 0, -0.16]}>
        <boxGeometry args={[11.25, 6.5, 0.18]} />
        <meshStandardMaterial color="#5d3147" metalness={0.4} roughness={0.52} />
      </mesh>
      <mesh>
        <planeGeometry args={[10.5, 5.92]} />
        {active && texture
          ? <meshBasicMaterial map={texture} toneMapped={false} />
          : <meshBasicMaterial color="#09243a" toneMapped={false} />}
      </mesh>
      {[-5.48, 5.48].map(x => (
        <mesh key={x} position={[x, 0, 0.1]}>
          <boxGeometry args={[0.24, 6.4, 0.15]} />
          <meshStandardMaterial color="#922d46" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function CinemaSeat({ seat, selected, choose }) {
  return (
    <group position={[seat.x, 0, seat.z]} onClick={event => { event.stopPropagation(); choose(seat.id); }}>
      <mesh position={[0, 0.7, 0.27]}>
        <boxGeometry args={[1.18, 1.25, 0.25]} />
        <meshStandardMaterial color={selected ? "#edbb75" : "#77263e"} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.43, -0.1]}>
        <boxGeometry args={[1.1, 0.25, 0.82]} />
        <meshStandardMaterial color={selected ? "#f3c88b" : "#a83f59"} roughness={0.84} />
      </mesh>
      {[-0.63, 0.63].map(x => (
        <mesh key={x} position={[x, 0.55, 0.05]}>
          <boxGeometry args={[0.12, 0.55, 0.85]} />
          <meshStandardMaterial color="#422e41" metalness={0.22} />
        </mesh>
      ))}
    </group>
  );
}

function SeatCamera({ seatId }) {
  const { camera, gl } = useThree();
  useEffect(() => {
    if (gl.xr.isPresenting) return;
    const seat = seatById(seatId);
    if (seat) camera.position.set(seat.x, 1.68, seat.z - 0.18);
    else camera.position.set(0, 2.9, 8.75);
    camera.lookAt(0, 3.05, -9.1);
    camera.updateProjectionMatrix();
  }, [seatId, camera, gl]);
  return null;
}

function HeadsetEntry({ entryRef, setNotice }) {
  const { gl } = useThree();
  const activeSession = useRef(null);
  useEffect(() => {
    gl.xr.enabled = true;
    gl.xr.setReferenceSpaceType("local-floor");
    entryRef.current = async () => {
      try {
        if (!navigator.xr) throw new Error("WebXR is not supported on this device.");
        const session = await navigator.xr.requestSession("immersive-vr", {
          optionalFeatures: ["local-floor"]
        });
        activeSession.current = session;
        await gl.xr.setSession(session);
        setNotice("Headset screening view active. Playback uses the desktop player controls in Rung 1.");
        session.addEventListener("end", () => {
          activeSession.current = null;
          setNotice("Headset session ended. Desktop cinema remains available.");
        }, { once: true });
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Could not enter WebXR.");
      }
    };
    return () => {
      entryRef.current = null;
      const session = activeSession.current;
      activeSession.current = null;
      if (session) session.end().catch(() => {});
    };
  }, [gl, entryRef, setNotice]);
  return null;
}

function CinemaWorld({ videoElement, hasMedia, seatId, chooseSeat, entryRef, setNotice }) {
  return (
    <>
      <color attach="background" args={["#080b1d"]} />
      <fog attach="fog" args={["#080b1d", 19, 31]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[-6, 4, 0]} color="#ef906c" intensity={28} distance={15} />
      <pointLight position={[6, 4, 0]} color="#8a71df" intensity={23} distance={15} />
      <spotLight position={[0, 7.5, 2]} angle={0.6} intensity={30} penumbra={0.8} color="#ffdda6" />
      <SeatCamera seatId={seatId} />
      <HeadsetEntry entryRef={entryRef} setNotice={setNotice} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <planeGeometry args={[19, 22]} />
        <meshStandardMaterial color="#1d1c32" roughness={0.95} />
      </mesh>
      <mesh position={[0, 4.5, -9.7]}>
        <boxGeometry args={[19, 9, 0.4]} />
        <meshStandardMaterial color="#2b1833" />
      </mesh>
      {[-9, 9].map(x => (
        <group key={x}>
          <mesh position={[x, 4.4, 0]}>
            <boxGeometry args={[0.2, 8.8, 21]} />
            <meshStandardMaterial color="#251c35" />
          </mesh>
          {[-5, 0, 5].map(z => (
            <mesh key={z} position={[x * 0.987, 3.4, z]}>
              <boxGeometry args={[0.19, 2.2, 0.28]} />
              <meshBasicMaterial color="#c57a53" />
            </mesh>
          ))}
        </group>
      ))}
      {[-6.3, 6.3].map(x => (
        <group key={x} position={[x, 3.8, -9.0]}>
          <mesh><boxGeometry args={[1.24, 7.6, 0.3]} /><meshStandardMaterial color="#5c1733" /></mesh>
          {[-0.35, 0, 0.35].map(dx => (
            <mesh key={dx} position={[dx, 0, 0.2]}>
              <boxGeometry args={[0.12, 7.1, 0.1]} /><meshStandardMaterial color="#ba4967" />
            </mesh>
          ))}
        </group>
      ))}
      <ProjectedScreen videoElement={videoElement} active={hasMedia} />
      {SEATS.map(seat => (
        <CinemaSeat key={seat.id} seat={seat} selected={seat.id === seatId} choose={chooseSeat} />
      ))}
      {[-5.4, 5.4].map(x => (
        <mesh key={x} position={[x, 0.012, 1.6]}>
          <boxGeometry args={[0.055, 0.02, 15]} />
          <meshBasicMaterial color="#d39462" />
        </mesh>
      ))}
    </>
  );
}

class TheaterGraphicsBoundary extends React.Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="reel-house-no-3d" role="status">
      WebGL is unavailable. The standard video player and REEL links below still work.
    </div>;
    return this.props.children;
  }
}

export function ReelHouseXR({ onLeave }) {
  const [videoElement, setVideoElement] = useState(null);
  const [mediaSrc, setMediaSrc] = useState("");
  const [mediaLabel, setMediaLabel] = useState("No movie selected");
  const [notice, setNotice] = useState("Choose the public-domain demo or a local video to start. Nothing plays automatically.");
  const [seatId, setSeatId] = useState(null);
  const [canXR, setCanXR] = useState(false);
  const localUrl = useRef(null);
  const entryRef = useRef(null);
  const fileRef = useRef(null);
  const releaseLocal = useCallback(() => {
    if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    localUrl.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    navigator.xr?.isSessionSupported?.("immersive-vr")
      .then(supported => { if (!cancelled) setCanXR(Boolean(supported)); })
      .catch(() => { if (!cancelled) setCanXR(false); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!videoElement) return;
    videoElement.pause();
    videoElement.removeAttribute("src");
    videoElement.load();
    if (mediaSrc) {
      videoElement.src = mediaSrc;
      videoElement.load();
    }
  }, [videoElement, mediaSrc]);
  useEffect(() => () => {
    videoElement?.pause();
    releaseLocal();
  }, [videoElement, releaseLocal]);

  const chooseDemo = () => {
    releaseLocal();
    setMediaSrc(DEMO_VIDEO_URL);
    setMediaLabel("MDN CC0 flower sample");
    setNotice("Public-domain video selected. Press play in the browser player. Network access and video CORS support are device-dependent.");
  };
  const chooseLocal = event => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    const error = validateLocalVideo(file);
    if (error) { setNotice(error); return; }
    releaseLocal();
    localUrl.current = URL.createObjectURL(file);
    setMediaSrc(localUrl.current);
    setMediaLabel(file.name.slice(0, 100));
    setNotice("Local video selected. It stays in this browser tab and is not uploaded or broadcast.");
  };
  const reset = () => {
    releaseLocal();
    setMediaSrc("");
    setMediaLabel("No movie selected");
    setNotice("Player cleared. Nothing is being streamed.");
    if (fileRef.current) fileRef.current.value = "";
  };
  return (
    <section id="reel-house" className="reel-house" aria-label="REEL House cinema venue">
      <div className="reel-house-heading">
        <div>
          <p className="reel-house-kicker">INFINITE COMMONS · ENTERTAINMENT DISTRICT · RUNG 1</p>
          <h2>REEL HOUSE <em>XR</em></h2>
          <p>Take a seat in the Commons cinema. REEL Network curates the stories; this room gives them a place to shine.</p>
        </div>
      </div>
      <div className="reel-house-actions">
        <button type="button" onClick={() => entryRef.current?.()} disabled={!canXR}>
          {canXR ? "Enter headset VR" : "Headset VR unavailable · Desktop preview"}
        </button>
        <a href={REEL_NETWORK_URL} target="_blank" rel="noopener noreferrer">Open REEL Network ↗</a>
        <a href={REEL_THEATER_URL} target="_blank" rel="noopener noreferrer">Open standalone REEL Theater ↗</a>
        <button type="button" onClick={onLeave}>Leave REEL House</button>
      </div>
      <div className="reel-house-viewport" aria-label="3D cinema auditorium">
        <TheaterGraphicsBoundary>
          <Canvas camera={{ position: [0, 2.9, 8.75], fov: 61 }} dpr={[1, 1.5]}
            gl={{ antialias: true, powerPreference: "high-performance" }}>
            <CinemaWorld videoElement={videoElement} hasMedia={Boolean(mediaSrc)} seatId={seatId}
              chooseSeat={setSeatId} entryRef={entryRef} setNotice={setNotice} />
          </Canvas>
        </TheaterGraphicsBoundary>
      </div>
      <div className="reel-house-seating" aria-label="Cinema seats">
        <div className="reel-house-minor-head">
          <strong>Choose a desktop viewing seat</strong>
          <span>{seatId ? "Selected: " + seatById(seatId)?.label : "Lobby camera selected"}</span>
        </div>
        <div className="reel-house-seat-grid">
          {SEATS.map(seat => <button key={seat.id} type="button" aria-pressed={seatId === seat.id}
            onClick={() => setSeatId(seat.id)} title={seat.label} aria-label={seat.label}>
            {seat.id.split("-").at(-1)}
          </button>)}
        </div>
        <button type="button" className="reel-house-reset-seat" onClick={() => setSeatId(null)}>Back to lobby view</button>
      </div>
      <div className="reel-house-player">
        <div className="reel-house-minor-head">
          <strong>Screening player · local controls</strong>
          <span>{mediaLabel}</span>
        </div>
        <div className="reel-house-media-actions">
          <button type="button" onClick={chooseDemo}>Load CC0 demo</button>
          <button type="button" onClick={() => fileRef.current?.click()}>Choose local video</button>
          <button type="button" onClick={reset} disabled={!mediaSrc}>Clear screen</button>
          <input ref={fileRef} type="file" hidden accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogv"
            aria-label="Choose a local authorized movie file" onChange={chooseLocal} />
        </div>
        <video ref={setVideoElement} controls playsInline preload="metadata" crossOrigin="anonymous"
          aria-label="REEL House screening player" onError={() => setNotice("Playback failed or this video format/source is blocked. Try an authorized local MP4 or WebM file.")} />
        <p role="status" className="reel-house-status">{notice}</p>
      </div>
      <div className="reel-house-foot">
        <p><strong>Rung 1 preview.</strong> This is not a live multi-visitor screening. No synchronized audience,
          avatars, network broadcast, REEL Network channel feed or media rights approval is connected.
          Start playback using the player before entering VR; headset transport controls are not implemented yet.</p>
        <p>Venue ID: <code>{REEL_HOUSE_WORLD_ID}</code>. Nothing auto-uploads, autoplays or tracks viewers.</p>
      </div>
    </section>
  );
}
export default ReelHouseXR;
