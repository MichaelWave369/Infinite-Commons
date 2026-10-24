/**
 * Nested Council Chambers R5. Static, operator-stepped PUBLIC rehearsal.
 * Every seat statement is a reviewed authored fixture, NOT inference.
 * Every review note is operator-supplied, NOT independent verification.
 * This module never executes network actions, signs receipts or grants access.
 */
import { ROUNDTABLE_ROLES, MAX_AGENDA_LENGTH } from "./commonsPortalRegistry.mjs";

export const CHAMBER_PROTOCOL = "commons.nested-chambers.offline-practice.v0.5";
export const CHAMBER_REVIEW_MAX_LENGTH = 240;

const settings = [
  {
    id: "inquiry",
    name: "The Inquiry Chamber",
    subtitle: "Questions and evidence",
    color: "#a1dbeb",
    sigil: "◇",
    description: "A place to distinguish observations, assumptions, and what remains unanswered.",
    rule: "A compelling claim without independent observations remains a proposal.",
    question: "Which assumption should be tested before the next move?",
    lines: [
      ["Proposal", "Map what is observed separately from what is inferred. A surprising result deserves a second measurement.", "No observational evidence was loaded in this rehearsal."],
      ["Implementation", "Write a repeatable test, expected result, and explicit failure condition before describing a discovery.", "The test has not been run."],
      ["Challenge", "Agreement across these five fixture voices cannot establish external truth. Where might selection bias hide?", "No independently reproduced measurements are present."],
      ["Provenance", "Record the question, each claim's origin, and the difference between demonstration text and observed data.", "Fixture text is not a sourced research finding."],
      ["Synthesis", "Recommend a proposed falsification test and preserve every open question for human review.", "Recommendation only; no factual result or approval."]
    ]
  },
  {
    id: "forge",
    name: "The Forge Chamber",
    subtitle: "Builds and safe releases",
    color: "#eec18f",
    sigil: "✳",
    description: "A workshop for designs, quality gates, rollback plans, and practical risks.",
    rule: "No build is a release until an independent check can be reproduced.",
    question: "What failure would make this plan unsafe to ship?",
    lines: [
      ["Proposal", "Prefer one small change that can be reverted without breaking the systems that already work.", "The change is an example, not deployed code."],
      ["Implementation", "Specify interface boundaries, input checks, and an executable acceptance test.", "No test was run by this text-only fixture."],
      ["Challenge", "What is the rollback path if a dependency or permission assumption fails?", "Risk is posed as a question; no threat scan occurred."],
      ["Provenance", "Keep the build identifier, test receipts, and differences between planned and observed states.", "No actual release receipt has been retrieved."],
      ["Synthesis", "Present a gated implementation proposal. The operator decides whether and when to execute.", "No automation or deployment has been authorized."]
    ]
  },
  {
    id: "dreamwell",
    name: "The Dreamwell Chamber",
    subtitle: "Stories and possibilities",
    color: "#d0afff",
    sigil: "◎",
    description: "A home for strange creative sparks, playful experiments, and original worlds.",
    rule: "Imagination is welcome. Fiction must remain labeled as fiction.",
    question: "Which invented idea deserves a prototype without being mistaken for fact?",
    lines: [
      ["Proposal", "Imagine a crossroads where four very different worlds share a public plaza but keep their own physics.", "This is fiction and speculative design."],
      ["Implementation", "Sketch an opt-in story experience that works without live model services or shared identities.", "This is not a deployed game."],
      ["Challenge", "Does the idea borrow too much from someone else's fictional world, or imply a capability we do not have?", "Creative concerns are not a legal review."],
      ["Provenance", "Mark narrative events as authored fiction and designs as proposed rather than verified inventions.", "The source is this local, static demonstration."],
      ["Synthesis", "Choose one reversible prototype and celebrate a delightful discovery without claiming it is reality.", "A human creator still controls publication."]
    ]
  }
];

function freezeChamber(chamber) {
  if (chamber.lines.length !== ROUNDTABLE_ROLES.length) throw new Error("Chamber seat plan must match the established five-role council.");
  return Object.freeze({
    ...chamber,
    lines: Object.freeze(chamber.lines.map(line => Object.freeze({
      kind: line[0], message: line[1], evidenceBoundary: line[2],
      source: "AUTHORED_OFFLINE_FIXTURE"
    })))
  });
}

