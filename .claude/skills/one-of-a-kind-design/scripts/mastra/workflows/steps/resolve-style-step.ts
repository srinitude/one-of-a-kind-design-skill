/**
 * resolve-style-step.ts — Wraps existing resolve-style.ts as a Mastra workflow step.
 * Now includes intent parsing from enhance-user-message.ts (formerly a platform hook).
 */

import { createStep } from "@mastra/core/workflows";
import { Effect } from "effect";
import { z } from "zod";
import {
  buildEnhancement,
  computeSpecificity,
  extractDimensions,
} from "../../../enhance-user-message.js";
import { resolveStyle } from "../../../resolve-style.js";

const inputSchema = z.object({
  outputType: z.string(),
  industry: z.string().optional(),
  mood: z.array(z.string()).optional(),
  userIntent: z.string(),
  dialOverrides: z.record(z.string(), z.number()).optional(),
  hasReferenceImage: z.boolean().optional(),
});

const outputSchema = z.object({
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
  specificity: z.number(),
  enhancement: z.string(),
});

export const resolveStyleStep = createStep({
  id: "resolve-style",
  description: "Parse intent dimensions and resolve style from taxonomy",
  inputSchema,
  outputSchema,
  execute: ({ inputData, writer }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "resolve-style", status: "running" }),
          catch: () => new Error("writer failed"),
        });

        const dimensions = extractDimensions(inputData.userIntent);
        const specificity = computeSpecificity(dimensions);
        const enhancement = buildEnhancement(dimensions);

        const effectiveOutputType = inputData.outputType || dimensions.outputType || "website";
        const effectiveIndustry = inputData.industry || dimensions.industry || undefined;
        const effectiveMood = inputData.mood?.length
          ? inputData.mood
          : dimensions.moodAestheticTags.length > 0
            ? dimensions.moodAestheticTags
            : undefined;

        const taxonomyPath = `${import.meta.dir}/../../../../references/TAXONOMY.yaml`;
        const taxonomyText = yield* Effect.tryPromise({
          try: async () => Bun.file(taxonomyPath).text(),
          catch: () => new Error("Failed to read taxonomy"),
        });
        const { parse } = yield* Effect.tryPromise({
          try: async () => import("yaml"),
          catch: () => new Error("Failed to import yaml"),
        });
        const taxonomy = parse(taxonomyText) as Record<string, unknown>;

        const resolved = yield* resolveStyle(taxonomy, {
          outputType: effectiveOutputType,
          industry: effectiveIndustry,
          mood: effectiveMood,
          _userIntent: inputData.userIntent,
          dialOverrides: inputData.dialOverrides as Record<string, number> | undefined,
          hasReferenceImage: inputData.hasReferenceImage,
        });

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "resolve-style", status: "complete" }),
          catch: () => new Error("writer failed"),
        });

        return {
          styleId: resolved.id,
          dials: resolved.dials as Record<string, number>,
          conventionBreak: {
            applied: resolved.conventionBreak.applied,
            text: resolved.conventionBreak.breakText,
          },
          recommendedChain: resolved.recommendedChain,
          palette: Object.values(resolved.designSystemParameters).slice(0, 5),
          promptTokens: resolved.generativeAi.positivePrompt,
          motionSignature: resolved.motionSignature,
          premiumPatterns: resolved.premiumPatterns,
          negativePrompt: resolved.generativeAi.negativePrompt,
          specificity,
          enhancement,
        };
      }),
    ),
});
