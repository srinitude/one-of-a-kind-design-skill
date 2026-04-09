/**
 * Omakase Counter Rebrand — website pipeline: wabi-sabi style
 *
 * Run: bun run examples/omakase-counter-rebrand/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";

const STYLE_ID = "wabi-sabi";
const STAGE = "image-gen";
const INTENT = "vertical Japanese calligraphy on hand-textured washi paper, warm intimate tones";

const resolveAndLog = Effect.gen(function* () {
  yield* Console.log("=== Omakase Counter Rebrand: Website Pipeline ===\n");

  const selection = selectModel(STYLE_ID, "image", "pro");
  yield* Console.log(`[1/5] Model: ${selection.primary.name}`);
  yield* Console.log(`  Endpoint: ${selection.primary.endpoint}`);

  const promptId = buildPromptId(STAGE, STYLE_ID, INTENT);
  yield* Console.log(`[2/5] Prompt ID: ${promptId}`);

  const context = buildCrafterContext(STAGE, { id: STYLE_ID, name: "Wabi-Sabi" }, INTENT);
  yield* Console.log(`[3/5] Crafter context built (${context.length} chars)`);
  return { selection, promptId };
});

const generate = (endpoint: string) =>
  Effect.gen(function* () {
    yield* Console.log("[4/5] Calling fal.ai for hero asset...");
    const result = yield* runFalGeneration({
      endpoint,
      prompt: INTENT,
      params: { image_size: "portrait_4_3" },
    });
    yield* Console.log(`  URL: ${result.url}`);
    yield* Console.log(`  Seed: ${result.seed} | Timing: ${result.timing}ms`);
    return result;
  });

const scoreResult = Effect.gen(function* () {
  yield* Console.log("[5/5] Quality scoring (simulated sub-scores)...");
  const report = computeComposite({
    antiSlopGate: 8.5, codeStandardsGate: 7.5, assetQualityAvg: 8.0,
    promptArtifactAlign: 8.2, aesthetic: 8.8, styleFidelity: 9.0,
    distinctiveness: 9.2, hierarchy: 8.0, colorHarmony: 8.5,
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
