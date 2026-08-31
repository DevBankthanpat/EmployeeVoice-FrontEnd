import { z } from "zod";

import { IdSchema, PeriodSchema, TimestampSchema } from "./common";
import { AnalysisRunStatusSchema, AnalysisTriggerSchema } from "./enums";

/**
 * `analysis_runs` (ARCHITECTURE.md §5). One record per AI pipeline run, shown on
 * the Analysis Runs screen (C6) and returned by GET /admin/analysis-runs.
 */
export const AnalysisRunSchema = z.object({
  id: IdSchema,
  period: PeriodSchema,
  triggeredBy: AnalysisTriggerSchema,
  status: AnalysisRunStatusSchema,
  startedAt: TimestampSchema.nullable().optional(),
  finishedAt: TimestampSchema.nullable().optional(),
  signalsProcessed: z.number().int().nonnegative().nullable().optional(),
});
export type AnalysisRun = z.infer<typeof AnalysisRunSchema>;
