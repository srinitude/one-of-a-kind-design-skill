/**
 * ci-validate.ts — CI validation pipeline (Bun + Effect).
 * Runs: build → lint → enforce → test. All must pass.
 * Max nesting depth: 2 (Effect.gen → Effect.tryPromise).
 *
 * Run: bun run scripts/ci-validate.ts
 */
import { Console, Effect, pipe } from "effect";

const runStep = (name: string, args: string[]) =>
  Effect.gen(function* () {
    yield* Console.log(`Running ${name}...`);
    const proc = Bun.spawn(["bun", ...args], {
      stdout: "inherit",
      stderr: "inherit",
    });
    const code = yield* Effect.tryPromise({
      try: () => proc.exited,
      catch: (e) => new Error(`${name} spawn failed: ${e}`),
    });
    if (code !== 0) yield* Effect.fail(new Error(`${name} failed with exit code ${code}`));
    yield* Console.log(`${name} passed`);
  });

const steps = [
  runStep("build", ["tsc", "--noEmit"]),
  runStep("lint", ["run", "lint"]),
  runStep("enforce", ["run", new URL("./enforce-rules.ts", import.meta.url).pathname]),
  runStep("test", ["test"]),
];

const program = pipe(
  Effect.all(steps, { concurrency: 1, discard: true }),
  Effect.flatMap(() => Console.log("\nAll checks passed.")),
);

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      pipe(
        Console.error(`\nCI failed: ${error}`),
        Effect.flatMap(() => Effect.sync(() => process.exit(1))),
      ),
    ),
    Effect.runPromise,
  );
}
