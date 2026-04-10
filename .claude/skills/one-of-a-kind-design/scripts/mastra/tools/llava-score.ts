/**
 * llava-score.ts — Mastra tool wrapping LLaVA 13B vision scoring.
 * Delegates to the existing run-perceptual-quality.ts Effect pipeline.
 */

import { createTool } from "@mastra/core/tools";
import { Effect } from "effect";
import { z } from "zod";
import { analyzeQuality } from "../../run-perceptual-quality.js";

const inputSchema = z.object({
  imageUrl: z.string().describe("URL of the image to score"),
  styleId: z.string().describe("Style ID for fidelity scoring"),
});

const outputSchema = z.object({
  aesthetic: z.number().describe("Aesthetic quality 1-10"),
  styleFidelity: z.number().describe("Style fidelity 1-10"),
  distinctiveness: z.number().describe("Distinctiveness 1-10"),
  hierarchy: z.number().describe("Visual hierarchy 1-10"),
  colorHarmony: z.number().describe("Color harmony 1-10"),
  description: z.string().describe("Vision model description"),
});

export const llavaScoreTool = createTool({
  id: "llava-score",
  description: "Score an image using LLaVA 13B vision model for aesthetic and style quality",
  inputSchema,
  outputSchema,
  execute: (input) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* analyzeQuality({
          imageUrl: input.imageUrl,
          styleId: input.styleId,
        });

        return {
          aesthetic: result.aesthetic,
          styleFidelity: result.style_fidelity,
          distinctiveness: result.distinctiveness,
          hierarchy: result.hierarchy,
          colorHarmony: result.color_harmony,
          description: result.description,
        };
      }),
    ),
});
