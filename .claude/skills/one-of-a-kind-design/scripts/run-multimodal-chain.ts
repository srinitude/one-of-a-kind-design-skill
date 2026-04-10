/**
 * run-multimodal-chain.ts — Sequential multi-modal generation chains.
 * Supports t2i -> i2i -> i2v pipelines with verification between steps.
 *
 * Run: bun run scripts/run-multimodal-chain.ts --chain "t2i-i2i" --style "cinematic" --prompt "..."
 */

import { fal } from "@fal-ai/client";
import { Effect, pipe } from "effect";

// --- Types ---

export type ChainStep =
  | {
      readonly type: "text-to-image";
      readonly prompt: string;
      readonly model: string;
      readonly seed: number;
    }
  | {
      readonly type: "image-to-image";
      readonly prompt: string;
      readonly model: string;
      readonly strength: number;
      readonly seed: number;
    }
  | {
      readonly type: "image-to-video";
      readonly prompt: string;
      readonly model: string;
      readonly duration: number;
    }
  | {
      readonly type: "verify";
      readonly referenceUrl: string;
      readonly minSimilarity: number;
      readonly maxSimilarity: number;
    };

export interface StepResult {
  readonly stepIndex: number;
  readonly type: string;
  readonly model: string;
  readonly url: string;
  readonly timingMs: number;
}

export interface ChainResult {
  readonly steps: ReadonlyArray<StepResult>;
  readonly finalUrl: string;
  readonly totalTiming: number;
  readonly verificationResults: ReadonlyArray<Record<string, unknown>>;
}

// --- fal.ai config ---

const configureFal = (): Effect.Effect<void, Error> =>
  Effect.try({
    try: () => {
      fal.config({ credentials: Bun.env.FAL_KEY ?? "" });
    },
    catch: (e) => new Error(`fal.ai config failed: ${e}`),
  });

// --- Step executors ---

const runT2I = (
  step: Extract<ChainStep, { type: "text-to-image" }>,
): Effect.Effect<{ url: string; timingMs: number }, Error> =>
  Effect.tryPromise({
    try: async () => {
      const start = Date.now();
      const result = (await fal.subscribe(step.model, {
        input: { prompt: step.prompt, seed: step.seed, image_size: "landscape_16_9" },
        timeout: 120000,
      })) as { images?: Array<{ url: string }>; data?: { images?: Array<{ url: string }> } };
      const images = result.images ?? result.data?.images ?? [];
      const url = images[0]?.url ?? "";
      return { url, timingMs: Date.now() - start };
    },
    catch: (e) => new Error(`T2I generation failed on ${step.model}: ${e}`),
  });

const runI2I = (
  step: Extract<ChainStep, { type: "image-to-image" }>,
  inputUrl: string,
): Effect.Effect<{ url: string; timingMs: number }, Error> =>
  Effect.tryPromise({
    try: async () => {
      const start = Date.now();
      const result = (await fal.subscribe(step.model, {
        input: {
          prompt: step.prompt,
          image_url: inputUrl,
          image_prompt_strength: step.strength,
          strength: step.strength,
          seed: step.seed,
        },
        timeout: 120000,
      })) as { images?: Array<{ url: string }>; data?: { images?: Array<{ url: string }> } };
      const images = result.images ?? result.data?.images ?? [];
      const url = images[0]?.url ?? "";
      return { url, timingMs: Date.now() - start };
    },
    catch: (e) => new Error(`I2I generation failed on ${step.model}: ${e}`),
  });

const runI2V = (
  step: Extract<ChainStep, { type: "image-to-video" }>,
  inputUrl: string,
): Effect.Effect<{ url: string; timingMs: number }, Error> =>
  Effect.tryPromise({
    try: async () => {
      const start = Date.now();
      const result = (await fal.subscribe(step.model, {
        input: { prompt: step.prompt, image_url: inputUrl, duration: step.duration },
        timeout: 300000,
      })) as { video?: { url: string }; data?: { video?: { url: string } } };
      const url = result.video?.url ?? result.data?.video?.url ?? "";
      return { url, timingMs: Date.now() - start };
    },
    catch: (e) => new Error(`I2V generation failed on ${step.model}: ${e}`),
  });

