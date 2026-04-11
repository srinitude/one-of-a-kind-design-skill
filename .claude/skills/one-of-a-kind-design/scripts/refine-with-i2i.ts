/**
 * refine-with-i2i.ts — Multi-pass refinement using image-to-image.
 * When brief compliance check finds missing elements, this script
 * uses i2i to add them while preserving the base composition.
 *
 * Strategy:
 * - Low strength (0.2-0.4) to preserve base composition
 * - Prompt focuses ONLY on the missing element
 * - Verify after each pass that the element was added
 * - Max 3 refinement passes per missing element
 */

import { Effect, Console, pipe } from "effect";

interface RefinementInput {
  readonly imageUrl: string;
  readonly missingElement: string;
  readonly elementPrompt: string;
  readonly strength: number;
  readonly seed: number;
}

interface RefinementResult {
  readonly url: string;
  readonly element: string;
  readonly added: boolean;
  readonly attempts: number;
  readonly timingMs: number;
}

const configureFal = Effect.tryPromise({
  try: async () => {
    const { fal } = await import("@fal-ai/client");
    fal.config({ credentials: Bun.env.FAL_KEY ?? "" });
    return fal;
  },
  catch: (e) => new Error(`fal.ai config failed: ${e}`),
});

/**
 * Maps missing element names to focused i2i prompts.
 * These prompts describe ONLY the element to add, not the whole scene.
 */
const ELEMENT_PROMPTS: Record<string, string> = {
  "bourbon glass":
    "a crystal bourbon glass with condensation droplets, amber liquid, resting on a surface, catching warm light",
  "material junction":
    "where rough-hewn timber meets smooth lime plaster, visible joint with craft marks, two contrasting textures meeting",
  "nail holes":
    "small square nail holes in aged wood surface, catching raking side-light, creating pattern of shadow dots",
  "body traces":
    "ghostly thermal heat signatures on concrete, full-body silhouettes in infrared magenta fading at edges",
  "glitch effects":
    "horizontal scan line artifacts, digital corruption bands cutting through the image, signal interference",
  "RGB split":
    "chromatic aberration with red green blue channels offset, RGB channel separation on edges",
  "film grain":
    "subtle photographic film grain texture, analog noise pattern across the image",
  "shallow DOF":
    "extremely shallow depth of field, razor-thin focus plane, creamy bokeh blur",
};

const getElementPrompt = (element: string): string =>
  ELEMENT_PROMPTS[element] ?? `add ${element} to the scene, preserving the existing composition`;

const runI2IRefinement = (
  fal: { subscribe: Function },
  input: RefinementInput,
) =>
  Effect.tryPromise({
    try: async () => {
      const start = Date.now();
      const r = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
        input: {
          prompt: input.elementPrompt,
          image_url: input.imageUrl,
          strength: input.strength,
          seed: input.seed,
          num_images: 1,
        },
        timeout: 60000,
      });
      const data = r.data as Record<string, unknown>;
      const images = data.images as Array<{ url: string }> | undefined;
      return {
        url: images?.[0]?.url ?? "",
        timingMs: Date.now() - start,
      };
    },
    catch: (e) => new Error(`I2I refinement failed: ${e}`),
  });

const checkElementPresent = (
  fal: { subscribe: Function },
  imageUrl: string,
  element: string,
) =>
  Effect.tryPromise({
    try: async () => {
      const r = await fal.subscribe("fal-ai/llavav15-13b", {
        input: {
          image_url: imageUrl,
          prompt: `Is there a ${element} visible in this image? Answer only YES or NO.`,
        },
        timeout: 20000,
      });
      const answer = ((r as any).data?.output as string) ?? "";
      return answer.toUpperCase().includes("YES");
    },
    catch: () => false,
  });

export const refineForElement = (
  imageUrl: string,
  element: string,
  seed: number,
): Effect.Effect<RefinementResult, Error> =>
  Effect.gen(function* () {
    const fal = yield* configureFal;
    const elementPrompt = getElementPrompt(element);
    let currentUrl = imageUrl;
    let attempts = 0;
    const maxAttempts = 3;
    const startTime = Date.now();

    // Start with low strength, increase each attempt
    const strengths = [0.25, 0.35, 0.45];

    while (attempts < maxAttempts) {
      yield* Console.log(
        `[refine] pass ${attempts + 1}/${maxAttempts} for "${element}" (strength ${strengths[attempts]})`,
      );

      const result = yield* runI2IRefinement(fal, {
        imageUrl: currentUrl,
        missingElement: element,
        elementPrompt,
        strength: strengths[attempts] ?? 0.35,
        seed: seed + attempts,
      });

      currentUrl = result.url;
      attempts++;

      // Verify the element was added
      const present = yield* checkElementPresent(fal, currentUrl, element);
      if (present) {
        yield* Console.log(`[refine] "${element}" successfully added`);
        return {
          url: currentUrl,
          element,
          added: true,
          attempts,
          timingMs: Date.now() - startTime,
        };
      }

      yield* Console.log(`[refine] "${element}" not yet visible, retrying`);
    }

    yield* Console.log(`[refine] "${element}" could not be added after ${maxAttempts} passes`);
    return {
      url: currentUrl,
      element,
      added: false,
      attempts,
      timingMs: Date.now() - startTime,
    };
  });

/**
 * Refines an image for ALL missing elements sequentially.
 * Each pass feeds into the next, building up the composition.
 */
export const refineAll = (
  imageUrl: string,
  missingElements: ReadonlyArray<string>,
  seed: number,
): Effect.Effect<
  { url: string; results: ReadonlyArray<RefinementResult> },
  Error
> =>
  Effect.gen(function* () {
    if (missingElements.length === 0) {
      return { url: imageUrl, results: [] };
    }

    yield* Console.log(
      `[refine] refining ${missingElements.length} missing elements`,
    );
    let currentUrl = imageUrl;
    const results: RefinementResult[] = [];

    for (const element of missingElements) {
      const result = yield* refineForElement(currentUrl, element, seed);
      currentUrl = result.url;
      results.push(result);
    }

    const added = results.filter((r) => r.added).length;
    yield* Console.log(
      `[refine] ${added}/${missingElements.length} elements added`,
    );

    return { url: currentUrl, results };
  });

// CLI
if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const imageUrl = getArg("--image") ?? "";
  const elements = (getArg("--elements") ?? "").split(",").filter(Boolean);
  const seed = Number(getArg("--seed") ?? "42");

  if (!imageUrl || elements.length === 0) {
    console.error("Usage: --image <url> --elements <el1,el2,...> [--seed 42]");
    process.exitCode = 1;
  } else {
    pipe(
      refineAll(imageUrl, elements, seed),
      Effect.flatMap((r) => Console.log(JSON.stringify(r, null, 2))),
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
