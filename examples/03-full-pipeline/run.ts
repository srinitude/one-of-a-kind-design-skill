/**
 * 03 - Full Pipeline: style resolve -> model select -> prompt gen -> fal gen -> E2B post-process
 *
 * Run: bun run examples/03-full-pipeline/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import {
  E2bSandboxService,
  E2bSandboxDefaultLayer,
} from "../../.claude/skills/one-of-a-kind-design/scripts/e2b-sandbox-manager";

const STYLE_ID = "cinematic";
const STAGE = "image-gen";
const USER_INTENT = "dramatic wide-angle establishing shot of a futuristic city";

const generateImage = Effect.gen(function* () {
  yield* Console.log("=== 03: Full Pipeline ===\n");

  yield* Console.log("[1/4] Selecting model...");
  const selection = selectModel(STYLE_ID, "image", "pro");
  yield* Console.log(`  Model: ${selection.primary.name}`);

  yield* Console.log("[2/4] Building prompt...");
  const promptId = buildPromptId(STAGE, STYLE_ID, USER_INTENT);
  const context = buildCrafterContext(STAGE, { id: STYLE_ID, name: "Cinematic" }, USER_INTENT);
  yield* Console.log(`  Prompt ID: ${promptId}`);

  yield* Console.log("[3/4] Running fal.ai generation...");
  const result = yield* runFalGeneration({
    endpoint: selection.primary.endpoint,
    prompt: USER_INTENT,
    params: { image_size: "landscape_16_9" },
  });
  yield* Console.log(`  URL: ${result.url}`);
  return result;
});

const postProcess = (imageUrl: string) =>
  Effect.gen(function* () {
    yield* Console.log("[4/4] E2B post-processing...");
    const svc = yield* E2bSandboxService;
    const info = yield* svc.withSandbox((sandbox) =>
      svc.exec(sandbox, `console.log("Processed image from: ${imageUrl.slice(0, 50)}...")`),
    );
    yield* Console.log(`  Sandbox output: ${info.stdout}`);
    return info;
  });

const program = pipe(
  generateImage,
  Effect.flatMap((result) => postProcess(result.url)),
  Effect.provide(E2bSandboxDefaultLayer),
  Effect.catchAll((error) =>
    Console.error(`Pipeline failed: ${error}`),
  ),
);

if (import.meta.main) {
  Effect.runPromise(program);
}
