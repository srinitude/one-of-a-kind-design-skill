/**
 * run-3d-generation.ts — Trellis 3D mesh generation from images.
 * Uses fal-ai/trellis to generate 3D meshes from 2D images.
 *
 * Run: bun run scripts/run-3d-generation.ts --image-url "..." --format "glb"
 */

import { fal } from "@fal-ai/client";
import { Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

type MeshFormat = "glb" | "obj" | "stl" | "usdz";

interface MeshGenerationInput {
  readonly imageUrl: string;
  readonly format: MeshFormat;
}

interface MeshGenerationResult {
  readonly mesh_url: string;
  readonly format: MeshFormat;
  readonly vertex_count: number;
  readonly timing: number;
}

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- 3D Generation ---

export function generate3dMesh(
  input: MeshGenerationInput,
): Effect.Effect<MeshGenerationResult, Error> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const start = Date.now();
        const trellisInput = {
          image_url: input.imageUrl,
          ss_guidance_strength: 7.5,
          slat_guidance_strength: 3.0,
        };
        const result = await fal.subscribe("fal-ai/trellis", {
          input: trellisInput,
          logs: true,
          onQueueUpdate: (_update) => {
            // Queue status logged by fal client internally
          },
        });
        const timing = Date.now() - start;

        const data = result.data as Record<string, unknown>;
        const meshUrl =
          (data.mesh_url as string | undefined) ??
          (data.model_url as string | undefined) ??
          (data.url as string | undefined) ??
          ((data.output as Record<string, unknown> | undefined)?.url as string | undefined) ??
          "";

        const vertexCount =
          (data.vertex_count as number | undefined) ??
          (data.num_vertices as number | undefined) ??
          ((data.metadata as Record<string, unknown> | undefined)?.vertex_count as
            | number
            | undefined) ??
          0;

        return {
          mesh_url: meshUrl,
          format: input.format,
          vertex_count: vertexCount,
          timing,
        } satisfies MeshGenerationResult;
      },
      catch: (e) => new Error(`Trellis 3D generation failed: ${e}`),
    }),
    Effect.retry({
      schedule: retryPolicy,
      while: (err) => err.message.includes("429") || err.message.includes("rate limit"),
    }),
    Effect.timeout(Duration.minutes(5)),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new Error("3D generation timed out after 5 minutes")),
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
  const format = (getArg("--format") ?? "glb") as MeshFormat;

  if (!imageUrl) return yield* Effect.fail(new Error("--image-url is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const validFormats: MeshFormat[] = ["glb", "obj", "stl", "usdz"];
  if (!validFormats.includes(format)) {
    return yield* Effect.fail(
      new Error(`Invalid format: ${format}. Valid: ${validFormats.join(", ")}`),
    );
  }

  const result = yield* generate3dMesh({ imageUrl, format });

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`3D generation failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
