/**
 * select-fal-models.ts — Style → fal.ai generation endpoint selection.
 * Deterministic model selection based on style, output type, and quality tier.
 *
 * Run: bun run scripts/select-fal-models.ts --style "cinematic" --type "image" --tier "pro"
 */
import { Effect, pipe } from "effect";

// --- Types ---

type OutputType = "image" | "video";
type Tier = "fast" | "standard" | "pro" | "premium";

interface ModelSelection {
  readonly primary: FalModel;
  readonly fallback: FalModel;
  readonly tier: Tier;
  readonly reason: string;
}

interface FalModel {
  readonly name: string;
  readonly provider: string;
  readonly endpoint: string;
  readonly tier: Tier;
  readonly strengths: string;
}

// --- Model Registry (verified working endpoints only) ---

const IMAGE_MODELS: FalModel[] = [
  {
    name: "Flux Dev",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux/dev",
    tier: "standard",
    strengths: "rapid prototyping, mood-boards, style fusion",
  },
  {
    name: "Flux Schnell",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux/schnell",
    tier: "fast",
    strengths: "ultra-low-cost rapid iteration",
  },
  {
    name: "Flux Pro 1.1",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux-pro/v1.1",
    tier: "pro",
    strengths: "professional-grade generation, premium quality",
  },
  {
    name: "Flux 1.1 Ultra",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux-pro/v1.1-ultra",
    tier: "premium",
    strengths: "ultra-high resolution, wide aspect ratios",
  },
  {
    name: "Flux 2",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux-2",
    tier: "standard",
    strengths: "fast customizable generation",
  },
  {
    name: "Ideogram V3",
    provider: "Ideogram",
    endpoint: "fal-ai/ideogram/v3",
    tier: "pro",
    strengths: "typography in images, logo-like output",
  },
  {
    name: "Recraft V3",
    provider: "Recraft",
    endpoint: "fal-ai/recraft-v3",
    tier: "pro",
    strengths: "design-focused, brand assets",
  },
  {
    name: "Nano Banana",
    provider: "Google",
    endpoint: "fal-ai/nano-banana",
    tier: "pro",
    strengths: "Gemini 2.5 Flash vision-language",
  },
  {
    name: "Luma Photon",
    provider: "Luma Labs",
    endpoint: "fal-ai/luma-photon",
    tier: "pro",
    strengths: "photorealistic, natural lighting",
  },
];

const VIDEO_MODELS: FalModel[] = [
  {
    name: "Veo 3",
    provider: "Google DeepMind",
    endpoint: "fal-ai/veo3",
    tier: "premium",
    strengths: "native audio generation, cinematic quality",
  },
  {
    name: "Veo 2",
    provider: "Google DeepMind",
    endpoint: "fal-ai/veo2",
    tier: "pro",
    strengths: "excellent quality, reliable video generation",
  },
  {
    name: "WAN T2V",
    provider: "Alibaba",
    endpoint: "fal-ai/wan-t2v",
    tier: "standard",
    strengths: "versatile text-to-video, good motion",
  },
  {
    name: "CogVideoX 5B",
    provider: "THUDM",
    endpoint: "fal-ai/cogvideox-5b",
    tier: "standard",
    strengths: "open model, good baseline video",
  },
];

// --- Style-to-Model Affinity ---

const STYLE_MODEL_AFFINITY: Record<string, { image: string[]; video: string[] }> = {
  "art-deco": {
    image: ["Flux Pro 1.1", "Ideogram V3", "Recraft V3"],
    video: ["Veo 3", "Veo 2"],
  },
  cinematic: {
    image: ["Flux 1.1 Ultra", "Luma Photon", "Flux Pro 1.1"],
    video: ["Veo 3", "Veo 2"],
  },
  neubrutalism: {
    image: ["Flux Pro 1.1", "Ideogram V3", "Recraft V3"],
    video: ["Veo 2", "WAN T2V"],
  },
  glassmorphism: {
    image: ["Flux Pro 1.1", "Flux 1.1 Ultra"],
    video: ["Veo 2", "WAN T2V"],
  },
  bauhaus: {
    image: ["Ideogram V3", "Flux Pro 1.1", "Recraft V3"],
    video: ["Veo 2", "WAN T2V"],
  },
  "editorial-minimalism": {
    image: ["Flux 1.1 Ultra", "Flux Pro 1.1"],
    video: ["Veo 3", "Veo 2"],
  },
  "pixel-art": {
    image: ["Flux Pro 1.1", "Flux Dev"],
    video: ["WAN T2V", "CogVideoX 5B"],
  },
  "wabi-sabi": {
    image: ["Flux 1.1 Ultra", "Luma Photon", "Flux Pro 1.1"],
    video: ["Veo 2", "WAN T2V"],
  },
};

// --- Selection Logic ---

export function selectModel(
  styleId: string,
  outputType: OutputType,
  requestedTier: Tier,
): ModelSelection {
  const models = outputType === "image" ? IMAGE_MODELS : VIDEO_MODELS;
  const affinity = STYLE_MODEL_AFFINITY[styleId];

  // Try style-specific affinity first
  if (affinity) {
    const preferred = outputType === "image" ? affinity.image : affinity.video;
    const primary = models.find(
      (m) => preferred.includes(m.name) && tierRank(m.tier) >= tierRank(requestedTier),
    );
    if (primary) {
      const fallback =
        models.find((m) => m.name !== primary.name && tierRank(m.tier) >= tierRank("standard")) ??
        primary;
      return {
        primary,
        fallback,
        tier: primary.tier,
        reason: `Style affinity: ${styleId} maps to ${primary.name}`,
      };
    }
  }

  // Fallback: best model at requested tier
  const tiered = models
    .filter((m) => tierRank(m.tier) >= tierRank(requestedTier))
    .sort((a, b) => tierRank(b.tier) - tierRank(a.tier));

  const primary = tiered[0] ?? models[0];
  const fallback = tiered[1] ?? models[1] ?? primary;

  return {
    primary,
    fallback,
    tier: primary.tier,
    reason: `Tier selection: best ${requestedTier}+ model`,
  };
}

function tierRank(tier: Tier): number {
  const ranks: Record<Tier, number> = { fast: 0, standard: 1, pro: 2, premium: 3 };
  return ranks[tier];
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const styleId = getArg("--style") ?? "editorial-minimalism";
  const outputType = (getArg("--type") ?? "image") as OutputType;
  const tier = (getArg("--tier") ?? "pro") as Tier;

  const selection = selectModel(styleId, outputType, tier);

  yield* Effect.sync(() => {
    console.log(JSON.stringify(selection, null, 2));
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Model selection failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
