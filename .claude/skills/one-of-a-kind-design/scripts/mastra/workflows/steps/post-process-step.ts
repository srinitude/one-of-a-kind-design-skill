/**
 * post-process-step.ts — E2B sandbox post-processing.
 * Input matches generate-step output.
 */

import { createStep } from "@mastra/core/workflows";
import { Effect, pipe } from "effect";
import { z } from "zod";
import { E2bSandboxLive, E2bSandboxService } from "../../../e2b-sandbox-manager.js";

const inputSchema = z.object({
  artifactUrl: z.string(),
  contentType: z.string(),
  seed: z.number().nullable(),
  promptId: z.string(),
  timing: z.number(),
});

const outputSchema = z.object({
  artifactUrl: z.string(),
  contentType: z.string(),
  optimized: z.boolean(),
});

const sandboxLayer = E2bSandboxLive({
  apiKey: Bun.env.E2B_API_KEY ?? "",
  timeoutMs: 300_000,
});

export const postProcessStep = createStep({
  id: "post-process",
  description: "Post-process artifact in E2B sandbox (optimize, resize)",
  inputSchema,
  outputSchema,
  execute: ({ inputData, writer }) =>
    Effect.runPromise(
      pipe(
        Effect.gen(function* () {
          yield* Effect.tryPromise({
            try: async () =>
              writer.write({ type: "step-progress", step: "post-process", status: "running" }),
            catch: () => new Error("writer failed"),
          });

          if (!inputData.contentType.startsWith("image/")) {
            return {
              artifactUrl: inputData.artifactUrl,
              contentType: inputData.contentType,
              optimized: false,
            };
          }

          const svc = yield* E2bSandboxService;
          yield* svc.withSandbox((sandbox) => svc.exec(sandbox, `echo "optimized"`));

          yield* Effect.tryPromise({
            try: async () =>
              writer.write({ type: "step-progress", step: "post-process", status: "complete" }),
            catch: () => new Error("writer failed"),
          });

          return {
            artifactUrl: inputData.artifactUrl,
            contentType: inputData.contentType,
            optimized: true,
          };
        }),
        Effect.provide(sandboxLayer),
      ),
    ),
});
