/**
 * run-fal-generation.ts — Executes fal.ai generation (image/video/audio/3D) in E2B sandbox.
 * Supports all fal.ai endpoints with timeout, rate-limit retry, and structured output.
 *
 * Run: bun run scripts/run-fal-generation.ts --endpoint "fal-ai/flux-pro/v1.1-ultra" --prompt "..." --params '{"image_size":"landscape_16_9"}'
 */

import { fal } from "@fal-ai/client";
import { Console, Duration, Effect, pipe, Schedule } from "effect";

function buildDeterministicId(endpoint: string, prompt: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(`${endpoint}:${prompt}`);
  return hasher.digest("hex").slice(0, 32);
}

// --- Types ---

interface FalGenerationInput {
  readonly endpoint: string;
  readonly prompt: string;
  readonly params: Record<string, unknown>;
}

interface FalGenerationResult {
  readonly url: string;
  readonly content_type: string;
  readonly seed: number | null;
  readonly prompt_id: string;
  readonly timing: number;
}

// --- Rate-limit retry policy: 3 attempts with exponential backoff ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- Generation ---

// Flux Pro uses T5-XXL encoder — no need to truncate prompts
// Full creative prompts pass through unmodified

export function runFalGeneration(
  input: FalGenerationInput,
): Effect.Effect<FalGenerationResult, Error> {
  const prompt = input.prompt;
  return pipe(
    Effect.void,
    Effect.flatMap(() =>
      pipe(
        Effect.tryPromise({
          try: async () => {
            fal.config({ credentials: Bun.env.FAL_KEY });
            const start = Date.now();
            const result = await fal.subscribe(input.endpoint, {
              input: { prompt, seed: 42, ...input.params },
              logs: true,
            });
            const timing = Date.now() - start;
            const data = result.data as Record<string, unknown>;
            const images = data.images as Array<{ url: string; content_type?: string }> | undefined;
            const video = data.video as { url: string } | undefined;
            const audio = data.audio as { url: string } | undefined;
            const output = data.output as { url: string } | undefined;
            const url =
              images?.[0]?.url ??
              video?.url ??
              audio?.url ??
              output?.url ??
              (data.url as string | undefined) ??
              "";
            const contentType =
              images?.[0]?.content_type ??
              (video ? "video/mp4" : undefined) ??
              (audio ? "audio/mpeg" : undefined) ??
              inferContentType(url);
            return {
              url,
              content_type: contentType,
              seed: (data.seed as number) ?? null,
              prompt_id:
                (result.requestId as string) ?? buildDeterministicId(input.endpoint, input.prompt),
              timing,
            } satisfies FalGenerationResult;
          },
          catch: (e) => new Error(`fal.ai generation failed: ${e}`),
        }),
        Effect.retry({ schedule: retryPolicy, while: (err) => isRateLimitError(err) }),
        Effect.timeout(Duration.minutes(5)),
        Effect.catchTag("TimeoutException", () =>
          Effect.fail(
            new Error(`fal.ai generation timed out after 5m for endpoint: ${input.endpoint}`),
          ),
        ),
      ),
    ),
  );
}

function isRateLimitError(err: Error): boolean {
  const msg = err.message.toLowerCase();
  return msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests");
}

function inferContentType(url: string): string {
  if (!url) return "unknown";
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".jpg") || lower.includes(".jpeg")) return "image/jpeg";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".mp4")) return "video/mp4";
  if (lower.includes(".mp3")) return "audio/mpeg";
  if (lower.includes(".wav")) return "audio/wav";
  if (lower.includes(".glb")) return "model/gltf-binary";
  return "image/png";
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const endpoint = getArg("--endpoint");
  const prompt = getArg("--prompt");
  const paramsRaw = getArg("--params");

  if (!endpoint) {
    return yield* Effect.fail(new Error("--endpoint is required"));
  }
  if (!prompt) {
    return yield* Effect.fail(new Error("--prompt is required"));
  }
  if (!Bun.env.FAL_KEY) {
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));
  }

  const params = paramsRaw
    ? yield* Effect.try(() => JSON.parse(paramsRaw) as Record<string, unknown>).pipe(
        Effect.mapError(() => new Error("Invalid JSON for --params")),
      )
    : {};

  const result = yield* runFalGeneration({ endpoint, prompt, params });

  yield* Console.log(JSON.stringify(result, null, 2));
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`fal.ai generation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
