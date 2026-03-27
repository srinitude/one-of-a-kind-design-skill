/**
 * run-background-removal.ts — Subject isolation via background removal.
 * Uses fal-ai/birefnet/v2 (default) or fal-ai/bria/rmbg for transparent backgrounds.
 *
 * Run: bun run scripts/run-background-removal.ts --image-url "..." --model "birefnet"
 */

import { fal } from "@fal-ai/client";
import { Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

type BgRemovalModel = "birefnet" | "bria";

interface BgRemovalInput {
  readonly imageUrl: string;
  readonly model: BgRemovalModel;
}

interface BgRemovalResult {
  readonly url: string;
  readonly model_used: string;
  readonly timing: number;
}

// --- Model endpoint mapping ---

const MODEL_ENDPOINTS: Record<BgRemovalModel, string> = {
  birefnet: "fal-ai/birefnet/v2",
  bria: "fal-ai/bria/rmbg",
};

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- Background Removal ---

export function removeBackground(input: BgRemovalInput): Effect.Effect<BgRemovalResult, Error> {
  const endpoint = MODEL_ENDPOINTS[input.model];

  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const start = Date.now();
        const result = await fal.subscribe(endpoint, {
          input: {
            image_url: input.imageUrl,
          },
          logs: true,
          onQueueUpdate: (_update) => {
            // Queue status logged by fal client internally
          },
        });
        const timing = Date.now() - start;

        const data = result.data as Record<string, unknown>;
        const image = data.image as { url: string } | undefined;
        const images = data.images as Array<{ url: string }> | undefined;
        const url = image?.url ?? images?.[0]?.url ?? (data.url as string | undefined) ?? "";

        return {
          url,
          model_used: endpoint,
          timing,
        } satisfies BgRemovalResult;
      },
      catch: (e) => new Error(`Background removal (${endpoint}) failed: ${e}`),
    }),
    Effect.retry({
      schedule: retryPolicy,
      while: (err) => err.message.includes("429") || err.message.includes("rate limit"),
    }),
    Effect.timeout(Duration.minutes(3)),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new Error(`Background removal timed out after 3 minutes`)),
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
  const model = (getArg("--model") ?? "birefnet") as BgRemovalModel;

  if (!imageUrl) return yield* Effect.fail(new Error("--image-url is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const validModels: BgRemovalModel[] = ["birefnet", "bria"];
  if (!validModels.includes(model)) {
    return yield* Effect.fail(
      new Error(`Invalid model: ${model}. Valid: ${validModels.join(", ")}`),
    );
  }

  const result = yield* removeBackground({ imageUrl, model });

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Background removal failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
