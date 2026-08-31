import type { z } from "zod";

import {
  ActionSchema,
  AnalysisRunSchema,
  AuditEntrySchema,
  BranchSchema,
  DashboardSummarySchema,
  DepartmentSchema,
  MemberSchema,
  MySubmissionItemSchema,
  OrgSettingsSchema,
  ProfileSchema,
  RolePermissionSchema,
  SignalDetailSchema,
  StatsSchema,
  TeamSchema,
  ThemeDetailSchema,
} from "@/data/schemas";

import actionsJson from "./actions.json";
import analysisRunsJson from "./analysisRuns.json";
import auditLogJson from "./auditLog.json";
import branchesJson from "./branches.json";
import dashboardSummaryJson from "./dashboardSummary.json";
import departmentsJson from "./departments.json";
import membersJson from "./members.json";
import mySubmissionsJson from "./mySubmissions.json";
import orgJson from "./org.json";
import profileJson from "./profile.json";
import rolePermissionsJson from "./rolePermissions.json";
import signalsJson from "./signals.json";
import statsJson from "./stats.json";
import teamsJson from "./teams.json";
import themesJson from "./themes.json";

/**
 * Validates a mock JSON blob against its Zod schema at module load, so
 * malformed mock data fails loudly at startup instead of surfacing as a broken
 * screen later. This is the "type-safe glue" that guarantees mock data always
 * matches the shared contract (implementation_plan.md Phase 1, task 6).
 */
function load<S extends z.ZodType>(
  schema: S,
  data: unknown,
  label: string,
): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `[mock] ${label} does not match its schema:\n` +
        JSON.stringify(result.error.issues, null, 2),
    );
  }
  return result.data;
}

// Org structure
export const mockOrgSettings = load(OrgSettingsSchema, orgJson, "org.json");
export const mockBranches = load(
  BranchSchema.array(),
  branchesJson,
  "branches.json",
);
export const mockDepartments = load(
  DepartmentSchema.array(),
  departmentsJson,
  "departments.json",
);
export const mockTeams = load(TeamSchema.array(), teamsJson, "teams.json");

// People
export const mockMembers = load(
  MemberSchema.array(),
  membersJson,
  "members.json",
);
export const mockProfile = load(ProfileSchema, profileJson, "profile.json");
export const mockRolePermissions = load(
  RolePermissionSchema.array(),
  rolePermissionsJson,
  "rolePermissions.json",
);

// Employee submissions
export const mockMySubmissions = load(
  MySubmissionItemSchema.array(),
  mySubmissionsJson,
  "mySubmissions.json",
);

// Dashboard (org)
export const mockDashboardSummary = load(
  DashboardSummarySchema,
  dashboardSummaryJson,
  "dashboardSummary.json",
);
export const mockStats = load(StatsSchema, statsJson, "stats.json");
export const mockThemes = load(
  ThemeDetailSchema.array(),
  themesJson,
  "themes.json",
);
export const mockSignals = load(
  SignalDetailSchema.array(),
  signalsJson,
  "signals.json",
);
export const mockActions = load(
  ActionSchema.array(),
  actionsJson,
  "actions.json",
);

// Admin
export const mockAuditLog = load(
  AuditEntrySchema.array(),
  auditLogJson,
  "auditLog.json",
);
export const mockAnalysisRuns = load(
  AnalysisRunSchema.array(),
  analysisRunsJson,
  "analysisRuns.json",
);

/** Simulated network latency so screens exercise their loading states in dev. */
export const MOCK_LATENCY_MS = 200;

/** Resolves after a short delay to mimic a real request round-trip. */
export function mockDelay(ms: number = MOCK_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
