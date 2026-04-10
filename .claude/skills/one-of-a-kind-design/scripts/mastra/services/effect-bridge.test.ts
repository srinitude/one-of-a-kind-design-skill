/**
 * services/effect-bridge.test.ts — Tests for the Effect-Mastra bridge.
 */

import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import {
  MastraAgentError,
  MastraLive,
  MastraService,
  MastraToolError,
  MastraWorkflowError,
} from "./effect-bridge";

describe("Effect Bridge", () => {
  describe("tagged errors", () => {
    it("MastraAgentError has correct tag", () => {
      const err = new MastraAgentError({ agentId: "test", cause: "boom" });
      expect(err._tag).toBe("MastraAgentError");
      expect(err.agentId).toBe("test");
    });

    it("MastraToolError has correct tag", () => {
      const err = new MastraToolError({ toolId: "test", cause: "boom" });
      expect(err._tag).toBe("MastraToolError");
      expect(err.toolId).toBe("test");
    });

    it("MastraWorkflowError has correct tag", () => {
      const err = new MastraWorkflowError({ workflowId: "test", cause: "boom" });
      expect(err._tag).toBe("MastraWorkflowError");
      expect(err.workflowId).toBe("test");
    });
  });

  describe("MastraService tag", () => {
    it("is a valid Context tag", () => {
      expect(MastraService).toBeDefined();
      expect(MastraService.key).toBe("MastraService");
    });
  });

  describe("MastraLive layer", () => {
    it("is a valid Layer", () => {
      expect(MastraLive).toBeDefined();
    });
  });

  describe("error matching", () => {
    it("catches MastraAgentError by tag", async () => {
      const program = Effect.gen(function* () {
        yield* Effect.fail(new MastraAgentError({ agentId: "x", cause: "test" }));
        return "never";
      }).pipe(Effect.catchTag("MastraAgentError", (e) => Effect.succeed(`caught: ${e.agentId}`)));

      const result = await Effect.runPromise(program);
      expect(result).toBe("caught: x");
    });

    it("catches MastraToolError by tag", async () => {
      const program = Effect.gen(function* () {
        yield* Effect.fail(new MastraToolError({ toolId: "y", cause: "test" }));
        return "never";
      }).pipe(Effect.catchTag("MastraToolError", (e) => Effect.succeed(`caught: ${e.toolId}`)));

      const result = await Effect.runPromise(program);
      expect(result).toBe("caught: y");
    });

    it("catches MastraWorkflowError by tag", async () => {
      const program = Effect.gen(function* () {
        yield* Effect.fail(new MastraWorkflowError({ workflowId: "z", cause: "test" }));
        return "never";
      }).pipe(
        Effect.catchTag("MastraWorkflowError", (e) => Effect.succeed(`caught: ${e.workflowId}`)),
      );

      const result = await Effect.runPromise(program);
      expect(result).toBe("caught: z");
    });
  });
});
