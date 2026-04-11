/**
 * verify-step.ts — 4-layer verification.
 * Input matches post-process-step output, plus styleId from pipeline context.
 */

import { createStep } from "@mastra/core/workflows";
import { Effect } from "effect";
import { z } from "zod";
import { verifyImage } from "../../../verify-image.js";

const inputSchema = z.object({
  artifactUrl: z.string(),
  contentType: z.string(),
  optimized: z.boolean(),
  styleId: z.string().optional(),
});

const outputSchema = z.object({
  artifactUrl: z.string(),
  isUnique: z.boolean(),
  ssimIndex: z.number(),
  pHashSimilarity: z.number(),
  pixelVerdict: z.string(),
  styleId: z.string(),
});

export const verifyStep = createStep({
  id: "verify",
  description: "Run 4-layer deterministic verification on generated artifact",
  inputSchema,
  outputSchema,
  execute: ({ inputData, writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "verify", status: "running" }),
          catch: () => new Error("writer failed"),
        });

        const style = inputData.styleId ?? "unknown";
        const result = yield* verifyImage(inputData.artifactUrl, null, style);

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "verification", step: "verify", status: "complete" }),
          catch: () => new Error("writer failed"),
        });

        return {
          artifactUrl: inputData.artifactUrl,
          isUnique: result.uniqueness.isUnique,
          ssimIndex: result.structuralSimilarity.ssimIndex,
          pHashSimilarity: result.perceptualHash.similarity,
          pixelVerdict: result.pixelDiff.verdict,
          styleId: style,
        };
      }),
    ),
});
