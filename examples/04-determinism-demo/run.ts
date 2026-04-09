/**
 * 04 - Determinism Demo: proves same inputs -> same outputs every time
 *
 * Run: bun run examples/04-determinism-demo/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { buildPromptId } from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";

const CASES = [
  { stage: "image-gen", styleId: "bauhaus", intent: "geometric composition" },
  { stage: "video-gen", styleId: "cinematic", intent: "dramatic establishing shot" },
  { stage: "svg-gen", styleId: "art-deco", intent: "luxury hotel logo" },
] as const;

function runDeterminismCheck(stage: string, styleId: string, intent: string) {
  return Effect.gen(function* () {
    const id1 = buildPromptId(stage, styleId, intent);
    const id2 = buildPromptId(stage, styleId, intent);
    const match = id1 === id2;

    yield* Console.log(`  Stage: ${stage} | Style: ${styleId}`);
    yield* Console.log(`  Run 1: ${id1}`);
    yield* Console.log(`  Run 2: ${id2}`);
    yield* Console.log(`  Match: ${match ? "PASS" : "FAIL"}\n`);
    return match;
  });
}

const program = Effect.gen(function* () {
  yield* Console.log("=== 04: Determinism Demo ===\n");
  yield* Console.log("Testing that buildPromptId produces identical IDs for identical inputs:\n");

  let allPassed = true;
  for (const c of CASES) {
    const passed = yield* runDeterminismCheck(c.stage, c.styleId, c.intent);
    if (!passed) allPassed = false;
  }

  yield* Console.log("--- Cross-input uniqueness ---\n");
  const ids = CASES.map((c) => buildPromptId(c.stage, c.styleId, c.intent));
  const unique = new Set(ids).size;
  yield* Console.log(`  ${ids.length} inputs -> ${unique} unique IDs`);
  yield* Console.log(`  Unique: ${unique === ids.length ? "PASS" : "FAIL"}\n`);

  const result = allPassed && unique === ids.length ? "ALL CHECKS PASSED" : "SOME CHECKS FAILED";
  yield* Console.log(`Result: ${result}`);
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Determinism demo failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
