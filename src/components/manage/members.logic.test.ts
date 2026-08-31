import { describe, expect, it } from "vitest";

import { provider } from "@/data/provider";
import type { Member } from "@/data/schemas";

import { filterMembers } from "./members.logic";

const base = {
  role: "employee",
  status: "active",
  createdAt: "2025-01-01T00:00:00Z",
} as const;

const SAMPLE: Member[] = [
  { id: "u1", name: "Kanya Sirichai", email: "kanya@x.co", ...base },
  { id: "u2", name: "Peter Nilsson", email: "peter.nilsson@x.co", ...base },
  { id: "u3", name: "Malee Srisuk", email: "malee@x.co", ...base },
];

describe("filterMembers", () => {
  it("returns a copy of the full list for an empty query", () => {
    const result = filterMembers(SAMPLE, "   ");
    expect(result).toHaveLength(SAMPLE.length);
    expect(result).not.toBe(SAMPLE);
  });

  it("matches on name, case-insensitively", () => {
    expect(filterMembers(SAMPLE, "kanya").map((m) => m.id)).toEqual(["u1"]);
    expect(filterMembers(SAMPLE, "MALEE").map((m) => m.id)).toEqual(["u3"]);
  });

  it("matches on email", () => {
    expect(filterMembers(SAMPLE, "nilsson@x").map((m) => m.id)).toEqual(["u2"]);
  });

  it("returns nothing when no member matches", () => {
    expect(filterMembers(SAMPLE, "nobody")).toEqual([]);
  });
});

/**
 * RBAC guarantee (CLAUDE.md Hard Rule #7): the admin member-management view must
 * never link a member to a signal they submitted. This asserts the shape stays
 * free of any such join, so the guarantee is test-backed as the code exists.
 */
describe("member management view — no submitted-signal linkage", () => {
  const FORBIDDEN_KEYS = [
    "signalId",
    "signalIds",
    "submissionId",
    "submissionIds",
    "submissions",
    "signals",
    "signalCount",
  ];

  it("exposes no signal/submission linkage on any member", async () => {
    const members = await provider.getMembers();
    expect(members.length).toBeGreaterThan(0);
    for (const member of members) {
      for (const key of FORBIDDEN_KEYS) {
        expect(key in member).toBe(false);
      }
    }
  });
});
