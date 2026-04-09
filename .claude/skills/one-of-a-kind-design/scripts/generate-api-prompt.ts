/**
 * generate-api-prompt.ts — Routes to correct prompt-crafter subagent + target API.
 * Two-phase pipeline: deterministic route → subagent craft.
 *
 * Run: bun run scripts/generate-api-prompt.ts --stage "image-gen" --style '{"id":"art-deco",...}' --intent "luxury hotel hero"
 */
import { Effect, pipe } from "effect";

// --- Types ---

type TargetApi = "fal-ai" | "quiverai";

interface RouteEntry {
  readonly crafter: string;
  readonly api: TargetApi;
}

interface PromptResult {
  readonly craftedPrompt: string;
  readonly negativePrompt: string;
  readonly model: string;
  readonly pipelineStage: string;
  readonly crafterUsed: string;
  readonly targetApi: TargetApi;
  readonly params: Record<string, unknown>;
  readonly promptId: string;
}

// --- Route Map ---

export const ROUTE_MAP: Record<string, RouteEntry> = {
  "image-gen": { crafter: "prompt-crafter-image-gen", api: "fal-ai" },
  "image-edit": { crafter: "prompt-crafter-image-edit", api: "fal-ai" },
  "style-transfer": { crafter: "prompt-crafter-style-transfer", api: "fal-ai" },
  controlnet: { crafter: "prompt-crafter-controlnet", api: "fal-ai" },
  "video-gen": { crafter: "prompt-crafter-video-gen", api: "fal-ai" },
  "video-camera": { crafter: "prompt-crafter-video-camera", api: "fal-ai" },
  "video-restyle": { crafter: "prompt-crafter-video-restyle", api: "fal-ai" },
  "3d-gen": { crafter: "prompt-crafter-3d-gen", api: "fal-ai" },
  upscale: { crafter: "prompt-crafter-upscale", api: "fal-ai" },
  "audio-tts": { crafter: "prompt-crafter-audio-tts", api: "fal-ai" },
  "audio-music": { crafter: "prompt-crafter-audio-music", api: "fal-ai" },
  annotation: { crafter: "prompt-crafter-annotation", api: "fal-ai" },
  avatar: { crafter: "prompt-crafter-avatar", api: "fal-ai" },
  "svg-gen": { crafter: "prompt-crafter-svg-gen", api: "quiverai" },
  "svg-vectorize": { crafter: "prompt-crafter-svg-vectorize", api: "quiverai" },
};

// --- Model Selection Defaults ---

export const DEFAULT_MODELS: Record<string, string> = {
  "image-gen": "fal-ai/flux-pro/v1.1-ultra",
  "image-edit": "fal-ai/flux-pro/v1/fill",
  "style-transfer": "fal-ai/flux-kontext/pro",
  controlnet: "fal-ai/flux-pro/v1/controlnet",
  "video-gen": "fal-ai/kling-video/v2.5/pro/image-to-video",
  "video-camera": "fal-ai/kling-video/v3/pro",
  "video-restyle": "fal-ai/luma-ray/v2",
  "3d-gen": "fal-ai/trellis",
  upscale: "fal-ai/topaz/upscale/image",
  "audio-tts": "fal-ai/playai/tts/v3",
  "audio-music": "fal-ai/stable-audio",
  annotation: "fal-ai/gpt-image-1",
  avatar: "fal-ai/act-one",
  "svg-gen": "quiverai/arrow-preview",
  "svg-vectorize": "quiverai/arrow-preview",
};

// --- Prompt Construction ---

interface DialModifiersData {
  readonly promptPrefix?: string;
  readonly promptSuffix?: string;
  readonly negativeBoost?: string[];
  readonly compositionOverride?: string | null;
  readonly colorShift?: "warmer" | "cooler" | "muted" | "saturated" | null;
}

interface ConventionBreakData {
  readonly applied?: boolean;
  readonly dogma?: string;
  readonly breakText?: string;
}

interface AudienceFitData {
  readonly fitType?: "strong" | "unexpected" | "neutral";
  readonly audienceNote?: string;
}

interface StyleData {
  readonly id: string;
  readonly name?: string;
  readonly tags?: string[];
  readonly generativeAi?: {
    positivePrompt?: string;
    negativePrompt?: string;
  };
  readonly motionSignature?: string;
  readonly motionCharacter?: string;
  readonly dials?: Record<string, number>;
  readonly designSystemParameters?: Record<string, string>;
  readonly antiSlopOverrides?: string[];
  readonly dialModifiers?: DialModifiersData;
  readonly conventionBreak?: ConventionBreakData;
  readonly audienceFit?: AudienceFitData;
}

