/**
 * verify-brief-compliance.ts — Checks if generated image contains key brief elements.
 * Uses LLaVA 13B to verify each element, returns a hit/miss checklist.
 * Missing elements feed into the multi-pass refinement loop.
 */

import { Effect, Console, pipe } from "effect";

interface BriefElement {
  readonly name: string;
  readonly query: string;
}

interface ComplianceResult {
  readonly elements: ReadonlyArray<{
    readonly name: string;
    readonly present: boolean;
  }>;
  readonly complianceRate: number;
  readonly missingElements: ReadonlyArray<string>;
}

const configureFal = Effect.tryPromise({
  try: async () => {
    const { fal } = await import("@fal-ai/client");
    fal.config({ credentials: Bun.env.FAL_KEY ?? "" });
    return fal;
  },
  catch: (e) => new Error(`fal.ai config failed: ${e}`),
});

const checkElement = (
  fal: { subscribe: Function },
  imageUrl: string,
  element: BriefElement,
) =>
  Effect.tryPromise({
    try: async () => {
      const r = await fal.subscribe("fal-ai/llavav15-13b", {
        input: {
          image_url: imageUrl,
          prompt: `Look at this image carefully. ${element.query} Answer only YES or NO.`,
        },
        timeout: 20000,
      });
      const answer = ((r as any).data?.output as string) ?? "";
      return answer.toUpperCase().includes("YES");
    },
    catch: () => false,
  });

export const verifyBriefCompliance = (
  imageUrl: string,
  elements: ReadonlyArray<BriefElement>,
): Effect.Effect<ComplianceResult, Error> =>
  Effect.gen(function* () {
    const fal = yield* configureFal;

    const results = yield* Effect.all(
      elements.map((el) =>
        pipe(
          checkElement(fal, imageUrl, el),
          Effect.map((present) => ({ name: el.name, present })),
        ),
      ),
      { concurrency: 3 },
    );

    const missing = results
      .filter((r) => !r.present)
      .map((r) => r.name);

    const rate = results.length > 0
      ? results.filter((r) => r.present).length / results.length
      : 1;

    yield* Console.log(
      `[brief-check] ${results.filter((r) => r.present).length}/${results.length} elements present`,
    );
    if (missing.length > 0) {
      yield* Console.log(`[brief-check] missing: ${missing.join(", ")}`);
    }

    return { elements: results, complianceRate: rate, missingElements: missing };
  });

/**
 * Extracts key visual elements from a user intent string.
 * Returns structured queries for LLaVA verification.
 */
export const extractBriefElements = (
  intent: string,
): ReadonlyArray<BriefElement> => {
  const elements: BriefElement[] = [];
  const lower = intent.toLowerCase();

  // Object/subject detection
  const objectPatterns: Array<[RegExp, string, string]> = [
    [/bourbon|whiskey|glass/i, "bourbon glass", "Is there a glass (bourbon, whiskey, or drinking glass) visible in the image?"],
    [/piano|keys/i, "piano keys", "Are piano keys visible in the image?"],
    [/saxophone|sax/i, "saxophone", "Is there a saxophone visible?"],
    [/timber.*plaster|plaster.*timber|wood.*plaster/i, "material junction", "Are two different materials meeting or joining (like wood and plaster)?"],
    [/nail hole/i, "nail holes", "Are there visible nail holes or small holes in the surface?"],
    [/flower/i, "flowers", "Are there flowers visible in the image?"],
    [/cross|crucifix/i, "religious symbols", "Are there crosses or religious symbols visible?"],
    [/handprint|body.*heat|thermal/i, "body traces", "Are there human body impressions, handprints, or thermal traces visible?"],
    [/scan line|glitch/i, "glitch effects", "Are there visible scan lines, glitch effects, or digital corruption?"],
    [/rgb split/i, "RGB split", "Is there an RGB channel split or chromatic aberration effect?"],
  ];

  for (const [pattern, name, query] of objectPatterns) {
    if (pattern.test(lower)) {
      elements.push({ name, query });
    }
  }

  // Mood/atmosphere detection
  const moodPatterns: Array<[RegExp, string, string]> = [
    [/warm|amber/i, "warm lighting", "Is the overall lighting warm (amber, golden, or warm-toned)?"],
    [/cold|cool|blue/i, "cool tones", "Does the image have cool or blue-toned colors?"],
    [/shallow.*depth|bokeh|dof/i, "shallow DOF", "Is there shallow depth of field with blurred background (bokeh)?"],
    [/film grain/i, "film grain", "Is there visible film grain or photographic noise?"],
    [/smoke|smoky|haze/i, "atmospheric haze", "Is there visible smoke, haze, or atmospheric fog?"],
  ];

  for (const [pattern, name, query] of moodPatterns) {
    if (pattern.test(lower)) {
      elements.push({ name, query });
    }
  }

  return elements;
};

// CLI
if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const imageUrl = getArg("--image") ?? "";
  const intent = getArg("--intent") ?? "";

  if (!imageUrl || !intent) {
    console.error("Usage: --image <url> --intent <text>");
    process.exitCode = 1;
  } else {
    const elements = extractBriefElements(intent);
    pipe(
      verifyBriefCompliance(imageUrl, elements),
      Effect.flatMap((r) =>
        Console.log(JSON.stringify(r, null, 2)),
      ),
      Effect.catchAll((e) =>
        Effect.sync(() => {
          console.error(`Error: ${e}`);
          process.exitCode = 1;
        }),
      ),
      Effect.runPromise,
    );
  }
}
