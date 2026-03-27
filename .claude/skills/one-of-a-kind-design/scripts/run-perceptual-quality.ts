/**
 * run-perceptual-quality.ts — Aesthetic/fidelity/distinctiveness scoring via vision model.
 * Uses MoonDreamNext to analyze visual quality across 5 dimensions.
 *
 * Run: bun run scripts/run-perceptual-quality.ts --image-url "..." --style-id "art-deco"
 */

import { fal } from "@fal-ai/client";
import { Duration, Effect, pipe, Schedule } from "effect";

// --- Types ---

interface PerceptualQualityInput {
  readonly imageUrl: string;
  readonly styleId: string;
}

interface PerceptualQualityResult {
  readonly aesthetic: number;
  readonly style_fidelity: number;
  readonly distinctiveness: number;
  readonly hierarchy: number;
  readonly color_harmony: number;
}

// --- Style descriptors for evaluation ---

const STYLE_DESCRIPTORS: Record<string, string> = {
  "art-deco":
    "geometric patterns, gold accents, luxury materials, symmetry, bold typography, fan motifs",
  cinematic:
    "dramatic lighting, depth of field, filmic grain, wide aspect ratios, narrative composition",
  neubrutalism: "raw borders, loud colors, visible grid, chunky shadows, anti-polish aesthetic",
  glassmorphism:
    "frosted glass panels, blurred backgrounds, subtle borders, light refraction, translucency",
  bauhaus:
    "primary colors, geometric shapes, grid-based composition, sans-serif typography, functionalism",
  "editorial-minimalism":
    "generous whitespace, refined typography, restrained palette, clear hierarchy",
  "pixel-art":
    "crisp pixel edges, limited palette, retro game aesthetic, dithering, small sprite details",
  "wabi-sabi":
    "organic textures, muted earth tones, asymmetry, visible imperfections, natural materials",
  "brutalist-web":
    "raw HTML aesthetic, monospace fonts, dense text, minimal decoration, anti-design",
  "dark-mode-ui":
    "deep backgrounds, neon accents, subtle gradients, high contrast text, glow effects",
  "liquid-glass": "fluid shapes, holographic effects, glass distortion, morphing transitions",
  "bento-ui":
    "grid tiles, contained sections, rounded corners, clear card boundaries, modular layout",
  "swiss-international":
    "grid precision, Helvetica-like type, red accents, asymmetric balance, photographic",
  "scandinavian-minimalism":
    "light wood textures, pastel accents, airy spacing, rounded forms, cozy warmth",
  vaporwave:
    "pink/purple/cyan palette, retro 80s elements, glitch art, Greek statuary, sunset gradients",
};

// --- Retry Policy ---

const retryPolicy = pipe(
  Schedule.exponential(Duration.seconds(2)),
  Schedule.intersect(Schedule.recurs(2)),
);

// --- Quality Analysis ---

export function analyzeQuality(
  input: PerceptualQualityInput,
): Effect.Effect<PerceptualQualityResult, Error> {
  const styleDesc = STYLE_DESCRIPTORS[input.styleId] ?? `${input.styleId} design style`;

  return pipe(
    Effect.tryPromise({
      try: async () => {
        fal.config({ credentials: Bun.env.FAL_KEY });

        const analysisPrompt = [
          `You are an expert design critic. Analyze this image and score each dimension from 1-10.`,
          `The target design style is: ${input.styleId} (${styleDesc}).`,
          ``,
          `Score these 5 dimensions:`,
          `1. AESTHETIC: Overall visual beauty, composition balance, professional quality (1-10)`,
          `2. STYLE_FIDELITY: How well does this match "${input.styleId}" style? Key markers: ${styleDesc} (1-10)`,
          `3. DISTINCTIVENESS: Does this look unique or AI-generic? Penalize cookie-cutter, stock-photo aesthetics (1-10)`,
          `4. HIERARCHY: Is there clear visual hierarchy? Can you tell what to look at first? (1-10)`,
          `5. COLOR_HARMONY: Do colors work together? Is the palette intentional? (1-10)`,
          ``,
          `Respond ONLY with 5 numbers separated by commas, like: 8,7,6,9,8`,
          `No other text. Just the 5 scores.`,
        ].join("\n");

        const result = await fal.subscribe("fal-ai/moondream-next", {
          input: { image_url: input.imageUrl, prompt: analysisPrompt },
        });

        const data = result.data as Record<string, unknown>;
        const output = (data.output as string) ?? (data.text as string) ?? "";
        return parseScores(output);
      },
      catch: (e) => new Error(`MoonDreamNext quality analysis failed: ${e}`),
    }),
    Effect.retry({ schedule: retryPolicy, while: (err) => err.message.includes("429") }),
  );
}

export function parseScores(raw: string): PerceptualQualityResult {
  // Extract numbers from the response
  const numbers = raw.match(/\d+\.?\d*/g)?.map(Number) ?? [];

  // Clamp all scores to 1-10
  const clamp = (n: number): number => Math.max(1, Math.min(10, Math.round(n)));

  return {
    aesthetic: clamp(numbers[0] ?? 5),
    style_fidelity: clamp(numbers[1] ?? 5),
    distinctiveness: clamp(numbers[2] ?? 5),
    hierarchy: clamp(numbers[3] ?? 5),
    color_harmony: clamp(numbers[4] ?? 5),
  };
}

// --- CLI Entry ---

const program = Effect.gen(function* () {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const imageUrl = getArg("--image-url");
  const styleId = getArg("--style-id") ?? "editorial-minimalism";

  if (!imageUrl) return yield* Effect.fail(new Error("--image-url is required"));
  if (!Bun.env.FAL_KEY)
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));

  const result = yield* analyzeQuality({ imageUrl, styleId });

  yield* Effect.sync(() => {
    console.log(JSON.stringify(result, null, 2));
  });
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Perceptual quality analysis failed: ${error}`);
        process.exit(1);
      }),
    ),
    Effect.runPromise,
  );
}
