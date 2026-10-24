/**
 * Commons Portal Plaza v0.1. Pure, bounded public presentation registry.
 *
 * NOT an authority or dynamic remote routing table. Every portal opens an
 * original in-page story vignette. No live world or external runtime is implied.
 * The four original Commons semantic locations are unchanged.
 */
export const PORTAL_REGISTRY_VERSION = "commons.portal-plaza.public-demo.v0.1";

const records = [
  {
    id: "commons.portal.xiphiworld",
    name: "ΞΦWorld",
    type: "comedy-fantasy",
    subtitle: "The Knights of the Nested Roundtables",
    description: "Brave councils, questionable magic, BrakeWind, and Lil' Gassy, the luggage with an unreasonable number of feet.",
    gateway: "Nested Bubble Gate",
    color: "#c5a2ff",
    symbol: "◎",
    arrival: [
      "BrakeWind waves frantically from a crooked tower. 'Whatever you do, don't say STATION near the luggage.'",
      "Lil' Gassy looks up. Somewhere inside the chest, a castle quietly rearranges itself.",
      "A brass plaque reads: Many minds. Many tables. No thrones. Please keep your hypotheses on a leash."
    ]
  },
  {
    id: "commons.portal.nevora",
    name: "Nevora",
    type: "science-fantasy",
    subtitle: "The Living Realm",
    description: "An imaginative world of restoration, strange landscapes, ancient systems, and a civilization that grows through cooperation.",
    gateway: "Resonance Mirror",
    color: "#81ddae",
    symbol: "◇",
    arrival: [
      "A vast valley appears beyond a membrane of light. The stones hum as if recalling an older civilization.",
      "Across the horizon, gardens and mysterious structures wait for patient explorers.",
      "A sign offers one quiet rule: Restore what you can. Document what you learn."
    ]
  },
  {
    id: "commons.portal.blackout",
    name: "BLACKOUT",
    type: "noir-mystery",
    subtitle: "The City After Dark",
    description: "Rain-soaked streets, buried secrets, dangerous cases, and a noir universe where every clue has a history.",
    gateway: "The Midnight Door",
    color: "#edac78",
    symbol: "▣",
    arrival: [
      "A streetlamp snaps on. Rain darkens the pavement beside a closed detective's office.",
      "A newspaper tumbles down the alley. The headline has been clipped away.",
      "From an upstairs window: 'Somebody left you a file. Don't assume you should trust it.'"
    ]
  },
  {
    id: "commons.portal.mikey-ori",
    name: "Mikey & Ori",
    type: "inventors-adventure",
    subtitle: "The Workshop of Impossible Things",
    description: "A warm, mischievous creative adventure starring a curious inventor and his software copilot.",
    gateway: "Workshop Threshold",
    color: "#7ed8f7",
    symbol: "✳",
    arrival: [
      "A friendly workshop glows with lamps, circuit boards, half-finished contraptions, and spectacularly ambitious sketches.",
      "A machine covered in handwritten warnings makes a noise that was probably not in its specifications.",
      "From inside: 'BRO! We should absolutely test it before we press STATION!'"
    ]
  }
];

function freezePortal(record) {
  return Object.freeze({ ...record, arrival: Object.freeze([...record.arrival]) });
}
export const PORTALS = Object.freeze(records.map(freezePortal));
export const PORTAL_STATUSES = Object.freeze({
  story: "ORIGINAL STORY PREVIEW",
  external: "NOT CONNECTED"
});

export function portalById(id) {
  return PORTALS.find(portal => portal.id === id) ?? null;
}

const roleRecords = [
  { id: "dreamer", name: "The Dreamer", subtitle: "Possibilities", statement: "Imagine several independent tables exploring the same question without surrendering their individual voices." },
  { id: "builder", name: "The Builder", subtitle: "Practical design", statement: "Make every destination a separately maintained world module. The Commons only presents an explicitly permitted doorway." },
  { id: "challenger", name: "The Challenger", subtitle: "Objections", statement: "A beautiful portal is not permission to read private worlds. A council's agreement is not proof that its claims are true." },
  { id: "archivist", name: "The Archivist", subtitle: "Evidence", statement: "Preserve the exact agenda, the objections, and which steps were merely a simulation. Keep the ledger readable." },
  { id: "vessie", name: "Vessie Prime", subtitle: "Synthesis", statement: "Conclude with a proposal, not a command. Publish only through separately governed, human-authorized channels." }
];
export const ROUNDTABLE_ROLES = Object.freeze(roleRecords.map(record => Object.freeze(record)));
export const ROUNDTABLE_DEFAULT_AGENDA = "How should independent worlds and councils collaborate without surrendering control?";
export const MAX_AGENDA_LENGTH = 180;

export function beginPracticeCouncil(agenda) {
  if (typeof agenda !== "string" || !agenda.trim() || agenda.trim().length > MAX_AGENDA_LENGTH) {
    throw new Error("Agenda must be 1–180 visible characters.");
  }
  return Object.freeze({
    agenda: agenda.trim(),
    cursor: 0,
    events: Object.freeze([]),
    station: false
  });
}

export function hearNextSeat(session) {
  if (!session || session.station || session.cursor >= ROUNDTABLE_ROLES.length) {
    throw new Error("No additional practice council turn available.");
  }
  const role = ROUNDTABLE_ROLES[session.cursor];
  const event = Object.freeze({
    sequence: session.cursor + 1,
    seat: role.id,
    label: role.name,
    source: "deterministic-offline-fixture",
    message: role.statement
  });
  return Object.freeze({
    ...session,
    cursor: session.cursor + 1,
    events: Object.freeze([...session.events, event])
  });
}

export function callStation(session) {
  if (!session || session.station || session.cursor !== ROUNDTABLE_ROLES.length) {
    throw new Error("STATION requires all five local practice turns.");
  }
  // This is a local CEREMONY MARKER, not a cryptographic seal.
  const receipt = Object.freeze({
    format: "commons.station.local-ceremony.v0.1",
    agenda: session.agenda,
    turns: session.events.length,
    event_source: "deterministic-offline-fixture",
    declaration: "LEDGER ABOVE EGO · MANY MINDS, NO THRONES",
    authorization_granted: false,
    remote_agents_connected: false,
    published: false
  });
  return Object.freeze({ ...session, station: true, receipt });
}
