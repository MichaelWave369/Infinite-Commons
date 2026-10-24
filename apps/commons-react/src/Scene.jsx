import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import trustedSceneHtml from "../../../web/index.html?raw";
import { PORTALS } from "./commonsPortalRegistry.mjs";

const LivingCity = lazy(() => import("./LivingCity.jsx"));
const HeritageArchiveDialog = lazy(() => import("./HeritageArchiveDialog.jsx"));

export function canUseWebGL2() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2", { powerPreference: "low-power" }));
  } catch {
    return false;
  }
}

function drawCity(svg) {
  const ns = "http://www.w3.org/2000/svg";
  const buildings = svg.querySelector("#city-buildings");
  const lights = svg.querySelector("#city-lights");
  if (!buildings || !lights) throw new Error("Commons scene is missing its city layers");
  const rect = (x, y, width, height, fill, opacity = 1) => {
    const element = document.createElementNS(ns, "rect");
    for (const [key, value] of Object.entries({ x, y, width, height, fill, opacity })) {
      element.setAttribute(key, String(value));
    }
    return element;
  };
  for (let band = 0; band < 8; band += 1) {
    const y = 416 + band * 39;
    for (let column = 0; column < 25; column += 1) {
      const x = 400 + column * 37 + (band % 2) * 10;
      const tall = 4 + ((column * 13 + band * 7) % 21);
      buildings.append(rect(x, y - tall, 19 + band * 2, tall + 7,
        band % 3 === 0 ? "#061a2b" : "#0a2239", 0.62));
    }
  }
  let state = 369;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 650; index += 1) {
    const x = 362 + random() * 837;
    const y = 400 + random() * 320;
    const size = 0.7 + y / 720 * 2.2 * random();
    fragment.append(rect(x.toFixed(2), y.toFixed(2), (size * 1.45).toFixed(2),
      size.toFixed(2), y < 500 ? "#ffe3a4" : "#ffb369",
      0.44 + Math.min(0.52, y / 1400)));
  }
  lights.append(fragment);
}

function PaintedScene() {
  const drawing = useRef(null);
  useEffect(() => {
    const container = drawing.current;
    const parsed = new DOMParser().parseFromString(trustedSceneHtml, "text/html");
    const source = parsed.querySelector("svg.vista");
    if (!source || !container) throw new Error("Reviewed Commons scene unavailable");
    const svg = document.importNode(source, true);
    drawCity(svg);
    container.replaceChildren(svg);
    return () => container.replaceChildren();
  }, []);
  return (
    <div className="react-scene-drawing" ref={drawing}
      role="img" aria-label="Painted modernist terrace with amber doorway overlooking the blue-hour Commons" />
  );
}

class ThreeBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? <PaintedScene /> : this.props.children;
  }
}

