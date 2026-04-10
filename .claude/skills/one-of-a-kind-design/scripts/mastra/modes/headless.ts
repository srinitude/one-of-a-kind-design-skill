/**
 * modes/headless.ts — Entry point for CI/CD.
 * Runs headless pipeline. NO suspend. Auto-retry via time-travel. Exit code 0/1.
 */

import { Effect } from "effect";

export type HeadlessRef = Effect.Effect<void>;

interface PipelineInput {
  readonly userIntent: string;
  readonly outputType: string;
  readonly industry?: string;
  readonly mood?: string[];
  readonly dialOverrides?: Record<string, number>;
  readonly projectId?: string;
}

interface PipelineResult {
  readonly status: string;
  readonly steps?: Record<string, { output?: Record<string, unknown> }>;
  readonly artifactUrl?: string;
  readonly compositeScore?: number;
  readonly passed?: boolean;
  readonly styleId?: string;
}

interface WorkflowRun {
  start: (opts: Record<string, unknown>) => Promise<PipelineResult>;
  resume: (opts: Record<string, unknown>) => Promise<PipelineResult>;
  timeTravel: (opts: Record<string, unknown>) => Promise<PipelineResult>;
}

interface HeadlessSuccess {
  readonly status: "success";
  readonly result: {
    artifactUrl: string;
    compositeScore: number;
    passed: boolean;
    styleId: string;
    chain: string;
  };
}

interface HeadlessFailure {
  readonly status: "failed";
  readonly snapshot: PipelineResult;
  readonly attempts: number;
  readonly result: null;
}

type HeadlessResult = HeadlessSuccess | HeadlessFailure;

export const runHeadless = (input: PipelineInput): Promise<HeadlessResult> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const mod = yield* Effect.tryPromise({
        try: () =>
          import("../index.js") as Promise<{
            mastra: { getWorkflow: (id: string) => { createRun: () => Promise<WorkflowRun> } };
          }>,
        catch: (e) => new Error(`Failed to import mastra instance: ${e}`),
      });

      const workflow = mod.mastra.getWorkflow("design-pipeline-headless");
      const run = yield* Effect.tryPromise({
        try: () => workflow.createRun(),
        catch: (e) => new Error(`Failed to create workflow run: ${e}`),
      });

      let result = yield* Effect.tryPromise({
        try: () => run.start({ inputData: input }),
        catch: (e) => new Error(`Pipeline start failed: ${e}`),
      });

      let attempts = 0;
      const maxAttempts = 3;

      while (result.status === "suspended" && attempts < maxAttempts) {
        attempts++;
        const composite = (result.steps?.["score-quality"]?.output?.composite as number) ?? 0;

        if (composite >= 7.0) {
          result = yield* Effect.tryPromise({
            try: () => run.resume({ step: "quality-gate", resumeData: { action: "accept" } }),
            catch: (e) => new Error(`Resume failed: ${e}`),
          });
        } else {
          result = yield* Effect.tryPromise({
            try: () =>
              run.timeTravel({
                step: "generate-artifact",
                inputData: {
                  ...(result.steps?.["craft-prompt"]?.output ?? {}),
                  seed: 42 + attempts,
                },
              }),
            catch: (e) => new Error(`Time-travel retry failed: ${e}`),
          });
        }
      }

      const failed =
        result.status === "failed" || (result.status === "suspended" && attempts >= maxAttempts);

      if (failed) {
        return { status: "failed" as const, snapshot: result, attempts, result: null };
      }

      return {
        status: "success" as const,
        result: {
          artifactUrl: result.artifactUrl ?? "",
          compositeScore: result.compositeScore ?? 0,
          passed: result.passed ?? false,
          styleId: result.styleId ?? "",
          chain: "completed",
        },
      };
    }),
  );

export const runExperiment = (datasetId: string) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const mod = yield* Effect.tryPromise({
        try: () =>
          import("../index.js") as Promise<{
            mastra: {
              datasets: {
                get: (opts: { id: string }) => Promise<{
                  listItems: (opts: { perPage: number }) => Promise<{
                    items: Array<{ id: string; input: PipelineInput }>;
                  }>;
                }>;
              };
            };
          }>,
        catch: (e) => new Error(`Failed to import mastra: ${e}`),
      });

      const dataset = yield* Effect.tryPromise({
        try: () => mod.mastra.datasets.get({ id: datasetId }),
        catch: (e) => new Error(`Failed to get dataset: ${e}`),
      });

      const itemData = yield* Effect.tryPromise({
        try: () => dataset.listItems({ perPage: 100 }),
        catch: (e) => new Error(`Failed to list items: ${e}`),
      });

      const results: Array<{ itemId: string; status: string }> = [];
      for (const item of itemData.items) {
        const r = yield* Effect.tryPromise({
          try: () => runHeadless(item.input),
          catch: (e) => new Error(`Pipeline failed for item ${item.id}: ${e}`),
        });
        results.push({ itemId: item.id, status: r.status });
      }

      return results;
    }),
  );
