/**
 * run-quiver-svg-generation.ts — Executes QuiverAI text-to-SVG generation.
 * Produces vector graphics from natural language descriptions.
 * Falls back to fal.ai Recraft V3 (real SVG) then fal.ai Flux (raster) if QuiverAI is unreachable.
 *
 * Run: bun run scripts/run-quiver-svg-generation.ts --prompt "..." --instructions "..." --temperature 0.8
 */

import { QuiverAI } from "@quiverai/sdk";
import { Console, Duration, Effect, pipe } from "effect";

function buildDeterministicId(key: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(key);
  return hasher.digest("hex").slice(0, 32);
}

// --- Types ---

interface SvgGenerationInput {
  readonly prompt: string;
  readonly instructions: string;
  readonly temperature: number;
}

interface SvgGenerationResult {
  readonly svg_content: string;
  readonly prompt_id: string;
  readonly timing: number;
  readonly source: "quiverai" | "recraft-svg" | "fal-fallback";
}

// --- QuiverAI generation with timeout ---

const quiverGenerate = (input: SvgGenerationInput): Effect.Effect<SvgGenerationResult, Error> =>
  pipe(
    Effect.tryPromise({
      try: async () => {
        const client = new QuiverAI({ bearerAuth: Bun.env.QUIVERAI_API_KEY });
        const start = Date.now();
        const result = await client.createSVGs.generateSVG({
          model: "arrow-preview",
          prompt: input.prompt,
          instructions: input.instructions,
          n: 1,
          temperature: input.temperature,
        });
        const timing = Date.now() - start;
        // SDK returns { headers, result } where result is SvgResponse
        const res = result.result as Record<string, unknown>;
        const data = (res.data ?? []) as Array<{ svg?: string; content?: string }>;
        const svgContent = data[0]?.svg ?? data[0]?.content ?? "";
        const responseId = (res.id as string | undefined) ?? "";

        return {
          svg_content: svgContent,
          prompt_id: responseId || buildDeterministicId(input.prompt),
          timing,
          source: "quiverai" as const,
        };
      },
      catch: (e) => new Error(`QuiverAI SVG generation failed: ${e}`),
    }),
    Effect.flatMap((result) =>
      result.svg_content.length < 10
        ? Effect.fail(new Error("QuiverAI returned empty SVG content"))
        : Effect.succeed(result),
    ),
    Effect.timeout(Duration.seconds(60)),
    Effect.catchTag("TimeoutException", () =>
      Effect.fail(new Error("QuiverAI timed out after 60s")),
    ),
  );

// --- Recraft V3 fallback: generates real SVG via fal.ai ---

const callRecraft = (input: SvgGenerationInput) =>
  Effect.tryPromise({
    try: async () => {
      const { fal } = await import("@fal-ai/client");
      fal.config({ credentials: Bun.env.FAL_KEY });
      const start = Date.now();
      const result = await fal.subscribe("fal-ai/recraft-v3", {
        input: {
          prompt: `${input.prompt}. ${input.instructions}`,
          style: "vector_illustration",
          image_size: "square",
        },
      });
      const timing = Date.now() - start;
      const data = result.data as Record<string, unknown>;
      const images = data.images as Array<{ url: string; content_type?: string }> | undefined;
      return { url: images?.[0]?.url ?? "", contentType: images?.[0]?.content_type ?? "", timing };
    },
    catch: (e) => new Error(`Recraft V3 SVG fallback failed: ${e}`),
  });

const fetchSvgContent = (svgUrl: string) =>
  Effect.tryPromise({
    try: async () => (await globalThis.fetch(svgUrl)).text(),
    catch: (e) => new Error(`Failed to fetch SVG content: ${e}`),
  });

