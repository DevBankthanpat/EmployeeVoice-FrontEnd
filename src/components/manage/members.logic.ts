import type { Member } from "@/data/schemas";

/**
 * Pure, presentation-free helper for the Members list (D1). Kept out of the
 * component so the search derivation is unit-testable, matching the repo's
 * `*.logic.ts` convention.
 *
 * Operates on the admin `Member` view, which by schema has NO field linking a
 * member to any submitted signal (CLAUDE.md Hard Rule #7) — so nothing derived
 * here can surface one.
 */

/**
 * Case-insensitive filter of members by a free-text query, matched against name
 * or email. An empty/whitespace query returns a copy of the full list (never a
 * live reference), so callers can't accidentally mutate provider state.
 */
export function filterMembers(
  members: readonly Member[],
  query: string,
): Member[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...members];
  return members.filter(
    (m) =>
      m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
  );
}
