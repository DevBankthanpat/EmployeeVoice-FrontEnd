/**
 * Central runtime flags.
 *
 * USE_MOCK defaults to `true` so the whole app runs on in-memory mock data
 * until the real backend lands (Phase 6+). Flip it by setting
 * NEXT_PUBLIC_USE_MOCK=false. It is NEXT_PUBLIC_* so both server and client
 * components read the same value. See ARCHITECTURE.md §8.
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
