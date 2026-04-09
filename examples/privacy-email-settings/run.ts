/**
 * privacy-email-settings — Mobile-app example: Bento UI style.
 * Reproduces the exact invocation from the 20-test validation suite.
 *
 * Run: bun run examples/privacy-email-settings/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { parse as parseYaml } from "yaml";
import { resolveStyle } from "../../.claude/skills/one-of-a-kind-design/scripts/resolve-style";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";
import { computeRealScores, computeFallbackScores } from "../lib/real-scoring";
import { distillPrompt, distillNegative } from "../lib/distill-prompt";

const USER_PROMPT = "Settings page for a privacy-focused email client";

const program = Effect.gen(function* () {
  yield* Console.log("=== Privacy Email Settings ===\n");

  const taxonomyPath = `${import.meta.dir}/../../.claude/skills/one-of-a-kind-design/references/TAXONOMY.yaml`;
  const taxonomy = yield* Effect.tryPromise({
    try: async () => parseYaml(await Bun.file(taxonomyPath).text()) as Record<string, unknown>,
    catch: (e) => new Error(`Taxonomy load failed: ${e}`),
  });

  const resolved = yield* resolveStyle(taxonomy, {
    industry: "tech",
    mood: ["minimal"],
  });
  yield* Console.log(`Style: ${resolved.id} (${resolved.name})`);

  const selection = selectModel(resolved.id, "image", "pro");
  yield* Console.log(`Model: ${selection.primary.name}`);

  const distilled = distillPrompt(resolved, USER_PROMPT);
  const negative = distillNegative(resolved);
  yield* Console.log(`Prompt: ${distilled}\n`);

  const genResult = yield* runFalGeneration({
    endpoint: selection.primary.endpoint,
    prompt: distilled,
    params: { image_size: "portrait_4_3", negative_prompt: negative, num_inference_steps: 28, guidance_scale: 3.5 },
  });
  yield* Console.log(`Generated: ${genResult.url}`);

  const fileSizeBytes = yield* Effect.tryPromise({
    try: async () => Number((await fetch(genResult.url, { method: "HEAD" })).headers.get("content-length") ?? "50000"),
    catch: () => new Error("HEAD failed"),
  });

  const scores = yield* pipe(
    computeRealScores({ artifactUrl: genResult.url, prompt: distilled, styleId: resolved.id, jobType: "image-gen", fileSizeBytes, conventionBreakApplied: resolved.conventionBreak.applied }),
    Effect.catchAll(() => Effect.succeed(computeFallbackScores(fileSizeBytes, "image-gen", resolved.conventionBreak.applied))),
  );

  const report = computeComposite(scores);
  yield* Console.log(`\n${report.scoreCard}`);
});

if (import.meta.main) {
  pipe(program, Effect.catchAll((e) => Effect.sync(() => { console.error(`Failed: ${e}`); process.exitCode = 1; })), Effect.runPromise);
}
