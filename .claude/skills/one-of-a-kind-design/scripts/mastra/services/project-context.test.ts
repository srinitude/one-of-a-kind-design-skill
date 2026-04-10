/**
 * services/project-context.test.ts — Tests for project context persistence.
 */

import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { ProjectContextError, ProjectContextLive, ProjectContextService } from "./project-context";

describe("ProjectContextService", () => {
  it("loads empty state for new project", async () => {
    const state = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* ProjectContextService;
          return yield* svc.load("test-pc-1");
        }),
        ProjectContextLive,
      ),
    );

    expect(state.styleId).toBeNull();
    expect(state.palette).toEqual([]);
    expect(state.generationHistory).toEqual([]);
    expect(state.pHashLibrary).toEqual([]);
  });

  it("locks style for a project", async () => {
    const state = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* ProjectContextService;
          yield* svc.lockStyle("test-pc-2", "wabi-sabi");
          return yield* svc.load("test-pc-2");
        }),
        ProjectContextLive,
      ),
    );

    expect(state.styleId).toBe("wabi-sabi");
  });

  it("adds generation record", async () => {
    const state = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* ProjectContextService;
          yield* svc.addGeneration("test-pc-3", {
            timestamp: Date.now(),
            promptId: "p-001",
            artifactUrl: "https://example.com/img.png",
            composite: 7.5,
            styleId: "brutalist-web",
          });
          return yield* svc.load("test-pc-3");
        }),
        ProjectContextLive,
      ),
    );

    expect(state.generationHistory).toHaveLength(1);
    expect(state.generationHistory[0].promptId).toBe("p-001");
  });

  it("adds pHash to library", async () => {
    const state = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* ProjectContextService;
          yield* svc.addPHash("test-pc-4", "abc123");
          yield* svc.addPHash("test-pc-4", "def456");
          return yield* svc.load("test-pc-4");
        }),
        ProjectContextLive,
      ),
    );

    expect(state.pHashLibrary).toEqual(["abc123", "def456"]);
  });

  it("saves and loads full state", async () => {
    const state = await Effect.runPromise(
      Effect.provide(
        Effect.gen(function* () {
          const svc = yield* ProjectContextService;
          yield* svc.save("test-pc-5", {
            styleId: "minimalism-fine-art",
            palette: ["#000", "#fff"],
            characterRefs: ["ref1"],
            generationHistory: [],
            pHashLibrary: ["hash1"],
            tasteDials: { density: 3 },
          });
          return yield* svc.load("test-pc-5");
        }),
        ProjectContextLive,
      ),
    );

    expect(state.styleId).toBe("minimalism-fine-art");
    expect(state.palette).toEqual(["#000", "#fff"]);
  });

  it("ProjectContextError has correct tag", () => {
    const err = new ProjectContextError({ operation: "test", cause: "boom" });
    expect(err._tag).toBe("ProjectContextError");
    expect(err.operation).toBe("test");
  });
});
