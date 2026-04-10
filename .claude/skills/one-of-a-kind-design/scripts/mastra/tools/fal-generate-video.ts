/**
 * fal-generate-video.ts — Mastra tool wrapping fal.ai video generation.
 * Supports Seedance 2.0 (bytedance/seedance-2.0/fast/{mode}) and WAN (fal-ai/wan-t2v).
 * Duration MUST be a STRING per Seedance API spec.
 */

import { createTool } from "@mastra/core/tools";
import { Effect } from "effect";
import { z } from "zod";
import { runFalGeneration } from "../../run-fal-generation.js";

const inputSchema = z.object({
  endpoint: z.string().describe("Video model endpoint, e.g. bytedance/seedance-2.0/fast/t2v"),
  prompt: z.string().max(500).describe("Video generation prompt"),
  negativePrompt: z.string().optional().describe("Negative prompt"),
  seed: z.number().int().optional().describe("Deterministic seed"),
  duration: z.string().optional().describe("Duration as STRING, e.g. '5' not 5"),
  imageUrl: z.string().optional().describe("Reference image URL for i2v mode"),
  referenceImages: z.array(z.string()).optional().describe("Reference images for ref2v mode"),
});

const outputSchema = z.object({
  url: z.string().describe("URL of the generated video"),
  contentType: z.string().describe("MIME type (video/mp4)"),
  seed: z.number().nullable().describe("Seed used"),
  promptId: z.string().describe("Deterministic prompt hash ID"),
  timing: z.number().describe("Generation time in ms"),
});

export const falGenerateVideoTool = createTool({
  id: "fal-generate-video",
  description: "Generate video from text or image using fal.ai (Seedance 2.0, WAN T2V)",
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
        if (input.duration) params.duration = input.duration;
        if (input.imageUrl) params.image_url = input.imageUrl;
        if (input.referenceImages) params.reference_images = input.referenceImages;

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
