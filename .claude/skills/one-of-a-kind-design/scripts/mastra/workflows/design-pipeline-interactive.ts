/**
 * design-pipeline-interactive.ts — Interactive design pipeline with human-in-the-loop.
 * Suspends at quality gate when score < 7.0 for user decision.
 */

import { createWorkflow } from "@mastra/core/workflows";
import type { Effect } from "effect";
import { z } from "zod";
import { craftPromptStep } from "./steps/craft-prompt-step.js";
import { generateStep } from "./steps/generate-step.js";
import { persistContextStep } from "./steps/persist-context-step.js";
import { postProcessStep } from "./steps/post-process-step.js";
import { qualityGateInteractiveStep } from "./steps/quality-gate-interactive.js";
import { resolveStyleStep } from "./steps/resolve-style-step.js";
import { scoreStep } from "./steps/score-step.js";
import { selectModelsStep } from "./steps/select-models-step.js";
import { verifyStep } from "./steps/verify-step.js";

export type EffectRef = Effect.Effect<void>;

const inputSchema = z.object({
  outputType: z.string(),
  industry: z.string().optional(),
  mood: z.array(z.string()).optional(),
  userIntent: z.string(),
  dialOverrides: z.record(z.string(), z.number()).optional(),
  projectId: z.string().optional(),
});

const outputSchema = z.object({
  artifactUrl: z.string(),
  compositeScore: z.number(),
  passed: z.boolean(),
  styleId: z.string(),
  persisted: z.boolean(),
});

export const designPipelineInteractive = createWorkflow({
  id: "design-pipeline-interactive",
  description: "Interactive design pipeline with suspend/resume quality gate",
  inputSchema,
  outputSchema,
  steps: [
    resolveStyleStep,
    selectModelsStep,
    craftPromptStep,
    generateStep,
    postProcessStep,
    verifyStep,
    scoreStep,
    qualityGateInteractiveStep,
    persistContextStep,
  ],
})
  .then(resolveStyleStep)
  .then(selectModelsStep)
  .then(craftPromptStep)
  .then(generateStep)
  .then(postProcessStep)
  .then(verifyStep)
  .then(scoreStep)
  .then(qualityGateInteractiveStep)
  .then(persistContextStep)
  .commit();
