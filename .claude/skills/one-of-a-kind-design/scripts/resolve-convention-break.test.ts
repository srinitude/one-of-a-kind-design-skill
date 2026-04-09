import { describe, expect, test } from "bun:test";
import { resolveConventionBreak } from "./resolve-convention-break";

const ART_DECO_BREAKS = [
  { dogma: "always use grids", break: "organic free-form layout" },
  { dogma: "perfect symmetry", break: "deliberate asymmetric tension" },
  { dogma: "safe color palettes", break: "clashing complementary hues" },
];

describe("resolveConventionBreak", () => {
  test("variance 2 returns applied: false", () => {
    const result = resolveConventionBreak(2, ART_DECO_BREAKS);
    expect(result.applied).toBe(false);
  });

  test("variance 5 returns exactly break at index 0", () => {
    const result = resolveConventionBreak(5, ART_DECO_BREAKS);
    expect(result.applied).toBe(true);
    expect(result.dogma).toBe("always use grids");
    expect(result.breakText).toBe("organic free-form layout");
    expect(result.injectionPoint).toBe("prompt-suffix");
  });

  test("variance 8 returns deterministic break based on modulo", () => {
    const result = resolveConventionBreak(8, ART_DECO_BREAKS);
    expect(result.applied).toBe(true);
    // 8 % 3 = 2 -> index 2
    expect(result.dogma).toBe("safe color palettes");
    expect(result.breakText).toBe("clashing complementary hues");
  });

  test("variance 10 returns all breaks for the style", () => {
    const result = resolveConventionBreak(10, ART_DECO_BREAKS);
    expect(result.applied).toBe(true);
    expect(result.breakText).toContain("organic free-form layout");
    expect(result.breakText).toContain("deliberate asymmetric tension");
    expect(result.breakText).toContain("clashing complementary hues");
    expect(result.injectionPoint).toBe("prompt-suffix");
  });

  test("style with 0 convention breaks returns applied: false regardless of variance", () => {
    const result = resolveConventionBreak(10, []);
    expect(result.applied).toBe(false);
  });

  test("same inputs always produce same output", () => {
    const a = resolveConventionBreak(7, ART_DECO_BREAKS);
    const b = resolveConventionBreak(7, ART_DECO_BREAKS);
    expect(a).toEqual(b);
  });

  test("variance 3 returns applied: false (boundary)", () => {
    const result = resolveConventionBreak(3, ART_DECO_BREAKS);
    expect(result.applied).toBe(false);
  });

  test("variance 4 returns applied: true (boundary)", () => {
    const result = resolveConventionBreak(4, ART_DECO_BREAKS);
    expect(result.applied).toBe(true);
    expect(result.dogma).toBe("always use grids");
  });

  test("reason field is always populated", () => {
    const low = resolveConventionBreak(2, ART_DECO_BREAKS);
    const mid = resolveConventionBreak(5, ART_DECO_BREAKS);
    const high = resolveConventionBreak(10, ART_DECO_BREAKS);
    expect(low.reason.length).toBeGreaterThan(0);
    expect(mid.reason.length).toBeGreaterThan(0);
    expect(high.reason.length).toBeGreaterThan(0);
  });
});
