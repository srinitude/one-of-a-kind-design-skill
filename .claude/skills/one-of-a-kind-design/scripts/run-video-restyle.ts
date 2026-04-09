/**
 * run-video-restyle.ts — Video restyling via Luma Ray v2.
 * Applies style transformations to existing video content.
 *
 * Run: bun run scripts/run-video-restyle.ts --video-url "..." --style-prompt "..."
 */

import { fal } from "@fal-ai/client";
import { Console, Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

interface VideoRestyleInput {
  readonly videoUrl: string;
  readonly stylePrompt: string;
}

interface VideoRestyleResult {
  readonly url: string;
  readonly timing: number;
}

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- Video Restyle ---

export function restyleVideo(input: VideoRestyleInput): Effect.Effect<VideoRestyleResult, Error> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const start = Date.now();
        const result = await fal.subscribe("fal-ai/luma-ray/v2", {
          input: {
            prompt: input.stylePrompt,
            video_url: input.videoUrl,
            mode: "modify",
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
        const video = data.video as { url: string } | undefined;
        const url =
          video?.url ??
          (data.url as string | undefined) ??
          (data.video_url as string | undefined) ??
          "";

        return {
          url,
          timing,
        } satisfies VideoRestyleResult;
      },
      catch: (e) => new Error(`Luma Ray v2 video restyle failed: ${e}`),
    }),
    Effect.retry({
      schedule: retryPolicy,
      while: (err) => err.message.includes("429") || err.message.includes("rate limit"),
    }),
    Effect.timeout(Duration.minutes(5)),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new Error("Video restyle timed out after 5 minutes")),
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

  const videoUrl = getArg("--video-url");
  const stylePrompt = getArg("--style-prompt");

  if (!videoUrl) return yield* Effect.fail(new Error("--video-url is required"));
  if (!stylePrompt) return yield* Effect.fail(new Error("--style-prompt is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const result = yield* restyleVideo({ videoUrl, stylePrompt });

  yield* Console.log(JSON.stringify(result, null, 2));
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Video restyle failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
