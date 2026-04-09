/**
 * cost-estimator.test.ts — Tests for pre-flight cost estimation.
 * TDD: RED -> GREEN -> REFACTOR
 */
import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import {
  BUDGET_LIMITS,
  computeMultiplier,
  estimateCost,
  estimateCostPure,
  resolveTier,
} from "./cost-estimator";

describe("cost-estimator", () => {
  it("fast tier is within budget for reasonable params", () => {
    const estimate = estimateCostPure("fal-ai/flux/schnell", {});
    expect(estimate.tier).toBe("fast");
    expect(estimate.withinBudget).toBe(true);
    expect(estimate.estimatedUsd).toBeLessThanOrEqual(BUDGET_LIMITS.fast);
  });

  it("premium tier with large params reports correct estimate", () => {
    const estimate = estimateCostPure("fal-ai/kling-video/v2/master", {
      num_frames: 120,
      num_inference_steps: 50,
    });
    expect(estimate.tier).toBe("premium");
    expect(estimate.estimatedUsd).toBeGreaterThan(0);
    expect(typeof estimate.reason).toBe("string");
  });

  it("deterministic — same inputs produce same output", () => {
    const params = { image_size: "landscape_16_9" };
    const a = estimateCostPure("fal-ai/flux-pro/v1.1-ultra", params);
    const b = estimateCostPure("fal-ai/flux-pro/v1.1-ultra", params);
    expect(a.tier).toBe(b.tier);
    expect(a.estimatedUsd).toBe(b.estimatedUsd);
    expect(a.withinBudget).toBe(b.withinBudget);
    expect(a.reason).toBe(b.reason);
  });

  it("resolveTier returns correct tier for known endpoints", () => {
    expect(resolveTier("fal-ai/flux/schnell")).toBe("fast");
    expect(resolveTier("fal-ai/flux-pro/v1.1")).toBe("standard");
    expect(resolveTier("fal-ai/flux-pro/v1.1-ultra")).toBe("pro");
    expect(resolveTier("fal-ai/kling-video/v2/master")).toBe("premium");
  });

  it("resolveTier infers tier from endpoint name for unknown endpoints", () => {
    expect(resolveTier("fal-ai/some-model/turbo")).toBe("fast");
    expect(resolveTier("fal-ai/some-model/ultra")).toBe("premium");
    expect(resolveTier("fal-ai/some-model/pro")).toBe("pro");
    expect(resolveTier("fal-ai/unknown-model")).toBe("standard");
  });

  it("computeMultiplier increases for larger sizes", () => {
    const base = computeMultiplier({});
    const landscape = computeMultiplier({ image_size: "landscape_16_9" });
    expect(landscape).toBeGreaterThan(base);
  });

  it("computeMultiplier increases for high step counts", () => {
    const base = computeMultiplier({});
    const highSteps = computeMultiplier({ num_inference_steps: 50 });
    expect(highSteps).toBeGreaterThan(base);
  });

  it("estimateCost Effect wrapper matches pure function", async () => {
    const params = { image_size: "portrait_4_3" };
    const pure = estimateCostPure("fal-ai/flux-pro/v1.1", params);
    const effectResult = await Effect.runPromise(estimateCost("fal-ai/flux-pro/v1.1", params));
    expect(effectResult.tier).toBe(pure.tier);
    expect(effectResult.estimatedUsd).toBe(pure.estimatedUsd);
  });
});
