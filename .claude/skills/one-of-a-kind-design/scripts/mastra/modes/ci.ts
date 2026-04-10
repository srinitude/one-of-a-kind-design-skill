/**
 * modes/ci.ts — CLI wrapper for headless mode.
 * Usage: bun run scripts/mastra/modes/ci.ts '{"userIntent":"...","outputType":"..."}'
 */

import { Effect, pipe } from "effect";
import { runHeadless } from "./headless.js";

pipe(
  Effect.gen(function* () {
    const rawInput = Bun.argv[2] ?? "{}";
    const input = yield* Effect.try({
      try: () => JSON.parse(rawInput) as { userIntent: string; outputType: string },
      catch: () => new Error("Invalid JSON input"),
    });

    const result = yield* Effect.tryPromise({
      try: () => runHeadless(input),
      catch: (e) => new Error(`Headless pipeline failed: ${e}`),
    });

    if (result.status === "failed") {
      yield* Effect.sync(() => {
        console.error("Pipeline failed:", JSON.stringify(result.snapshot, null, 2));
      });
      yield* Effect.sync(() => {
        process.exitCode = 1;
      });
    } else {
      yield* Effect.sync(() => {
        console.log("Succeeded:", result.result.artifactUrl);
        console.log("Score:", result.result.compositeScore);
      });
    }
  }),
  Effect.catchAll((e) =>
    Effect.sync(() => {
      console.error(`CI error: ${e}`);
      process.exitCode = 1;
    }),
  ),
  Effect.runPromise,
);
