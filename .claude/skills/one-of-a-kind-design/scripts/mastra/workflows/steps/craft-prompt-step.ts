/**
 * craft-prompt-step.ts — Uses prompt-crafter agent to craft generation prompts.
 * Input matches select-models-step output.
 */

import { createStep } from "@mastra/core/workflows";
import { Effect } from "effect";
import { z } from "zod";
import { buildCrafterContext, buildPromptId } from "../../../generate-api-prompt.js";

const inputSchema = z.object({
  chain: z.string(),
  models: z.array(
    z.object({
      step: z.string(),
      endpoint: z.string(),
      name: z.string(),
      tier: z.string(),
    }),
  ),
  reason: z.string(),
});

const outputSchema = z.object({
  craftedPrompt: z.string(),
  negativePrompt: z.string(),
  model: z.string(),
  pipelineStage: z.string(),
  promptId: z.string(),
  params: z.record(z.string(), z.unknown()),
});

export const craftPromptStep = createStep({
  id: "craft-prompt",
  description: "Craft optimized generation prompt using agent and style context",
  inputSchema,
  outputSchema,
  execute: ({ inputData, mastra, writer, getInitData }) =>
    Effect.runPromise(
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "craft-prompt", status: "running" }),
          catch: () => new Error("writer failed"),
        });

        const initData = getInitData<{
          userIntent: string;
          outputType: string;
          dialOverrides?: Record<string, number>;
        }>();

        const stage = (initData.outputType ?? "image") === "video" ? "video-gen" : "image-gen";
        const styleData = { id: "resolved" };
        const context = buildCrafterContext(stage, styleData, initData.userIntent ?? "");
        const promptId = buildPromptId(stage, "resolved", initData.userIntent ?? "");

        const agent = mastra.getAgent("prompt-crafter");
        const result = yield* Effect.tryPromise({
          try: async () => agent.generate(context),
          catch: (e) => new Error(`Agent generation failed: ${e}`),
        });

        yield* Effect.tryPromise({
          try: async () =>
            writer.write({ type: "step-progress", step: "craft-prompt", status: "complete" }),
          catch: () => new Error("writer failed"),
        });

        const primaryEndpoint = inputData.models[0]?.endpoint ?? "fal-ai/flux-pro/v1.1-ultra";

        return {
          craftedPrompt: result.text,
          negativePrompt: "",
          model: primaryEndpoint,
          pipelineStage: stage,
          promptId,
          params: { image_size: "landscape_16_9" },
        };
      }),
    ),
});
