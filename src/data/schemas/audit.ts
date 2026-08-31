import { z } from "zod";

import { IdSchema, TimestampSchema } from "./common";
import { RoleSchema } from "./enums";

/**
 * `audit_log` (ARCHITECTURE.md §5, CLAUDE.md Hard Rule #8). Records sensitive
 * actions by org admins/viewers (dashboard access, member management, analysis
 * runs). Actors are org-side users; this log never references signal submitters.
 */
export const AuditEntrySchema = z.object({
  id: IdSchema,
  actorName: z.string().min(1),
  actorRole: RoleSchema.optional(),
  /** e.g. view_dashboard | invite_member | edit_role | run_analysis | ... */
  action: z.string().min(1),
  target: z.string().nullable().optional(),
  createdAt: TimestampSchema,
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;
