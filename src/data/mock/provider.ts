import type { DataProvider } from "@/data/provider";
import {
  type Action,
  ActionSchema,
  type AnalysisRun,
  AnalysisRunSchema,
  type Branch,
  BranchSchema,
  type Department,
  DepartmentSchema,
  type Member,
  MemberSchema,
  type MySubmissionItem,
  MySubmissionItemSchema,
  type OrgSettings,
  OrgSettingsSchema,
  ProfileSchema,
  SubmitSignalResultSchema,
  type Team,
  TeamSchema,
  ThemeSchema,
  type ActionStatus,
  type SignalFeedItem,
  type Theme,
  type ThemeDetail,
} from "@/data/schemas";

import * as db from "./index";

/**
 * The mock implementation of {@link DataProvider}. Reads are served from the
 * validated mock JSON in `./index`; writes return a freshly constructed,
 * schema-validated object (the mock is not persisted across calls — that is not
 * needed to demo the frontend, Phases 2–5). Every method is async and delayed
 * so screens exercise their loading states.
 */

let seq = 0;
function genId(prefix: string): string {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function currentPeriod(): string {
  return nowIso().slice(0, 7);
}

function findOrThrow<T>(
  items: readonly T[],
  match: (t: T) => boolean,
  what: string,
): T {
  const found = items.find(match);
  if (!found) throw new Error(`[mock] ${what} not found`);
  return found;
}

/** Project the full stored signal down to the department-only feed shape (§4.5). */
function toFeedItem(s: (typeof db.mockSignals)[number]): SignalFeedItem {
  return {
    id: s.id,
    title: s.title,
    summary: s.summary,
    departmentName: s.departmentName,
    signalTypes: s.signalTypes,
    impactLevel: s.impactLevel,
    tags: s.tags,
    createdAt: s.createdAt,
  };
}

/**
 * In-memory own-submission history, seeded from the JSON. `submitSignal`
 * prepends to it so a freshly submitted signal shows up in My Submissions
 * during the session (Phase 3 DoD). This is the employee's OWN self-view
 * (GET /signals/mine) — it is not an identity link and does not conflict with
 * §4.2: anonymity governs the org dashboard, which never reads this list. State
 * is per page-load only (resets on refresh), which is all the mock needs.
 */
const mySubmissions: MySubmissionItem[] = [...db.mockMySubmissions];

/**
 * In-memory AI-actions state, seeded from the JSON. `updateActionStatus` mutates
 * it so the Actions Board (C5) visibly moves a card between columns during the
 * session (Phase 4 DoD: "mark reviewed/done — mock mutation"). Per page-load only.
 */
const actions: Action[] = db.mockActions.map((a) => ({ ...a }));

/**
 * In-memory analysis-run history, seeded from the JSON. `runAnalysis` prepends a
 * new queued run so "Run analysis now" (C6) visibly adds a row. Per page-load only.
 */
const analysisRuns: AnalysisRun[] = [...db.mockAnalysisRuns];

/**
 * In-memory org-management state, seeded from the JSON. The admin screens (D1–D7)
 * mutate these so an invite, a rename, a new department, or a settings change is
 * reflected across refetches within the session (Phase 5 DoD: "manage members/
 * departments/settings entirely on mock"). Per page-load only (resets on refresh).
 */
const members: Member[] = db.mockMembers.map((m) => ({ ...m }));
const branches: Branch[] = db.mockBranches.map((b) => ({ ...b }));
const departments: Department[] = db.mockDepartments.map((d) => ({ ...d }));
const teams: Team[] = db.mockTeams.map((t) => ({ ...t }));
let orgSettings: OrgSettings = { ...db.mockOrgSettings };

/** Project a full theme detail down to the card shape. */
function toThemeCard(t: ThemeDetail): Theme {
  return ThemeSchema.parse({
    id: t.id,
    name: t.name,
    trend: t.trend,
    period: t.period,
    reportCount: t.reportCount,
    departmentNames: t.departmentNames,
    sparkline: t.sparkline,
  });
}

export const mockProvider: DataProvider = {
  // ── Auth & profile ──────────────────────────────────────────────────────
  async login(input) {
    await db.mockDelay();
    const member = db.mockMembers.find(
      (m) => m.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (!member) throw new Error("Invalid email or password");
    const user = ProfileSchema.parse({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      locale: "th",
      branchName: member.branchName ?? null,
      departmentName: member.departmentName ?? null,
      teamName: member.teamName ?? null,
      position: member.position ?? null,
      workFormat: member.workFormat ?? null,
    });
    return { user };
  },

  async getMe() {
    await db.mockDelay();
    return db.mockProfile;
  },

  async updateMe(patch) {
    await db.mockDelay();
    return ProfileSchema.parse({ ...db.mockProfile, ...patch });
  },

  // ── Employee ────────────────────────────────────────────────────────────
  async submitSignal(input) {
    await db.mockDelay();
    const id = genId("sub");
    const createdAt = nowIso();
    // Record the employee's own history row so it appears in My Submissions.
    // Anonymity (Hard Rule #1 / §4.2) is unaffected: when isAnonymous is true no
    // identity row is written on the backend; this self-view is not that link.
    mySubmissions.unshift(
      MySubmissionItemSchema.parse({
        id,
        title: input.title.trim(),
        signalTypes: input.signalTypes,
        impactLevel: input.impactLevel,
        status: "submitted",
        isAnonymous: input.isAnonymous,
        createdAt,
      }),
    );
    return SubmitSignalResultSchema.parse({
      id,
      status: "submitted",
      isAnonymous: input.isAnonymous,
      createdAt,
    });
  },

  async getMySubmissions() {
    await db.mockDelay();
    return [...mySubmissions];
  },

  // ── Dashboard [org] ─────────────────────────────────────────────────────
  async getDashboardSummary() {
    await db.mockDelay();
    return db.mockDashboardSummary;
  },

  async getDashboardStats() {
    await db.mockDelay();
    return db.mockStats;
  },

  async getThemes() {
    await db.mockDelay();
    return db.mockThemes.map(toThemeCard);
  },

  async getTheme(id) {
    await db.mockDelay();
    return findOrThrow(db.mockThemes, (t) => t.id === id, `theme "${id}"`);
  },

  async getDashboardSignals(filters) {
    await db.mockDelay();
    let items = db.mockSignals.map(toFeedItem);
    const department = filters?.departmentName;
    const signalType = filters?.signalType;
    const impactLevel = filters?.impactLevel;
    const period = filters?.period;
    if (department)
      items = items.filter((i) => i.departmentName === department);
    if (signalType)
      items = items.filter((i) => i.signalTypes.includes(signalType));
    if (impactLevel) items = items.filter((i) => i.impactLevel === impactLevel);
    if (period) items = items.filter((i) => i.createdAt.slice(0, 7) === period);
    return items;
  },

  async getDashboardSignal(id) {
    await db.mockDelay();
    return findOrThrow(db.mockSignals, (s) => s.id === id, `signal "${id}"`);
  },

  async getActions() {
    await db.mockDelay();
    return [...actions];
  },

  async updateActionStatus(id, status: ActionStatus) {
    await db.mockDelay();
    const action = findOrThrow(actions, (a) => a.id === id, `action "${id}"`);
    const updated = ActionSchema.parse({ ...action, status });
    // Persist so the board reflects the change across refetches this session.
    const index = actions.indexOf(action);
    actions[index] = updated;
    return updated;
  },

  // ── Management [admin] ──────────────────────────────────────────────────
  async getMembers() {
    await db.mockDelay();
    return [...members];
  },

  async getMember(id) {
    await db.mockDelay();
    return findOrThrow(members, (m) => m.id === id, `member "${id}"`);
  },

  async inviteMember(input) {
    await db.mockDelay();
    const dept = input.departmentId
      ? departments.find((d) => d.id === input.departmentId)
      : undefined;
    const member = MemberSchema.parse({
      id: genId("usr"),
      name: input.name ?? input.email.split("@")[0] ?? input.email,
      email: input.email,
      role: input.role,
      status: "invited",
      branchId: null,
      branchName: null,
      departmentId: input.departmentId ?? null,
      departmentName: dept?.name ?? null,
      teamId: null,
      teamName: null,
      position: null,
      workFormat: null,
      createdAt: nowIso(),
    });
    // Prepend so the new invite is visible at the top of the members list.
    members.unshift(member);
    return member;
  },

  async updateMember(id, patch) {
    await db.mockDelay();
    const existing = findOrThrow(members, (m) => m.id === id, `member "${id}"`);
    const merged = { ...existing, ...patch };
    // Re-resolve display names when the underlying ids change.
    if (patch.branchId !== undefined) {
      merged.branchName =
        branches.find((b) => b.id === patch.branchId)?.name ?? null;
    }
    if (patch.departmentId !== undefined) {
      merged.departmentName =
        departments.find((d) => d.id === patch.departmentId)?.name ?? null;
    }
    if (patch.teamId !== undefined) {
      merged.teamName = teams.find((t) => t.id === patch.teamId)?.name ?? null;
    }
    const updated = MemberSchema.parse(merged);
    members[members.indexOf(existing)] = updated;
    return updated;
  },

  async getBranches() {
    await db.mockDelay();
    return [...branches];
  },

  async createBranch(input) {
    await db.mockDelay();
    const branch = BranchSchema.parse({
      id: genId("br"),
      orgId: orgSettings.id,
      name: input.name,
    });
    branches.push(branch);
    return branch;
  },

  async updateBranch(id, patch) {
    await db.mockDelay();
    const existing = findOrThrow(
      branches,
      (b) => b.id === id,
      `branch "${id}"`,
    );
    const updated = BranchSchema.parse({ ...existing, name: patch.name });
    branches[branches.indexOf(existing)] = updated;
    return updated;
  },

  async getDepartments() {
    await db.mockDelay();
    return [...departments];
  },

  async createDepartment(input) {
    await db.mockDelay();
    const dept = DepartmentSchema.parse({
      id: genId("dep"),
      orgId: orgSettings.id,
      name: input.name,
    });
    departments.push(dept);
    return dept;
  },

  async getTeams() {
    await db.mockDelay();
    return [...teams];
  },

  async createTeam(input) {
    await db.mockDelay();
    const team = TeamSchema.parse({
      id: genId("team"),
      departmentId: input.departmentId,
      name: input.name,
    });
    teams.push(team);
    return team;
  },

  async getRoles() {
    await db.mockDelay();
    return db.mockRolePermissions;
  },

  async getOrgSettings() {
    await db.mockDelay();
    return orgSettings;
  },

  async updateOrgSettings(patch) {
    await db.mockDelay();
    orgSettings = OrgSettingsSchema.parse({ ...orgSettings, ...patch });
    return orgSettings;
  },

  async getAuditLog() {
    await db.mockDelay();
    return db.mockAuditLog;
  },

  async runAnalysis() {
    await db.mockDelay();
    const run = AnalysisRunSchema.parse({
      id: genId("run"),
      period: currentPeriod(),
      triggeredBy: "manual",
      status: "queued",
      startedAt: nowIso(),
      finishedAt: null,
      signalsProcessed: null,
    });
    // Prepend so it appears at the top of the run history this session.
    analysisRuns.unshift(run);
    return run;
  },

  async getAnalysisRuns() {
    await db.mockDelay();
    return [...analysisRuns];
  },
};
