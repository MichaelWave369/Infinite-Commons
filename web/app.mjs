import {
  PACKS, WORLD_NODES, WORLD_FINGERPRINT, resolvePack, styleVariables
} from "./packs.mjs";
import { loadExamplePhiSpace, phiSpacePanel } from "./phispace-public.mjs";

export const ARRIVAL_ID = "commons.arrival";

// Deterministic purely decorative city lights. No location, account or network data.
export function cityLights(count = 650, seed = 369) {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Array.from({ length: count }, () => {
    const x = 362 + random() * 837;
    const y = 400 + random() * 320;
    const size = 0.7 + (y / 720) * 2.2 * random();
    return { x: +x.toFixed(2), y: +y.toFixed(2), size: +size.toFixed(2) };
  });
}

export function sceneSnapshot(packId) {
  const pack = resolvePack(packId);
  return Object.freeze({
    worldId: ARRIVAL_ID,
    worldFingerprint: WORLD_FINGERPRINT,
    visibleNodes: WORLD_NODES.map((node) => node.id),
    styleId: pack.id,
    scene: pack.scene,
    networkConnected: false
  });
}

function svgRect(x, y, width, height, color, opacity = 1) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  for (const [key, value] of Object.entries({
    x, y, width, height, fill: color, opacity
  })) node.setAttribute(key, String(value));
  return node;
}

function drawCity() {
  const buildings = document.getElementById("city-buildings");
  const lights = document.getElementById("city-lights");
  // Low buildings, distant towers and light grids are original procedural artwork.
  for (let band = 0; band < 8; band += 1) {
    const y = 416 + band * 39;
    for (let column = 0; column < 25; column += 1) {
      const x = 400 + column * 37 + (band % 2) * 10;
      const tall = 4 + ((column * 13 + band * 7) % 21);
      buildings.append(svgRect(x, y - tall, 19 + band * 2, tall + 7,
        band % 3 === 0 ? "#061a2b" : "#0a2239", .62));
    }
  }
  const group = document.createDocumentFragment();
  for (const light of cityLights()) {
    const tone = light.y < 500 ? "#ffe3a4" : "#ffb369";
    group.append(svgRect(light.x, light.y, light.size * 1.45, light.size,
      tone, .44 + Math.min(.52, light.y / 1400)));
  }
  lights.append(group);
}

const DETAILS = Object.freeze({
  "commons.plaza": {
    kind: "PUBLIC DESTINATION · DEMO",
    title: "The Commons Promenade",
    description: "Every light beyond the terrace suggests a place to meet, make, play, or learn.",
    cards: [
      ["Commons Directory", "Four fixed demonstration locations. Theme changes do not add, remove, or rename them."],
      ["Open worlds", "Community districts and collaborative spaces are the eventual goal, not live features in this slice."],
      ["What stays the same", "commons.plaza remains commons.plaza in Midnight Sierra, Cloudgarden, and every other preview."]
    ]
  },
  "commons.bbs": {
    kind: "BBS LOUNGE · OFFLINE SAMPLE",
    title: "The BBS Lounge",
    description: "A little echo of the internet before every interface became a billboard.",
    cards: [
      ["001 · WELCOME TO THE COMMONS", "System operator: Pull up a chair. This board is sample content, stored in the prototype."],
      ["002 · MUSIC NIGHT", "Community board: Imagine a room where people can share tracks without an algorithm choosing the next one."],
      ["003 · OLD-SCHOOL RULE", "Respect the guestbook. Don't confuse curiosity with consent."]
    ]
  },
  "how-it-works": {
    kind: "DESIGN CONTRACT · V0.1",
    title: "One world, twenty interpretations",
    description: "This is a static, local-only experience prototype inside the existing Infinite Commons repository.",
    cards: [
      ["FOUNDATION", "The existing deterministic Python bootstrap loader is unchanged; no Porch authority or network protocols are modified."],
      ["PRESENTATION", "Theme packs select validated colors and a city or floating-island illustration. Two scenes are curated; eighteen are palette previews."],
      ["SHARED STATE", "The same four example destination IDs remain available after every theme switch."],
      ["HONEST BOUNDARY", "PhiSpace loads only a reviewed same-origin sample manifest. Real accounts, permissions, community messages, networking and WebXR remain unimplemented."]
    ]
  }
});

