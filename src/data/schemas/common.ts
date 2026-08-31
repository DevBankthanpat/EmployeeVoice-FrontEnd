import { z } from "zod";

/**
 * Shared primitive schemas reused across every entity.
 * See ARCHITECTURE.md §5 for the underlying data model.
 */

/**
 * Entity identifier. The backend uses UUIDs (ARCHITECTURE.md §5); the mock
 * layer uses readable ids like "sig_001" for legibility. Both satisfy this
 * relaxed contract, so the same schemas validate mock data and real payloads.
 */
export const IdSchema = z.string().min(1);

/** ISO-8601 timestamp, e.g. "2026-07-09T10:30:00Z". */
export const TimestampSchema = z.iso.datetime();

/** Reporting period as "YYYY-MM" (ARCHITECTURE.md §5 `themes.period`). */
export const PeriodSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "period must be formatted as YYYY-MM");
