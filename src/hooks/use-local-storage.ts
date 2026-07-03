import { useCallback, useSyncExternalStore } from "react";

// Module-level cache + subscribers so every hook instance for the same key
// stays in sync within the same tab. Without this, sidebar and module button
// each keep their own useState copy and diverge until reload.
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function getListeners(key: string) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  return set;
}

function notify(key: string) {
  const set = listeners.get(key);
  if (set) set.forEach((l) => l());
}

function readRaw<T>(key: string, initial: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  if (typeof window === "undefined") {
    cache.set(key, initial);
    return initial;
  }
  try {
    const raw = window.localStorage.getItem(key);
    const value = raw !== null ? (JSON.parse(raw) as T) : initial;
    cache.set(key, value);
    return value;
  } catch {
    cache.set(key, initial);
    return initial;
  }
}

function writeRaw<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
  notify(key);
}

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    if (!listeners.has(e.key)) return;
    try {
      cache.set(e.key, e.newValue === null ? undefined : JSON.parse(e.newValue));
    } catch {}
    notify(e.key);
  });
}

export function useLocalStorage<T>(key: string, initial: T) {
  // Ensure a value is cached before subscribing (SSR-safe: server returns initial)
  const getSnapshot = () => {
    if (!cache.has(key)) readRaw(key, initial);
    return cache.get(key) as T;
  };
  const subscribe = (cb: () => void) => {
    const set = getListeners(key);
    set.add(cb);
    return () => set.delete(cb);
  };
  const value = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initial,
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = (cache.has(key) ? cache.get(key) : initial) as T;
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeRaw(key, resolved);
    },
    // Intentionally omit `initial` — callers often pass a fresh object literal
    // each render, which would make setValue unstable and cause effect loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const reset = useCallback(
    () => writeRaw(key, initial),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue, { hydrated: true, reset }] as const;
}
