/**
 * design-pipeline-headless.ts — Fully autonomous design pipeline.
 * NO suspend anywhere. Quality gate auto-retries via time-travel.
 */

import { createWorkflow } from "@mastra/core/workflows";
import type { Effect } from "effect";
import { z } from "zod";
import { craftPromptStep } from "./steps/craft-prompt-step.js";
import { generateStep } from "./steps/generate-step.js";
import { persistContextStep } from "./steps/persist-context-step.js";
import { postProcessStep } from "./steps/post-process-step.js";
import { qualityGateHeadlessStep } from "./steps/quality-gate-headless.js";
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

export const designPipelineHeadless = createWorkflow({
  id: "design-pipeline-headless",
  description: "Fully autonomous design pipeline — no suspend, auto-retry, exit code 0/1",
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
    qualityGateHeadlessStep,
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
  .then(qualityGateHeadlessStep)
  .then(persistContextStep)
  .commit();
