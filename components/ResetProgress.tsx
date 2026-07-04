"use client";

import { useState } from "react";

/**
 * Quiet "start over" control for the foot of the progress rail. Two-step
 * (button → inline confirm) so a beginner can reset on purpose but never by
 * accident. Clears every coachrey:* key and reloads, so the app boots fresh
 * into onboarding (goal selection).
 */
export default function ResetProgress() {
  const [confirming, setConfirming] = useState(false);

  function reset() {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith("coachrey:"))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* private mode / disabled storage — nothing to clear */
    }
    window.location.reload();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className="rail-reset"
        onClick={() => setConfirming(true)}
      >
        <span className="ic" aria-hidden>
          ↺
        </span>
        Start over
      </button>
    );
  }

  return (
    <div className="rail-reset-confirm" role="group" aria-label="Confirm reset">
      <p>Reset your progress, chat, and goals? This can&apos;t be undone.</p>
      <div className="rr-row">
        <button
          type="button"
          className="rr-cancel"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>
        <button type="button" className="rr-go" onClick={reset}>
          Reset everything
        </button>
      </div>
    </div>
  );
}
