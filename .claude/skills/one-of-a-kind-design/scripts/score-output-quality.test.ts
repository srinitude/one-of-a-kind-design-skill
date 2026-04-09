import { describe, expect, test } from "bun:test";
import { BASE_WEIGHTS, computeComposite } from "./score-output-quality";

const baseScores = {
  antiSlopGate: 8.0,
  codeStandardsGate: 8.0 as number | null,
  assetQualityAvg: 8.0,
  promptArtifactAlign: 8.0,
  aesthetic: 8.0,
  styleFidelity: 8.0,
  distinctiveness: 8.0,
  hierarchy: 8.0,
  colorHarmony: 8.0,
  conventionBreakAdherence: null as number | null,
};

describe("computeComposite", () => {
  test("computes correct weighted composite", () => {
    const scores = {
      ...baseScores,
      conventionBreakAdherence: 8.0 as number | null,
    };
    const report = computeComposite(scores);
    // All scores are 8.0, weights sum to 1.0, so composite should be 8.0
    expect(report.composite).toBe(8.0);
  });

  test("passes when composite >= 7.0", () => {
    const scores = {
      antiSlopGate: 8.5,
      codeStandardsGate: 9.0 as number | null,
      assetQualityAvg: 8.0,
      promptArtifactAlign: 7.5,
      aesthetic: 7.8,
      styleFidelity: 8.2,
      distinctiveness: 7.0,
      hierarchy: 7.5,
      colorHarmony: 8.0,
      conventionBreakAdherence: null as number | null,
    };
    const report = computeComposite(scores);
    expect(report.composite).toBeGreaterThanOrEqual(7.0);
    expect(report.passed).toBe(true);
  });

  test("fails when composite < 7.0", () => {
    const scores = {
      antiSlopGate: 3.0,
      codeStandardsGate: 4.0 as number | null,
      assetQualityAvg: 3.0,
      promptArtifactAlign: 2.0,
      aesthetic: 3.0,
      styleFidelity: 2.0,
      distinctiveness: 3.0,
      hierarchy: 2.0,
      colorHarmony: 3.0,
      conventionBreakAdherence: null as number | null,
    };
    const report = computeComposite(scores);
    expect(report.composite).toBeLessThan(7.0);
    expect(report.passed).toBe(false);
  });

  test("all weights sum to 1.0", () => {
    const totalWeight = Object.values(BASE_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.001);
  });

  test("score card contains all sub-score names", () => {
    const scores = {
      ...baseScores,
      conventionBreakAdherence: 8.0 as number | null,
    };
    const report = computeComposite(scores);
    expect(report.scoreCard).toContain("Anti-Slop Gate");
    expect(report.scoreCard).toContain("Code Standards");
    expect(report.scoreCard).toContain("Asset Quality");
    expect(report.scoreCard).toContain("Prompt Alignment");
    expect(report.scoreCard).toContain("Aesthetic");
    expect(report.scoreCard).toContain("Style Fidelity");
    expect(report.scoreCard).toContain("Distinctiveness");
    expect(report.scoreCard).toContain("Hierarchy");
    expect(report.scoreCard).toContain("Color Harmony");
    expect(report.scoreCard).toContain("Conv. Break");
  });

  test("convention break adherence redistributes when null", () => {
    const withBreak = computeComposite({
      ...baseScores,
      conventionBreakAdherence: 8.0,
    });
    const withoutBreak = computeComposite({
      ...baseScores,
      conventionBreakAdherence: null,
    });
    // Both should produce 8.0 since all active scores are 8.0
    expect(withBreak.composite).toBe(8.0);
    expect(withoutBreak.composite).toBe(8.0);
  });

  test("new weight distribution: code_standards is 0.03, convention_break is 0.05", () => {
    expect(BASE_WEIGHTS.codeStandardsGate).toBe(0.03);
    expect(BASE_WEIGHTS.conventionBreakAdherence).toBe(0.05);
  });
});
