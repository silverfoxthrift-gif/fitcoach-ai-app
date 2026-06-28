"use client";

import { useEffect, useRef, useState } from "react";

const PREFIX = "coachrey:";

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

/**
 * State synced to localStorage. Starts from `initial` on both server and first
 * client render (avoids hydration mismatch), then hydrates from storage in an
 * effect. `hydrated` flips true once the stored value is loaded.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T
): [T, (v: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const keyRef = useRef(key);

  useEffect(() => {
    setValue(loadJSON<T>(keyRef.current, initial));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (v: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const nextVal = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      saveJSON(keyRef.current, nextVal);
      return nextVal;
    });
  };

  return [value, set, hydrated];
}
