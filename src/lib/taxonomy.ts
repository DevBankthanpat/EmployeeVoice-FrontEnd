import {
  Briefcase,
  FileText,
  Lightbulb,
  type LucideIcon,
  Megaphone,
  Minus,
  Monitor,
  Package,
  Smile,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
  Workflow,
} from "lucide-react";

import {
  type ActionPriority,
  type ActionStatus,
  type AnalysisRunStatus,
  EvidenceTypeSchema,
  FrequencySchema,
  type ImpactLevel,
  ImpactLevelSchema,
  ImpactTypeSchema,
  RelatedAreaSchema,
  type Role,
  RoleSchema,
  type SignalType,
  SignalTypeSchema,
  type SubmissionStatus,
  type ThemeTrend,
  type UserStatus,
  UserStatusSchema,
  WorkFormatSchema,
  WorkflowStageSchema,
} from "@/data/schemas";

/**
 * Presentation metadata for the signal taxonomy (ARCHITECTURE.md §5.1). This is
 * the "labels + icons are a presentation concern" layer the enums file defers
 * to Phase 3. Labels themselves live in i18n (`enums.*`); this file only owns
 * icons, stable display order, and the sparing semantic-color mapping used on
 * impact indicators (CLAUDE.md §Design direction).
 */

/** Ordered enum values (declaration order = the §5.1 order). */
export const SIGNAL_TYPES = SignalTypeSchema.options;
export const FREQUENCIES = FrequencySchema.options;
export const IMPACT_TYPES = ImpactTypeSchema.options;
export const IMPACT_LEVELS = ImpactLevelSchema.options;
export const RELATED_AREAS = RelatedAreaSchema.options;
export const WORKFLOW_STAGES = WorkflowStageSchema.options;
export const EVIDENCE_TYPES = EvidenceTypeSchema.options;

/** People/management enums (Phase 5 admin screens). */
export const ROLES = RoleSchema.options;
export const USER_STATUSES = UserStatusSchema.options;
export const WORK_FORMATS = WorkFormatSchema.options;

/** Lucide icon per signal type — mirrors the emoji cues in §5.1. */
export const SIGNAL_TYPE_ICONS: Record<SignalType, LucideIcon> = {
  process_workflow: Workflow,
  people_collaboration: Users,
  communication: Megaphone,
  system_software: Monitor,
  equipment_resource: Package,
  policy_procedure: FileText,
  management_decision: Briefcase,
  suggestion_improvement: Lightbulb,
  incident_risk: TriangleAlert,
  positive_practice: Smile,
};

/**
 * Badge classes per impact level. Semantic colors are used sparingly and only
 * here (impact indicators); low stays neutral so red/amber carry real weight.
 */
export const IMPACT_LEVEL_BADGE: Record<ImpactLevel, string> = {
  low: "border-border bg-muted text-muted-foreground",
  medium: "border-medium/20 bg-medium/10 text-medium",
  high: "border-high/20 bg-high/10 text-high",
  severe: "border-high/30 bg-high/15 font-semibold text-high",
};

/** Badge classes per submission lifecycle status (My Submissions chips). */
export const SUBMISSION_STATUS_BADGE: Record<SubmissionStatus, string> = {
  submitted: "border-border bg-muted text-muted-foreground",
  processing: "border-medium/20 bg-medium/10 text-medium",
  analyzed: "border-primary/20 bg-primary/10 text-primary",
};

// ── Management (admin-side) presentation maps (Phase 5) ──────────────────────

/** Badge classes per role. Admin is emphasised; the rest stay neutral. */
export const ROLE_BADGE: Record<Role, string> = {
  employee: "border-border bg-muted text-muted-foreground",
  org_viewer: "border-primary/20 bg-primary/10 text-primary",
  org_admin: "border-primary/30 bg-primary/15 font-semibold text-primary",
};

/**
 * Badge classes per account status (Members list / detail). Green for active,
 * amber for a pending invite, neutral for disabled — semantic colour used
 * sparingly per §Design direction.
 */
export const USER_STATUS_BADGE: Record<UserStatus, string> = {
  active: "border-positive/20 bg-positive/10 text-positive",
  invited: "border-medium/20 bg-medium/10 text-medium",
  disabled: "border-border bg-muted text-muted-foreground",
};

// ── Dashboard (org-side) presentation maps ──────────────────────────────────

/** Trend arrow per theme direction (theme cards / detail). Neutral by design:
 * a rising problem and a rising positive read differently, so colour is not used
 * to imply good/bad — the label carries the meaning. */
export const THEME_TREND_ICON: Record<ThemeTrend, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

/** Badge classes per suggested-action priority (Actions Board / overview). */
export const ACTION_PRIORITY_BADGE: Record<ActionPriority, string> = {
  low: "border-border bg-muted text-muted-foreground",
  medium: "border-medium/20 bg-medium/10 text-medium",
  high: "border-high/20 bg-high/10 text-high",
};

/** Badge classes per suggested-action review state (Actions Board columns). */
export const ACTION_STATUS_BADGE: Record<ActionStatus, string> = {
  new: "border-primary/20 bg-primary/10 text-primary",
  reviewed: "border-medium/20 bg-medium/10 text-medium",
  done: "border-positive/20 bg-positive/10 text-positive",
};

/** Badge classes per analysis-run lifecycle status (Analysis Runs). */
export const ANALYSIS_RUN_STATUS_BADGE: Record<AnalysisRunStatus, string> = {
  queued: "border-border bg-muted text-muted-foreground",
  running: "border-primary/20 bg-primary/10 text-primary",
  completed: "border-positive/20 bg-positive/10 text-positive",
  failed: "border-high/20 bg-high/10 text-high",
};
