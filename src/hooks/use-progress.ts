import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import { modules } from "@/data/course";

const KEY = "vibecoding:progress:v1";

type Progress = {
  completed: string[];
  lastVisited: string | null;
};

export function useProgress() {
  const [state, setState] = useLocalStorage<Progress>(KEY, {
    completed: [],
    lastVisited: null,
  });

  const isComplete = useCallback(
    (slug: string) => state.completed.includes(slug),
    [state.completed],
  );

  const markComplete = useCallback(
    (slug: string) =>
      setState((s) =>
        s.completed.includes(slug) ? s : { ...s, completed: [...s.completed, slug] },
      ),
    [setState],
  );

  const toggleComplete = useCallback(
    (slug: string) =>
      setState((s) => ({
        ...s,
        completed: s.completed.includes(slug)
          ? s.completed.filter((c) => c !== slug)
          : [...s.completed, slug],
      })),
    [setState],
  );

  const visit = useCallback(
    (slug: string) => setState((s) => ({ ...s, lastVisited: slug })),
    [setState],
  );

  const reset = useCallback(() => {
    setState({ completed: [], lastVisited: null });
    try {
      // sweep all module-scoped drafts as well
      const prefixes = ["vibecoding:"];
      Object.keys(window.localStorage).forEach((k) => {
        if (prefixes.some((p) => k.startsWith(p)) && k !== "vibecoding:fontSize") {
          window.localStorage.removeItem(k);
        }
      });
      // re-init progress key after wipe
      window.localStorage.setItem(
        KEY,
        JSON.stringify({ completed: [], lastVisited: null }),
      );
    } catch {}
  }, [setState]);

  const total = modules.length;
  const completedCount = state.completed.filter((s) =>
    modules.some((m) => m.slug === s),
  ).length;
  const percent = Math.round((completedCount / total) * 100);

  const nextUnfinishedSlug = (() => {
    if (state.lastVisited) {
      const fromLast = modules.findIndex((m) => m.slug === state.lastVisited);
      for (let i = fromLast; i < modules.length; i++) {
        if (!state.completed.includes(modules[i].slug)) return modules[i].slug;
      }
    }
    const first = modules.find((m) => !state.completed.includes(m.slug));
    return first?.slug ?? modules[0].slug;
  })();

  return {
    state,
    isComplete,
    markComplete,
    toggleComplete,
    visit,
    reset,
    total,
    completedCount,
    percent,
    nextUnfinishedSlug,
  };
}
