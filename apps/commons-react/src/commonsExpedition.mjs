/**
 * Expedition Trail v0.4: a deterministic, session-only tour of public story
 * previews. No cross-world travel, tracking, persistence or permissions.
 */
import { PORTALS } from "./commonsPortalRegistry.mjs";

export const EXPEDITION_VERSION = "commons.expedition.practice-v0.4";
export const EXPEDITION_HALL_ID = "commons.expedition.roundtable-hall";

const notes = [
  { id: "commons.portal.xiphiworld", label: "A Question of Thrones", clue: "BrakeWind knows the plaque's first law. What is it?", reflection: "Many minds. Many tables. No thrones.", flavor: "Lil' Gassy burps in a suspiciously ceremonial manner." },
  { id: "commons.portal.nevora", label: "The Caretaker's Path", clue: "What does Nevora ask visitors to do before leaving?", reflection: "Restore what you can. Document what you learn.", flavor: "The valley answers with a soft light." },
  { id: "commons.portal.blackout", label: "The Missing Headline", clue: "What happened to the important part of the newspaper?", reflection: "The headline has been clipped away.", flavor: "A detective writes down what the evidence does not show." },
  { id: "commons.portal.mikey-ori", label: "A Workshop Warning", clue: "What should an inventor do before the big ceremony?", reflection: "Test the machine before pressing STATION.", flavor: "Somewhere a perfectly avoidable machine beeps." }
];

export const EXPEDITION_STOPS = Object.freeze([
  ...PORTALS.map((portal, index) => {
    const note = notes[index];
    if (portal.id !== note?.id) throw new Error("Expedition notes no longer match the reviewed world registry.");
    return Object.freeze({
      id: portal.id, name: portal.name, color: portal.color, symbol: portal.symbol,
      label: note.label, clue: note.clue, reflection: note.reflection, flavor: note.flavor,
      kind: "offline-story-window"
    });
  }),
  Object.freeze({
    id: EXPEDITION_HALL_ID, name: "Grand Roundtable", symbol: "Φ", color: "#dfb98e",
    label: "The Fifth Threshold", clue: "Take what you have seen to the hall of five independent seats.",
    reflection: "LEDGER ABOVE EGO · MANY MINDS, NO THRONES",
    flavor: "At the center of the Commons, every seat is equal.",
    kind: "same-page-hall"
  })
]);

export function beginExpedition() {
  return Object.freeze({
    version: EXPEDITION_VERSION, index: 0, visited: Object.freeze([]), finished: false
  });
}

export function expeditionActiveStop(session) {
  if (!session || session.version !== EXPEDITION_VERSION || session.finished ||
      !Number.isInteger(session.index) || session.index < 0 || session.index >= EXPEDITION_STOPS.length ||
      !Array.isArray(session.visited)) return null;
  return EXPEDITION_STOPS[session.index];
}

export function expeditionActivePortalId(session) {
  const stop = expeditionActiveStop(session);
  return stop?.kind === "offline-story-window" ? stop.id : null;
}

export function inspectExpeditionStory(session, portalId) {
  const stop = expeditionActiveStop(session);
  if (!stop || stop.kind !== "offline-story-window" || stop.id !== portalId)
    throw new Error("Only the current reviewed story stop can receive an expedition stamp.");
  return Object.freeze({
    ...session,
    visited: Object.freeze([...new Set([...session.visited, portalId])])
  });
}

export function advanceExpedition(session) {
  const stop = expeditionActiveStop(session);
  if (!stop || stop.kind !== "offline-story-window" || !session.visited.includes(stop.id))
    throw new Error("Inspect the current story before proceeding to the next stop.");
  return Object.freeze({ ...session, index: session.index + 1 });
}

export function finishExpedition(session) {
  const stop = expeditionActiveStop(session);
  const required = EXPEDITION_STOPS.filter(s => s.kind === "offline-story-window").map(s => s.id);
  if (!stop || stop.id !== EXPEDITION_HALL_ID ||
      session.visited.length !== required.length || !required.every(id => session.visited.includes(id)))
    throw new Error("All four stories and the Hall step are required to complete the expedition.");
  return Object.freeze({
    ...session, finished: true,
    conclusion: Object.freeze({
      format: "commons.expedition.session-only.v0.4",
      destinations: required.length,
      source: "original-offline-story-previews",
      permission_granted: false,
      published: false,
      durable: false
    })
  });
}
