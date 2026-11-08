/** Pure More Bounce R2 arcade + comfort helpers. No media access or network calls. */
export const BEAT_PERIOD_MS = 600;
export const BEAT_COUNT = 12;
export const BEAT_LEAD_MS = 900;
export const BEAT_WINDOW_MS = 230;

export function newArcadeRound(now) {
  if (!Number.isFinite(now)) throw new RangeError("Invalid clock");
  return { status: "running", startedAt: now, beatIndex: 0, score: 0,
    combo: 0, bestCombo: 0, hits: 0, misses: 0, last: "Watch the pulse" };
}
export function nextBeatAt(round) {
  return round.startedAt + BEAT_LEAD_MS + round.beatIndex * BEAT_PERIOD_MS;
}
export function advanceArcade(round, now) {
  if (!round || round.status !== "running" || !Number.isFinite(now)) return round;
  let next = round;
  while (next.beatIndex < BEAT_COUNT && now > nextBeatAt(next) + BEAT_WINDOW_MS) {
    next = { ...next, beatIndex: next.beatIndex + 1, misses: next.misses + 1,
      combo: 0, last: "Missed beat" };
  }
  return next.beatIndex >= BEAT_COUNT ? { ...next, status: "done" } : next;
}
export function tapArcade(round, now) {
  const state = advanceArcade(round, now);
  if (!state || state.status !== "running") return state;
  const diff = Math.abs(now - nextBeatAt(state));
  if (diff > BEAT_WINDOW_MS) return { ...state, last: "Too early" };
  const perfect = diff <= 100;
  const combo = state.combo + 1;
  const beatIndex = state.beatIndex + 1;
  return { ...state, beatIndex, score: state.score + (perfect ? 100 : 50),
    hits: state.hits + 1, combo, bestCombo: Math.max(combo, state.bestCombo),
    last: perfect ? "Perfect +100" : "Good +50",
    status: beatIndex >= BEAT_COUNT ? "done" : "running" };
}
export function beatProgress(round, now) {
  if (!round || round.status !== "running" || !Number.isFinite(now)) return 0;
  return Math.max(0, Math.min(1, 1 - (nextBeatAt(round) - now) / BEAT_PERIOD_MS));
}

/** XR gamepads often expose Touch sticks as axes[2:4], fallback [0:2]. */
export function readXRStick(gamepad) {
  if (!gamepad || !Array.isArray(Array.from(gamepad.axes ?? []))) return { x: 0, y: 0 };
  const a = gamepad.axes;
  const i = a.length >= 4 ? 2 : 0;
  const x = Number.isFinite(a[i]) && Math.abs(a[i]) > 0.18 ? a[i] : 0;
  const y = Number.isFinite(a[i + 1]) && Math.abs(a[i + 1]) > 0.18 ? a[i + 1] : 0;
  return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
}
export function boundedWalk(position, leftStick, forward, dt) {
  const elapsed = Math.max(0, Math.min(Number.isFinite(dt) ? dt : 0, 0.06));
  const fx = Number.isFinite(forward?.x) ? forward.x : 0;
  const fz = Number.isFinite(forward?.z) ? forward.z : -1;
  const magnitude = Math.hypot(fx, fz) || 1;
  const dx = fx / magnitude, dz = fz / magnitude;
  const speed = 1.2 * elapsed;
  const x = Math.max(-5.4, Math.min(5.4, position.x + (-leftStick.y * dx + leftStick.x * -dz) * speed));
  const z = Math.max(-1.70, Math.min(5.1, position.z + (-leftStick.y * dz + leftStick.x * dx) * speed));
  return { x, z };
}
export function nearestDeck(position, a, b, radius = 0.43) {
  if (!position || !a || !b || !Number.isFinite(position.x) ||
      !Number.isFinite(position.y) || !Number.isFinite(position.z)) return null;
  const dist = p => Math.hypot(position.x - p.x, position.y - p.y, position.z - p.z);
  const da = dist(a), db = dist(b);
  return Math.min(da, db) <= radius ? (da <= db ? "A" : "B") : null;
}
