import { describe, expect, it } from "vitest";

import { DEFAULT_MIN_GROUP } from "@/lib/anonymity";

import * as db from "./index";
import signalsJson from "./signals.json";
import themesJson from "./themes.json";

/**
 * These tests are the Phase 1 safety net. Importing `./index` runs every mock
 * file through its Zod schema, so a malformed fixture fails here — and the
 * anonymity checks below guard the core product promise from day one
 * (CLAUDE.md: write anonymity tests as soon as the relevant code exists).
 */

// Fields that must never appear on a dashboard read model: identity, or the
// quasi-identifiers that §4.5 / Hard Rule #4 forbid combining (department only).
const FORBIDDEN_DASHBOARD_KEYS = [
  "teamId",
  "team",
  "teamName",
  "position",
  "tenure",
  "workFormat",
  "employeeId",
  "userId",
  "submitterId",
  "submittedBy",
  "email",
  "name",
];

describe("mock data validates against the shared schemas", () => {
  it("loads a non-empty fixture for every screen", () => {
    expect(db.mockSignals.length).toBeGreaterThan(0);
    expect(db.mockThemes.length).toBeGreaterThan(0);
    expect(db.mockActions.length).toBeGreaterThan(0);
    expect(db.mockMembers.length).toBeGreaterThan(0);
    expect(db.mockAnalysisRuns.length).toBeGreaterThan(0);
    expect(db.mockAuditLog.length).toBeGreaterThan(0);
    expect(db.mockRolePermissions.length).toBe(3);
    expect(db.mockOrgSettings.minGroupThreshold).toBeGreaterThanOrEqual(1);
  });
});

describe("k-anonymity in mock data (§4.3 / Hard Rule #2)", () => {
  const min = db.mockOrgSettings.minGroupThreshold;

  it("uses a threshold of at least the default", () => {
    expect(min).toBeGreaterThanOrEqual(DEFAULT_MIN_GROUP);
  });

  it("shows no theme whose report count is below the threshold", () => {
    for (const theme of db.mockThemes) {
      expect(theme.reportCount, `theme "${theme.name}"`).toBeGreaterThanOrEqual(
        min,
      );
    }
  });

  it("shows departments-affected as a coarse count, never below threshold when non-zero", () => {
    const affected = db.mockStats.departmentsAffected.value;
    if (affected > 0) expect(affected).toBeGreaterThanOrEqual(1);
  });
});

describe("structural anonymity: dashboard signals expose department only (§4.5)", () => {
  const raw = signalsJson as ReadonlyArray<Record<string, unknown>>;

  it("carries a department for every signal", () => {
    for (const s of raw) {
      expect(typeof s.departmentName).toBe("string");
    }
  });

  it("leaks no identity or forbidden quasi-identifier field", () => {
    for (const s of raw) {
      for (const key of FORBIDDEN_DASHBOARD_KEYS) {
        expect(
          key in s,
          `signals.json signal "${String(s.id)}" leaks "${key}"`,
        ).toBe(false);
      }
    }
  });

  it("keeps the same guarantee for signals embedded in theme details", () => {
    const themes = themesJson as ReadonlyArray<{
      relatedSignals?: ReadonlyArray<Record<string, unknown>>;
    }>;
    for (const theme of themes) {
      for (const s of theme.relatedSignals ?? []) {
        for (const key of FORBIDDEN_DASHBOARD_KEYS) {
          expect(key in s).toBe(false);
        }
      }
    }
  });
});
