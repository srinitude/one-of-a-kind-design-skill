/**
 * fal-generate-image.ts — Mastra tool wrapping fal.ai text-to-image generation.
 * Delegates to the existing run-fal-generation.ts Effect pipeline.
 */

import { createTool } from "@mastra/core/tools";
import { Effect } from "effect";
import { z } from "zod";
import { runFalGeneration } from "../../run-fal-generation.js";

const inputSchema = z.object({
  endpoint: z.string().describe("fal.ai model endpoint, e.g. fal-ai/flux-pro/v1.1-ultra"),
  prompt: z.string().max(500).describe("Image generation prompt, max 500 chars"),
  negativePrompt: z.string().optional().describe("Negative prompt for exclusions"),
  seed: z.number().int().optional().describe("Deterministic seed for reproducibility"),
  imageSize: z.string().optional().describe("Output size, e.g. landscape_16_9"),
  numInferenceSteps: z.number().int().optional().describe("Inference steps (higher = better)"),
  guidanceScale: z.number().optional().describe("CFG guidance scale"),
});

const outputSchema = z.object({
  url: z.string().describe("URL of the generated image"),
  contentType: z.string().describe("MIME type of the output"),
  seed: z.number().nullable().describe("Seed used for generation"),
  promptId: z.string().describe("Deterministic prompt hash ID"),
  timing: z.number().describe("Generation time in milliseconds"),
});

export const falGenerateImageTool = createTool({
  id: "fal-generate-image",
  description: "Generate an image from text using fal.ai models (Flux, Ideogram, Recraft, etc.)",
  inputSchema,
  outputSchema,
  execute: (input, { writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () => writer?.write({ type: "generation-progress", status: "submitting" }),
          catch: () => new Error("writer failed"),
        });

        const params: Record<string, unknown> = {};
        if (input.negativePrompt) params.negative_prompt = input.negativePrompt;
        if (input.seed !== undefined) params.seed = input.seed;
        if (input.imageSize) params.image_size = input.imageSize;
        if (input.numInferenceSteps) params.num_inference_steps = input.numInferenceSteps;
        if (input.guidanceScale) params.guidance_scale = input.guidanceScale;

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
