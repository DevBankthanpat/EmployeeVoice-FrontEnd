import { z } from "zod";

import { IdSchema, TimestampSchema } from "./common";
import {
  LocaleSchema,
  RoleSchema,
  UserStatusSchema,
  WorkFormatSchema,
} from "./enums";

/**
 * People-related schemas. Three representations, by audience:
 *  - `User`    — canonical entity (ARCHITECTURE.md §5 `users`).
 *  - `Member`  — admin management view (screens D1/D3): resolved org-unit names,
 *                and — per CLAUDE.md Hard Rule #7 — NO link to submitted signals.
 *  - `Profile` — self-view for GET /me and the Employee Home context card
 *                (§5.1 note: self-view only, never aggregated).
 */

/** `users` — canonical entity. No `hashed_password`: that never leaves the backend. */
export const UserSchema = z.object({
  id: IdSchema,
  orgId: IdSchema,
  email: z.email(),
  name: z.string().min(1),
  role: RoleSchema,
  branchId: IdSchema.nullable().optional(),
  departmentId: IdSchema.nullable().optional(),
  teamId: IdSchema.nullable().optional(),
  position: z.string().nullable().optional(),
  workFormat: WorkFormatSchema.nullable().optional(),
  status: UserStatusSchema,
  locale: LocaleSchema.optional(),
  createdAt: TimestampSchema,
});
export type User = z.infer<typeof UserSchema>;

/**
 * Admin-facing view of a user (Members list D1 / Member detail D3). Carries
 * resolved names for branch/department/team so admins can read and edit org
 * context. Deliberately has NO field linking a member to any submitted signal
 * (CLAUDE.md Hard Rule #7).
 */
export const MemberSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  email: z.email(),
  role: RoleSchema,
  status: UserStatusSchema,
  branchId: IdSchema.nullable().optional(),
  branchName: z.string().nullable().optional(),
  departmentId: IdSchema.nullable().optional(),
  departmentName: z.string().nullable().optional(),
  teamId: IdSchema.nullable().optional(),
  teamName: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  workFormat: WorkFormatSchema.nullable().optional(),
  createdAt: TimestampSchema,
});
export type Member = z.infer<typeof MemberSchema>;

/**
 * Self-view of the signed-in user (GET /me). Also powers the Employee Home
 * profile context card. Resolved names only; this is the user's own data and is
 * never aggregated or exposed to org roles (§5.1 note).
 */
export const ProfileSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  email: z.email(),
  role: RoleSchema,
  locale: LocaleSchema.optional(),
  branchName: z.string().nullable().optional(),
  departmentName: z.string().nullable().optional(),
  teamName: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  workFormat: WorkFormatSchema.nullable().optional(),
});
export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Role → capability map (Roles & Permissions screen D5, GET /roles). Mirrors the
 * fixed 3-role boundaries in CLAUDE.md Hard Rule #7.
 */
export const RolePermissionSchema = z.object({
  role: RoleSchema,
  canSubmitSignals: z.boolean(),
  canViewOwnSubmissions: z.boolean(),
  canViewDashboard: z.boolean(),
  canManageMembers: z.boolean(),
  canManageOrgSettings: z.boolean(),
  canRunAnalysis: z.boolean(),
  canViewAuditLog: z.boolean(),
});
export type RolePermission = z.infer<typeof RolePermissionSchema>;

// ── Auth + mutation inputs (mirror ARCHITECTURE.md §7) ──────────────────────

export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

/** Result of a login. Real auth adds JWTs in Phase 9; mock omits `token`. */
export const AuthResultSchema = z.object({
  user: ProfileSchema,
  token: z.string().optional(),
});
export type AuthResult = z.infer<typeof AuthResultSchema>;

/** PATCH /me — a user may only self-edit name + locale (§7). */
export const UpdateMeInputSchema = z
  .object({
    name: z.string().min(1),
    locale: LocaleSchema,
  })
  .partial();
export type UpdateMeInput = z.infer<typeof UpdateMeInputSchema>;

export const InviteMemberInputSchema = z.object({
  email: z.email(),
  name: z.string().min(1).optional(),
  role: RoleSchema,
  departmentId: IdSchema.optional(),
});
export type InviteMemberInput = z.infer<typeof InviteMemberInputSchema>;

/**
 * PATCH /members/:id — admin-managed fields only. Employees cannot self-edit
 * these (branch/department/team/position/work_format are admin-managed, §7).
 */
export const UpdateMemberInputSchema = z
  .object({
    role: RoleSchema,
    status: UserStatusSchema,
    branchId: IdSchema.nullable(),
    departmentId: IdSchema.nullable(),
    teamId: IdSchema.nullable(),
    position: z.string().nullable(),
    workFormat: WorkFormatSchema.nullable(),
  })
  .partial();
export type UpdateMemberInput = z.infer<typeof UpdateMemberInputSchema>;
