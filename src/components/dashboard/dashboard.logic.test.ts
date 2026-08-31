import { describe, expect, it } from "vitest";

import type { SignalFeedItem } from "@/data/schemas";

import {
  countActiveFilters,
  signalFilterOptions,
  sortSignalsByNewest,
} from "./dashboard.logic";

function feedItem(over: Partial<SignalFeedItem>): SignalFeedItem {
  return {
    id: "sig_x",
    title: "t",
    summary: "s",
    departmentName: "Operations",
    signalTypes: ["process_workflow"],
    impactLevel: "low",
    tags: [],
    createdAt: "2026-07-01T00:00:00Z",
    ...over,
  };
}

describe("signalFilterOptions", () => {
  it("derives distinct, sorted departments and newest-first periods", () => {
    const signals = [
      feedItem({ departmentName: "Sales", createdAt: "2026-05-10T00:00:00Z" }),
      feedItem({
        departmentName: "Operations",
        createdAt: "2026-07-02T00:00:00Z",
      }),
      feedItem({
        departmentName: "Operations",
        createdAt: "2026-06-20T00:00:00Z",
      }),
    ];
    const { departments, periods } = signalFilterOptions(signals);
    expect(departments).toEqual(["Operations", "Sales"]);
    expect(periods).toEqual(["2026-07", "2026-06", "2026-05"]);
  });

  it("returns empty options for an empty feed", () => {
    expect(signalFilterOptions([])).toEqual({ departments: [], periods: [] });
  });
});

describe("countActiveFilters", () => {
  it("counts only the filters that are set", () => {
    expect(countActiveFilters({})).toBe(0);
    expect(countActiveFilters({ departmentName: "Sales" })).toBe(1);
    expect(
      countActiveFilters({
        departmentName: "Sales",
        signalType: "communication",
        impactLevel: "high",
        period: "2026-07",
      }),
    ).toBe(4);
  });
});

describe("sortSignalsByNewest", () => {
  it("orders newest first without mutating the input", () => {
    const input = [
      feedItem({ id: "a", createdAt: "2026-07-01T00:00:00Z" }),
      feedItem({ id: "b", createdAt: "2026-07-08T00:00:00Z" }),
      feedItem({ id: "c", createdAt: "2026-07-04T00:00:00Z" }),
    ];
    const sorted = sortSignalsByNewest(input);
    expect(sorted.map((s) => s.id)).toEqual(["b", "c", "a"]);
    // input untouched
    expect(input.map((s) => s.id)).toEqual(["a", "b", "c"]);
  });
});
