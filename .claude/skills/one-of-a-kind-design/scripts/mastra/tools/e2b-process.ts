/**
 * e2b-process.ts — Mastra tool wrapping E2B sandbox post-processing.
 * Delegates to the existing e2b-sandbox-manager.ts Effect service.
 */

import { createTool } from "@mastra/core/tools";
import { Effect, pipe } from "effect";
import { z } from "zod";
import { E2bSandboxLive, E2bSandboxService } from "../../e2b-sandbox-manager.js";

const inputSchema = z.object({
  code: z.string().describe("JavaScript/TypeScript code to execute in sandbox"),
  inputFiles: z
    .array(z.object({ url: z.string(), remotePath: z.string() }))
    .optional()
    .describe("Files to upload before execution"),
  outputPaths: z.array(z.string()).optional().describe("Remote paths to download after execution"),
});

const outputSchema = z.object({
  stdout: z.string().describe("Standard output from execution"),
  stderr: z.string().describe("Standard error from execution"),
  exitCode: z.number().describe("Exit code (0 = success)"),
  artifacts: z.array(z.string()).describe("URLs of output artifacts"),
});

const sandboxLayer = E2bSandboxLive({
  apiKey: Bun.env.E2B_API_KEY ?? "",
  timeoutMs: 300_000,
});

export const e2bProcessTool = createTool({
  id: "e2b-process",
  description: "Execute code in an isolated E2B sandbox for post-processing (sharp, potrace, etc.)",
  inputSchema,
  outputSchema,
  execute: (input) =>
    Effect.runPromise(
      pipe(
        Effect.gen(function* () {
          const svc = yield* E2bSandboxService;
          return yield* svc.withSandbox((sandbox) =>
            Effect.gen(function* () {
              const execResult = yield* svc.exec(sandbox, input.code);
              return {
                stdout: execResult.stdout,
                stderr: execResult.stderr,
                exitCode: execResult.exitCode,
                artifacts: execResult.artifacts,
              };
            }),
          );
        }),
        Effect.provide(sandboxLayer),
      ),
    ),
});
