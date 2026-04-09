import { describe, expect, test } from "bun:test";
import { applyDials } from "./apply-dials";

const STUB_BREAKS = [
  { dogma: "always use grids", break: "organic free-form layout" },
  { dogma: "perfect symmetry", break: "deliberate asymmetric tension" },
  { dogma: "safe color palettes", break: "clashing complementary hues" },
];

describe("applyDials", () => {
  test("same dials produce same DialModifiers (determinism)", () => {
    const a = applyDials(
      { design_variance: 5, motion_intensity: 5, visual_density: 5, audience_formality: 5 },
      STUB_BREAKS,
    );
    const b = applyDials(
      { design_variance: 5, motion_intensity: 5, visual_density: 5, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(a).toEqual(b);
  });

  test("design_variance 1 produces zero convention breaks in negativeBoost", () => {
    const result = applyDials(
      { design_variance: 1, motion_intensity: 5, visual_density: 5, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(result.negativeBoost).toContain("no experimental");
    expect(result.negativeBoost).toContain("no unexpected");
    expect(result.compositionOverride).toBeNull();
  });

  test("design_variance 9 includes convention break text in promptSuffix", () => {
    const result = applyDials(
      { design_variance: 9, motion_intensity: 5, visual_density: 5, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(result.promptSuffix.length).toBeGreaterThan(0);
    expect(result.compositionOverride).not.toBeNull();
  });

  test("motion_intensity 2 produces motionScale 0.3", () => {
    const result = applyDials(
      { design_variance: 5, motion_intensity: 2, visual_density: 5, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(result.motionScale).toBe(0.3);
  });

  test("motion_intensity 5 produces motionScale 1.0", () => {
    const result = applyDials(
      { design_variance: 5, motion_intensity: 5, visual_density: 5, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(result.motionScale).toBe(1.0);
  });

  test("motion_intensity 8 produces motionScale 1.5", () => {
    const result = applyDials(
      { design_variance: 5, motion_intensity: 8, visual_density: 5, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(result.motionScale).toBe(1.5);
  });

  test("motion_intensity 10 produces motionScale 2.0", () => {
    const result = applyDials(
      { design_variance: 5, motion_intensity: 10, visual_density: 5, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(result.motionScale).toBe(2.0);
  });

  test("visual_density 10 produces densityClass maximalist", () => {
    const result = applyDials(
      { design_variance: 5, motion_intensity: 5, visual_density: 10, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(result.densityClass).toBe("maximalist");
  });

  test("visual_density 2 produces densityClass sparse", () => {
    const result = applyDials(
      { design_variance: 5, motion_intensity: 5, visual_density: 2, audience_formality: 5 },
      STUB_BREAKS,
    );
    expect(result.densityClass).toBe("sparse");
  });

  test("audience_formality 1 produces typographyTier mono-accent", () => {
    const result = applyDials(
      { design_variance: 5, motion_intensity: 5, visual_density: 5, audience_formality: 1 },
      STUB_BREAKS,
    );
    expect(result.typographyTier).toBe("mono-accent");
    expect(result.colorShift).toBe("cooler");
  });

  test("audience_formality 10 produces typographyTier display-heavy", () => {
    const result = applyDials(
      { design_variance: 5, motion_intensity: 5, visual_density: 5, audience_formality: 10 },
      STUB_BREAKS,
    );
    expect(result.typographyTier).toBe("display-heavy");
  });

  test("dial value 0 floors to 1", () => {
    const result = applyDials(
      { design_variance: 0, motion_intensity: 0, visual_density: 0, audience_formality: 0 },
      STUB_BREAKS,
    );
    expect(result.motionScale).toBe(0.3);
    expect(result.densityClass).toBe("sparse");
    expect(result.typographyTier).toBe("mono-accent");
  });

  test("dial value 11 caps to 10", () => {
    const result = applyDials(
      { design_variance: 11, motion_intensity: 11, visual_density: 11, audience_formality: 11 },
      STUB_BREAKS,
    );
    expect(result.motionScale).toBe(2.0);
    expect(result.densityClass).toBe("maximalist");
    expect(result.typographyTier).toBe("display-heavy");
  });

  test("missing dial values default to 5", () => {
    const result = applyDials({}, STUB_BREAKS);
    expect(result.motionScale).toBe(1.0);
    expect(result.densityClass).toBe("balanced");
    expect(result.typographyTier).toBe("body-forward");
    expect(result.colorShift).toBeNull();
  });
});
