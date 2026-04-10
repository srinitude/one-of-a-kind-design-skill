/**
 * select-fal-models.ts — Style → fal.ai generation endpoint selection.
 * Deterministic model selection based on style, output type, and quality tier.
 * Supports t2i, i2i, i2v, and multi-modal chain model selection.
 *
 * Run: bun run scripts/select-fal-models.ts --style "cinematic" --type "image" --tier "pro"
 */
import { Effect, pipe } from "effect";

// --- Types ---

type OutputType = "image" | "video" | "image-to-image" | "image-to-video";
type Tier = "fast" | "standard" | "pro" | "premium";
type ChainType = "t2i" | "t2i-i2i" | "t2i-i2v" | "i2i" | "t2i-i2i-i2v";

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

interface ChainModelSelection {
  readonly chain: ChainType;
  readonly models: ReadonlyArray<{ step: string; model: FalModel }>;
  readonly reason: string;
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
    name: "WAN T2V",
    provider: "Alibaba",
    endpoint: "fal-ai/wan-t2v",
    tier: "pro",
    strengths: "versatile text-to-video, good motion, reliable",
  },
  {
    name: "CogVideoX 5B",
    provider: "THUDM",
    endpoint: "fal-ai/cogvideox-5b",
    tier: "standard",
    strengths: "open model, good baseline video",
  },
];

const I2I_MODELS: FalModel[] = [
  {
    name: "Recraft V3 I2I",
    provider: "Recraft",
    endpoint: "fal-ai/recraft-v3",
    tier: "pro",
    strengths: "design-focused style transfer, brand refinement",
  },
  {
    name: "Flux Pro New",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux-pro/new",
    tier: "pro",
    strengths: "high-quality image variation with prompt guidance",
  },
  {
    name: "Flux Pro 1.1 Ref",
    provider: "Black Forest Labs",
    endpoint: "fal-ai/flux-pro/v1.1",
    tier: "pro",
    strengths: "professional i2i with image_prompt_strength control",
  },
  {
    name: "Qwen Image Edit",
    provider: "Alibaba",
    endpoint: "fal-ai/qwen-image-2/edit",
    tier: "standard",
    strengths: "advanced in-painting, text editing within images",
  },
  {
    name: "Qwen Image Edit Plus",
    provider: "Alibaba",
    endpoint: "fal-ai/qwen-image-2/pro/edit",
    tier: "pro",
    strengths: "superior text editing and image composition",
  },
];

const I2V_MODELS: FalModel[] = [
  {
    name: "Minimax Video 01",
    provider: "MiniMax",
    endpoint: "fal-ai/minimax/video-01",
    tier: "standard",
    strengths: "first frame input, reference image support",
  },
  {
    name: "CogVideoX 5B I2V",
    provider: "THUDM",
    endpoint: "fal-ai/cogvideox-5b/image-to-video",
    tier: "standard",
    strengths: "open model i2v, good baseline",
  },
  {
    name: "WAN I2V",
    provider: "Alibaba",
    endpoint: "fal-ai/wan-i2v",
    tier: "pro",
    strengths: "versatile image-to-video with motion control",
  },
  {
    name: "Hunyuan I2V",
    provider: "Tencent",
    endpoint: "fal-ai/hunyuan-video/image-to-video",
    tier: "pro",
    strengths: "customizable, multi-locale campaigns",
  },
];

// --- Style-to-Model Affinity ---

const STYLE_MODEL_AFFINITY: Record<
  string,
  { image: string[]; video: string[]; i2i: string[]; i2v: string[] }
> = {
  "art-deco": {
    image: ["Flux Pro 1.1", "Ideogram V3", "Recraft V3"],
    video: ["WAN T2V"],
    i2i: ["Recraft V3 I2I"],
    i2v: ["Minimax Video 01"],
  },
  cinematic: {
    image: ["Flux 1.1 Ultra", "Luma Photon", "Flux Pro 1.1"],
    video: ["WAN T2V"],
    i2i: ["Flux Pro 1.1 Ref"],
    i2v: ["WAN I2V"],
  },
  neubrutalism: {
    image: ["Flux Pro 1.1", "Ideogram V3", "Recraft V3"],
    video: ["WAN T2V"],
    i2i: ["Recraft V3 I2I"],
    i2v: ["Minimax Video 01"],
  },
  glassmorphism: {
    image: ["Flux Pro 1.1", "Flux 1.1 Ultra"],
    video: ["WAN T2V"],
    i2i: ["Flux Pro New"],
    i2v: ["CogVideoX 5B I2V"],
  },
  bauhaus: {
    image: ["Ideogram V3", "Flux Pro 1.1", "Recraft V3"],
    video: ["WAN T2V"],
    i2i: ["Recraft V3 I2I"],
    i2v: ["Minimax Video 01"],
  },
  "editorial-minimalism": {
    image: ["Flux 1.1 Ultra", "Flux Pro 1.1"],
    video: ["WAN T2V"],
    i2i: ["Flux Pro 1.1 Ref"],
    i2v: ["WAN I2V"],
  },
  "pixel-art": {
    image: ["Flux Pro 1.1", "Flux Dev"],
    video: ["WAN T2V"],
    i2i: ["Flux Pro New"],
    i2v: ["CogVideoX 5B I2V"],
  },
  "wabi-sabi": {
    image: ["Flux 1.1 Ultra", "Luma Photon"],
    video: ["WAN T2V"],
    i2i: ["Flux Pro 1.1 Ref"],
    i2v: ["WAN I2V"],
  },
};

// --- Selection Logic ---

export function selectModel(
  styleId: string,
  outputType: OutputType,
  requestedTier: Tier,
): ModelSelection {
  const modelMap: Record<OutputType, FalModel[]> = {
    image: IMAGE_MODELS,
    video: VIDEO_MODELS,
    "image-to-image": I2I_MODELS,
    "image-to-video": I2V_MODELS,
  };
  const models = modelMap[outputType];
  const affinity = STYLE_MODEL_AFFINITY[styleId];

  if (affinity) {
    const affinityMap: Record<OutputType, string[]> = {
      image: affinity.image,
      video: affinity.video,
      "image-to-image": affinity.i2i,
      "image-to-video": affinity.i2v,
    };
    const preferred = affinityMap[outputType];
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

export function selectChainModels(
  chain: ChainType,
  styleId: string,
  tier: Tier,
): ChainModelSelection {
  const steps: Array<{ step: string; model: FalModel }> = [];

  if (chain === "t2i" || chain === "t2i-i2i" || chain === "t2i-i2v" || chain === "t2i-i2i-i2v") {
    steps.push({ step: "t2i", model: selectModel(styleId, "image", tier).primary });
  }
  if (chain === "i2i" || chain === "t2i-i2i" || chain === "t2i-i2i-i2v") {
    steps.push({ step: "i2i", model: selectModel(styleId, "image-to-image", tier).primary });
  }
  if (chain === "t2i-i2v" || chain === "t2i-i2i-i2v") {
    steps.push({ step: "i2v", model: selectModel(styleId, "image-to-video", tier).primary });
  }

  return { chain, models: steps, reason: `Chain ${chain} for style ${styleId} at tier ${tier}` };
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
  const chain = getArg("--chain") as ChainType | undefined;

  if (chain) {
    const chainSelection = selectChainModels(chain, styleId, tier);
    yield* Effect.sync(() => {
      console.log(JSON.stringify(chainSelection, null, 2));
    });
  } else {
    const selection = selectModel(styleId, outputType, tier);
    yield* Effect.sync(() => {
      console.log(JSON.stringify(selection, null, 2));
    });
  }
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
