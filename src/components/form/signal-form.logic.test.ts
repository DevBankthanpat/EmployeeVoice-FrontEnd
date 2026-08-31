import { describe, expect, it } from "vitest";

import {
  type Draft,
  INITIAL_DRAFT,
  sectionInvalidFields,
  validateSubmission,
} from "@/components/form/signal-form.logic";

/**
 * Per-section validation runs against the shared `SignalSubmissionSchema`
 * (Guiding Principle #4). These tests lock in that each of the four sections
 * gates on exactly its own required fields, and that the final submit produces
 * a schema-valid payload with optionals trimmed away.
 */

const completeDraft: Draft = {
  ...INITIAL_DRAFT,
  signalTypes: ["process_workflow", "equipment_resource"],
  title: "Forklift booking clashes across shifts",
  description: "Two shifts book the same forklift; work stalls until it frees.",
  frequency: "regular",
  impactTypes: ["time_loss", "team_difficulty"],
  impactLevel: "high",
};

describe("signal-form per-section validation", () => {
  it("blocks section 1 until at least one signal type is chosen", () => {
    expect(sectionInvalidFields(0, INITIAL_DRAFT)).toEqual(["signalTypes"]);
    const withType: Draft = {
      ...INITIAL_DRAFT,
      signalTypes: ["communication"],
    };
    expect(sectionInvalidFields(0, withType)).toEqual([]);
  });

  it("requires every detail field in section 2", () => {
    const invalid = sectionInvalidFields(1, INITIAL_DRAFT);
    expect(new Set(invalid)).toEqual(
      new Set([
        "title",
        "description",
        "frequency",
        "impactTypes",
        "impactLevel",
      ]),
    );
    expect(sectionInvalidFields(1, completeDraft)).toEqual([]);
  });

  it("never blocks the optional section (3) or the consent section (4)", () => {
    expect(sectionInvalidFields(2, INITIAL_DRAFT)).toEqual([]);
    expect(sectionInvalidFields(3, INITIAL_DRAFT)).toEqual([]);
  });

  it("treats whitespace-only title/description as missing", () => {
    const blank: Draft = {
      ...completeDraft,
      title: "   ",
      description: "  ",
    };
    expect(new Set(sectionInvalidFields(1, blank))).toEqual(
      new Set(["title", "description"]),
    );
  });
});

describe("signal-form submit validation", () => {
  it("rejects an empty draft and points at the first bad section", () => {
    const result = validateSubmission(INITIAL_DRAFT);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.firstSection).toBe(0);
      expect(result.invalid.has("signalTypes")).toBe(true);
    }
  });

  it("jumps to section 2 when only detail fields are missing", () => {
    const onlyTypes: Draft = {
      ...INITIAL_DRAFT,
      signalTypes: ["incident_risk"],
    };
    const result = validateSubmission(onlyTypes);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.firstSection).toBe(1);
  });

  it("accepts a complete draft and trims empty optionals to undefined", () => {
    const result = validateSubmission(completeDraft);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("Forklift booking clashes across shifts");
      expect(result.data.signalTypes).toContain("process_workflow");
      expect(result.data.improvementSuggestion).toBeUndefined();
      expect(result.data.notes).toBeUndefined();
      expect(result.data.evidence).toBeUndefined();
    }
  });

  it("carries the anonymity + consent choices through to the payload", () => {
    const anon: Draft = {
      ...completeDraft,
      isAnonymous: true,
      consentAi: false,
    };
    const result = validateSubmission(anon);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.isAnonymous).toBe(true);
      expect(result.data.consentAi).toBe(false);
      expect(result.data.consentStatistics).toBe(true);
    }
  });
});
