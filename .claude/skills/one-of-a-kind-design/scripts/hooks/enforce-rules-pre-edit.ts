/**
 * enforce-rules-pre-edit.ts — PreToolUse hook for Edit tool.
 * Validates tool_input.new_string against all 3 rules before edit is applied.
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
    try: () => JSON.parse(input) as { tool_input?: { file_path?: string; new_string?: string } },
    catch: () => new Error("Failed to parse stdin"),
  });

  const filePath = parsed?.tool_input?.file_path ?? "";
  const newString = parsed?.tool_input?.new_string ?? "";

  if (!filePath.endsWith(".ts") || filePath.endsWith(".test.ts")) {
    logHook("PreToolUse", "Edit", "SKIP", filePath.split("/").pop() ?? "");
    return;
  }

  logHook("PreToolUse", "Edit", "INFO", `checking: ${filePath.split("/").pop() ?? ""}`);

  const report = enforceRules(newString, filePath);
  // Skip "Missing Effect import" since this is a partial edit
  const violations = report.violations.filter((v) => v.pattern !== "Missing Effect import");

  if (violations.length > 0) {
    const reasons = violations
      .slice(0, 5)
      .map((v) => `L${v.line} [${v.rule}] ${v.pattern} → ${v.replacement}`)
      .join("\n");

    logHook(
      "PreToolUse",
      "Edit",
      "DENY",
      `${violations.length} violations in ${filePath.split("/").pop() ?? ""}`,
    );
    yield* Effect.sync(() => {
      console.log(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: `Rule violations in edit to ${filePath}:\n${reasons}${violations.length > 5 ? `\n...and ${violations.length - 5} more` : ""}`,
          },
        }),
      );
    });
    return;
  }

  logHook("PreToolUse", "Edit", "PASS", filePath.split("/").pop() ?? "");
});

pipe(
  program,
  Effect.catchAll((e) =>
    Effect.sync(() => {
      logHook("PreToolUse", "Edit", "ERROR", e instanceof Error ? e.message : String(e));
    }),
  ),
  Effect.runPromise,
);
