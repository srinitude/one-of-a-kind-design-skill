/**
 * e2b-process.ts — Mastra tool wrapping E2B sandbox post-processing.
 * Delegates to the existing e2b-sandbox-manager.ts Effect service.
 * Includes safety validation (formerly enforce-bash-safety hook logic).
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

const BLOCKED_PATTERNS: readonly { regex: RegExp; reason: string }[] = [
  { regex: /\bsudo\b/, reason: "Elevated privileges not allowed in sandbox" },
  { regex: /\brm\s+-rf?\s+\//, reason: "Recursive root delete blocked" },
  { regex: /\b(curl|wget)\s+.*\|\s*(bash|sh)\b/, reason: "Remote code execution blocked" },
  { regex: /\beval\s*\(/, reason: "Dynamic eval blocked" },
  { regex: /FAL_KEY|E2B_API_KEY|QUIVERAI_API_KEY/, reason: "Credential exposure blocked" },
  { regex: /\/proc\//, reason: "Process filesystem access blocked" },
  { regex: /\bchmod\s+777/, reason: "World-writable permissions blocked" },
];

const validateCode = (code: string) =>
  Effect.gen(function* () {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.regex.test(code)) {
        yield* Effect.fail(new Error(`Safety violation: ${pattern.reason}`));
      }
    }
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
          yield* validateCode(input.code);

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
