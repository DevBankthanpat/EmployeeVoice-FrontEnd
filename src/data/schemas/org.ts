import { z } from "zod";

import { IdSchema, TimestampSchema } from "./common";

/**
 * Organization structure (ARCHITECTURE.md §5): branches, departments, teams,
 * and the editable org settings surfaced on the Org Settings screen (D6).
 */

/** `branches` — name only per §5. */
export const BranchSchema = z.object({
  id: IdSchema,
  orgId: IdSchema,
  name: z.string().min(1),
});
export type Branch = z.infer<typeof BranchSchema>;

/** `departments` — the only quasi-identifier ever shown on the dashboard (§4.5). */
export const DepartmentSchema = z.object({
  id: IdSchema,
  orgId: IdSchema,
  name: z.string().min(1),
});
export type Department = z.infer<typeof DepartmentSchema>;

/** `teams` — belongs to a department. A quasi-identifier; never dashboard-shown. */
export const TeamSchema = z.object({
  id: IdSchema,
  departmentId: IdSchema,
  name: z.string().min(1),
});
export type Team = z.infer<typeof TeamSchema>;

/** Editable org config (`organizations` subset) for the Org Settings screen (D6). */
export const OrgSettingsSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  logoUrl: z.url().nullable().optional(),
  /** k-anonymity threshold, default 5 (§4.3). Never below 1. */
  minGroupThreshold: z.number().int().min(1),
  consentPolicyText: z.string(),
  createdAt: TimestampSchema.optional(),
});
export type OrgSettings = z.infer<typeof OrgSettingsSchema>;

// ── Mutation inputs (mirror ARCHITECTURE.md §7) ─────────────────────────────

export const CreateBranchInputSchema = z.object({ name: z.string().min(1) });
export type CreateBranchInput = z.infer<typeof CreateBranchInputSchema>;

export const UpdateBranchInputSchema = z.object({ name: z.string().min(1) });
export type UpdateBranchInput = z.infer<typeof UpdateBranchInputSchema>;

export const CreateDepartmentInputSchema = z.object({
  name: z.string().min(1),
});
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentInputSchema>;

export const CreateTeamInputSchema = z.object({
  name: z.string().min(1),
  departmentId: IdSchema,
});
export type CreateTeamInput = z.infer<typeof CreateTeamInputSchema>;

export const UpdateOrgSettingsInputSchema = z
  .object({
    name: z.string().min(1),
    logoUrl: z.url().nullable(),
    minGroupThreshold: z.number().int().min(1),
    consentPolicyText: z.string(),
  })
  .partial();
export type UpdateOrgSettingsInput = z.infer<
  typeof UpdateOrgSettingsInputSchema
>;
