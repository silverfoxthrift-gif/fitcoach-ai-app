"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./storage";
import { INITIAL_PROGRESS, applyMessage, type ProgressDelta } from "./gamification";
import type { Progress } from "./types";

export function useProgress() {
  const [progress, setProgress, hydrated] = useLocalStorage<Progress>(
    "progress",
    INITIAL_PROGRESS
  );

  // Records a sent message and returns the delta (level-ups, new badges) so the
  // UI can fire celebrations. Uses a functional update to stay correct under
  // rapid sends.
  const recordMessage = useCallback(
    (opts?: { plan?: boolean }): ProgressDelta => {
      const delta = applyMessage(progress, opts);
      setProgress(delta.next);
      return delta;
    },
    [progress, setProgress]
  );

  return { progress, hydrated, recordMessage };
}
