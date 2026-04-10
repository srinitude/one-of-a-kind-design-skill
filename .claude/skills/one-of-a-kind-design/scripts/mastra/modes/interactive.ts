/**
 * modes/interactive.ts — Entry point for coding agent sessions.
 * Runs the interactive pipeline with streaming. Handles suspend/resume for quality gate.
 */

import { Effect, pipe } from "effect";

export type InteractiveRef = Effect.Effect<void>;

interface PipelineInput {
  readonly userIntent: string;
  readonly outputType: string;
  readonly industry?: string;
  readonly mood?: string[];
  readonly dialOverrides?: Record<string, number>;
  readonly projectId?: string;
}

interface StreamChunk {
  readonly type: string;
  readonly [key: string]: unknown;
}

interface RunHandle {
  readonly resume: (opts: Record<string, unknown>) => Promise<unknown>;
  readonly timeTravel: (opts: Record<string, unknown>) => Promise<unknown>;
}

interface PipelineResult {
  readonly status: string;
  readonly steps?: Record<string, { output?: Record<string, unknown> }>;
  readonly artifactUrl?: string;
  readonly compositeScore?: number;
  readonly styleId?: string;
}

interface WorkflowRun extends RunHandle {
  stream: (opts: Record<string, unknown>) => AsyncIterable<StreamChunk> & {
    result: Promise<PipelineResult>;
  };
}

const logStep = (step: string, status: string) =>
  Effect.sync(() => {
    console.log(`[${step}] ${status}`);
  });

const logGeneration = (status: string) =>
  Effect.sync(() => {
    console.log(`Generating... ${status}`);
  });

const logScore = (composite: unknown) =>
  Effect.sync(() => {
    console.log(`Quality: ${composite}/10`);
  });

const logChunk = (chunk: StreamChunk) => {
  if (chunk.type === "step-progress") return logStep(String(chunk.step), String(chunk.status));
  if (chunk.type === "generation-progress") return logGeneration(String(chunk.status));
  if (chunk.type === "quality-score") return logScore(chunk.composite);
  return Effect.void;
};

const consumeStream = (stream: AsyncIterable<StreamChunk>) =>
  Effect.tryPromise({
    try: async () => {
      const chunks: StreamChunk[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return chunks;
    },
    catch: (e) => new Error(`Stream consumption failed: ${e}`),
  });

export const runInteractive = (input: PipelineInput) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const { mastra } = yield* Effect.tryPromise({
        try: () => import("../index.js"),
        catch: (e) => new Error(`Failed to import mastra instance: ${e}`),
      });

      const workflow = mastra.getWorkflow("design-pipeline-interactive");
      const run = yield* Effect.tryPromise({
        try: () => workflow.createRun() as Promise<unknown>,
        catch: (e) => new Error(`Failed to create workflow run: ${e}`),
      }) as Effect.Effect<WorkflowRun, Error>;

      const streamHandle = run.stream({ inputData: input });

      const chunks = yield* consumeStream(streamHandle);
      for (const chunk of chunks) {
        yield* logChunk(chunk);
      }

      const result = yield* Effect.tryPromise({
        try: () => streamHandle.result,
        catch: (e) => new Error(`Failed to get stream result: ${e}`),
      });

      if (result?.status === "suspended") {
        return { status: "awaiting-feedback" as const, run, result };
      }

      return { status: "complete" as const, result };
    }),
  );

export const retryWithFeedback = (
  run: RunHandle,
  feedback: string,
  adjustedDials?: Record<string, number>,
) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: () =>
          run.timeTravel({
            step: "craft-prompt",
            inputData: { feedback, dialOverrides: adjustedDials },
          }),
        catch: (e) => new Error(`Time-travel failed: ${e}`),
      });

      return result;
    }),
  );

if (import.meta.main) {
  pipe(
    Effect.gen(function* () {
      const rawInput = Bun.argv[2] ?? "{}";
      const input = yield* Effect.try({
        try: () => JSON.parse(rawInput) as PipelineInput,
        catch: () => new Error("Invalid JSON input"),
      });

      const result = yield* Effect.tryPromise({
        try: () => runInteractive(input),
        catch: (e) => new Error(`Interactive pipeline failed: ${e}`),
      });

      yield* Effect.sync(() => {
        console.log(JSON.stringify(result, null, 2));
      });
    }),
    Effect.catchAll((e) =>
      Effect.sync(() => {
        console.error(`Error: ${e}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
