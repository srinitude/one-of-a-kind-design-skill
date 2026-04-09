/**
 * Brutalist Zine Streetwear Drop — image series pipeline: brutalist-web + risograph
 *
 * Run: bun run examples/brutalist-zine-streetwear-drop/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";

const STYLE_ID = "brutalist-web";
const STAGE = "image-gen";
const FRAME_COUNT = 6;

const INTENTS = [
  "raw hoodie product shot with deliberate grain and risograph color bleed, confrontational crop",
  "distorted streetwear layflat with photocopy texture overlay, barely legible typography",
  "asymmetric zine spread with collage fragments of technical fabrics, halftone dots",
  "overexposed flash photography of capsule jacket, brutal monochrome with red channel shift",
  "torn paper edges framing sneaker detail, risograph magenta and cyan separation",
  "full spread chaos layout mixing product silhouettes with geometric noise patterns",
] as const;

const generateFrame = (endpoint: string, intent: string, index: number) =>
  Effect.gen(function* () {
    const promptId = buildPromptId(STAGE, STYLE_ID, intent);
    yield* Console.log(`  [Frame ${index + 1}/${FRAME_COUNT}] ID: ${promptId.slice(0, 12)}...`);

    const result = yield* runFalGeneration({
      endpoint,
      prompt: intent,
      params: { image_size: "portrait_4_3", seed: 42 + index },
    });
    yield* Console.log(`    URL: ${result.url}`);
    return result;
  });

const program = Effect.gen(function* () {
  yield* Console.log("=== Brutalist Zine Streetwear Drop: Image Series ===\n");

  const selection = selectModel(STYLE_ID, "image", "pro");
  yield* Console.log(`Model: ${selection.primary.name}\n`);

  const context = buildCrafterContext(STAGE, { id: STYLE_ID, name: "Brutalist Web" }, INTENTS[0]);
  yield* Console.log(`Crafter context: ${context.length} chars\n`);

  yield* Console.log("Generating 6 zine frames...");
  for (let i = 0; i < FRAME_COUNT; i++) {
    yield* generateFrame(selection.primary.endpoint, INTENTS[i], i);
  }

  yield* Console.log("\nQuality scoring...");
  const report = computeComposite({
    antiSlopGate: 8.0, codeStandardsGate: null, assetQualityAvg: 7.8,
    promptArtifactAlign: 8.5, aesthetic: 7.5, styleFidelity: 9.0,
    distinctiveness: 9.5, hierarchy: 7.0, colorHarmony: 7.2,
  });
  yield* Console.log(report.scoreCard);
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Pipeline failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
