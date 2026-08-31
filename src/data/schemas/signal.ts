import { z } from "zod";

import { IdSchema, TimestampSchema } from "./common";
import {
  EvidenceTypeSchema,
  FrequencySchema,
  ImpactLevelSchema,
  ImpactTypeSchema,
  RelatedAreaSchema,
  SignalTypeSchema,
  SubmissionStatusSchema,
  WorkFormatSchema,
  WorkflowStageSchema,
} from "./enums";

/**
 * Submission-side schemas (ARCHITECTURE.md §5, §5.1). The employee-facing form
 * input (`SignalSubmission`) is deliberately separate from the stored content
 * (`Signal`) and the anonymity-governed envelope (`Submission`).
 */

/**
 * One evidence attachment. A `url` item carries a link; `image`/`screenshot`/
 * `file` items carry file metadata (`s3Key` is assigned by the backend on
 * upload). The refine keeps the two shapes mutually consistent.
 */
export const EvidenceItemSchema = z
  .object({
    id: IdSchema.optional(),
    type: EvidenceTypeSchema,
    url: z.url().nullable().optional(),
    fileName: z.string().min(1).nullable().optional(),
    mime: z.string().nullable().optional(),
    sizeBytes: z.number().int().nonnegative().nullable().optional(),
    s3Key: z.string().nullable().optional(),
  })
  .refine((e) => (e.type === "url" ? Boolean(e.url) : Boolean(e.fileName)), {
    message: "url items require `url`; file items require `fileName`",
  });
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

/**
 * The 4-section Submit-Signal form payload (§5.1; plan Phase 3). INPUT only:
 * org context (department/team/position/work_format) is attached server-side
 * from the submitter's profile, and identity is governed separately by
 * `isAnonymous` (CLAUDE.md Hard Rule #1) — it is never carried in this payload.
 */
export const SignalSubmissionSchema = z.object({
  // Section 1 — Signal Type
  signalTypes: z.array(SignalTypeSchema).min(1),

  // Section 2 — Detail
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  frequency: FrequencySchema,
  impactTypes: z.array(ImpactTypeSchema).min(1),
  impactLevel: ImpactLevelSchema,
  incidentAt: TimestampSchema.optional(),

  // Section 3 — Optional
  relatedAreas: z.array(RelatedAreaSchema).optional(),
  improvementSuggestion: z.string().optional(),
  effectivenessScore: z.number().int().min(1).max(5).optional(),
  evidence: z.array(EvidenceItemSchema).optional(),
  workflowStage: WorkflowStageSchema.optional(),
  notes: z.string().optional(),

  // Section 4 — Privacy & Consent
  consentStatistics: z.boolean(),
  consentAi: z.boolean(),
  isAnonymous: z.boolean(),
});
export type SignalSubmission = z.infer<typeof SignalSubmissionSchema>;

/**
 * `signals` — the stored content row. The quasi-identifiers here
 * (team/position/tenure/work_format) MUST NOT be combined on any dashboard
 * view (CLAUDE.md Hard Rule #4). Dashboard reads use the coarsened
 * `SignalFeedItem` / `SignalDetail` shapes in `dashboard.ts`, never this.
 */
export const SignalSchema = z.object({
  id: IdSchema,
  submissionId: IdSchema,
  incidentAt: TimestampSchema.nullable().optional(),
  departmentId: IdSchema,
  teamId: IdSchema.nullable().optional(),
  position: z.string().nullable().optional(),
  tenure: z.string().nullable().optional(),
  workFormat: WorkFormatSchema.nullable().optional(),
  signalTypes: z.array(SignalTypeSchema).min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  frequency: FrequencySchema,
  impactTypes: z.array(ImpactTypeSchema).min(1),
  impactLevel: ImpactLevelSchema,
  relatedAreas: z.array(RelatedAreaSchema).optional(),
  improvementSuggestion: z.string().nullable().optional(),
  effectivenessScore: z.number().int().min(1).max(5).nullable().optional(),
  workflowStage: WorkflowStageSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type Signal = z.infer<typeof SignalSchema>;

/**
 * `submissions` — the envelope carrying consent + anonymity + lifecycle status.
 * When `isAnonymous` is true, NO identity row exists at all (§4.2); identity is
 * otherwise isolated in `submission_identity` with no join to content
 * (Hard Rule #1) and is never part of any frontend schema.
 */
export const SubmissionSchema = z.object({
  id: IdSchema,
  orgId: IdSchema,
  createdAt: TimestampSchema,
  isAnonymous: z.boolean(),
  consentStatistics: z.boolean(),
  consentAi: z.boolean(),
  status: SubmissionStatusSchema,
});
export type Submission = z.infer<typeof SubmissionSchema>;

/**
 * A row in the employee's own submission history (GET /signals/mine, screen B4).
 * Own-data self-view — never an aggregate, never exposed to org roles.
 */
export const MySubmissionItemSchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  signalTypes: z.array(SignalTypeSchema).min(1),
  impactLevel: ImpactLevelSchema,
  status: SubmissionStatusSchema,
  isAnonymous: z.boolean(),
  createdAt: TimestampSchema,
});
export type MySubmissionItem = z.infer<typeof MySubmissionItemSchema>;

/** Confirmation returned by POST /signals. */
export const SubmitSignalResultSchema = z.object({
  id: IdSchema,
  status: SubmissionStatusSchema,
  isAnonymous: z.boolean(),
  createdAt: TimestampSchema,
});
export type SubmitSignalResult = z.infer<typeof SubmitSignalResultSchema>;
