/**
 * select-models-step.ts — Wraps existing select-fal-models.ts.
 * Input matches resolve-style-step output.
 */

import { createStep } from "@mastra/core/workflows";
import { Effect } from "effect";
import { z } from "zod";
import { selectChainModels } from "../../../select-fal-models.js";

const inputSchema = z.object({
  styleId: z.string(),
  dials: z.record(z.string(), z.number()),
  conventionBreak: z.object({
    applied: z.boolean(),
    text: z.string().optional(),
  }),
  recommendedChain: z.string(),
  palette: z.array(z.string()),
  promptTokens: z.string(),
  motionSignature: z.string(),
  premiumPatterns: z.array(z.string()),
  negativePrompt: z.string(),
});

const outputSchema = z.object({
  chain: z.string(),
  models: z.array(
    z.object({
      step: z.string(),
      endpoint: z.string(),
      name: z.string(),
      tier: z.string(),
    }),
  ),
  reason: z.string(),
});

export const selectModelsStep = createStep({
  id: "select-models",
  description: "Select fal.ai models based on style affinity and tier",
  inputSchema,
  outputSchema,
  execute: ({ inputData, writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "select-models", status: "running" }),
          catch: () => new Error("writer failed"),
        });

        const qualityDial = (inputData.dials as Record<string, number>).quality ?? 7;
        const tier = qualityDial >= 8 ? "premium" : "standard";
        const chainType = inputData.recommendedChain as
          | "t2i"
          | "t2i-i2i"
          | "t2i-i2v"
          | "i2i"
          | "t2i-i2i-i2v";

        const selection = selectChainModels(
          chainType,
          inputData.styleId,
          tier as "standard" | "premium",
        );

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "select-models", status: "complete" }),
          catch: () => new Error("writer failed"),
        });

        return {
          chain: selection.chain,
          models: selection.models.map((m) => ({
            step: m.step,
            endpoint: m.model.endpoint,
            name: m.model.name,
            tier: m.model.tier,
          })),
          reason: selection.reason,
        };
      }),
    ),
});
