/**
 * edit-with-nano-banana.ts — Surgical image editing via Nano Banana Pro Edit.
 * Uses a prompt-enhancing system to generate precise, localized edit instructions.
 *
 * Nano Banana Pro Edit preserves: pixel dimensions, aspect ratio, framing,
 * camera perspective, global composition, and all unedited regions.
 *
 * The edit prompt is constructed by a system prompt that enforces:
 * - Spatial locality (only the described region changes)
 * - Dimensional integrity (no resizing/resampling)
 * - Photometric consistency (matching lighting/exposure/grain)
 * - Structural fidelity (no warping/stretching)
 * - Semantic precision (only what's requested changes)
 */

import { Effect, Console, pipe } from "effect";

interface EditInput {
  readonly imageUrl: string;
  readonly editDescription: string;
  readonly seed: number;
}

interface EditResult {
  readonly url: string;
  readonly timingMs: number;
  readonly editApplied: string;
}

const EDIT_SYSTEM_PROMPT = `You are operating as a Prompt-Enhancing Assistant whose sole function is to produce one final, production-ready image-editing prompt for Nano Banana Pro. Your output must be exactly one prompt, suitable for direct use. Do not include explanations, metadata, options, commentary, or multiple variants.

Generate a prompt that instructs Nano Banana Pro to perform extremely localized, precise image edits while strictly preserving: original pixel dimensions, aspect ratio, framing and crop, camera perspective, global composition, and unedited regions.

The prompt must explicitly enforce:
1. Spatial Locality — only the described region may be modified, all other pixels bit-identical
2. Dimensional Integrity — final image matches original width, height, aspect ratio exactly
3. Photometric Consistency — preserve lighting, exposure, white balance, grain, lens artifacts, depth of field
4. Structural Fidelity — no altered geometry, proportions, perspective, warping, stretching
5. Semantic Precision — modify only what is requested, nothing else

The prompt must clearly identify what to change, where to change it, and how it should look afterward. Use precise spatial language and include explicit "do not change" clauses for everything outside the target area.

Output only the final prompt text. No headings, no bullet points, no markdown.`;

const configureFal = Effect.tryPromise({
  try: async () => {
    const { fal } = await import("@fal-ai/client");
    fal.config({ credentials: Bun.env.FAL_KEY ?? "" });
    return fal;
  },
  catch: (e) => new Error(`fal.ai config failed: ${e}`),
});

/**
 * Enhances a simple edit description into a precise Nano Banana prompt.
 * Uses LLaVA to understand the current image, then crafts the edit prompt.
 */
const enhanceEditPrompt = (
  fal: { subscribe: Function },
  imageUrl: string,
  editDescription: string,
) =>
  Effect.tryPromise({
    try: async () => {
      const r = await fal.subscribe("fal-ai/llavav15-13b", {
        input: {
          image_url: imageUrl,
          prompt: `${EDIT_SYSTEM_PROMPT}\n\nThe user wants to: ${editDescription}\n\nGenerate the edit prompt:`,
        },
        timeout: 25000,
      });
      return ((r as any).data?.output as string) ?? editDescription;
    },
    catch: () => new Error("prompt enhancement failed"),
  });

/**
 * Executes a surgical edit using Nano Banana Pro Edit.
 */
const executeEdit = (
  fal: { subscribe: Function },
  imageUrl: string,
  editPrompt: string,
  seed: number,
) =>
  Effect.tryPromise({
    try: async () => {
      const start = Date.now();
      const r = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
        input: {
          prompt: editPrompt,
          image_urls: [imageUrl],
          seed,
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
    catch: (e) => new Error(`Nano Banana edit failed: ${e}`),
  });

/**
 * Full edit pipeline: enhance prompt → execute edit → return result.
 */
export const editImage = (
  input: EditInput,
): Effect.Effect<EditResult, Error> =>
  Effect.gen(function* () {
    const fal = yield* configureFal;

    yield* Console.log(
      `[edit] enhancing prompt: "${input.editDescription.slice(0, 60)}..."`,
    );

    const enhancedPrompt = yield* pipe(
      enhanceEditPrompt(fal, input.imageUrl, input.editDescription),
      Effect.catchAll(() => Effect.succeed(input.editDescription)),
    );

    yield* Console.log(
      `[edit] enhanced: "${enhancedPrompt.slice(0, 80)}..."`,
    );

    yield* Console.log("[edit] executing Nano Banana Pro Edit...");
    const result = yield* executeEdit(
      fal,
      input.imageUrl,
      enhancedPrompt,
      input.seed,
    );

    yield* Console.log(
      `[edit] done in ${result.timingMs}ms: ${result.url.slice(0, 60)}`,
    );

    return {
      url: result.url,
      timingMs: result.timingMs,
      editApplied: enhancedPrompt,
    };
  });

/**
 * Edit for brief compliance — adds missing elements surgically.
 * More precise than i2i refinement because it doesn't re-generate.
 */
export const editForCompliance = (
  imageUrl: string,
  missingElements: ReadonlyArray<string>,
  seed: number,
): Effect.Effect<{ url: string; edits: ReadonlyArray<EditResult> }, Error> =>
  Effect.gen(function* () {
    if (missingElements.length === 0) {
      return { url: imageUrl, edits: [] };
    }

    yield* Console.log(
      `[edit] fixing ${missingElements.length} missing elements via Nano Banana`,
    );

    let currentUrl = imageUrl;
    const edits: EditResult[] = [];

    for (const element of missingElements) {
      const result = yield* editImage({
        imageUrl: currentUrl,
        editDescription: `Add a ${element} to this image in a natural position that fits the existing composition and lighting`,
        seed: seed + edits.length,
      });
      currentUrl = result.url;
      edits.push(result);
    }

    return { url: currentUrl, edits };
  });

// CLI
if (import.meta.main) {
  const args = Bun.argv.slice(2);
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : undefined;
  };

  const imageUrl = getArg("--image") ?? "";
  const edit = getArg("--edit") ?? "";
  const seed = Number(getArg("--seed") ?? "42");

  if (!imageUrl || !edit) {
    Effect.runSync(
      Console.error("Usage: --image <url> --edit <description> [--seed 42]"),
    );
    process.exitCode = 1;
  } else {
    pipe(
      editImage({ imageUrl, editDescription: edit, seed }),
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