export function Scene({ scene, onVisit, onPortalPreview, styleId = "midnight-sierra" }) {
  const [threeRequested, setThreeRequested] = useState(false);
  const [vista, setVista] = useState("shasta");
  const [arrayMode, setArrayMode] = useState("beacon");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [threeNotice, setThreeNotice] = useState("");
  const [reducedMotion, setReducedMotion] = useState(() => {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch { return false; }
  });
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener?.("change", update);
    return () => preference.removeEventListener?.("change", update);
  }, []);

  const availableForStyle = styleId === "midnight-sierra";
  const active3D = availableForStyle && threeRequested;
  const use3D = (nextVista) => {
    if (!canUseWebGL2()) {
      setThreeNotice("WebGL 2 unavailable. The painted Commons and HTML portal previews remain fully usable.");
      setThreeRequested(false);
      return;
    }
    setThreeNotice(nextVista === "portals"
      ? "Four original story portals rendered as visual sculptures. Native HTML buttons open the same in-page previews. No live game transfer."
      : "WebGL 2 visual-only preview. No new Commons locations or permissions.");
    setVista(nextVista);
    setArchiveOpen(false);
    setThreeRequested(true);
  };
  const returnToPainted = () => {
    setArchiveOpen(false);
    setThreeRequested(false);
    setThreeNotice("Painted adventure view restored.");
  };

  return (
    <div className="scene-frame" data-scene={scene}
      data-renderer={active3D ? "webgl2" : "painted"}>
      {active3D ? (
        <ThreeBoundary key={styleId} onError={returnToPainted}>
          <Suspense fallback={<div className="scene-loading" role="status">Painting the 3D horizon…</div>}>
            <LivingCity reducedMotion={reducedMotion} onError={returnToPainted} vista={vista} arrayMode={arrayMode} />
          </Suspense>
        </ThreeBoundary>
      ) : <PaintedScene />}
      <div className="scene-vignette" aria-hidden="true" />
      {active3D && vista === "shasta" && archiveOpen && (
        <Suspense fallback={null}>
          <HeritageArchiveDialog onClose={() => setArchiveOpen(false)} />
        </Suspense>
      )}
      {active3D && vista === "shasta" && (
        <div className="third-light-operator" aria-label="Third Light Array simulation controls">
          <span>THE THIRD LIGHT ARRAY · FICTIONAL SKY PROJECTION</span>
          <button type="button" className="third-light-button" aria-pressed={arrayMode === "signal"}
            onClick={() => setArrayMode(mode => mode === "beacon" ? "signal" : "beacon")}>
            {arrayMode === "beacon" ? "✧ Activate Signal Halo" : "✧ Return to Quiet Beacon"}
          </button>
          <button type="button" className="third-light-button"
            aria-pressed={arrayMode === "constellation"}
            onClick={() => setArrayMode(mode => mode === "constellation" ? "beacon" : "constellation")}>
            {arrayMode === "constellation" ? "✧ Close Constellation" : "✧ Show Constellation"}
          </button>
          {arrayMode === "constellation" && (
            <span role="status">ORION-INSPIRED ART · NOT A HISTORICAL SKY RECONSTRUCTION</span>
          )}
          <button type="button" className="third-light-button"
            aria-haspopup="dialog" onClick={() => setArchiveOpen(true)}>
            ◇ Explore Heritage Archive
          </button>
        </div>
      )}
      <div className="scene-render-controls" role="group" aria-label="Choose the Midnight Sierra display mode">
        {availableForStyle && (active3D ? (
          <>
            <button type="button" className="render-toggle" aria-pressed={vista === "shasta"}
              onClick={() => use3D("shasta")}>△ Shasta</button>
            <button type="button" className="render-toggle" aria-pressed={vista === "city"}
              onClick={() => use3D("city")}>◇ Living City</button>
            <button type="button" className="render-toggle" aria-pressed={vista === "portals"}
              onClick={() => use3D("portals")}>◎ Portal Courtyard</button>
            <button type="button" className="render-toggle" onClick={returnToPainted}>
              ◧ Return to Painted View
            </button>
          </>
        ) : (
          <>
            <button type="button" className="render-toggle" onClick={() => use3D("shasta")}>
              △ Explore Shasta Campus 3D
            </button>
            <button type="button" className="render-toggle" onClick={() => use3D("city")}>
              ◈ Explore Living City 3D
            </button>
            <button type="button" className="render-toggle" onClick={() => use3D("portals")}>
              ◎ Explore Portal Courtyard 3D
            </button>
          </>
        ))}
        {threeNotice && <span className="scene-render-note" role="status">{threeNotice}</span>}
      </div>
      {active3D && vista === "portals" && (
        <div className="portal-3d-operator" role="group" aria-label="Explore the four original story gateways">
          <strong>THE LIVING PORTAL COURTYARD</strong>
          <span>Visual sculptures · original story windows only</span>
          <div className="portal-3d-gates">
            {PORTALS.map(portal => (
              <button type="button" key={portal.id}
                onClick={() => onPortalPreview?.(portal.id)}
                aria-label={"Open " + portal.name + " story preview from 3D courtyard"}>
                <span aria-hidden="true" style={{ color: portal.color }}>{portal.symbol}</span>
                {portal.name}
              </button>
            ))}
          </div>
          <a href="#roundtable-hall">Visit the Grand Roundtable ↓</a>
        </div>
      )}
      <button className="hotspot hotspot-door" type="button"
        aria-label="Open the example or locally selected PhiSpace"
        onClick={() => onVisit("phispace.example")}>↗ <span>PHISPACE</span></button>
      {active3D && (
        <button className="hotspot hotspot-radio" type="button"
          aria-label="Tune the fictional Midnight Radio"
          onClick={() => onVisit("midnight.radio")}>♫ <span>TUNE RADIO</span></button>
      )}
      <button className="hotspot hotspot-bbs" type="button"
        aria-label="Visit offline sample BBS Lounge"
        onClick={() => onVisit("commons.bbs")}>⌘ <span>BBS LOUNGE</span></button>
      <button className="hotspot hotspot-city" type="button"
        aria-label="Visit offline sample Commons Promenade"
        onClick={() => onVisit("commons.plaza")}>◇ <span>THE COMMONS</span></button>
      <div className="scene-caption">
        <span className="location-pin">◉ COMMONS / ARRIVAL TERRACE</span>
        <span className="ambient-note">{active3D && vista === "portals" ? "Four story worlds · The nested Roundtable beacon · Visual preview only" : active3D && vista === "shasta" ? "Three · Six · Nine · Root Temple · Trihelion · Bloomforge · Visual preview only" : "A thousand windows. A thousand stories."}</span>
      </div>
    </div>
  );
}
