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

// --- Model Registry ---

const IMAGE_MODELS: FalModel[] = [
  {
    name: "Flux Dev",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux/dev",
    tier: "standard",
    strengths: "rapid prototyping, mood-boards, style fusion",
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
    tier: "pro",
    strengths: "ultra-high resolution, wide aspect ratios",
  },
  {
    name: "Flux Fast",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux/fast",
    tier: "fast",
    strengths: "ultra-low-cost rapid iteration",
  },
  {
    name: "Flux 2",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux-2",
    tier: "standard",
    strengths: "fast customizable generation",
  },
  {
    name: "Flux 2 Pro",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux-2/pro",
    tier: "pro",
    strengths: "highest-performing BFL model",
  },
  {
    name: "Flux 2 Max",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux-2/max",
    tier: "premium",
    strengths: "maximum quality, complex scenes",
  },
  {
    name: "GPT Image 1",
    provider: "OpenAI",
    endpoint: "fal-ai/gpt-image-1",
    tier: "pro",
    strengths: "text rendering, complex composition",
  },
  {
    name: "GPT Image 1.5",
    provider: "OpenAI",
    endpoint: "fal-ai/gpt-image-1-5",
    tier: "premium",
    strengths: "latest OpenAI quality, photorealism",
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
    endpoint: "fal-ai/recraft/v3",
    tier: "pro",
    strengths: "design-focused, brand assets",
  },
  {
    name: "Stable Diffusion 3.5",
    provider: "Stability AI",
    endpoint: "fal-ai/stable-diffusion-v35-large",
    tier: "standard",
    strengths: "open model, wide style range",
  },
  {
    name: "Reve",
    provider: "Reve",
    endpoint: "fal-ai/reve",
    tier: "pro",
    strengths: "artistic quality, creative control",
  },
  {
    name: "Nano Banana",
    provider: "Google",
    endpoint: "fal-ai/nano-banana",
    tier: "pro",
    strengths: "Gemini 2.5 Flash vision-language",
  },
  {
    name: "Seedream 3.0",
    provider: "ByteDance",
    endpoint: "fal-ai/seedream/3.0",
    tier: "standard",
    strengths: "fast generation, good defaults",
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
    name: "Veo 3.1",
    provider: "Google DeepMind",
    endpoint: "fal-ai/veo3.1/video/generate",
    tier: "premium",
    strengths: "highest quality, complex scenes with audio",
  },
  {
    name: "Veo 3",
    provider: "Google DeepMind",
    endpoint: "fal-ai/veo3/video/generate",
    tier: "premium",
    strengths: "native audio generation",
  },
  {
    name: "Veo 2",
    provider: "Google DeepMind",
    endpoint: "fal-ai/veo2/video/generate",
    tier: "pro",
    strengths: "excellent quality, 4K support",
  },
  {
    name: "Sora 2",
    provider: "OpenAI",
    endpoint: "fal-ai/sora/v2",
    tier: "premium",
    strengths: "long-form video, narrative coherence",
  },
  {
    name: "Runway Gen-4.5",
    provider: "Runway",
    endpoint: "fal-ai/runway/gen4.5",
    tier: "premium",
    strengths: "latest Runway, reference-aware",
  },
  {
    name: "Runway Gen-4 Turbo",
    provider: "Runway",
    endpoint: "fal-ai/runway/gen4/turbo",
    tier: "pro",
    strengths: "fast high-quality video",
  },
  {
    name: "Runway Aleph",
    provider: "Runway",
    endpoint: "fal-ai/runway/aleph",
    tier: "premium",
    strengths: "Gen-4 extended, cinematic",
  },
  {
    name: "Kling 3",
    provider: "Kuaishou",
    endpoint: "fal-ai/kling-video/v3/pro",
    tier: "premium",
    strengths: "camera control, long duration",
  },
  {
    name: "Kling 2.6 Pro",
    provider: "Kuaishou",
    endpoint: "fal-ai/kling-video/v2.6/pro",
    tier: "pro",
    strengths: "reliable, good motion",
  },
  {
    name: "Kling 2.5 Turbo Pro",
    provider: "Kuaishou",
    endpoint: "fal-ai/kling-video/v2.5/pro/image-to-video",
    tier: "pro",
    strengths: "image-to-video, fast",
  },
  {
    name: "Luma Ray 2",
    provider: "Luma Labs",
    endpoint: "fal-ai/luma-ray/v2",
    tier: "pro",
    strengths: "stylized video, modify/extend",
  },
  {
    name: "Marey",
    provider: "Moonvalley",
    endpoint: "fal-ai/marey",
    tier: "pro",
    strengths: "cinematic quality, production-grade",
  },
  {
    name: "WAN 2.6",
    provider: "Alibaba",
    endpoint: "fal-ai/wan/v2.6",
    tier: "pro",
    strengths: "versatile, good at motion",
  },
  {
    name: "Seedance V1.5 Pro",
    provider: "ByteDance",
    endpoint: "fal-ai/seedance/v1.5/pro",
    tier: "pro",
    strengths: "dance/motion specialized",
  },
  {
    name: "Minimax Hailuo 2.3",
    provider: "Minimax",
    endpoint: "fal-ai/minimax-hailuo/v2.3",
    tier: "standard",
    strengths: "fast, cost-effective",
  },
  {
    name: "LTX Video 2",
    provider: "Lightricks",
    endpoint: "fal-ai/ltx-video/v2",
    tier: "standard",
    strengths: "open model, good baseline",
  },
];

// --- Style-to-Model Affinity ---

const STYLE_MODEL_AFFINITY: Record<string, { image: string[]; video: string[] }> = {
  "art-deco": {
    image: ["Flux 2 Pro", "GPT Image 1", "Ideogram V3"],
    video: ["Veo 3.1", "Runway Gen-4 Turbo", "Kling 3"],
  },
  cinematic: {
    image: ["Flux 1.1 Ultra", "Luma Photon", "GPT Image 1.5"],
    video: ["Veo 3.1", "Runway Aleph", "Marey"],
  },
  neubrutalism: {
    image: ["Flux 2 Pro", "Ideogram V3", "Recraft V3"],
    video: ["Luma Ray 2", "Kling 2.6 Pro"],
  },
  glassmorphism: { image: ["Flux 2 Pro", "GPT Image 1"], video: ["Veo 2", "Runway Gen-4 Turbo"] },
  bauhaus: {
    image: ["Ideogram V3", "Flux 2 Pro", "Recraft V3"],
    video: ["Kling 2.6 Pro", "LTX Video 2"],
  },
  "editorial-minimalism": { image: ["Flux 1.1 Ultra", "GPT Image 1.5"], video: ["Veo 3", "Marey"] },
  "pixel-art": {
    image: ["Flux 2 Pro", "Stable Diffusion 3.5"],
    video: ["LTX Video 2", "Minimax Hailuo 2.3"],
  },
  "wabi-sabi": { image: ["Flux 1.1 Ultra", "Reve", "Luma Photon"], video: ["Veo 2", "WAN 2.6"] },
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
  const args = process.argv.slice(2);
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
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
