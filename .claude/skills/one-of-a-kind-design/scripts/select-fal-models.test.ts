import { describe, expect, test } from "bun:test";
import { selectModel } from "./select-fal-models";

describe("selectModel", () => {
  test("selects image model for art-deco", () => {
    const selection = selectModel("art-deco", "image", "pro");
    expect(selection.primary).toBeDefined();
    expect(selection.primary.endpoint).toContain("fal-ai");
    expect(selection.reason).toContain("art-deco");
  });

  test("selects video model for cinematic", () => {
    const selection = selectModel("cinematic", "video", "pro");
    expect(selection.primary).toBeDefined();
    expect(selection.primary.endpoint).toContain("fal-ai");
    expect(selection.reason).toContain("cinematic");
  });

  test("falls back to tier-based selection for unknown style", () => {
    const selection = selectModel("unknown-style-xyz", "image", "pro");
    expect(selection.primary).toBeDefined();
    expect(selection.reason).toContain("Tier selection");
  });

  test("returns primary and fallback models", () => {
    const selection = selectModel("art-deco", "image", "pro");
    expect(selection.primary).toBeDefined();
    expect(selection.fallback).toBeDefined();
    expect(selection.primary.name).not.toBe(selection.fallback.name);
  });

  test("respects tier filtering", () => {
    const premiumSelection = selectModel("unknown-style", "video", "pro");
    expect(premiumSelection.primary).toBeDefined();
    // Pro tier should select pro-tier or better models
    expect(["pro", "premium"]).toContain(premiumSelection.tier);
  });
});