export const COUNCIL_CHAMBERS = Object.freeze(settings.map(freezeChamber));
export function chamberById(id) {
  if (typeof id !== "string") return null;
  return COUNCIL_CHAMBERS.find(c => c.id === id) ?? null;
}

export function beginChamber(chamberId, agenda) {
  const chamber = chamberById(chamberId);
  if (!chamber) throw new Error("Unknown reviewed chamber.");
  if (typeof agenda !== "string" || !agenda.trim() || agenda.trim().length > MAX_AGENDA_LENGTH)
    throw new Error("The common agenda must contain 1–180 characters.");
  return Object.freeze({
    version: CHAMBER_PROTOCOL,
    chamberId,
    agenda: agenda.trim(),
    cursor: 0,
    events: Object.freeze([]),
    operatorReview: null,
    closed: false
  });
}

function active(session) {
  const chamber = chamberById(session?.chamberId);
  if (!chamber || session?.version !== CHAMBER_PROTOCOL || !Object.isFrozen(session?.events) ||
      session?.closed || !Number.isInteger(session?.cursor) ||
      session.cursor < 0 || session.cursor > ROUNDTABLE_ROLES.length ||
      session.events.length !== session.cursor ||
      session.events.some((event, index) => event.seat !== ROUNDTABLE_ROLES[index].id))
    throw new Error("Invalid or closed local chamber session.");
  return chamber;
}

export function hearChamberSeat(session) {
  const chamber = active(session);
  if (session.cursor >= ROUNDTABLE_ROLES.length || session.operatorReview !== null)
    throw new Error("All chamber seats have been heard.");
  const seat = ROUNDTABLE_ROLES[session.cursor];
  const line = chamber.lines[session.cursor];
  const event = Object.freeze({
    sequence: session.cursor + 1,
    seat: seat.id,
    label: seat.name,
    kind: line.kind,
    statement: line.message,
    boundary: line.evidenceBoundary,
    provenance: line.source
  });
  return Object.freeze({
    ...session, cursor: session.cursor + 1,
    events: Object.freeze([...session.events, event])
  });
}

export function submitChamberReview(session, note) {
  active(session);
  if (session.cursor !== ROUNDTABLE_ROLES.length || session.operatorReview !== null)
    throw new Error("Five seats must be heard before operator review.");
  if (typeof note !== "string" || !note.trim() || note.trim().length > CHAMBER_REVIEW_MAX_LENGTH)
    throw new Error("Operator question must contain 1–240 characters.");
  return Object.freeze({ ...session, operatorReview: note.trim() });
}

export function closeChamber(session) {
  active(session);
  if (session.cursor !== ROUNDTABLE_ROLES.length || !session.operatorReview)
    throw new Error("A five-seat rehearsal and operator review are required.");
  return Object.freeze({
    ...session,
    closed: true,
    dossier: Object.freeze({
      format: "commons.chamber.practice-dossier.v0.5",
      chamberId: session.chamberId,
      agenda: session.agenda,
      turnCount: session.events.length,
      operatorQuestion: session.operatorReview,
      fixtureOnly: true,
      independentEvidence: false,
      humanApprovedAction: false,
      published: false
    })
  });
}

export function compareChambers(closedSessions) {
  if (!Array.isArray(closedSessions) || closedSessions.length !== COUNCIL_CHAMBERS.length)
    throw new Error("Convergence requires one closed practice dossier from every chamber.");
  const ids = new Set();
  const agenda = closedSessions[0]?.agenda;
  for (const session of closedSessions) {
    if (!chamberById(session?.chamberId) || ids.has(session.chamberId) ||
        !session.closed || session.version !== CHAMBER_PROTOCOL ||
        !session.dossier || session.cursor !== ROUNDTABLE_ROLES.length ||
        session.events.length !== ROUNDTABLE_ROLES.length || session.agenda !== agenda ||
        session.dossier.chamberId !== session.chamberId || session.dossier.fixtureOnly !== true) {
      throw new Error("Convergence only compares three completed sessions with one shared agenda.");
    }
    ids.add(session.chamberId);
  }
  return Object.freeze({
    format: "commons.nested-comparison.local-v0.5",
    agenda,
    chamberCount: ids.size,
    sources: Object.freeze(COUNCIL_CHAMBERS.map(c => Object.freeze({
      chamberId: c.id,
      rule: c.rule,
      review: closedSessions.find(s => s.chamberId === c.id).operatorReview
    }))),
    fixtureOnly: true,
    independentEvidence: false,
    permissionGranted: false,
    published: false
  });
}
