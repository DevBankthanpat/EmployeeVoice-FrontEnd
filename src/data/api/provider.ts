import type { DataProvider } from "@/data/provider";

/**
 * The real-API implementation of {@link DataProvider}. It is a placeholder until
 * Phase 9 (Integration): each method mirrors a REST route in ARCHITECTURE.md §7.
 * Until then, selecting it (NEXT_PUBLIC_USE_MOCK=false) fails fast with a clear
 * message rather than silently returning nothing.
 */
function notImplemented(method: string): Promise<never> {
  return Promise.reject(
    new Error(
      `[apiProvider] "${method}" is not implemented yet. The real backend is ` +
        `wired in Phase 9; until then run with NEXT_PUBLIC_USE_MOCK=true. ` +
        `See implementation_plan.md.`,
    ),
  );
}

export const apiProvider: DataProvider = {
  // Auth & profile
  login: () => notImplemented("login"),
  getMe: () => notImplemented("getMe"),
  updateMe: () => notImplemented("updateMe"),

  // Employee
  submitSignal: () => notImplemented("submitSignal"),
  getMySubmissions: () => notImplemented("getMySubmissions"),

  // Dashboard [org]
  getDashboardSummary: () => notImplemented("getDashboardSummary"),
  getDashboardStats: () => notImplemented("getDashboardStats"),
  getThemes: () => notImplemented("getThemes"),
  getTheme: () => notImplemented("getTheme"),
  getDashboardSignals: () => notImplemented("getDashboardSignals"),
  getDashboardSignal: () => notImplemented("getDashboardSignal"),
  getActions: () => notImplemented("getActions"),
  updateActionStatus: () => notImplemented("updateActionStatus"),

  // Management [admin]
  getMembers: () => notImplemented("getMembers"),
  getMember: () => notImplemented("getMember"),
  inviteMember: () => notImplemented("inviteMember"),
  updateMember: () => notImplemented("updateMember"),
  getBranches: () => notImplemented("getBranches"),
  createBranch: () => notImplemented("createBranch"),
  updateBranch: () => notImplemented("updateBranch"),
  getDepartments: () => notImplemented("getDepartments"),
  createDepartment: () => notImplemented("createDepartment"),
  getTeams: () => notImplemented("getTeams"),
  createTeam: () => notImplemented("createTeam"),
  getRoles: () => notImplemented("getRoles"),
  getOrgSettings: () => notImplemented("getOrgSettings"),
  updateOrgSettings: () => notImplemented("updateOrgSettings"),
  getAuditLog: () => notImplemented("getAuditLog"),
  runAnalysis: () => notImplemented("runAnalysis"),
  getAnalysisRuns: () => notImplemented("getAnalysisRuns"),
};
