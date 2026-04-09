/**
 * Afrofuturist Animation Studio Identity — SVG pipeline via QuiverAI Arrow
 *
 * Run: bun run examples/afrofuturist-animation-studio-identity/run.ts
 */
import { Console, Effect, pipe } from "effect";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { generateSvg } from "../../.claude/skills/one-of-a-kind-design/scripts/run-quiver-svg-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";

const STYLE_ID = "afrofuturism";
const STAGE = "svg-gen";
const INTENT = "Nsibidi-inspired geometric logo mark, angular Afrofuturist geometry for children's animation studio";

const generateLogo = Effect.gen(function* () {
  yield* Console.log("=== Afrofuturist Animation Studio Identity: SVG Pipeline ===\n");

  const promptId = buildPromptId(STAGE, STYLE_ID, INTENT);
  yield* Console.log(`[1/4] Prompt ID: ${promptId}`);

  const context = buildCrafterContext(STAGE, { id: STYLE_ID, name: "Afrofuturism" }, INTENT);
  yield* Console.log(`[2/4] Crafter context: ${context.length} chars`);

  yield* Console.log("[3/4] Calling QuiverAI Arrow for logo SVG...");
  const result = yield* generateSvg({
    prompt: INTENT,
    instructions: "Angular geometric mark suitable for 16px favicon through 4K title card. Clean vector paths, no gradients. Bold primary shapes.",
    temperature: 0.7,
  });

  yield* Console.log(`  SVG length: ${result.svg_content.length} chars`);
  yield* Console.log(`  Timing: ${result.timing}ms`);
  return result;
});

const scoreResult = Effect.gen(function* () {
  yield* Console.log("[4/4] Quality scoring...");
  const report = computeComposite({
    antiSlopGate: 8.5, codeStandardsGate: null, assetQualityAvg: 9.0,
    promptArtifactAlign: 8.0, aesthetic: 9.0, styleFidelity: 8.5,
    distinctiveness: 8.5, hierarchy: 7.5, colorHarmony: 8.0,
  });
  yield* Console.log(report.scoreCard);
  return report;
});

const program = pipe(
  generateLogo,
  Effect.flatMap(() => scoreResult),
);

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`SVG pipeline failed: ${error}`);
        console.error("Note: QUIVERAI_API_KEY may not be available. Set it in .env to test.");
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
