/**
 * verify-image.ts — Mastra tool wrapping the 4-layer verification stack.
 * Delegates to the existing verify-image.ts Effect pipeline.
 */

import { createTool } from "@mastra/core/tools";
import { Effect } from "effect";
import { z } from "zod";
import { verifyImage as runVerifyImage } from "../../verify-image.js";

const inputSchema = z.object({
  generatedUrl: z.string().describe("URL of the generated image to verify"),
  referenceUrl: z.string().nullable().describe("Reference image URL (null for self-compare)"),
});

const outputSchema = z.object({
  pixelDiff: z.object({
    totalPixels: z.number(),
    diffPixels: z.number(),
    diffPercent: z.number(),
    verdict: z.enum(["identical", "minor-diff", "significant-diff", "completely-different"]),
  }),
  structuralSimilarity: z.object({
    ssimIndex: z.number(),
    luminance: z.number(),
    contrast: z.number(),
    structure: z.number(),
  }),
  perceptualHash: z.object({
    hashA: z.string(),
    hashB: z.string(),
    hammingDistance: z.number(),
    similarity: z.number(),
  }),
  uniqueness: z.object({
    nearestMatchDistance: z.number(),
    isUnique: z.boolean(),
    closestMatchId: z.string().nullable(),
  }),
});

export const verifyImageTool = createTool({
  id: "verify-image",
  description:
    "Run 4-layer verification (pixelmatch, SSIM, pHash, uniqueness) on a generated image",
  inputSchema,
  outputSchema,
  execute: (input) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* runVerifyImage(input.generatedUrl, input.referenceUrl);
        return {
          pixelDiff: result.pixelDiff,
          structuralSimilarity: result.structuralSimilarity,
          perceptualHash: result.perceptualHash,
          uniqueness: result.uniqueness,
        };
      }),
    ),
});
