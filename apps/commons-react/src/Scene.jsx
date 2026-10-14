import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import trustedSceneHtml from "../../../web/index.html?raw";

const LivingCity = lazy(() => import("./LivingCity.jsx"));

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

export function Scene({ scene, onVisit, styleId = "midnight-sierra" }) {
  const [threeRequested, setThreeRequested] = useState(false);
  const [vista, setVista] = useState("shasta");
  const [arrayMode, setArrayMode] = useState("beacon");
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
      setThreeNotice("WebGL 2 unavailable. The painted Commons remains fully usable.");
      setThreeRequested(false);
      return;
    }
    setThreeNotice("WebGL 2 visual-only preview. No new Commons locations or permissions.");
    setVista(nextVista);
    setThreeRequested(true);
  };
  const returnToPainted = () => {
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
        </div>
      )}
      <div className="scene-render-controls" role="group" aria-label="Choose the Midnight Sierra display mode">
        {availableForStyle && (active3D ? (
          <>
            <button type="button" className="render-toggle" onClick={() => setVista(vista === "shasta" ? "city" : "shasta")}>
              {vista === "shasta" ? "◇ Legacy Living City" : "△ Sisters of Shasta"}
            </button>
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
          </>
        ))}
        {threeNotice && <span className="scene-render-note" role="status">{threeNotice}</span>}
      </div>
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
        <span className="ambient-note">{active3D && vista === "shasta" ? "Three · Six · Nine · Root Temple · Trihelion · Bloomforge · Visual preview only" : "A thousand windows. A thousand stories."}</span>
      </div>
    </div>
  );
}
