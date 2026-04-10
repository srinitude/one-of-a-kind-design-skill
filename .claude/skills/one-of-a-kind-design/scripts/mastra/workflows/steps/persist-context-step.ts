/**
 * persist-context-step.ts — Save generation context to project memory.
 * Input matches quality-gate output.
 */

import { createStep } from "@mastra/core/workflows";
import { Effect } from "effect";
import { z } from "zod";

const inputSchema = z.object({
  artifactUrl: z.string(),
  composite: z.number(),
  passed: z.boolean(),
  scoreCard: z.string(),
  styleId: z.string(),
});

const outputSchema = z.object({
  artifactUrl: z.string(),
  compositeScore: z.number(),
  passed: z.boolean(),
  styleId: z.string(),
  persisted: z.boolean(),
});

export const persistContextStep = createStep({
  id: "persist-context",
  description: "Persist generation context for project memory and audit trail",
  inputSchema,
  outputSchema,
  execute: ({ inputData, writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "persist-context", status: "running" }),
          catch: () => new Error("writer failed"),
        });

        const contextPath = ".mastra/context.json";
        const entry = {
          timestamp: new Date().toISOString(),
          styleId: inputData.styleId,
          artifactUrl: inputData.artifactUrl,
          composite: inputData.composite,
          passed: inputData.passed,
        };

        yield* Effect.tryPromise({
          try: async () => {
            const existing = await Bun.file(contextPath)
              .text()
              .catch(() => "[]");
            const entries = JSON.parse(existing) as unknown[];
            entries.push(entry);
            await Bun.write(contextPath, JSON.stringify(entries, null, 2));
          },
          catch: () => new Error("Failed to persist context"),
        });

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "persist-context", status: "complete" }),
          catch: () => new Error("writer failed"),
        });

        return {
          artifactUrl: inputData.artifactUrl,
          compositeScore: inputData.composite,
          passed: inputData.passed,
          styleId: inputData.styleId,
          persisted: true,
        };
      }),
    ),
});
