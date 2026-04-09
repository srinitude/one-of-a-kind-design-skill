/**
 * cost-estimator.ts — Pre-flight cost check before any fal.ai call.
 * Deterministic lookup based on model tier and params. No API calls needed.
 */
import { Effect } from "effect";

type Tier = "fast" | "standard" | "pro" | "premium";

interface CostEstimate {
  readonly tier: Tier;
  readonly estimatedUsd: number;
  readonly withinBudget: boolean;
  readonly reason: string;
}

const BUDGET_LIMITS: Record<Tier, number> = {
  fast: 0.01,
  standard: 0.05,
  pro: 0.2,
  premium: 1.0,
};

const TIER_MAP: Record<string, Tier> = {
  "fal-ai/flux/schnell": "fast",
  "fal-ai/flux-pro/v1.1": "standard",
  "fal-ai/flux-pro/v1.1-ultra": "pro",
  "fal-ai/flux-realism": "standard",
  "fal-ai/stable-diffusion-v35-large": "standard",
  "fal-ai/recraft-v3": "standard",
  "fal-ai/ideogram/v3": "standard",
  "fal-ai/kling-video/v2/master": "premium",
  "fal-ai/minimax-video/video-01-live": "pro",
  "fal-ai/veo2": "premium",
  "fal-ai/luma-ray/v2": "pro",
  "fal-ai/hunyuan-video": "pro",
  "fal-ai/stable-audio": "fast",
  "fal-ai/f5-tts": "fast",
};

function resolveTier(endpoint: string): Tier {
  if (TIER_MAP[endpoint]) return TIER_MAP[endpoint];
  if (endpoint.includes("schnell") || endpoint.includes("turbo")) return "fast";
  if (endpoint.includes("ultra") || endpoint.includes("master")) return "premium";
  if (endpoint.includes("pro")) return "pro";
  return "standard";
}

function computeMultiplier(params: Record<string, unknown>): number {
  let mult = 1.0;
  const size = params.image_size as string | undefined;
  if (size === "landscape_16_9" || size === "portrait_4_3") mult *= 1.2;
  const steps = params.num_inference_steps as number | undefined;
  if (steps && steps > 30) mult *= 1.5;
  const frames = params.num_frames as number | undefined;
  if (frames && frames > 60) mult *= 2.0;
  return mult;
}

function estimateCost(
  endpoint: string,
  params: Record<string, unknown>,
): Effect.Effect<CostEstimate, never> {
  return Effect.succeed(estimateCostPure(endpoint, params));
}

function estimateCostPure(endpoint: string, params: Record<string, unknown>): CostEstimate {
  const tier = resolveTier(endpoint);
  const base = BUDGET_LIMITS[tier];
  const multiplier = computeMultiplier(params);
  const estimatedUsd = Math.round(base * multiplier * 1000) / 1000;
  const withinBudget = estimatedUsd <= BUDGET_LIMITS[tier];
  const reason = withinBudget
    ? `${tier} tier: $${estimatedUsd} within $${BUDGET_LIMITS[tier]} limit`
    : `${tier} tier: $${estimatedUsd} exceeds $${BUDGET_LIMITS[tier]} limit`;
  return { tier, estimatedUsd, withinBudget, reason };
}

export type { CostEstimate, Tier };
export { BUDGET_LIMITS, computeMultiplier, estimateCost, estimateCostPure, resolveTier };
