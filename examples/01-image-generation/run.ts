/**
 * 01 - Image Generation: resolve style -> select model -> generate prompt -> run fal.ai
 *
 * Run: bun run examples/01-image-generation/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";

const STYLE_ID = "bauhaus";
const STAGE = "image-gen";
const USER_INTENT = "geometric composition with primary colors";

const program = Effect.gen(function* () {
  yield* Console.log("=== 01: Image Generation Pipeline ===\n");

  const selection = selectModel(STYLE_ID, "image", "pro");
  yield* Console.log(`Model: ${selection.primary.name} (${selection.primary.endpoint})`);
  yield* Console.log(`Reason: ${selection.reason}\n`);

  const promptId = buildPromptId(STAGE, STYLE_ID, USER_INTENT);
  yield* Console.log(`Prompt ID (deterministic): ${promptId}`);

  const context = buildCrafterContext(STAGE, { id: STYLE_ID, name: "Bauhaus" }, USER_INTENT);
  yield* Console.log(`Crafter context:\n${context}\n`);

  yield* Console.log("Calling fal.ai...");
  const result = yield* runFalGeneration({
    endpoint: selection.primary.endpoint,
    prompt: USER_INTENT,
    params: { image_size: "landscape_16_9" },
  });

  yield* Console.log(`Result URL: ${result.url}`);
  yield* Console.log(`Content type: ${result.content_type}`);
  yield* Console.log(`Seed: ${result.seed}`);
  yield* Console.log(`Prompt ID: ${result.prompt_id}`);
  yield* Console.log(`Timing: ${result.timing}ms`);
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Image generation failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
