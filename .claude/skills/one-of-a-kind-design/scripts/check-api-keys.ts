import { Console, Effect, pipe } from "effect";

interface KeyCheckResult {
  name: string;
  status: "present" | "missing";
  value: string | undefined;
}

const REQUIRED_KEYS = ["FAL_KEY", "E2B_API_KEY", "QUIVERAI_API_KEY"] as const;

export const checkKeys = Effect.gen(function* () {
  const results: KeyCheckResult[] = REQUIRED_KEYS.map((name) => ({
    name,
    status: Bun.env[name] ? "present" : "missing",
    value: Bun.env[name] ? `${Bun.env[name]!.slice(0, 6)}...` : undefined,
  }));

  const missing = results.filter((r) => r.status === "missing");
  const present = results.filter((r) => r.status === "present");

  for (const r of present) {
    yield* Console.log(`  ${r.name}: ${r.value}`);
  }

  for (const r of missing) {
    yield* Console.error(`  ${r.name}: MISSING`);
  }

  if (missing.length > 0) {
    yield* Console.error(`\n${missing.length} key(s) missing. Set them before proceeding.`);
    yield* Effect.fail(new Error(`Missing keys: ${missing.map((r) => r.name).join(", ")}`));
  }

  yield* Console.log(`\nAll ${REQUIRED_KEYS.length} API keys present.`);
  return results;
});

const program = pipe(
  Console.log("Checking API keys...\n"),
  Effect.flatMap(() => checkKeys),
  Effect.catchAll((error) =>
    pipe(
      Console.error(`\n${error}`),
      Effect.flatMap(() => Effect.fail(error)),
    ),
  ),
);

if (import.meta.main) {
  Effect.runPromise(program);
}
