import { useEffect, useRef } from "react";
import trustedSceneHtml from "../../../web/index.html?raw";

/**
 * Existing, reviewed Commons illustration is the single art source of truth.
 * Clone ONLY the repository-owned svg.vista node; never parse user content
 * or inject an untrusted theme's HTML.
 */
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

export function Scene({ scene, onVisit }) {
  const drawing = useRef(null);
  useEffect(() => {
    const container = drawing.current;
    const parsed = new DOMParser().parseFromString(trustedSceneHtml, "text/html");
    const source = parsed.querySelector("svg.vista");
    if (!source || !container) throw new Error("Reviewed Commons scene unavailable");
    // importNode is used for SVG namespace correctness. No script nodes are read.
    const svg = document.importNode(source, true);
    drawCity(svg);
    container.replaceChildren(svg);
    return () => container.replaceChildren();
  }, []);

  return (
    <div className="scene-frame" data-scene={scene}>
      <div className="react-scene-drawing" ref={drawing}
        role="img" aria-label="Modernist terrace with a warm illuminated doorway overlooking the Commons, displayed as a blue-hour city or floating gardens" />
      <div className="scene-vignette" aria-hidden="true" />
      <button className="hotspot hotspot-door" type="button"
        aria-label="Open the example or locally selected PhiSpace"
        onClick={() => onVisit("phispace.example")}>↗ <span>PHISPACE</span></button>
      <button className="hotspot hotspot-bbs" type="button"
        aria-label="Visit offline sample BBS Lounge"
        onClick={() => onVisit("commons.bbs")}>⌘ <span>BBS LOUNGE</span></button>
      <button className="hotspot hotspot-city" type="button"
        aria-label="Visit offline sample Commons Promenade"
        onClick={() => onVisit("commons.plaza")}>◇ <span>THE COMMONS</span></button>
      <div className="scene-caption">
        <span className="location-pin">◉ COMMONS / ARRIVAL TERRACE</span>
        <span className="ambient-note">A thousand windows. A thousand stories.</span>
      </div>
    </div>
  );
}
