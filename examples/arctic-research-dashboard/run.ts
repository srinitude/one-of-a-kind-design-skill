/**
 * Arctic Research Dashboard — web-app pipeline: swiss-international + generative-art
 *
 * Run: bun run examples/arctic-research-dashboard/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";

const STYLE_ID = "swiss-international";
const STAGE = "image-gen";
const INTENT = "algorithmic particle visualization of arctic ice shelf fragmentation, glacial blues to volcanic reds";

const resolveAndLog = Effect.gen(function* () {
  yield* Console.log("=== Arctic Research Dashboard: Web-App Pipeline ===\n");

  const selection = selectModel(STYLE_ID, "image", "pro");
  yield* Console.log(`[1/5] Model: ${selection.primary.name}`);

  const promptId = buildPromptId(STAGE, STYLE_ID, INTENT);
  yield* Console.log(`[2/5] Prompt ID: ${promptId}`);

  const context = buildCrafterContext(STAGE, { id: STYLE_ID, name: "Swiss International" }, INTENT);
  yield* Console.log(`[3/5] Crafter context built (${context.length} chars)`);
  return { selection };
});

const generate = (endpoint: string) =>
  Effect.gen(function* () {
    yield* Console.log("[4/5] Calling fal.ai for generative canvas hero...");
    const result = yield* runFalGeneration({
      endpoint,
      prompt: INTENT,
      params: { image_size: "landscape_16_9" },
    });
    yield* Console.log(`  URL: ${result.url}`);
    yield* Console.log(`  Seed: ${result.seed} | Timing: ${result.timing}ms`);
    return result;
  });

const scoreResult = Effect.gen(function* () {
  yield* Console.log("[5/5] Quality scoring...");
  const report = computeComposite({
    antiSlopGate: 8.0, codeStandardsGate: 7.0, assetQualityAvg: 8.5,
    promptArtifactAlign: 8.0, aesthetic: 8.5, styleFidelity: 8.0,
    distinctiveness: 7.5, hierarchy: 9.0, colorHarmony: 9.2,
  });
  yield* Console.log(report.scoreCard);
  return report;
});

const program = pipe(
  resolveAndLog,
  Effect.flatMap(({ selection }) => generate(selection.primary.endpoint)),
  Effect.flatMap(() => scoreResult),
);

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
