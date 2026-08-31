/**
 * k-anonymity helpers (ARCHITECTURE.md §4.3, CLAUDE.md Hard Rule #2).
 *
 * Any dashboard element (theme, department stat, signal card, filter result)
 * whose underlying group size is below the org's `MIN_GROUP` threshold must be
 * suppressed or bucketed into "Other" so a small team/department cannot be
 * de-anonymized. The threshold is org-configurable (`min_group_threshold`);
 * this is the default used when none is provided.
 */

/** Default k-anonymity group threshold (§4.3). */
export const DEFAULT_MIN_GROUP = 5;

/** Label for the bucket that absorbs groups below the threshold. */
export const OTHER_BUCKET_LABEL = "Other";

/** True when a group is large enough to be shown without suppression. */
export function meetsKAnonymity(
  groupSize: number,
  minGroup: number = DEFAULT_MIN_GROUP,
): boolean {
  return groupSize >= minGroup;
}
