/**
 * mcp/server.ts — MCP server exposing tools:
 * design-generate, design-resolve-style, design-score, design-verify.
 */

import { createTool } from "@mastra/core/tools";
import { Effect } from "effect";
import { z } from "zod";

export type MCPRef = Effect.Effect<void>;

export const designGenerateTool = createTool({
  id: "design-generate",
  description:
    "Generate a one-of-a-kind design asset. Supports websites, apps, images, SVGs, videos, mobile screens.",
  inputSchema: z.object({
    userIntent: z.string().describe("What to design, in natural language"),
    outputType: z
      .enum(["website", "web-app", "image", "svg", "video", "mobile-app"])
      .describe("Type of output"),
    industry: z.string().optional().describe("Industry context"),
    mood: z.array(z.string()).optional().describe("Mood keywords"),
    projectId: z.string().optional().describe("Project ID for context persistence"),
  }),
  outputSchema: z.object({
    artifactUrl: z.string(),
    compositeScore: z.number(),
    styleId: z.string(),
    chain: z.string(),
  }),
  execute: (input) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { runHeadless } = yield* Effect.tryPromise({
          try: () => import("../modes/headless.js"),
          catch: (e) => new Error(`Failed to import headless mode: ${e}`),
        });

        const result = yield* Effect.tryPromise({
          try: () => runHeadless(input),
          catch: (e) => new Error(`Pipeline execution failed: ${e}`),
        });

        return {
          artifactUrl: result.result?.artifactUrl ?? "",
          compositeScore: result.result?.compositeScore ?? 0,
          styleId: result.result?.styleId ?? "",
          chain: result.result?.chain ?? "",
        };
      }),
    ),
});

export const designResolveStyleTool = createTool({
  id: "design-resolve-style",
  description: "Resolve a design style from user intent without generating an artifact.",
  inputSchema: z.object({
    userIntent: z.string().describe("What to design, in natural language"),
    outputType: z.string().describe("Type of output"),
    industry: z.string().optional(),
  }),
  outputSchema: z.object({
    styleId: z.string(),
    palette: z.array(z.string()),
    chain: z.string(),
    motionSignature: z.string(),
  }),
  execute: (input) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { resolveStyle } = yield* Effect.tryPromise({
          try: () => import("../../resolve-style.js"),
          catch: (e) => new Error(`Failed to import resolve-style: ${e}`),
        });

        const taxonomyPath = `${import.meta.dir}/../../../assets/TAXONOMY.yaml`;
        const taxonomyText = yield* Effect.tryPromise({
          try: () => Bun.file(taxonomyPath).text(),
          catch: () => new Error("Failed to read taxonomy"),
        });
        const { parse } = yield* Effect.tryPromise({
          try: () => import("yaml"),
          catch: () => new Error("Failed to import yaml"),
        });
        const taxonomy = parse(taxonomyText) as Record<string, unknown>;

        const resolved = yield* resolveStyle(taxonomy, {
          outputType: input.outputType,
          industry: input.industry,
          _userIntent: input.userIntent,
        });

        return {
          styleId: resolved.id,
          palette: Object.values(resolved.designSystemParameters).slice(0, 5) as string[],
          chain: resolved.recommendedChain,
          motionSignature: resolved.motionSignature,
        };
      }),
    ),
});

export const designScoreTool = createTool({
  id: "design-score",
  description: "Score an existing image for quality using LLaVA vision model.",
  inputSchema: z.object({
    imageUrl: z.string().describe("URL of the image to score"),
    styleId: z.string().describe("Style ID for fidelity scoring"),
  }),
  outputSchema: z.object({
    composite: z.number(),
    passed: z.boolean(),
    scoreCard: z.string(),
  }),
  execute: (input) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { analyzeQuality } = yield* Effect.tryPromise({
          try: () => import("../../run-perceptual-quality.js"),
          catch: (e) => new Error(`Failed to import quality analyzer: ${e}`),
        });
        const { computeComposite } = yield* Effect.tryPromise({
          try: () => import("../../score-output-quality.js"),
          catch: (e) => new Error(`Failed to import score computation: ${e}`),
        });

        const perceptual = yield* analyzeQuality({
          imageUrl: input.imageUrl,
          styleId: input.styleId,
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

        return {
          composite: report.composite,
          passed: report.passed,
          scoreCard: report.scoreCard,
        };
      }),
    ),
});

export const designVerifyTool = createTool({
  id: "design-verify",
  description: "Verify an image with 4-layer verification (pixelmatch, SSIM, pHash, uniqueness).",
  inputSchema: z.object({
    generatedUrl: z.string().describe("URL of the generated image"),
    referenceUrl: z.string().nullable().describe("Optional reference image URL"),
  }),
  outputSchema: z.object({
    isUnique: z.boolean(),
    ssimIndex: z.number(),
    pHashSimilarity: z.number(),
  }),
  execute: (input) =>
    Effect.runPromise(
      Effect.gen(function* () {
        const { verifyImage } = yield* Effect.tryPromise({
          try: () => import("../../verify-image.js"),
          catch: (e) => new Error(`Failed to import verify-image: ${e}`),
        });

        const result = yield* verifyImage(input.generatedUrl, input.referenceUrl ?? null);

        return {
          isUnique: result.uniqueness.isUnique,
          ssimIndex: result.structuralSimilarity.ssimIndex,
          pHashSimilarity: result.perceptualHash.similarity,
        };
      }),
    ),
});

export const mcpTools: Record<string, ReturnType<typeof createTool>> = {
  "design-generate": designGenerateTool,
  "design-resolve-style": designResolveStyleTool,
  "design-score": designScoreTool,
  "design-verify": designVerifyTool,
};
