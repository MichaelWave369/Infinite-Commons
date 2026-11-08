import React from "react";
import { BEAT_COUNT, beatProgress } from "./moreBounceR2.mjs";

export function MoreBounceArcade({ round, clock, onStart, onHit, theme }) {
  const running = round?.status === "running";
  const done = round?.status === "done";
  const progress = beatProgress(round, clock);
  return (
    <section className="more-bounce-arcade" aria-label="Impossible Mix arcade challenge">
      <div className="more-bounce-arcade-heading">
        <div>
          <p className="more-bounce-kicker">MICRONIOUS TEK'S IMPOSSIBLE MIX CHALLENGE</p>
          <h3>Breakbeat Reaction Cabinet</h3>
          <p>A silent, original visual rhythm game. It does not mix or capture Backspin audio.</p>
          {theme && <p className="more-bounce-theme">CRATE ROULETTE · {theme[0]} × {theme[1]}</p>}
        </div>
        <button type="button" onClick={onStart}>{running ? "Restart challenge" : done ? "Play again" : "Start challenge"}</button>
      </div>
      <div className="more-bounce-arcade-pulse" role="img"
        aria-label="Beat approach meter; tap when its bar reaches the end">
        <div className="more-bounce-arcade-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
        <span>HIT ON THE FLASH</span>
      </div>
      <div className="more-bounce-arcade-score" aria-live="polite">
        <span>BEAT <strong>{round ? Math.min(round.beatIndex + (done ? 0 : 1), BEAT_COUNT) : 0} / {BEAT_COUNT}</strong></span>
        <span>SCORE <strong>{round?.score ?? 0}</strong></span>
        <span>COMBO <strong>{round?.combo ?? 0}</strong></span>
        <span>BEST <strong>{round?.bestCombo ?? 0}</strong></span>
      </div>
      <button type="button" className="more-bounce-arcade-tap" disabled={!running}
        onClick={onHit}>{running ? "TAP / CUT" : "START A ROUND TO TAP"}</button>
      <p className="more-bounce-note" role="status">
        {done ? `Round finished: ${round.hits} hits, ${round.misses} misses. ${round.score} points.`
          : running ? `${round.last}. Tap the button or target the arcade cabinet in VR.`
          : "Twelve beats. 600 ms apart. Aim for within 100 ms of the pulse for a Perfect."}
      </p>
      <p className="more-bounce-note">Desktop, touchscreen and Quest-controller targeting supported.
        This arcade uses only a visible pulse and locally generated scoring, not sampled songs or biometric tracking.</p>
    </section>
  );
}
