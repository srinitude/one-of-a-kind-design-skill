/**
 * run-upscale.ts — Resolution enhancement via AI upscaling.
 * Uses fal-ai/topaz/upscale/image (default) or fal-ai/esrgan.
 *
 * Run: bun run scripts/run-upscale.ts --image-url "..." --scale 4 --model "topaz"
 */

import { fal } from "@fal-ai/client";
import { Console, Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

type UpscaleModel = "topaz" | "esrgan";

interface UpscaleInput {
  readonly imageUrl: string;
  readonly scale: number;
  readonly model: UpscaleModel;
}

interface UpscaleResult {
  readonly url: string;
  readonly scale_factor: number;
  readonly model_used: string;
  readonly timing: number;
}

// --- Model endpoint mapping ---

const MODEL_ENDPOINTS: Record<UpscaleModel, string> = {
  topaz: "fal-ai/topaz/upscale/image",
  esrgan: "fal-ai/esrgan",
};

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- Upscale ---

export function upscaleImage(input: UpscaleInput): Effect.Effect<UpscaleResult, Error> {
  const endpoint = MODEL_ENDPOINTS[input.model];

  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const start = Date.now();
        const result = await fal.subscribe(endpoint, {
          input: {
            image_url: input.imageUrl,
            scale: input.scale,
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
        const image = data.image as { url: string } | undefined;
        const images = data.images as Array<{ url: string }> | undefined;
        const url = image?.url ?? images?.[0]?.url ?? (data.url as string | undefined) ?? "";

        return {
          url,
          scale_factor: input.scale,
          model_used: endpoint,
          timing,
        } satisfies UpscaleResult;
      },
      catch: (e) => new Error(`Upscale (${endpoint}) failed: ${e}`),
    }),
    Effect.retry({
      schedule: retryPolicy,
      while: (err) => err.message.includes("429") || err.message.includes("rate limit"),
    }),
    Effect.timeout(Duration.minutes(5)),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new Error("Upscale timed out after 5 minutes")),
    ),
  );
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const imageUrl = getArg("--image-url");
  const scale = parseInt(getArg("--scale") ?? "4", 10);
  const model = (getArg("--model") ?? "topaz") as UpscaleModel;

  if (!imageUrl) return yield* Effect.fail(new Error("--image-url is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const validModels: UpscaleModel[] = ["topaz", "esrgan"];
  if (!validModels.includes(model)) {
    return yield* Effect.fail(
      new Error(`Invalid model: ${model}. Valid: ${validModels.join(", ")}`),
    );
  }
  if (scale < 1 || scale > 8) {
    return yield* Effect.fail(new Error(`Scale must be between 1 and 8, got: ${scale}`));
  }

  const result = yield* upscaleImage({ imageUrl, scale, model });

  yield* Console.log(JSON.stringify(result, null, 2));
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Upscale failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
