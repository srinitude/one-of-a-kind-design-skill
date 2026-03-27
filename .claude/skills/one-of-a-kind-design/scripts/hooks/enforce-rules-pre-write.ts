/**
 * enforce-rules-pre-write.ts — PreToolUse hook for Write tool.
 * Validates tool_input.content against all 3 rules before file is written.
 * Only checks .ts files (skips test files).
 */
import { Effect, pipe } from "effect";
import { enforceRules } from "../enforce-rules";
import { logHook } from "./hook-logger";

const program = Effect.gen(function* () {
  const input = yield* Effect.tryPromise({
    try: async () => Bun.stdin.text(),
    catch: () => new Error("Failed to read stdin"),
  });

  const parsed = yield* Effect.try({
    try: () => JSON.parse(input) as { tool_input?: { file_path?: string; content?: string } },
    catch: () => new Error("Failed to parse stdin"),
  });

  const filePath = parsed?.tool_input?.file_path ?? "";
  const content = parsed?.tool_input?.content ?? "";

  if (!filePath.endsWith(".ts") || filePath.endsWith(".test.ts")) {
    logHook("PreToolUse", "Write", "SKIP", filePath.split("/").pop() ?? "");
    return;
  }

  logHook("PreToolUse", "Write", "INFO", `checking: ${filePath.split("/").pop() ?? ""}`);

  const report = enforceRules(content, filePath);

  if (!report.passed) {
    const reasons = report.violations
      .slice(0, 5)
      .map((v) => `L${v.line} [${v.rule}] ${v.pattern} → ${v.replacement}`)
      .join("\n");

    logHook("PreToolUse", "Write", "DENY", `${report.violations.length} violations in ${filePath.split("/").pop() ?? ""}`);
    yield* Effect.sync(() => {
      console.log(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: `Rule violations in ${filePath}:\n${reasons}${report.violations.length > 5 ? `\n...and ${report.violations.length - 5} more` : ""}`,
        },
      }));
    });
    return;
  }

  logHook("PreToolUse", "Write", "PASS", filePath.split("/").pop() ?? "");
});

pipe(
  program,
  Effect.catchAll((e) => Effect.sync(() => {
    logHook("PreToolUse", "Write", "ERROR", e instanceof Error ? e.message : String(e));
  })),
  Effect.runPromise,
);
