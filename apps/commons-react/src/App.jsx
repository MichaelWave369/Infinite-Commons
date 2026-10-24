import React, { useEffect, useRef, useState } from "react";
import { PACKS, WORLD_FINGERPRINT, WORLD_NODES, resolvePack, styleVariables } from "../../../web/packs.mjs";
import { phiSpacePanel, validatePublicPhiSpace } from "../../../web/phispace-public.mjs";
import { createLocalPreviewController, localPreviewPanel } from "../../../web/phispace-local-preview.mjs";
import exampleHome from "../../../web/fixtures/phispace-public.json";
import { Scene } from "./Scene.jsx";
import { CommonsNexus } from "./CommonsNexus.jsx";
import { portalById } from "./commonsPortalRegistry.mjs";

const PANELS = Object.freeze({
  "midnight.radio": {
    kind: "MIDNIGHT RADIO · FICTIONAL OFFLINE STORY",
    title: "The Midnight Frequency",
    description: "A tiny lamp glows on an old receiver. An original, imaginary transmission waits on the dial.",
    cards: [
      ["87.9 · THE BLUE-HOUR SIGNAL", "To whoever finds the terrace: there are still windows left to light. Build something worth opening a door for."],
      ["THE EMPTY CHAIR", "No visitors are connected. The second seat is simply an invitation for a future story."],
      ["LOCAL STORY SAMPLE", "This is authored demonstration text, not an actual radio stream, real person, conversation or network signal."]
    ]
  },
  "commons.plaza": {
    kind: "COMMONS PROMENADE · FICTIONAL SAMPLE",
    title: "The Commons Promenade",
    description: "Every illuminated window suggests another story. The actual network is not connected yet.",
    cards: [
      ["THE DIRECTORY", "Future neighborhoods, human-made exhibits, local Porches and community rooms belong here."],
      ["SAME DESTINATIONS", "Your theme changes the scene, not who owns a doorway or what permissions it has."],
      ["PUBLIC BY CHOICE", "Sharing a home will require authenticated owner approval. This is a sample destination."]
    ]
  },
  "commons.bbs": {
    kind: "BBS LOUNGE · FICTIONAL OFFLINE BOARD",
    title: "The BBS Lounge",
    description: "Before every site became an advertising funnel, bulletin boards were places to wander.",
    cards: [
      ["001 · WELCOME", "SYSOP: Pull up a chair. Bring a story. Respect other people's doors."],
      ["002 · MIDNIGHT RADIO", "A retro synthwave listening party sounds better than an endless engagement algorithm."],
      ["003 · GUESTBOOK ETIQUETTE", "Permission is not implied by curiosity. Knock first."]
    ]
  },
  "how-it-works": {
    kind: "COMMONS EXPERIENCE · BUILD v0.1",
    title: "One world, infinite ways to feel at home",
    description: "This is a React presentation of the existing Commons prototype, not a new network backend.",
    cards: [
      ["SHARED WORLD", "Four fixed semantic locations. The same place remains the same place across every appearance."],
      ["TWENTY STYLES", "Midnight Sierra and Cloudgarden have distinct illustrated scene treatments. Eighteen additional packs change the color palette."],
      ["LOCAL PHISPACE", "You can pick a manually exported JSON file and preview only its selected public-facing text in this tab."],
      ["TRUST BOUNDARIES", "No live Porch API, public account, WebXR, remote guestbook, synchronization or shared directory is connected."]
    ]
  }
});

function safeSavedStyle() {
  try { return resolvePack(window.localStorage.getItem("commons.demo.style")); }
  catch { return PACKS[0]; }
}
function saveStyle(id) {
  try { window.localStorage.setItem("commons.demo.style", id); }
  catch { /* nonpersistent browsing is supported */ }
}

function Dialog({ panel, onDismiss, dialogRef }) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
  }, [panel, dialogRef]);
  return (
    <dialog ref={dialogRef} onClose={onDismiss} aria-labelledby="react-dialog-title">
      <button type="button" className="close-dialog react-close" aria-label="Close panel"
        onClick={onDismiss}>✕</button>
      {panel && (
        <>
          <div className="eyebrow">{panel.kind}</div>
          <h2 id="react-dialog-title">{panel.title}</h2>
          <p>{panel.description}</p>
          <div className="dialog-content">
            {panel.cards.map(([title, body], index) => (
              <div className="demo-note" key={index}>
                <strong>{title}</strong>
                <span>{body}</span>
              </div>
            ))}
          </div>
          <p className="dialog-disclaimer">
            Local demonstration only. Nothing here claims a live Porch connection,
            verified identity, public publication, or networking authority.
          </p>
        </>
      )}
    </dialog>
  );
}

