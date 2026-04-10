/**
 * services/effect-bridge.ts — Effect service layer wrapping Mastra.
 * Tagged errors: MastraAgentError, MastraToolError, MastraWorkflowError.
 * MastraService Context.GenericTag + MastraLive Layer.
 */

import { Context, Data, Effect, Layer } from "effect";

export class MastraAgentError extends Data.TaggedError("MastraAgentError")<{
  readonly agentId: string;
  readonly cause: unknown;
}> {}

export class MastraToolError extends Data.TaggedError("MastraToolError")<{
  readonly toolId: string;
  readonly cause: unknown;
}> {}

export class MastraWorkflowError extends Data.TaggedError("MastraWorkflowError")<{
  readonly workflowId: string;
  readonly cause: unknown;
}> {}

interface MastraServiceShape {
  readonly getAgent: (id: string) => Effect.Effect<unknown, MastraAgentError>;
  readonly executeTool: (id: string, input: unknown) => Effect.Effect<unknown, MastraToolError>;
  readonly runWorkflow: (id: string, input: unknown) => Effect.Effect<unknown, MastraWorkflowError>;
}

export const MastraService = Context.GenericTag<MastraServiceShape>("MastraService");

interface MastraInstance {
  getAgent: (id: string) => unknown;
  getTool: (id: string) => { execute: (ctx: Record<string, unknown>) => Promise<unknown> };
  getWorkflow: (id: string) => {
    createRun: () => Promise<{ start: (opts: Record<string, unknown>) => Promise<unknown> }>;
  };
}

export const MastraLive = Layer.effect(
  MastraService,
  Effect.gen(function* () {
    const mod = yield* Effect.tryPromise({
      try: () => import("../index.js"),
      catch: (e) => new MastraWorkflowError({ workflowId: "init", cause: e }),
    });

    const instance = mod.mastra as unknown as MastraInstance;

    return {
      getAgent: (id: string) =>
        Effect.tryPromise({
          try: () => Promise.resolve(instance.getAgent(id)),
          catch: (e) => new MastraAgentError({ agentId: id, cause: e }),
        }),

      executeTool: (toolId: string, input: unknown) =>
        Effect.tryPromise({
          try: () =>
            instance.getTool(toolId).execute({
              context: { ...(input as Record<string, unknown>) },
            }),
          catch: (e) => new MastraToolError({ toolId, cause: e }),
        }),

      runWorkflow: (id: string, input: unknown) =>
        Effect.tryPromise({
          try: () =>
            instance
              .getWorkflow(id)
              .createRun()
              .then((run) => run.start({ inputData: input })),
          catch: (e) => new MastraWorkflowError({ workflowId: id, cause: e }),
        }),
    };
  }),
);
