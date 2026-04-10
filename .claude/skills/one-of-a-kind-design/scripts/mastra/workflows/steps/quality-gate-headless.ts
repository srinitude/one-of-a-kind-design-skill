/**
 * quality-gate-headless.ts — Fully autonomous quality gate, NO suspend.
 * Input matches score-step output.
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
  composite: z.number(),
  passed: z.boolean(),
  scoreCard: z.string(),
  styleId: z.string(),
});

export const qualityGateHeadlessStep = createStep({
  id: "quality-gate-headless",
  description: "Autonomous quality gate — auto-retry via time-travel, no suspend",
  inputSchema,
  outputSchema,
  execute: ({ inputData, writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        if (inputData.passed) {
          yield* Effect.tryPromise({
            try: async () =>
              writer.write({
                type: "quality-gate",
                status: "passed",
                composite: inputData.composite,
              }),
            catch: () => new Error("writer failed"),
          });
          return inputData;
        }

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({
              type: "quality-gate",
              status: "below-threshold",
              composite: inputData.composite,
            }),
          catch: () => new Error("writer failed"),
        });

        return inputData;
      }),
    ),
});