export function buildCrafterContext(stage: string, style: StyleData, userIntent: string): string {
  const parts: string[] = [];

  if (style.dialModifiers?.promptPrefix) {
    parts.push(`Creative direction: ${style.dialModifiers.promptPrefix}`);
  }

  parts.push(
    `Pipeline stage: ${stage}`,
    `Style: ${style.id} (${style.name ?? style.id})`,
    `Tags: ${style.tags?.join(", ") ?? "none"}`,
    `User intent: ${userIntent}`,
  );

  if (style.generativeAi?.positivePrompt) {
    parts.push(`Style positive tokens: ${style.generativeAi.positivePrompt}`);
  }

  if (style.conventionBreak?.applied) {
    parts.push(
      `Convention break: AVOID "${style.conventionBreak.dogma}" — INSTEAD "${style.conventionBreak.breakText}"`,
    );
  }

  if (style.audienceFit?.fitType === "unexpected") {
    parts.push(`Unexpected pairing note: ${style.audienceFit.audienceNote}`);
  }

  if (style.dialModifiers?.compositionOverride) {
    parts.push(`Composition: ${style.dialModifiers.compositionOverride}`);
  }

  if (style.generativeAi?.negativePrompt) {
    const extraNeg = style.dialModifiers?.negativeBoost ?? [];
    const allNeg = [style.generativeAi.negativePrompt, ...extraNeg].join(", ");
    parts.push(`Style negative tokens: ${allNeg}`);
  } else if (style.dialModifiers?.negativeBoost?.length) {
    parts.push(`Negative boost: ${style.dialModifiers.negativeBoost.join(", ")}`);
  }

  if (style.dialModifiers?.colorShift) {
    parts.push(`Color temperature: shift ${style.dialModifiers.colorShift}`);
  }

  if (style.motionSignature) {
    parts.push(`Motion signature: ${style.motionSignature}`);
  }
  if (style.motionCharacter) {
    parts.push(`Motion character: ${style.motionCharacter}`);
  }
  if (style.dials) {
    parts.push(`Dials: ${JSON.stringify(style.dials)}`);
  }
  if (style.designSystemParameters) {
    parts.push(`Design system: ${JSON.stringify(style.designSystemParameters)}`);
  }
  if (style.antiSlopOverrides?.length) {
    parts.push(`Anti-slop overrides: ${style.antiSlopOverrides.join("; ")}`);
  }

  if (style.dialModifiers?.promptSuffix) {
    parts.push(`Creative suffix: ${style.dialModifiers.promptSuffix}`);
  }

  return parts.join("\n");
}

export function buildPromptId(stage: string, styleId: string, intent: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(`${stage}:${styleId}:${intent}`);
  return hasher.digest("hex").slice(0, 16);
}

// --- Main ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const stage = getArg("--stage");
  const styleRaw = getArg("--style");
  const userIntent = getArg("--intent") ?? "";

  if (!stage) {
    return yield* Effect.fail(
      new Error(`Missing --stage. Options: ${Object.keys(ROUTE_MAP).join(", ")}`),
    );
  }

  const route = ROUTE_MAP[stage];
  if (!route) {
    return yield* Effect.fail(
      new Error(`Unknown stage: ${stage}. Options: ${Object.keys(ROUTE_MAP).join(", ")}`),
    );
  }

  const style: StyleData = styleRaw
    ? yield* Effect.try({
        try: () => JSON.parse(styleRaw) as StyleData,
        catch: () => ({ id: "editorial-minimalism" }) as StyleData,
      })
    : { id: "editorial-minimalism" };
  const crafterContext = buildCrafterContext(stage, style, userIntent);
  const model = DEFAULT_MODELS[stage] ?? "fal-ai/flux-pro/v1.1-ultra";
  const promptId = buildPromptId(stage, style.id, userIntent);

  // In production, this invokes the subagent via Claude Code agent system.
  // For CLI usage, we output the crafter context that would be sent.
  const result: PromptResult = {
    craftedPrompt: `[CRAFTER: ${route?.crafter}] ${crafterContext}`,
    negativePrompt: style.generativeAi?.negativePrompt ?? "",
    model,
    pipelineStage: stage,
    crafterUsed: route?.crafter,
    targetApi: route?.api,
    params: {
      style_id: style.id,
      motion_signature: style.motionSignature,
      dials: style.dials,
    },
    promptId,
  };

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
  });

  return result;
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Prompt generation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