export function App() {
  const [pack, setPack] = useState(safeSavedStyle);
  const [selectedPortalId, setSelectedPortalId] = useState(null);
  const [panel, setPanel] = useState(null);
  const [previewName, setPreviewName] = useState(null);
  const [importStatus, setImportStatus] = useState("No local PhiSpace selected. Files stay on this device.");
  const fileRef = useRef(null);
  const dialogRef = useRef(null);
  const preview = useRef(null);
  if (!preview.current) preview.current = createLocalPreviewController();

  useEffect(() => {
    const style = styleVariables(pack);
    for (const [key, value] of Object.entries(style)) {
      document.documentElement.style.setProperty(key, value);
    }
    document.documentElement.dataset.commonsStyle = pack.id;
    saveStyle(pack.id);
    return () => {
      for (const key of Object.keys(style)) document.documentElement.style.removeProperty(key);
    };
  }, [pack]);

  function openPortalPreview(id) {
    if (id === null) {
      setSelectedPortalId(null);
      return;
    }
    if (!portalById(id)) return;
    setSelectedPortalId(id);
    // After React commits the preview, move keyboard focus to its own HTML
    // region. This works for BOTH 3D overlay controls and standard portal cards.
    window.requestAnimationFrame(() => {
      const previewWindow = document.getElementById("portal-story-window");
      previewWindow?.focus({ preventScroll: true });
      previewWindow?.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }

  function visit(node) {
    if (node === "phispace.example") {
      try {
        const manual = preview.current.get();
        const nextPanel = manual
          ? localPreviewPanel(manual)
          : phiSpacePanel(validatePublicPhiSpace(exampleHome));
        setPanel(nextPanel);
      } catch {
        setPanel({
          kind: "PHISPACE · SAMPLE UNAVAILABLE",
          title: "The doorway stays closed",
          description: "This public content cannot be validated.",
          cards: [["FAIL CLOSED", "No private file, remote Porch, or unapproved network URL was queried."]]
        });
      }
      return;
    }
    if (Object.hasOwn(PANELS, node)) setPanel(PANELS[node]);
  }

  async function chooseFile(event) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setPanel(null);
    setPreviewName(null);
    setImportStatus("Checking the manually selected public JSON in this browser…");
    try {
      const accepted = await preview.current.load(file);
      if (!accepted) return; // withdrawn or superseded during the read
      const current = preview.current.get();
      if (!current) return;
      setPreviewName(current.profile.display_name);
      setImportStatus("UNVERIFIED LOCAL PREVIEW ONLY. Not uploaded or published.");
      setPanel(localPreviewPanel(current));
    } catch {
      if (preview.current.get()) return;
      setImportStatus("Rejected: not a valid owner-curated public export. Nothing was published.");
    }
  }

  function withdraw() {
    preview.current.withdraw();
    setPreviewName(null);
    setPanel(null);
    setImportStatus("Local preview withdrawn from this tab. Existing outside copies cannot be revoked here.");
    if (fileRef.current) fileRef.current.value = "";
  }

  const next = pack.id === "midnight-sierra" ? "cloudgarden" : "midnight-sierra";
  const sceneLabel = pack.scene === "floating"
    ? "Beyond the doorway, islands drift through the clouds. The same paths lead to the same places."
    : "Somewhere below, one window still glows. You wonder whose it is.";

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to the Commons</a>
      <div className="app">
        <header className="masthead">
          <a className="brand" href={import.meta.env.BASE_URL}
            aria-label="Infinite Commons home">
            <span className="brand-symbol" aria-hidden="true">✳</span>
            <span><strong>INFINITE COMMONS</strong><small>A world you can visit</small></span>
          </a>
          <nav aria-label="Commons destinations" className="commons-top-nav"><a href="#portal-plaza">WORLD PORTALS ↓</a><a href="#portal-wayfinder">WAYFINDER ↓</a><a href="#roundtable-hall">GRAND ROUNDTABLE ↓</a></nav>
          <span className="prototype-label">REACT EXPERIENCE · PUBLIC DEMO</span>
        </header>
        <main id="main-content" className="layout">
          <aside className="catalog" aria-labelledby="catalog-heading">
            <div className="eyebrow">THE STYLE EXCHANGE / 001</div>
            <h1 id="catalog-heading">Change the world.<br /><em>Not your place in it.</em></h1>
            <p className="intro">
              Twenty founding aesthetics. One shared Commons.
              Pick an atmosphere and the city transforms around you.
            </p>
            <div className="catalog-meta"><span>{PACKS.length} worlds</span><span>2 curated scenes</span></div>
            <div className="style-list" role="group" aria-label="Select your city design aesthetic">
              {PACKS.map(item => (
                <button type="button" className="style-option" key={item.id}
                  aria-pressed={item.id === pack.id}
                  onClick={() => setPack(item)}>
                  <span className="style-swatch" aria-hidden="true" style={{
                    "--swatch-top": item.palette.skyTop,
                    "--swatch-bottom": item.palette.skyBottom,
                    "--swatch-ground": item.palette.ground,
                    "--swatch-accent": item.palette.amber
                  }} />
                  <span>
                    <span className="style-name">{item.name}</span>
                    <span className="style-mood">{item.mood}</span>
                    {item.featured && <span className="style-feature">CURATED SCENE</span>}
                  </span>
                </button>
              ))}
            </div>
            <p className="catalog-note">
              Appearance only. Identities, permissions, and semantic world nodes
              are never controlled by an aesthetic. Other packs are palette previews.
            </p>
          </aside>
          <section className="world" aria-labelledby="world-heading">
            <div className="world-header">
              <div>
                <div className="eyebrow">YOU ARE HERE / COMMONS.ARRIVAL</div>
                <h2 id="world-heading">{pack.name}</h2>
                <p>{pack.mood}</p>
              </div>
              <div className="world-actions">
                <button type="button" className="secondary-btn" onClick={() => setPack(resolvePack(next))}>
                  ↔ Switch to {resolvePack(next).name}
                </button>
                <span className="online-badge">● LOCAL-ONLY DEMO</span>
              </div>
            </div>
            <Scene scene={pack.scene} styleId={pack.id} onVisit={visit} onPortalPreview={openPortalPreview} />
            <div className="below-scene">
              <div className="story-copy">
                <div className="eyebrow">THE FIRST THRESHOLD</div>
                <p>{sceneLabel}</p>
              </div>
              <button className="tertiary-btn" type="button"
                onClick={() => visit("how-it-works")}>How this works ↗</button>
            </div>
            <div className="local-preview-tools" aria-label="Optional local PhiSpace preview">
              <button className="secondary-btn" type="button" onClick={() => fileRef.current?.click()}>
                Preview a local PhiSpace JSON
              </button>
              {previewName && (
                <button type="button" className="tertiary-btn" onClick={withdraw}>Withdraw local preview</button>
              )}
              <input ref={fileRef} type="file" hidden accept=".json,application/json"
                aria-label="Choose a reviewed PhiSpace public JSON export" onChange={chooseFile} />
              <span role="status" aria-live="polite">{importStatus}</span>
            </div>
            <div className="proof-strip" role="status" aria-live="polite">
              <span>WORLD ID <strong>commons.arrival</strong></span>
              <span>NODE MAP <strong>{WORLD_NODES.length} FIXED</strong></span>
              <span>NETWORK <strong>NOT CONNECTED</strong></span>
              <span>STYLE <strong>{pack.id}</strong></span>
            </div>
            <p className="react-integrity">
              Semantic locations remain unchanged for all {PACKS.length} appearances.
              <span className="sr-only">World fingerprint: {WORLD_FINGERPRINT}.</span>
            </p>
            <CommonsNexus selectedPortalId={selectedPortalId} onPortalPreview={openPortalPreview} />
          </section>
        </main>
        <footer className="footer">
          <span>INFINITE PORCH ✳ INFINITE COMMONS ✳ PHISPACE</span>
          <span>Original artwork · No live account or Porch access · No advertising or tracking</span>
        </footer>
      </div>
      <Dialog panel={panel} onDismiss={() => setPanel(null)} dialogRef={dialogRef} />
    </>
  );
}
