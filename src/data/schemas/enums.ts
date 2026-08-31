import { z } from "zod";

/**
 * Controlled vocabularies. The taxonomy enums mirror ARCHITECTURE.md §5.1
 * exactly; the system enums mirror the status/kind columns in §5. Display
 * labels + icons (TH/EN) are a presentation concern and are added with the
 * form UI in Phase 3 — these are the raw stored values only.
 */

// ── Signal taxonomy (ARCHITECTURE.md §5.1) ──────────────────────────────────

/** Signal type — multi-select, 10 values. */
export const SignalTypeSchema = z.enum([
  "process_workflow",
  "people_collaboration",
  "communication",
  "system_software",
  "equipment_resource",
  "policy_procedure",
  "management_decision",
  "suggestion_improvement",
  "incident_risk",
  "positive_practice",
]);
export type SignalType = z.infer<typeof SignalTypeSchema>;

/** How often the situation occurs — single-select. */
export const FrequencySchema = z.enum([
  "first_time",
  "rare",
  "regular",
  "almost_daily",
]);
export type Frequency = z.infer<typeof FrequencySchema>;

/** Kind of impact — multi-select. */
export const ImpactTypeSchema = z.enum([
  "time_loss",
  "rework",
  "errors",
  "customer_impact",
  "team_difficulty",
  "stress",
  "cost_increase",
  "other",
]);
export type ImpactType = z.infer<typeof ImpactTypeSchema>;

/** Severity — single-select. Includes `severe` per §5.1. */
export const ImpactLevelSchema = z.enum(["low", "medium", "high", "severe"]);
export type ImpactLevel = z.infer<typeof ImpactLevelSchema>;

/** Related area — optional multi-select. */
export const RelatedAreaSchema = z.enum([
  "workflow",
  "tools_systems",
  "communication",
  "resource_shortage",
  "planning",
  "policy",
  "decision_making",
  "knowledge_training",
  "other",
]);
export type RelatedArea = z.infer<typeof RelatedAreaSchema>;

/** Workflow stage the issue occurred in — optional single-select. */
export const WorkflowStageSchema = z.enum([
  "receive_task",
  "verify_info",
  "request_approval",
  "execute",
  "deliver",
  "close",
]);
export type WorkflowStage = z.infer<typeof WorkflowStageSchema>;

/** Evidence attachment kind. */
export const EvidenceTypeSchema = z.enum([
  "image",
  "screenshot",
  "file",
  "url",
]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

/** Work format — a profile field (ARCHITECTURE.md §5.1). */
export const WorkFormatSchema = z.enum(["onsite", "hybrid", "remote", "field"]);
export type WorkFormat = z.infer<typeof WorkFormatSchema>;

// ── System enums (ARCHITECTURE.md §5) ───────────────────────────────────────

/** The three fixed POC roles (ARCHITECTURE.md §1.1, CLAUDE.md Hard Rule #7). */
export const RoleSchema = z.enum(["employee", "org_viewer", "org_admin"]);
export type Role = z.infer<typeof RoleSchema>;

/** Account lifecycle (`users.status`). */
export const UserStatusSchema = z.enum(["active", "invited", "disabled"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

/** Submission lifecycle (`submissions.status`). */
export const SubmissionStatusSchema = z.enum([
  "submitted",
  "processing",
  "analyzed",
]);
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

/** Theme trend direction (`themes.trend`). */
export const ThemeTrendSchema = z.enum(["up", "down", "stable"]);
export type ThemeTrend = z.infer<typeof ThemeTrendSchema>;

/** Suggested-action priority (`ai_actions.priority`). */
export const ActionPrioritySchema = z.enum(["low", "medium", "high"]);
export type ActionPriority = z.infer<typeof ActionPrioritySchema>;

/** Suggested-action review state (`ai_actions.status`). */
export const ActionStatusSchema = z.enum(["new", "reviewed", "done"]);
export type ActionStatus = z.infer<typeof ActionStatusSchema>;

/** Analysis run lifecycle (`analysis_runs.status`). */
export const AnalysisRunStatusSchema = z.enum([
  "queued",
  "running",
  "completed",
  "failed",
]);
export type AnalysisRunStatus = z.infer<typeof AnalysisRunStatusSchema>;

/** What triggered an analysis run (`analysis_runs.triggered_by`). */
export const AnalysisTriggerSchema = z.enum(["cron", "manual"]);
export type AnalysisTrigger = z.infer<typeof AnalysisTriggerSchema>;

/** UI locale (mirrors `src/i18n/config.ts` `locales`). */
export const LocaleSchema = z.enum(["th", "en"]);
export type LocaleValue = z.infer<typeof LocaleSchema>;
