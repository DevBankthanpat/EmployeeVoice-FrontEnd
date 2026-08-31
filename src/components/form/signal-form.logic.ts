import {
  type EvidenceItem,
  type Frequency,
  type ImpactLevel,
  type ImpactType,
  type RelatedArea,
  type SignalSubmission,
  SignalSubmissionSchema,
  type SignalType,
  type WorkflowStage,
} from "@/data/schemas";

/**
 * Pure form logic for the Submit-Signal stepper, split out from the component
 * so per-section validation is unit-testable without rendering. Validation runs
 * entirely against the shared `SignalSubmissionSchema` (Guiding Principle #4) —
 * this file only maps the draft onto it and slices issues per section.
 */

/** Working shape of the form; converted to a validated `SignalSubmission` on submit. */
export interface Draft {
  signalTypes: SignalType[];
  title: string;
  description: string;
  frequency: Frequency | null;
  impactTypes: ImpactType[];
  impactLevel: ImpactLevel | null;
  relatedAreas: RelatedArea[];
  improvementSuggestion: string;
  effectivenessScore: number | null;
  evidence: EvidenceItem[];
  workflowStage: WorkflowStage | null;
  notes: string;
  consentStatistics: boolean;
  consentAi: boolean;
  isAnonymous: boolean;
}

export const INITIAL_DRAFT: Draft = {
  signalTypes: [],
  title: "",
  description: "",
  frequency: null,
  impactTypes: [],
  impactLevel: null,
  relatedAreas: [],
  improvementSuggestion: "",
  effectivenessScore: null,
  evidence: [],
  workflowStage: null,
  notes: "",
  // Trust-first defaults: opted in to help by default, identified by default;
  // the employee can opt out of either on the same screen.
  consentStatistics: true,
  consentAi: true,
  isAnonymous: false,
};

/** Fields owned by each section — drives per-section validation + jump-to-error. */
export const SECTION_FIELDS: (keyof Draft)[][] = [
  ["signalTypes"],
  ["title", "description", "frequency", "impactTypes", "impactLevel"],
  [
    "relatedAreas",
    "improvementSuggestion",
    "effectivenessScore",
    "evidence",
    "workflowStage",
    "notes",
  ],
  ["consentStatistics", "consentAi", "isAnonymous"],
];

export const TOTAL_STEPS = SECTION_FIELDS.length;

/** Field → localized error-message key (only required fields can error). */
export const FIELD_ERROR_KEY: Partial<Record<keyof Draft, string>> = {
  signalTypes: "section1Error",
  title: "titleError",
  description: "descriptionError",
  frequency: "frequencyError",
  impactTypes: "impactTypeError",
  impactLevel: "impactLevelError",
};

/**
 * Build the candidate `SignalSubmission` from the draft: trim text, drop empty
 * optionals to `undefined`, and coerce the "not chosen yet" nulls so the shared
 * schema validates them.
 */
export function toCandidate(draft: Draft): Record<string, unknown> {
  return {
    signalTypes: draft.signalTypes,
    title: draft.title.trim(),
    description: draft.description.trim(),
    frequency: draft.frequency ?? undefined,
    impactTypes: draft.impactTypes,
    impactLevel: draft.impactLevel ?? undefined,
    relatedAreas: draft.relatedAreas.length ? draft.relatedAreas : undefined,
    improvementSuggestion: draft.improvementSuggestion.trim() || undefined,
    effectivenessScore: draft.effectivenessScore ?? undefined,
    evidence: draft.evidence.length ? draft.evidence : undefined,
    workflowStage: draft.workflowStage ?? undefined,
    notes: draft.notes.trim() || undefined,
    consentStatistics: draft.consentStatistics,
    consentAi: draft.consentAi,
    isAnonymous: draft.isAnonymous,
  };
}

/** Names of every field the shared schema rejects for this candidate. */
export function invalidFieldSet(
  candidate: Record<string, unknown>,
): Set<string> {
  const result = SignalSubmissionSchema.safeParse(candidate);
  if (result.success) return new Set();
  return new Set(result.error.issues.map((issue) => String(issue.path[0])));
}

/** Invalid fields for one section of the current draft (empty when the section is valid). */
export function sectionInvalidFields(
  step: number,
  draft: Draft,
): (keyof Draft)[] {
  const invalid = invalidFieldSet(toCandidate(draft));
  return (SECTION_FIELDS[step] ?? []).filter((field) => invalid.has(field));
}

export type SubmissionValidation =
  | { ok: true; data: SignalSubmission }
  | { ok: false; firstSection: number; invalid: Set<string> };

/** Full validation for submit: returns the parsed payload or the earliest bad section. */
export function validateSubmission(draft: Draft): SubmissionValidation {
  const parsed = SignalSubmissionSchema.safeParse(toCandidate(draft));
  if (parsed.success) return { ok: true, data: parsed.data };
  const invalid = new Set(
    parsed.error.issues.map((issue) => String(issue.path[0])),
  );
  const firstSection = SECTION_FIELDS.findIndex((fields) =>
    fields.some((field) => invalid.has(field)),
  );
  return {
    ok: false,
    firstSection: firstSection === -1 ? 0 : firstSection,
    invalid,
  };
}
