/**
 * fal-i2i.ts — Mastra tool wrapping fal.ai image-to-image style transfer.
 * Delegates to the existing run-fal-generation.ts Effect pipeline.
 */

import { createTool } from "@mastra/core/tools";
import { Effect } from "effect";
import { z } from "zod";
import { runFalGeneration } from "../../run-fal-generation.js";

const inputSchema = z.object({
  endpoint: z.string().describe("I2I model endpoint, e.g. fal-ai/flux-pro/v1.1/redux"),
  prompt: z.string().max(500).describe("Style transfer prompt"),
  imageUrl: z.string().describe("Source image URL to transform"),
  strength: z.number().min(0).max(1).optional().describe("Style transfer strength 0-1"),
  seed: z.number().int().optional().describe("Deterministic seed"),
  imageSize: z.string().optional().describe("Output size"),
});

const outputSchema = z.object({
  url: z.string().describe("URL of the transformed image"),
  contentType: z.string().describe("MIME type"),
  seed: z.number().nullable().describe("Seed used"),
  promptId: z.string().describe("Deterministic prompt hash ID"),
  timing: z.number().describe("Generation time in ms"),
});

export const falI2ITool = createTool({
  id: "fal-i2i",
  description: "Transform an image using fal.ai image-to-image models (style transfer, edits)",
  inputSchema,
  outputSchema,
  execute: (input, { writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () => writer?.write({ type: "generation-progress", status: "submitting" }),
          catch: () => new Error("writer failed"),
        });

        const params: Record<string, unknown> = { image_url: input.imageUrl };
        if (input.strength !== undefined) params.strength = input.strength;
        if (input.seed !== undefined) params.seed = input.seed;
        if (input.imageSize) params.image_size = input.imageSize;

        const result = yield* runFalGeneration({
          endpoint: input.endpoint,
          prompt: input.prompt,
          params,
        });

        yield* Effect.tryPromise({
          try: async () =>
            writer?.write({ type: "generation-progress", status: "complete", url: result.url }),
          catch: () => new Error("writer failed"),
        });

        return {
          url: result.url,
          contentType: result.content_type,
          seed: result.seed,
          promptId: result.prompt_id,
          timing: result.timing,
        };
      }),
    ),
});
