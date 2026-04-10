/**
 * score-step.ts — LLaVA + composite scoring.
 * Input matches verify-step output.
 */

import { createStep } from "@mastra/core/workflows";
import { Effect } from "effect";
import { z } from "zod";
import { analyzeQuality } from "../../../run-perceptual-quality.js";
import { computeComposite } from "../../../score-output-quality.js";

const inputSchema = z.object({
  artifactUrl: z.string(),
  isUnique: z.boolean(),
  ssimIndex: z.number(),
  pHashSimilarity: z.number(),
  pixelVerdict: z.string(),
});

const outputSchema = z.object({
  artifactUrl: z.string(),
  composite: z.number(),
  passed: z.boolean(),
  scoreCard: z.string(),
  styleId: z.string(),
});

export const scoreStep = createStep({
  id: "score-quality",
  description: "Compute composite quality score via LLaVA vision + weighted sub-scores",
  inputSchema,
  outputSchema,
  execute: ({ inputData, writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "score-quality", status: "running" }),
          catch: () => new Error("writer failed"),
        });

        const styleId = "resolved";

        const perceptual = yield* analyzeQuality({
          imageUrl: inputData.artifactUrl,
          styleId,
        });

        const report = computeComposite({
          antiSlopGate: 8.0,
          codeStandardsGate: null,
          assetQualityAvg: perceptual.aesthetic,
          promptArtifactAlign: perceptual.style_fidelity,
          aesthetic: perceptual.aesthetic,
          styleFidelity: perceptual.style_fidelity,
          distinctiveness: perceptual.distinctiveness,
          hierarchy: perceptual.hierarchy,
          colorHarmony: perceptual.color_harmony,
          conventionBreakAdherence: null,
        });

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({
              type: "quality-score",
              composite: report.composite,
              passed: report.passed,
            }),
          catch: () => new Error("writer failed"),
        });

        return {
          artifactUrl: inputData.artifactUrl,
          composite: report.composite,
          passed: report.passed,
          scoreCard: report.scoreCard,
          styleId,
        };
      }),
    ),
});
