import { z } from "zod";

import { IdSchema, PeriodSchema, TimestampSchema } from "./common";
import {
  ActionPrioritySchema,
  ActionStatusSchema,
  FrequencySchema,
  ImpactLevelSchema,
  ImpactTypeSchema,
  RelatedAreaSchema,
  SignalTypeSchema,
  ThemeTrendSchema,
  WorkflowStageSchema,
} from "./enums";

/**
 * Dashboard (org-side) read models. Everything here is aggregate or AI-derived
 * and passes through the anonymity filter (§4.6). Two rules bind these shapes:
 *  - k-anonymity: any group with size < MIN_GROUP is suppressed/bucketed (§4.3).
 *  - quasi-identifier coarsening: DEPARTMENT ONLY — never team/position/tenure/
 *    work_format, and never anything identifying a submitter (§4.5, Hard Rule #4).
 */

/** One stat-card value: the number plus an optional delta for the trend arrow. */
export const StatValueSchema = z.object({
  value: z.number().int().nonnegative(),
  delta: z.number().int().optional(),
});
export type StatValue = z.infer<typeof StatValueSchema>;

/** Signal Statistics widget (C1). Every value is a period aggregate. */
export const StatsSchema = z.object({
  totalSignals: StatValueSchema,
  highImpact: StatValueSchema,
  positive: StatValueSchema,
  departmentsAffected: StatValueSchema,
  newThisWeek: StatValueSchema,
});
export type Stats = z.infer<typeof StatsSchema>;

/** AI Executive Summary card (C1) / GET /dashboard/summary — k-anon enforced. */
export const DashboardSummarySchema = z.object({
  period: PeriodSchema,
  content: z.string().min(1),
  highlights: z.array(z.string().min(1)).optional(),
  generatedAt: TimestampSchema.optional(),
});
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

/**
 * Recent Signals Feed item (C1) and full feed (C3). DEPARTMENT ONLY. Adding
 * team/position/tenure/work_format or any identity field here is a privacy
 * regression (Hard Rule #4). `summary` is the AI summary, not raw free text.
 */
export const SignalFeedItemSchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  departmentName: z.string().min(1),
  signalTypes: z.array(SignalTypeSchema).min(1),
  impactLevel: ImpactLevelSchema,
  tags: z.array(z.string()).default([]),
  createdAt: TimestampSchema,
});
export type SignalFeedItem = z.infer<typeof SignalFeedItemSchema>;

/**
 * Signal Detail (C4) / GET /dashboard/signals/:id. Extends the feed item with
 * AI fields. Deliberately omits raw `description`: the dashboard shows the
 * AI-generated `summary` instead, since redacted free text can still carry
 * self-identifying phrasing. Still DEPARTMENT ONLY, still no identity.
 */
export const SignalDetailSchema = SignalFeedItemSchema.extend({
  frequency: FrequencySchema,
  impactTypes: z.array(ImpactTypeSchema).min(1),
  relatedAreas: z.array(RelatedAreaSchema).optional(),
  workflowStage: WorkflowStageSchema.optional(),
  keywords: z.array(z.string()).default([]),
  estimatedImpact: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  incidentAt: TimestampSchema.optional(),
});
export type SignalDetail = z.infer<typeof SignalDetailSchema>;

/** Filters for GET /dashboard/signals (C3). Department is the only unit filter. */
export const SignalFeedFiltersSchema = z.object({
  departmentName: z.string().optional(),
  signalType: SignalTypeSchema.optional(),
  impactLevel: ImpactLevelSchema.optional(),
  period: PeriodSchema.optional(),
});
export type SignalFeedFilters = z.infer<typeof SignalFeedFiltersSchema>;

/**
 * Theme card (C1). `reportCount` is an aggregate that MUST be ≥ MIN_GROUP to be
 * shown (Hard Rule #2); smaller groups are dropped or bucketed to "Other"
 * upstream. `departmentNames` are chips and may include the "Other" bucket.
 */
export const ThemeSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  trend: ThemeTrendSchema,
  period: PeriodSchema,
  reportCount: z.number().int().min(1),
  departmentNames: z.array(z.string().min(1)).default([]),
  sparkline: z.array(z.number()).optional(),
});
export type Theme = z.infer<typeof ThemeSchema>;

/** One point in a theme's trend-over-time series. */
export const ThemePointSchema = z.object({
  period: PeriodSchema,
  count: z.number().int().nonnegative(),
});
export type ThemePoint = z.infer<typeof ThemePointSchema>;

/**
 * Theme Detail (C2) / GET /dashboard/themes/:id. Adds the trend series and a
 * sample of related signals — which are `SignalFeedItem`s, i.e. already
 * department-only and k-anon filtered.
 */
export const ThemeDetailSchema = ThemeSchema.extend({
  summary: z.string().optional(),
  trendSeries: z.array(ThemePointSchema).default([]),
  relatedSignals: z.array(SignalFeedItemSchema).default([]),
});
export type ThemeDetail = z.infer<typeof ThemeDetailSchema>;

/** AI Suggested Action (C1/C5) — `ai_actions` (§5). */
export const ActionSchema = z.object({
  id: IdSchema,
  relatedThemeId: IdSchema.nullable().optional(),
  relatedThemeName: z.string().nullable().optional(),
  priority: ActionPrioritySchema,
  title: z.string().min(1),
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
  status: ActionStatusSchema,
});
export type Action = z.infer<typeof ActionSchema>;
