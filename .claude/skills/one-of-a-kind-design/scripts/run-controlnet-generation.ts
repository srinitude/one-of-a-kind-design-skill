/**
 * run-controlnet-generation.ts — ControlNet generation with structural guidance.
 * Uses fal-ai/flux-pro/v1/controlnet for structure-aware image generation.
 *
 * Run: bun run scripts/run-controlnet-generation.ts --control-image "..." --prompt "..." --control-mode "canny" --strength 0.8
 */

import { fal } from "@fal-ai/client";
import { Console, Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

type ControlMode = "canny" | "depth" | "pose" | "tile" | "blur" | "erode" | "gray";

interface ControlNetInput {
  readonly controlImageUrl: string;
  readonly prompt: string;
  readonly controlMode: ControlMode;
  readonly strength: number;
}

interface ControlNetResult {
  readonly url: string;
  readonly control_mode: ControlMode;
  readonly strength: number;
  readonly timing: number;
}

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- ControlNet Generation ---

export function runControlNet(input: ControlNetInput): Effect.Effect<ControlNetResult, Error> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const start = Date.now();
        const result = await fal.subscribe("fal-ai/flux-pro/v1/controlnet", {
          input: {
            prompt: input.prompt,
            control_image_url: input.controlImageUrl,
            controlnet_conditioning: [
              {
                control_image_url: input.controlImageUrl,
                control_mode: input.controlMode,
                conditioning_scale: input.strength,
              },
            ],
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_QUEUE") {
              Effect.runSync(
                Console.log(
                  `Queue position: ${(update as { queue_position?: number }).queue_position ?? "unknown"}`,
                ),
              );
            }
          },
        });
        const timing = Date.now() - start;

        const data = result.data as Record<string, unknown>;
        const images = data.images as Array<{ url: string }> | undefined;
        const url = images?.[0]?.url ?? (data.url as string) ?? "";

        return {
          url,
          control_mode: input.controlMode,
          strength: input.strength,
          timing,
        } satisfies ControlNetResult;
      },
      catch: (e) => new Error(`ControlNet generation failed: ${e}`),
    }),
    Effect.retry({
      schedule: retryPolicy,
      while: (err) => err.message.includes("429") || err.message.includes("rate limit"),
    }),
    Effect.timeout(Duration.minutes(5)),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new Error("ControlNet generation timed out after 5 minutes")),
    ),
  );
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const controlImageUrl = getArg("--control-image");
  const prompt = getArg("--prompt");
  const controlMode = (getArg("--control-mode") ?? "canny") as ControlMode;
  const strength = parseFloat(getArg("--strength") ?? "0.8");

  if (!controlImageUrl) return yield* Effect.fail(new Error("--control-image is required"));
  if (!prompt) return yield* Effect.fail(new Error("--prompt is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const validModes: ControlMode[] = ["canny", "depth", "pose", "tile", "blur", "erode", "gray"];
  if (!validModes.includes(controlMode)) {
    return yield* Effect.fail(
      new Error(`Invalid control-mode: ${controlMode}. Valid: ${validModes.join(", ")}`),
    );
  }
  if (strength < 0 || strength > 1) {
    return yield* Effect.fail(new Error(`Strength must be between 0 and 1, got: ${strength}`));
  }

  const result = yield* runControlNet({
    controlImageUrl,
    prompt,
    controlMode,
    strength,
  });

  yield* Console.log(JSON.stringify(result, null, 2));
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`ControlNet generation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
