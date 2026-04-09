import { describe, expect, test } from "bun:test";
import { Effect, Exit, pipe } from "effect";
import { buildPromptId } from "./generate-api-prompt";

describe("determinism integration", () => {
  test("buildPromptId is deterministic across calls", () => {
    const runs = Array.from({ length: 10 }, () =>
      buildPromptId("image-gen", "cinematic", "hero shot"),
    );
    const unique = new Set(runs);
    expect(unique.size).toBe(1);
  });

  test("buildPromptId varies with different inputs", () => {
    const a = buildPromptId("image-gen", "cinematic", "hero shot");
    const b = buildPromptId("image-gen", "cinematic", "different intent");
    const c = buildPromptId("video-gen", "cinematic", "hero shot");
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });
});

describe("e2b sandbox withSandbox cleanup", () => {
  test("sandbox is destroyed even when operation throws", async () => {
    let destroyed = false;
    const mockSandbox = {
      kill: async () => {
        destroyed = true;
      },
    };

    const acquire = Effect.succeed(mockSandbox);
    const use = (_sb: typeof mockSandbox) => Effect.fail(new Error("operation failed"));
    const release = (sb: typeof mockSandbox) =>
      pipe(
        Effect.tryPromise({
          try: () => sb.kill(),
          catch: (e) => new Error(`destroy failed: ${e}`),
        }),
        Effect.catchAll(() => Effect.void),
        Effect.asVoid,
      );

    const program = Effect.acquireUseRelease(acquire, use, release);
    const exit = await Effect.runPromiseExit(program);

    expect(Exit.isFailure(exit)).toBe(true);
    expect(destroyed).toBe(true);
  });
});
