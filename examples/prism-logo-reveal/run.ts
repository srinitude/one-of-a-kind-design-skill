/**
 * prism-logo-reveal — Video example: Bento UI style.
 * Reproduces the exact invocation from the 20-test validation suite.
 *
 * Run: bun run examples/prism-logo-reveal/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { parse as parseYaml } from "yaml";
import { resolveStyle } from "../../.claude/skills/one-of-a-kind-design/scripts/resolve-style";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";
import { computeFallbackScores } from "../lib/real-scoring";
import { distillPrompt, distillNegative } from "../lib/distill-prompt";

const USER_PROMPT = "5-second logo reveal animation for a tech startup called 'Prism'";

const program = Effect.gen(function* () {
  yield* Console.log("=== Prism Logo Reveal ===\n");

  const taxonomyPath = `${import.meta.dir}/../../.claude/skills/one-of-a-kind-design/references/TAXONOMY.yaml`;
  const taxonomy = yield* Effect.tryPromise({
    try: async () => parseYaml(await Bun.file(taxonomyPath).text()) as Record<string, unknown>,
    catch: (e) => new Error(`Taxonomy load failed: ${e}`),
  });

  const resolved = yield* resolveStyle(taxonomy, {
    industry: "tech",
    mood: ["futuristic"],
  });
  yield* Console.log(`Style: ${resolved.id} (${resolved.name})`);

  const selection = selectModel(resolved.id, "video", "pro");
  yield* Console.log(`Model: ${selection.primary.name}`);

  const distilled = distillPrompt(resolved, USER_PROMPT);
  const negative = distillNegative(resolved);
  yield* Console.log(`Prompt: ${distilled}\n`);

  const genResult = yield* runFalGeneration({
    endpoint: selection.primary.endpoint,
    prompt: distilled,
    params: { negative_prompt: negative },
  });
  yield* Console.log(`Generated: ${genResult.url}`);

  const fileSizeBytes = yield* Effect.tryPromise({
    try: async () => Number((await fetch(genResult.url, { method: "HEAD" })).headers.get("content-length") ?? "500000"),
    catch: () => new Error("HEAD failed"),
  });

  // Video scoring uses fallback (LLaVA cannot process mp4 frames directly)
  const scores = computeFallbackScores(fileSizeBytes, "video-gen", resolved.conventionBreak.applied);
  const report = computeComposite(scores);
  yield* Console.log(`\n${report.scoreCard}`);
});

if (import.meta.main) {
  pipe(program, Effect.catchAll((e) => Effect.sync(() => { console.error(`Failed: ${e}`); process.exitCode = 1; })), Effect.runPromise);
}