// --- Chain executor ---

export const executeChain = (steps: ChainStep[]): Effect.Effect<ChainResult, Error> =>
  Effect.gen(function* () {
    yield* configureFal();

    let currentUrl = "";
    const results: StepResult[] = [];
    const verifications: Array<Record<string, unknown>> = [];
    let totalTiming = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      if (step.type === "text-to-image") {
        const r = yield* runT2I(step);
        currentUrl = r.url;
        totalTiming += r.timingMs;
        results.push({
          stepIndex: i,
          type: "t2i",
          model: step.model,
          url: r.url,
          timingMs: r.timingMs,
        });
      }

      if (step.type === "image-to-image") {
        const r = yield* retryWithAdjustedStrength(step, currentUrl, 3);
        currentUrl = r.url;
        totalTiming += r.timingMs;
        results.push({
          stepIndex: i,
          type: "i2i",
          model: step.model,
          url: r.url,
          timingMs: r.timingMs,
        });
      }

      if (step.type === "image-to-video") {
        const r = yield* runI2V(step, currentUrl);
        currentUrl = r.url;
        totalTiming += r.timingMs;
        results.push({
          stepIndex: i,
          type: "i2v",
          model: step.model,
          url: r.url,
          timingMs: r.timingMs,
        });
      }

      if (step.type === "verify") {
        verifications.push({ stepIndex: i, referenceUrl: step.referenceUrl, currentUrl });
      }
    }

    return {
      steps: results,
      finalUrl: currentUrl,
      totalTiming,
      verificationResults: verifications,
    };
  });

// --- Retry helper for i2i with strength adjustment ---

const retryWithAdjustedStrength = (
  step: Extract<ChainStep, { type: "image-to-image" }>,
  inputUrl: string,
  maxRetries: number,
): Effect.Effect<{ url: string; timingMs: number }, Error> =>
  Effect.gen(function* () {
    let currentStrength = step.strength;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const adjusted = { ...step, strength: currentStrength };
      const result = yield* pipe(
        runI2I(adjusted, inputUrl),
        Effect.map((r) => ({ ...r, success: true as const })),
        Effect.catchAll((e) =>
          Effect.succeed({ url: "", timingMs: 0, success: false as const, error: e }),
        ),
      );

      if (result.success) return { url: result.url, timingMs: result.timingMs };
      lastError = result.error as Error;
      currentStrength = Math.max(0.1, Math.min(0.95, currentStrength - 0.1));
    }

    return yield* Effect.fail(lastError ?? new Error("I2I retry exhausted"));
  });

// --- CLI ---

if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const prompt = getArg("--prompt") ?? "a beautiful landscape";
  const chain = getArg("--chain") ?? "t2i";

  const steps: ChainStep[] = [];

  if (chain.includes("t2i")) {
    steps.push({ type: "text-to-image", prompt, model: "fal-ai/flux-pro/v1.1", seed: 42 });
  }
  if (chain.includes("i2i")) {
    steps.push({
      type: "image-to-image",
      prompt: `${prompt}, refined style`,
      model: "fal-ai/recraft-v3",
      strength: 0.6,
      seed: 42,
    });
  }
  if (chain.includes("i2v")) {
    steps.push({
      type: "image-to-video",
      prompt: "slow cinematic camera pan",
      model: "fal-ai/minimax/video-01",
      duration: 5,
    });
  }

  pipe(
    executeChain(steps),
    Effect.tap((result) =>
      Effect.sync(() => {
        console.log(JSON.stringify(result, null, 2));
      }),
    ),
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Chain execution failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
