/**
 * run-quiver-svg-vectorization.ts — Executes QuiverAI image-to-SVG vectorization.
 * Converts raster images to clean vector SVG representations.
 *
 * Run: bun run scripts/run-quiver-svg-vectorization.ts --image-url "..." --auto-crop true
 */

import { QuiverAI } from "@quiverai/sdk";
import { Console, Effect, pipe } from "effect";

// --- Types ---

interface VectorizationInput {
  readonly imageUrl: string;
  readonly autoCrop: boolean;
}

interface VectorizationResult {
  readonly svg_content: string;
  readonly prompt_id: string;
  readonly timing: number;
}

// --- Vectorization ---

export function vectorizeSvg(input: VectorizationInput): Effect.Effect<VectorizationResult, Error> {
  return Effect.tryPromise({
    try: async () => {
      const client = new QuiverAI({ bearerAuth: Bun.env.QUIVERAI_API_KEY });

      const start = Date.now();
      const result = await client.vectorizeSVG.vectorizeSVG({
        model: "arrow-preview",
        autoCrop: input.autoCrop,
        image: { url: input.imageUrl },
      });
      const timing = Date.now() - start;

      const data = result as Record<string, unknown>;
      const svgs = (data.svgs ?? data.results ?? data.data) as
        | Array<{ svg?: string; content?: string }>
        | undefined;
      const svgContent =
        svgs?.[0]?.svg ??
        svgs?.[0]?.content ??
        (data.svg as string | undefined) ??
        (data.content as string | undefined) ??
        "";

      return {
        svg_content: svgContent,
        prompt_id: (data.id as string | undefined) ?? crypto.randomUUID(),
        timing,
      } satisfies VectorizationResult;
    },
    catch: (e) => new Error(`QuiverAI vectorization failed: ${e}`),
  });
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const imageUrl = getArg("--image-url");
  const autoCrop = getArg("--auto-crop") !== "false";

  if (!imageUrl) {
    return yield* Effect.fail(new Error("--image-url is required"));
  }
  if (!Bun.env.QUIVERAI_API_KEY) {
    return yield* Effect.fail(new Error("QUIVERAI_API_KEY environment variable is required"));
  }

  const result = yield* vectorizeSvg({ imageUrl, autoCrop });

  yield* Console.log(
    JSON.stringify(
      {
        svg_content:
          result.svg_content.length > 200
            ? `${result.svg_content.slice(0, 200)}... (${result.svg_content.length} chars)`
            : result.svg_content,
        prompt_id: result.prompt_id,
        timing: result.timing,
      },
      null,
      2,
    ),
  );

  if (result.svg_content) {
    const outPath = `vectorized-output-${Date.now()}.svg`;
    yield* Effect.tryPromise({
      try: () => Bun.write(outPath, result.svg_content),
      catch: (e) => new Error(`Failed to write SVG: ${e}`),
    });
    yield* Console.log(`SVG written to: ${outPath}`);
  }
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`QuiverAI vectorization failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
