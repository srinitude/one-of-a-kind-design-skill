/**
 * setup.ts — First-run setup for the one-of-a-kind-design skill.
 * Installs all runtime dependencies. Idempotent — safe to run multiple times.
 *
 * Usage: bun run scripts/setup.ts
 */

import { Effect, Console, pipe } from "effect";

const checkBun = Effect.gen(function* () {
  const version = Bun.version;
  yield* Console.log(`Bun ${version} detected`);
  return version;
});

const installDeps = Effect.tryPromise({
  try: async () => {
    const proc = Bun.spawn(
      [
        "bun",
        "add",
        // Core framework
        "effect",
        "@effect/platform",
        // Mastra
        "@mastra/core",
        "@mastra/evals",
        "@mastra/e2b",
        "@mastra/libsql",
        "@mastra/stagehand",
        // Generation APIs
        "@fal-ai/client",
        "@quiverai/sdk",
        "@e2b/code-interpreter",
        // Verification
        "pixelmatch",
        "pngjs",
        // Utilities
        "yaml",
        "zod",
        "archiver",
      ],
      { stdout: "pipe", stderr: "pipe" },
    );
    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      const err = await new Response(proc.stderr).text();
      throw new Error(`bun add failed: ${err}`);
    }
    return output;
  },
  catch: (e) => new Error(`Dependency install failed: ${e}`),
});

const installDevDeps = Effect.tryPromise({
  try: async () => {
    const proc = Bun.spawn(
      ["bun", "add", "-d", "@types/bun", "@biomejs/biome", "typescript"],
      { stdout: "pipe", stderr: "pipe" },
    );
    await proc.exited;
    return "dev deps installed";
  },
  catch: (e) => new Error(`Dev dependency install failed: ${e}`),
});

const createEnvTemplate = Effect.gen(function* () {
  const envPath = `${import.meta.dir}/../../../../.env`;
  const exists = yield* Effect.sync(() => Bun.file(envPath).size > 0).pipe(
    Effect.catchAll(() => Effect.succeed(false)),
  );

  if (!exists) {
    yield* Effect.tryPromise({
      try: () =>
        Bun.write(
          envPath,
          "FAL_KEY=\nE2B_API_KEY=\nQUIVERAI_API_KEY=\n",
        ),
      catch: (e) => new Error(`Failed to create .env template: ${e}`),
    });
    yield* Console.log("Created .env template — fill in your API keys");
  } else {
    yield* Console.log(".env exists");
  }
});

const createMastraDir = Effect.gen(function* () {
  const dir = `${import.meta.dir}/../../../../.mastra`;
  yield* Effect.tryPromise({
    try: async () => {
      const proc = Bun.spawn(["mkdir", "-p", dir]);
      await proc.exited;
    },
    catch: (e) => new Error(`Failed to create .mastra dir: ${e}`),
  });
});

const main = Effect.gen(function* () {
  yield* Console.log("Setting up one-of-a-kind-design skill...\n");
  yield* checkBun;
  yield* Console.log("Installing dependencies...");
  yield* installDeps;
  yield* Console.log("Dependencies installed");
  yield* installDevDeps;
  yield* Console.log("Dev dependencies installed");
  yield* createEnvTemplate;
  yield* createMastraDir;
  yield* Console.log("\nSetup complete. Run: bun run validate");
});

pipe(
  main,
  Effect.catchAll((e) =>
    Console.error(`Setup failed: ${e}`),
  ),
  Effect.runPromise,
);
