import { describe, expect, it } from "vitest";

import { DEFAULT_MIN_GROUP, meetsKAnonymity } from "./anonymity";

describe("k-anonymity (§4.3 / Hard Rule #2)", () => {
  it("defaults the threshold to 5", () => {
    expect(DEFAULT_MIN_GROUP).toBe(5);
  });

  it("suppresses groups smaller than the threshold", () => {
    expect(meetsKAnonymity(4)).toBe(false);
    expect(meetsKAnonymity(0)).toBe(false);
  });

  it("allows groups at or above the threshold", () => {
    expect(meetsKAnonymity(5)).toBe(true);
    expect(meetsKAnonymity(50)).toBe(true);
  });

  it("honors a custom threshold", () => {
    expect(meetsKAnonymity(2, 3)).toBe(false);
    expect(meetsKAnonymity(3, 3)).toBe(true);
  });
});