let latestPanelRequest = 0;
async function openPanel(id) {
  const requestId = ++latestPanelRequest;
  let detail = DETAILS[id];
  if (id === "phispace.example") {
    try {
      detail = phiSpacePanel(await loadExamplePhiSpace());
    } catch {
      // Fail closed: never substitute private Porch data or a made-up live home.
      detail = {
        kind: "PHISPACE · PUBLIC FIXTURE UNAVAILABLE",
        title: "The doorway stays closed",
        description: "No verified sample public home could be loaded from this site.",
        cards: [["NO PRIVATE FALLBACK", "No device files, personal Porch API, private identity or remote URL was queried."]]
      };
    }
  }
  if (requestId !== latestPanelRequest || !detail) return;
  const dialog = document.getElementById("location-dialog");
  document.getElementById("dialog-kind").textContent = detail.kind;
  document.getElementById("dialog-title").textContent = detail.title;
  document.getElementById("dialog-description").textContent = detail.description;
  const holder = document.getElementById("dialog-content");
  holder.replaceChildren();
  for (const [heading, body] of detail.cards) {
    const section = document.createElement("div");
    section.className = "demo-note";
    const strong = document.createElement("strong");
    strong.textContent = heading;
    const paragraph = document.createElement("span");
    paragraph.textContent = body;
    section.append(strong, paragraph);
    holder.append(section);
  }
  if (!dialog.open) dialog.showModal();
}

function readPreference() {
  try { return window.localStorage.getItem("commons.demo.style"); }
  catch { return null; }
}

function savePreference(id) {
  try { window.localStorage.setItem("commons.demo.style", id); }
  catch { /* private browsing can disallow storage; switching still works */ }
}

function mount() {
  drawCity();
  const list = document.getElementById("style-list");
  const scene = document.getElementById("scene-frame");
  const heading = document.getElementById("world-heading");
  const mood = document.getElementById("mood-line");
  const quick = document.getElementById("quick-switch");

  const select = (id) => {
    const pack = resolvePack(id);
    for (const [key, value] of Object.entries(styleVariables(pack))) {
      document.documentElement.style.setProperty(key, value);
    }
    scene.dataset.scene = pack.scene;
    document.documentElement.dataset.commonsStyle = pack.id;
    heading.textContent = pack.name;
    mood.textContent = pack.mood;
    document.getElementById("active-style-label").textContent = pack.id;
    document.getElementById("narration").textContent = pack.scene === "floating"
      ? "Beyond the doorway, islands drift through the clouds. The paths still lead to the same places."
      : "Somewhere below, one window still glows. You wonder whose it is.";
    const next = pack.id === "midnight-sierra" ? "cloudgarden" : "midnight-sierra";
    quick.textContent = "↔ Switch to " + resolvePack(next).name;
    quick.dataset.next = next;
    for (const button of list.querySelectorAll("[data-pack]")) {
      button.setAttribute("aria-pressed", String(button.dataset.pack === pack.id));
    }
    savePreference(pack.id);
  };

  for (const pack of PACKS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "style-option";
    button.dataset.pack = pack.id;
    button.setAttribute("aria-pressed", "false");
    const swatch = document.createElement("span");
    swatch.className = "style-swatch";
    swatch.setAttribute("aria-hidden", "true");
    swatch.style.setProperty("--swatch-top", pack.palette.skyTop);
    swatch.style.setProperty("--swatch-bottom", pack.palette.skyBottom);
    swatch.style.setProperty("--swatch-ground", pack.palette.ground);
    swatch.style.setProperty("--swatch-accent", pack.palette.amber);
    const copy = document.createElement("span");
    const name = document.createElement("span");
    name.className = "style-name";
    name.textContent = pack.name;
    const subtitle = document.createElement("span");
    subtitle.className = "style-mood";
    subtitle.textContent = pack.mood;
    copy.append(name, subtitle);
    if (pack.featured) {
      const tag = document.createElement("span");
      tag.className = "style-feature";
      tag.textContent = "CURATED SCENE";
      copy.append(tag);
    }
    button.append(swatch, copy);
    button.addEventListener("click", () => select(pack.id));
    list.append(button);
  }
  document.getElementById("catalog-count").textContent = PACKS.length + " worlds";
  quick.addEventListener("click", () => select(quick.dataset.next));
  for (const target of document.querySelectorAll(".hotspot")) {
    target.addEventListener("click", () => openPanel(target.dataset.node));
  }
  document.getElementById("explain-world").addEventListener("click", () => openPanel("how-it-works"));
  select(readPreference() ?? "midnight-sierra");
}

if (typeof document !== "undefined") mount();
