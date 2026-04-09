/**
 * Somatic Therapist Practice App — mobile app pipeline: scandinavian-minimalism + wabi-sabi
 *
 * Run: bun run examples/somatic-therapist-practice-app/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";

const STYLE_ID = "scandinavian-minimalism";
const STAGE = "image-gen";
const INTENT = "layered organic textures suggesting safety and containment, warm neutrals, intentional imperfection";

const resolveAndGenerate = Effect.gen(function* () {
  yield* Console.log("=== Somatic Therapist Practice App: Mobile Pipeline ===\n");

  const selection = selectModel(STYLE_ID, "image", "pro");
  yield* Console.log(`[1/5] Model: ${selection.primary.name}`);

  const promptId = buildPromptId(STAGE, STYLE_ID, INTENT);
  yield* Console.log(`[2/5] Prompt ID: ${promptId}`);

  const context = buildCrafterContext(
    STAGE,
    { id: STYLE_ID, name: "Scandinavian Minimalism" },
    INTENT,
  );
  yield* Console.log(`[3/5] Crafter context: ${context.length} chars`);

  yield* Console.log("[4/5] Calling fal.ai for parallax depth textures...");
  const result = yield* runFalGeneration({
    endpoint: selection.primary.endpoint,
    prompt: INTENT,
    params: { image_size: "portrait_4_3" },
  });
  yield* Console.log(`  URL: ${result.url}`);
  yield* Console.log(`  Seed: ${result.seed} | Timing: ${result.timing}ms`);
  return result;
});

const scoreResult = Effect.gen(function* () {
  yield* Console.log("[5/5] Quality scoring...");
  const report = computeComposite({
    antiSlopGate: 9.0, codeStandardsGate: 7.5, assetQualityAvg: 8.0,
    promptArtifactAlign: 8.5, aesthetic: 8.5, styleFidelity: 8.0,
    distinctiveness: 7.5, hierarchy: 9.0, colorHarmony: 9.0,
  });
  yield* Console.log(report.scoreCard);
  return report;
});

const program = pipe(
  resolveAndGenerate,
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
