import React, { useEffect, useState } from "react";
import {
  WAYFINDER_DESTINATIONS, WAYFINDER_BOOKMARK_KEY,
  wayfinderById, reviewedDestination, parseWayfinderId,
  wayfinderSharePath, wayfinderClearPath, parseBookmarks, toggleBookmark
} from "./wayfinderPlan.mjs";

function initialSelection() {
  if (typeof window === "undefined") return null;
  return parseWayfinderId(window.location.search);
}
function initialBookmarks() {
  if (typeof window === "undefined") return [];
  try { return [...parseBookmarks(window.localStorage.getItem(WAYFINDER_BOOKMARK_KEY))]; }
  catch { return []; }
}

/** A visible, opt-in transfer desk for independently hosted, public sites. */
export function WayfinderDesk() {
  const [selectedId, setSelectedId] = useState(initialSelection);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [notice, setNotice] = useState("");
  const selected = wayfinderById(selectedId);

  useEffect(() => {
    function onPopState() { setSelectedId(parseWayfinderId(window.location.search)); setNotice(""); }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function choose(id) {
    const path = wayfinderSharePath(window.location.pathname, window.location.search, id);
    if (!path) return;
    window.history.pushState({ wayfinder: id }, "", path);
    setSelectedId(id);
    setNotice("");
  }

  function returnToDesk() {
    window.history.pushState({}, "", wayfinderClearPath(window.location.pathname, window.location.search));
    setSelectedId(null);
    setNotice("");
  }

  function saveBookmark(id) {
    const next = toggleBookmark(bookmarks, id);
    // Local browser storage only, changed by explicit user action; no analytics.
    try {
      window.localStorage.setItem(WAYFINDER_BOOKMARK_KEY, JSON.stringify(next));
      setBookmarks([...next]);
      setNotice(next.includes(id) ? "Saved on this browser only." : "Removed from this browser's bookmarks.");
    } catch {
      setNotice("This browser blocked local bookmark storage. Nothing was uploaded.");
    }
  }

  function eraseBookmarks() {
    try {
      window.localStorage.removeItem(WAYFINDER_BOOKMARK_KEY);
      setBookmarks([]);
      setNotice("All Wayfinder bookmarks erased from this browser.");
    } catch {
      setNotice("This browser blocked the bookmark change.");
    }
  }

  async function copyDoorway() {
    if (!selected) return;
    const path = wayfinderSharePath(window.location.pathname, window.location.search, selected.id);
    if (!path) return;
    const url = window.location.origin + path;
    try {
      await window.navigator.clipboard.writeText(url);
      setNotice("Copied a Commons preview link, not an account token.");
    } catch {
      setNotice("Clipboard blocked. This preview has a shareable URL: " + url);
    }
  }

  return (
    <section className="wayfinder-desk" id="portal-wayfinder" aria-labelledby="wayfinder-heading">
      <div className="wayfinder-header">
        <div>
          <div className="eyebrow">THE WAYFINDER / REAL PUBLIC PROJECT DOORS</div>
          <h2 id="wayfinder-heading">From stories to <em>places you can visit.</em></h2>
          <p>These are separately hosted public project experiences named in their owners' READMEs. We reviewed the declared destinations, not their current uptime. They are not the unreleased fantasy-world games above.</p>
        </div>
        <div className="wayfinder-summary">3 DOCUMENTED DOORS · 0 AUTOMATIC EXITS</div>
      </div>
      <div className="wayfinder-grid" aria-label="Curated public project doors">
        {WAYFINDER_DESTINATIONS.map(dest => (
          <article key={dest.id} className="wayfinder-card" style={{ "--wayfinder-glow": dest.color }}>
            <div className="wayfinder-glyph" aria-hidden="true">{dest.symbol}</div>
            <div>
              <span className="wayfinder-kind">{dest.kind}</span>
              <h3>{dest.title}</h3>
              <p className="wayfinder-subtitle">{dest.subtitle}</p>
              <p>{dest.detail}</p>
              <button type="button" className="wayfinder-choose" onClick={() => choose(dest.id)}
                aria-label={"Inspect " + dest.title + " public doorway"}>
                Inspect public doorway →
              </button>
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <div className="wayfinder-inspection" role="region" aria-label={selected.title + " doorway handoff"}>
          <div className="wayfinder-inspection-header">
            <div>
              <div className="eyebrow">EXTERNAL SITE · LEAVE COMMONS ONLY BY CHOICE</div>
              <h3>{selected.title}</h3>
            </div>
            <button type="button" className="nexus-quiet-button" onClick={returnToDesk}>Back to Wayfinder ↑</button>
          </div>
          <p>{selected.detail}</p>
          <p><strong>Verification scope:</strong> {selected.verification}. Source: {selected.evidence}.</p>
          <p><strong>Destination:</strong> <code>{selected.url}</code></p>
          <p>No single sign-on, shared passport, private data transfer, remote frame, or agent credential is attached to this link. Opening another website subjects you to that site's own behavior.</p>
          <div className="wayfinder-actions">
            <a className="wayfinder-exit" href={reviewedDestination(selected.id) ?? undefined}
              target="_blank" rel="noopener noreferrer"
              aria-label={"Open " + selected.title + " external website in a new tab"}>
              Open public site ↗
            </a>
            <button className="wayfinder-choose" type="button" onClick={() => saveBookmark(selected.id)}>
              {bookmarks.includes(selected.id) ? "Remove browser bookmark" : "Bookmark on this browser"}
            </button>
            <button className="wayfinder-choose" type="button" onClick={copyDoorway}>Copy Commons doorway link</button>
          </div>
        </div>
      )}
      <div className="wayfinder-passport">
        <span>LOCAL PASSPORT · {bookmarks.length} SAVED {bookmarks.length === 1 ? "DOOR" : "DOORS"}</span>
        {bookmarks.length > 0 && (
          <>
            {bookmarks.map(id => {
              const dest = wayfinderById(id);
              return dest && <button type="button" key={id} onClick={() => choose(id)}>{dest.title} ↗</button>;
            })}
            <button type="button" onClick={eraseBookmarks}>Forget all bookmarks</button>
          </>
        )}
      </div>
      {notice && <p className="wayfinder-notice" role="status" aria-live="polite">{notice}</p>}
      <p className="portal-boundary">Your bookmarks are saved only when you deliberately choose to save them and remain in this browser. Selection and share links contain only a public registry ID, never a user identity or credential.</p>
    </section>
  );
}