const recraftSvgFallback = (input: SvgGenerationInput): Effect.Effect<SvgGenerationResult, Error> =>
  pipe(
    callRecraft(input),
    Effect.flatMap(({ url, contentType, timing }) => {
      const isSvg = contentType === "image/svg+xml" || url.endsWith(".svg");
      if (!url || !isSvg) {
        return Effect.fail(new Error("Recraft V3 did not return valid SVG"));
      }
      return pipe(
        fetchSvgContent(url),
        Effect.map((svgContent) => ({
          svg_content: svgContent,
          prompt_id: buildDeterministicId(input.prompt),
          timing,
          source: "recraft-svg" as const,
        })),
      );
    }),
    Effect.flatMap((result) =>
      result.svg_content.length < 10
        ? Effect.fail(new Error("Recraft V3 returned empty SVG"))
        : Effect.succeed(result),
    ),
  );

// --- fal.ai raster fallback: generate image, wrap in SVG ---

const falFallback = (input: SvgGenerationInput): Effect.Effect<SvgGenerationResult, Error> =>
  pipe(
    Effect.tryPromise({
      try: async () => {
        const { fal } = await import("@fal-ai/client");
        fal.config({ credentials: Bun.env.FAL_KEY });

        const start = Date.now();
        const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
          input: {
            prompt: `${input.prompt}. ${input.instructions}. Clean vector-style graphic, flat colors, no gradients, suitable for SVG conversion`,
            image_size: "square",
            seed: 42,
          },
        });
        const timing = Date.now() - start;
        const data = result.data as Record<string, unknown>;
        const images = data.images as Array<{ url: string }> | undefined;
        const imageUrl = images?.[0]?.url ?? "";

        const svgContent = imageUrl
          ? [
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">',
              `  <image href="${imageUrl}" width="1024" height="1024"/>`,
              `  <!-- fal.ai fallback: QuiverAI was unreachable. Raster wrapped in SVG. -->`,
              "</svg>",
            ].join("\n")
          : "";

        return {
          svg_content: svgContent,
          prompt_id: buildDeterministicId(input.prompt),
          timing,
          source: "fal-fallback" as const,
        };
      },
      catch: (e) => new Error(`fal.ai SVG fallback failed: ${e}`),
    }),
    Effect.flatMap((result) =>
      result.svg_content.length < 10
        ? Effect.fail(new Error("fal.ai fallback returned no image"))
        : Effect.succeed(result),
    ),
  );

// --- Public API: try QuiverAI -> Recraft V3 SVG -> fal.ai raster ---

export function generateSvg(input: SvgGenerationInput): Effect.Effect<SvgGenerationResult, Error> {
  return pipe(
    quiverGenerate(input),
    Effect.catchAll((quiverErr) =>
      pipe(
        Console.log(`  QuiverAI failed: ${quiverErr.message}. Trying Recraft V3 SVG...`),
        Effect.flatMap(() => recraftSvgFallback(input)),
      ),
    ),
    Effect.catchAll((recraftErr) =>
      pipe(
        Console.log(
          `  Recraft SVG failed: ${recraftErr.message}. Falling back to fal.ai raster...`,
        ),
        Effect.flatMap(() => falFallback(input)),
      ),
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

  const prompt = getArg("--prompt");
  const instructions = getArg("--instructions") ?? "";
  const temperature = parseFloat(getArg("--temperature") ?? "0.8");

  if (!prompt) {
    return yield* Effect.fail(new Error("--prompt is required"));
  }

  const result = yield* generateSvg({ prompt, instructions, temperature });

  yield* Console.log(
    JSON.stringify(
      {
        svg_content:
          result.svg_content.length > 200
            ? `${result.svg_content.slice(0, 200)}... (${result.svg_content.length} chars)`
            : result.svg_content,
        prompt_id: result.prompt_id,
        timing: result.timing,
        source: result.source,
      },
      null,
      2,
    ),
  );

  if (result.svg_content) {
    const outPath = `quiver-output-${Date.now()}.svg`;
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
        console.error(`SVG generation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
