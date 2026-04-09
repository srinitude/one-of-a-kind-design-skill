/**
 * Deconstructed Opera Trailer — video pipeline: deconstructivism + camera choreography
 *
 * Run: bun run examples/deconstructed-opera-trailer/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";

const STYLE_ID = "deconstructivism";
const STAGE = "video-gen";
const INTENT = "fractured mirror shards reflecting silk falling, uncomfortable beauty, deconstructed opera aesthetic";
const CAMERA = "[Slow push] through shattered mirror fragments -> [Whip pan] to silk falling -> [Static hold] on single butterfly wing";

const program = Effect.gen(function* () {
  yield* Console.log("=== Deconstructed Opera Trailer: Video Pipeline ===\n");

  const selection = selectModel(STYLE_ID, "video", "premium");
  yield* Console.log(`[1/5] Model: ${selection.primary.name}`);
  yield* Console.log(`  Endpoint: ${selection.primary.endpoint}`);

  const promptId = buildPromptId(STAGE, STYLE_ID, INTENT);
  yield* Console.log(`[2/5] Prompt ID: ${promptId}`);

  const context = buildCrafterContext(STAGE, { id: STYLE_ID, name: "Deconstructivism" }, INTENT);
  yield* Console.log(`[3/5] Crafter context: ${context.length} chars`);
  yield* Console.log(`  Camera: ${CAMERA}`);

  yield* Console.log("[4/5] Calling fal.ai for video generation...");
  const result = yield* runFalGeneration({
    endpoint: selection.primary.endpoint,
    prompt: `${INTENT}. Camera: ${CAMERA}`,
    params: { duration: "short", aspect_ratio: "16:9" },
  });

  yield* Console.log(`  URL: ${result.url}`);
  yield* Console.log(`  Seed: ${result.seed} | Timing: ${result.timing}ms`);

  yield* Console.log("[5/5] Quality scoring...");
  const report = computeComposite({
    antiSlopGate: 8.0, codeStandardsGate: null, assetQualityAvg: 8.0,
    promptArtifactAlign: 8.5, aesthetic: 9.0, styleFidelity: 8.5,
    distinctiveness: 9.0, hierarchy: 7.5, colorHarmony: 8.0,
  });
  yield* Console.log(report.scoreCard);
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Video pipeline failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
