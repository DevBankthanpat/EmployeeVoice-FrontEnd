/**
 * The single data abstraction.
 *
 * Components MUST only ever call `provider.*`. Swapping mock → real (Phase 9)
 * must touch only this layer — never a component. See ARCHITECTURE.md §8 and
 * implementation_plan.md Guiding Principles #2.
 *
 * The interface mirrors the API contract in ARCHITECTURE.md §7 one-to-one, so
 * `apiProvider` can be a direct translation of each REST route.
 */
import { apiProvider } from "@/data/api/provider";
import { mockProvider } from "@/data/mock/provider";
import type {
  Action,
  ActionStatus,
  AnalysisRun,
  AuditEntry,
  AuthResult,
  Branch,
  CreateBranchInput,
  CreateDepartmentInput,
  CreateTeamInput,
  DashboardSummary,
  Department,
  InviteMemberInput,
  LoginInput,
  Member,
  MySubmissionItem,
  OrgSettings,
  Profile,
  RolePermission,
  SignalDetail,
  SignalFeedFilters,
  SignalFeedItem,
  SignalSubmission,
  Stats,
  SubmitSignalResult,
  Team,
  Theme,
  ThemeDetail,
  UpdateBranchInput,
  UpdateMeInput,
  UpdateMemberInput,
  UpdateOrgSettingsInput,
} from "@/data/schemas";
import { USE_MOCK } from "@/lib/env";

export interface DataProvider {
  // ── Auth & profile ──────────────────────────────────────────────────────
  login(input: LoginInput): Promise<AuthResult>;
  getMe(): Promise<Profile>;
  updateMe(patch: UpdateMeInput): Promise<Profile>;

  // ── Employee ────────────────────────────────────────────────────────────
  submitSignal(input: SignalSubmission): Promise<SubmitSignalResult>;
  getMySubmissions(): Promise<MySubmissionItem[]>;

  // ── Dashboard [org] ─────────────────────────────────────────────────────
  getDashboardSummary(): Promise<DashboardSummary>;
  getDashboardStats(): Promise<Stats>;
  getThemes(): Promise<Theme[]>;
  getTheme(id: string): Promise<ThemeDetail>;
  getDashboardSignals(filters?: SignalFeedFilters): Promise<SignalFeedItem[]>;
  getDashboardSignal(id: string): Promise<SignalDetail>;
  getActions(): Promise<Action[]>;
  updateActionStatus(id: string, status: ActionStatus): Promise<Action>;

  // ── Management [admin] ──────────────────────────────────────────────────
  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member>;
  inviteMember(input: InviteMemberInput): Promise<Member>;
  updateMember(id: string, patch: UpdateMemberInput): Promise<Member>;
  getBranches(): Promise<Branch[]>;
  createBranch(input: CreateBranchInput): Promise<Branch>;
  updateBranch(id: string, patch: UpdateBranchInput): Promise<Branch>;
  getDepartments(): Promise<Department[]>;
  createDepartment(input: CreateDepartmentInput): Promise<Department>;
  getTeams(): Promise<Team[]>;
  createTeam(input: CreateTeamInput): Promise<Team>;
  getRoles(): Promise<RolePermission[]>;
  getOrgSettings(): Promise<OrgSettings>;
  updateOrgSettings(patch: UpdateOrgSettingsInput): Promise<OrgSettings>;
  getAuditLog(): Promise<AuditEntry[]>;
  runAnalysis(): Promise<AnalysisRun>;
  getAnalysisRuns(): Promise<AnalysisRun[]>;
}

export type DataSource = "mock" | "api";

/** Which implementation is active. Exposed for debug surfaces / banners. */
export const dataSource: DataSource = USE_MOCK ? "mock" : "api";

/** The one provider the whole app talks to. */
export const provider: DataProvider = USE_MOCK ? mockProvider : apiProvider;
