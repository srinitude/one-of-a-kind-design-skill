/**
 * generate-step.ts — Calls fal.ai generation tool. Streams progress via writer.
 */

import { createStep } from "@mastra/core/workflows";
import { Effect } from "effect";
import { z } from "zod";
import { runFalGeneration } from "../../../run-fal-generation.js";

const inputSchema = z.object({
  craftedPrompt: z.string(),
  negativePrompt: z.string(),
  model: z.string(),
  promptId: z.string(),
  params: z.record(z.string(), z.unknown()),
  seed: z.number().optional(),
});

const outputSchema = z.object({
  artifactUrl: z.string(),
  contentType: z.string(),
  seed: z.number().nullable(),
  promptId: z.string(),
  timing: z.number(),
});

export const generateStep = createStep({
  id: "generate-artifact",
  description: "Generate artifact via fal.ai (image, video, 3D)",
  inputSchema,
  outputSchema,
  execute: ({ inputData, writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () => writer.write({ type: "generation-progress", status: "submitting" }),
          catch: () => new Error("writer failed"),
        });

        const params = { ...inputData.params } as Record<string, unknown>;
        if (inputData.negativePrompt) params.negative_prompt = inputData.negativePrompt;
        if (inputData.seed !== undefined) params.seed = inputData.seed;

        const result = yield* runFalGeneration({
          endpoint: inputData.model,
          prompt: inputData.craftedPrompt,
          params,
        });

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({
              type: "generation-progress",
              status: "complete",
              url: result.url,
            }),
          catch: () => new Error("writer failed"),
        });

        return {
          artifactUrl: result.url,
          contentType: result.content_type,
          seed: result.seed,
          promptId: result.prompt_id,
          timing: result.timing,
        };
      }),
    ),
});
