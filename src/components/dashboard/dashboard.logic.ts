import type { SignalFeedFilters, SignalFeedItem } from "@/data/schemas";

/**
 * Pure, presentation-free helpers for the org dashboard (C1–C6). Kept separate
 * from the React components so the derivations that drive the Signals filter bar
 * (C3) and the "recent" ordering (C1) are unit-testable in isolation, matching
 * the repo's `*.logic.ts` convention.
 *
 * Everything here operates on already-anonymised `SignalFeedItem`s (department
 * only, no identity — see dashboard schema §4.5), so deriving options from them
 * cannot leak a quasi-identifier.
 */

export interface SignalFilterOptions {
  /** Distinct department names present in the feed, alphabetically. */
  departments: string[];
  /** Distinct "YYYY-MM" periods present in the feed, newest first. */
  periods: string[];
}

/**
 * Derive the selectable filter values from the signals actually in the feed, so
 * every option yields at least one result (no dead filters) and no empty
 * department/period is ever offered.
 */
export function signalFilterOptions(
  signals: readonly SignalFeedItem[],
): SignalFilterOptions {
  const departments = new Set<string>();
  const periods = new Set<string>();
  for (const s of signals) {
    departments.add(s.departmentName);
    periods.add(s.createdAt.slice(0, 7));
  }
  return {
    departments: [...departments].sort((a, b) => a.localeCompare(b)),
    periods: [...periods].sort((a, b) => b.localeCompare(a)),
  };
}

/** How many filters are currently narrowing the feed (drives the "clear" affordance). */
export function countActiveFilters(filters: SignalFeedFilters): number {
  return (
    (filters.departmentName ? 1 : 0) +
    (filters.signalType ? 1 : 0) +
    (filters.impactLevel ? 1 : 0) +
    (filters.period ? 1 : 0)
  );
}

/** Newest-first copy of a signal list (for the "recent signals" widget). Does not mutate. */
export function sortSignalsByNewest(
  signals: readonly SignalFeedItem[],
): SignalFeedItem[] {
  return [...signals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
