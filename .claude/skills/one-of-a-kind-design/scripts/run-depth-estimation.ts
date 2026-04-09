/**
 * run-depth-estimation.ts — Depth map estimation for parallax effects.
 * Uses fal-ai/depth-anything/v2 to generate depth maps from images.
 *
 * Run: bun run scripts/run-depth-estimation.ts --image-url "..."
 */

import { fal } from "@fal-ai/client";
import { Console, Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

interface DepthEstimationInput {
  readonly imageUrl: string;
}

interface DepthEstimationResult {
  readonly depth_map_url: string;
  readonly timing: number;
}

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- Depth Estimation ---

export function estimateDepth(
  input: DepthEstimationInput,
): Effect.Effect<DepthEstimationResult, Error> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const start = Date.now();
        const result = await fal.subscribe("fal-ai/depth-anything/v2", {
          input: {
            image_url: input.imageUrl,
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
        const depthMap = data.depth_map as { url: string } | undefined;
        const image = data.image as { url: string } | undefined;
        const depthMapUrl =
          depthMap?.url ??
          image?.url ??
          (data.depth_map_url as string | undefined) ??
          (data.url as string | undefined) ??
          "";

        return {
          depth_map_url: depthMapUrl,
          timing,
        } satisfies DepthEstimationResult;
      },
      catch: (e) => new Error(`Depth Anything v2 estimation failed: ${e}`),
    }),
    Effect.retry({
      schedule: retryPolicy,
      while: (err) => err.message.includes("429") || err.message.includes("rate limit"),
    }),
    Effect.timeout(Duration.minutes(3)),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new Error("Depth estimation timed out after 3 minutes")),
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

  const imageUrl = getArg("--image-url");

  if (!imageUrl) return yield* Effect.fail(new Error("--image-url is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const result = yield* estimateDepth({ imageUrl });

  yield* Console.log(JSON.stringify(result, null, 2));
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Depth estimation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
