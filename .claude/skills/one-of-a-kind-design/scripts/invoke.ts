/**
 * invoke.ts — The entry point for /one-of-a-kind-design
 *
 * Usage:
 *   bun run invoke.ts Design a website for my ramen shop
 *   bun run invoke.ts --print Album cover for a jazz trio
 *
 * This chains: enhance-intent → resolve-style → assemble-scene-prompt
 * → select-model → generate → output
 */

import { Effect, Console, pipe } from "effect";
import { parse as parseYaml } from "yaml";
import { enhanceIntent } from "./enhance-intent";
import { assembleScenePrompt } from "../../../../examples/lib/assemble-scene-prompt";

const SCRIPTS_DIR = import.meta.dir;
const REFS_DIR = `${SCRIPTS_DIR}/../references`;

const loadTaxonomy = Effect.tryPromise({
  try: async () => {
    const text = await Bun.file(`${REFS_DIR}/TAXONOMY.yaml`).text();
    return parseYaml(text) as Record<string, unknown>;
  },
  catch: (e) => new Error(`Failed to load taxonomy: ${e}`),
});

const importModule = (path: string) =>
  Effect.tryPromise({
    try: () => import(path),
    catch: (e) => new Error(`Failed to import ${path}: ${e}`),
  });

const run = Effect.gen(function* () {
  const args = Bun.argv.slice(2);
  const isPrint = args[0] === "--print";
  const userPrompt = (isPrint ? args.slice(1) : args).join(" ");

  if (!userPrompt) {
    yield* Console.error(
      "Usage: /one-of-a-kind-design [--print] <your request>",
    );
    process.exitCode = 1;
    return;
  }

  const mode = isPrint ? "--print" : "interactive";

  yield* Console.log(`\n/one-of-a-kind-design${isPrint ? " --print" : ""} ${userPrompt}`);
  yield* Console.log(`Mode: ${mode}\n`);

  // Step 1: Enhance intent
  yield* Console.log("[1/6] Enhancing intent...");
  const enhanced = enhanceIntent(userPrompt);
  yield* Console.log(`  Industry: ${enhanced.industry ?? "unknown"}`);
  yield* Console.log(`  Mood: ${enhanced.mood.join(", ") || "none detected"}`);
  yield* Console.log(`  Subjects: ${enhanced.subjects.join(", ") || "none detected"}`);
  yield* Console.log(`  Constraints: ${enhanced.constraints.join(", ") || "none"}`);
  yield* Console.log(`  Specificity: ${enhanced.specificity}/7`);

  if (enhanced.clarifyingQuestions.length > 0 && !isPrint) {
    yield* Console.log("\n  Clarifying questions:");
    for (const q of enhanced.clarifyingQuestions) {
      yield* Console.log(`    - ${q}`);
    }
    yield* Console.log("  (In --print mode, these would be skipped)\n");
  }

  // Step 2: Resolve style
  yield* Console.log("[2/6] Resolving style...");
  const taxonomy = yield* loadTaxonomy;
  const { resolveStyle } = yield* importModule(`${SCRIPTS_DIR}/resolve-style.ts`);
  const resolved = (yield* Effect.tryPromise({
    try: () =>
      Effect.runPromise(
        resolveStyle(taxonomy, {
          outputType: enhanced.outputType,
          _userIntent: userPrompt,
          mood: enhanced.mood,
          industry: enhanced.industry ?? "",
        }),
      ),
    catch: (e) => new Error(`Style resolution failed: ${e}`),
  })) as Record<string, unknown>;

  yield* Console.log(`  Style: ${resolved.id}`);
  yield* Console.log(`  Chain: ${resolved.recommendedChain}`);
  const cb = resolved.conventionBreak as Record<string, unknown> | undefined;
  if (cb?.applied) {
    yield* Console.log(`  Convention break: ${String(cb.text ?? "").slice(0, 80)}`);
  }

  // Step 3: Assemble scene prompt
  yield* Console.log("[3/6] Assembling scene prompt...");
  const templates = (resolved.sceneTemplates ?? {}) as Record<string, string>;
  const sceneTemplate = templates[
    enhanced.outputType === "website" ? "website_hero" :
    enhanced.outputType === "video" ? "video_keyframe" :
    enhanced.outputType === "svg" ? "logo" :
    enhanced.outputType === "mobile-app" ? "mobile_hero" :
    "website_hero"
  ] ?? null as string | null;

  const palette = (() => {
    const dsp = (resolved.designSystemParameters ?? {}) as Record<string, unknown>;
    const hexes = JSON.stringify(dsp).match(/#[0-9a-fA-F]{6}/g) ?? [];
    return hexes.slice(0, 3).join(" ");
  })();

  const prompt = assembleScenePrompt({
    intent: userPrompt,
    styleId: String(resolved.id),
    industry: enhanced.industry,
    subjects: enhanced.subjects,
    moods: enhanced.mood,
    constraints: enhanced.constraints,
    sceneTemplate,
    palette,
  });

  yield* Console.log(`  Prompt: ${prompt.slice(0, 120)}...`);

  // Step 4: Select model
  yield* Console.log("[4/6] Selecting model...");
  const { selectModel } = yield* importModule(`${SCRIPTS_DIR}/select-fal-models.ts`);
  const modelResult = selectModel(
    resolved.id,
    enhanced.outputType === "video" ? "video" : "image",
    "pro",
  );
  const endpoint = modelResult?.endpoint ?? "fal-ai/flux-pro/v1.1";
  yield* Console.log(`  Model: ${endpoint}`);

  // Step 5: Generate
  yield* Console.log("[5/6] Generating...");
  const { runFalGeneration } = yield* importModule(`${SCRIPTS_DIR}/run-fal-generation.ts`);
  const imageSize = enhanced.outputType === "video"
    ? "landscape_16_9"
    : /album.*cover|square|icon/i.test(userPrompt)
      ? "square"
      : /poster|portrait|mobile/i.test(userPrompt)
        ? "portrait_4_3"
        : "landscape_16_9";

  const genResult = (yield* Effect.tryPromise({
    try: () =>
      Effect.runPromise(
        runFalGeneration({
          endpoint,
          prompt,
          params: { image_size: imageSize },
        }),
      ),
    catch: (e) => new Error(`Generation failed: ${e}`),
  })) as Record<string, unknown>;

  yield* Console.log(`  URL: ${genResult.url}`);
  yield* Console.log(`  Timing: ${genResult.timing}ms`);

  // Step 6: Output
  yield* Console.log("\n[6/6] Result");
  yield* Console.log(`  ${genResult.url}`);
  yield* Console.log(
    `\n${JSON.stringify({ style: resolved.id, industry: enhanced.industry, url: genResult.url, timing: genResult.timing, specificity: enhanced.specificity, outputType: enhanced.outputType })}`,
  );
});

pipe(
  run,
  Effect.catchAll((e) =>
    Console.error(`Pipeline error: ${e}`),
  ),
  Effect.runPromise,
);
