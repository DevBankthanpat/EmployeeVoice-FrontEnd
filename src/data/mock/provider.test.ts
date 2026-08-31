import { describe, expect, it } from "vitest";

import { provider } from "@/data/provider";
import {
  ActionSchema,
  AnalysisRunSchema,
  AuditEntrySchema,
  BranchSchema,
  DashboardSummarySchema,
  MemberSchema,
  ProfileSchema,
  SignalDetailSchema,
  SignalFeedItemSchema,
  StatsSchema,
  ThemeSchema,
} from "@/data/schemas";
import { DEFAULT_MIN_GROUP } from "@/lib/anonymity";

/**
 * End-to-end check of the Phase 1 deliverable: every provider method returns
 * data that validates against the shared schema for the screen that consumes
 * it. Exercises the derived projections (theme cards, department-only feed),
 * filters, the anonymity echo on submit, and the not-found error paths.
 */

const FORBIDDEN_DASHBOARD_KEYS = [
  "teamId",
  "teamName",
  "position",
  "tenure",
  "workFormat",
  "employeeId",
  "userId",
  "submitterId",
  "email",
  "name",
];

describe("mockProvider — dashboard reads", () => {
  it("returns a schema-valid executive summary and stats", async () => {
    const [summary, stats] = await Promise.all([
      provider.getDashboardSummary(),
      provider.getDashboardStats(),
    ]);
    expect(DashboardSummarySchema.safeParse(summary).success).toBe(true);
    expect(StatsSchema.safeParse(stats).success).toBe(true);
  });

  it("projects themes to cards that stay k-anon compliant", async () => {
    const themes = await provider.getThemes();
    expect(themes.length).toBeGreaterThan(0);
    for (const theme of themes) {
      expect(ThemeSchema.safeParse(theme).success).toBe(true);
      expect(theme.reportCount).toBeGreaterThanOrEqual(DEFAULT_MIN_GROUP);
    }
  });

  it("returns a theme detail by id and rejects an unknown id", async () => {
    const themes = await provider.getThemes();
    const first = themes[0];
    expect(first).toBeDefined();
    const detail = await provider.getTheme(first!.id);
    expect(detail.trendSeries.length).toBeGreaterThan(0);
    // related signals are department-only feed items
    for (const s of detail.relatedSignals) {
      expect(SignalFeedItemSchema.safeParse(s).success).toBe(true);
    }
    await expect(provider.getTheme("thm_does_not_exist")).rejects.toThrow();
  });

  it("feeds only department-scoped signals and honors filters", async () => {
    const all = await provider.getDashboardSignals();
    expect(all.length).toBeGreaterThan(0);
    for (const item of all) {
      expect(SignalFeedItemSchema.safeParse(item).success).toBe(true);
      // Defense-in-depth: the projection must not leak identity/quasi-identifiers.
      for (const key of FORBIDDEN_DASHBOARD_KEYS) {
        expect(key in item).toBe(false);
      }
    }
    const ops = await provider.getDashboardSignals({
      departmentName: "Operations",
    });
    expect(ops.length).toBeGreaterThan(0);
    expect(ops.every((i) => i.departmentName === "Operations")).toBe(true);
    expect(ops.length).toBeLessThan(all.length);
  });

  it("returns a signal detail (AI fields, no raw description)", async () => {
    const feed = await provider.getDashboardSignals();
    const detail = await provider.getDashboardSignal(feed[0]!.id);
    expect(SignalDetailSchema.safeParse(detail).success).toBe(true);
    expect("description" in detail).toBe(false);
    await expect(
      provider.getDashboardSignal("sig_does_not_exist"),
    ).rejects.toThrow();
  });

  it("returns schema-valid actions and updates a status", async () => {
    const actions = await provider.getActions();
    expect(actions.length).toBeGreaterThan(0);
    const updated = await provider.updateActionStatus(actions[0]!.id, "done");
    expect(ActionSchema.safeParse(updated).success).toBe(true);
    expect(updated.status).toBe("done");
  });
});

describe("mockProvider — auth, profile & employee", () => {
  it("logs in a known member and rejects an unknown email", async () => {
    const result = await provider.login({
      email: "kanya.sirichai@meridian.co.th",
      password: "whatever",
    });
    expect(ProfileSchema.safeParse(result.user).success).toBe(true);
    expect(result.user.role).toBe("org_admin");
    await expect(
      provider.login({ email: "nobody@example.com", password: "x" }),
    ).rejects.toThrow();
  });

  it("returns the current profile and my submissions", async () => {
    const me = await provider.getMe();
    expect(ProfileSchema.safeParse(me).success).toBe(true);
    const mine = await provider.getMySubmissions();
    expect(mine.length).toBeGreaterThan(0);
  });

  it("echoes an anonymous submission without recording identity", async () => {
    const result = await provider.submitSignal({
      signalTypes: ["process_workflow"],
      title: "Test signal",
      description: "Something to look at.",
      frequency: "rare",
      impactTypes: ["time_loss"],
      impactLevel: "low",
      consentStatistics: true,
      consentAi: true,
      isAnonymous: true,
    });
    expect(result.isAnonymous).toBe(true);
    expect(result.status).toBe("submitted");
  });
});

describe("mockProvider — management", () => {
  it("returns schema-valid members, audit log, runs and roles", async () => {
    const [members, audit, runs, roles] = await Promise.all([
      provider.getMembers(),
      provider.getAuditLog(),
      provider.getAnalysisRuns(),
      provider.getRoles(),
    ]);
    expect(members.every((m) => MemberSchema.safeParse(m).success)).toBe(true);
    expect(audit.every((a) => AuditEntrySchema.safeParse(a).success)).toBe(
      true,
    );
    expect(runs.every((r) => AnalysisRunSchema.safeParse(r).success)).toBe(
      true,
    );
    expect(roles.length).toBe(3);
  });

  it("invites a member (status invited) and resolves department name", async () => {
    const member = await provider.inviteMember({
      email: "new.person@meridian.co.th",
      role: "employee",
      departmentId: "dep_ops",
    });
    expect(MemberSchema.safeParse(member).success).toBe(true);
    expect(member.status).toBe("invited");
    expect(member.departmentName).toBe("Operations");
  });

  it("creates a branch and triggers an analysis run", async () => {
    const branch = await provider.createBranch({ name: "Khon Kaen Branch" });
    expect(BranchSchema.safeParse(branch).success).toBe(true);
    const run = await provider.runAnalysis();
    expect(AnalysisRunSchema.safeParse(run).success).toBe(true);
    expect(run.triggeredBy).toBe("manual");
  });
});
