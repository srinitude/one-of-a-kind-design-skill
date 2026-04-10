/**
 * quality-gate-interactive.ts — Suspends for human decision when score < 7.0.
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

const suspendSchema = z.object({
  composite: z.number(),
  artifactUrl: z.string(),
  scoreCard: z.string(),
  suggestion: z.string(),
});

const resumeSchema = z.object({
  action: z.enum(["accept", "retry", "adjust"]),
  feedback: z.string().optional(),
});

export const qualityGateInteractiveStep = createStep({
  id: "quality-gate",
  description: "Human-in-the-loop quality gate — suspend if score < 7.0",
  inputSchema,
  outputSchema,
  suspendSchema,
  resumeSchema,
  execute: ({ inputData, resumeData, suspend, writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        if (inputData.passed) {
          return inputData;
        }

        if (resumeData?.action === "accept" || resumeData?.action === "retry") {
          return inputData;
        }

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({
              type: "quality-gate",
              status: "suspending",
              composite: inputData.composite,
            }),
          catch: () => new Error("writer failed"),
        });

        const suggestion =
          inputData.composite < 5 ? "Re-generate with different style" : "Adjust dials and retry";

        return yield* Effect.tryPromise({
          try: async () =>
            suspend({
              composite: inputData.composite,
              artifactUrl: inputData.artifactUrl,
              scoreCard: inputData.scoreCard,
              suggestion,
            }),
          catch: () => new Error("suspend failed"),
        });
      }),
    ),
});
