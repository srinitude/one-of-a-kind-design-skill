/**
 * enforce-rules-post-write.ts — PostToolUse hook for Write|Edit.
 * Runs full enforce-rules on the written file after save.
 * Catches issues that PreToolUse couldn't (e.g., edit combined with existing code).
 * Exits with code 2 on violations (blocking error per Claude Code hook spec).
 */
import { Effect, pipe } from "effect";
import { enforceRules } from "../enforce-rules";
import { logHookBoth } from "./hook-logger";

const program = Effect.gen(function* () {
  const input = yield* Effect.tryPromise({
    try: async () => Bun.stdin.text(),
    catch: () => new Error("Failed to read stdin"),
  });

  const parsed = yield* Effect.try({
    try: () => JSON.parse(input) as { tool_input?: { file_path?: string } },
    catch: () => new Error("Failed to parse stdin"),
  });

  const filePath = parsed?.tool_input?.file_path ?? "";

  const basename = filePath.split("/").pop() ?? "";

  if (!filePath.endsWith(".ts") || filePath.endsWith(".test.ts")) {
    logHookBoth("PostToolUse", "Write|Edit", "SKIP", basename);
    return;
  }

  // Skip files that contain rule patterns (false positives from regex definitions)
  const META_FILES = ["enforce-rules.ts", "validate-code-standards.ts", "ci-validate.ts"];
  if (META_FILES.includes(basename)) {
    logHookBoth("PostToolUse", "Write|Edit", "SKIP", `meta: ${basename}`);
    return;
  }

  logHookBoth("PostToolUse", "Write|Edit", "INFO", `validating: ${basename}`);

  const fileExists = yield* Effect.tryPromise({
    try: async () => Bun.file(filePath).exists(),
    catch: () => new Error("File check failed"),
  });

  if (!fileExists) return;

  const content = yield* Effect.tryPromise({
    try: async () => Bun.file(filePath).text(),
    catch: () => new Error("File read failed"),
  });

  const report = enforceRules(content, filePath);

  if (!report.passed) {
    const reasons = report.violations
      .slice(0, 8)
      .map((v) => `L${v.line} [${v.rule}] ${v.pattern} → ${v.replacement}`)
      .join("\n");

    const msg = `Rule violations in ${filePath} (${report.violations.length} total):\n${reasons}${report.violations.length > 8 ? `\n...and ${report.violations.length - 8} more` : ""}\nFix these violations before proceeding.`;

    logHookBoth(
      "PostToolUse",
      "Write|Edit",
      "DENY",
      `${report.violations.length} violations in ${basename}`,
    );
    yield* Effect.sync(() => {
      console.error(msg);
      process.exitCode = 2;
    });
    return;
  }

  logHookBoth("PostToolUse", "Write|Edit", "PASS", `${basename} (0 violations)`);
});

pipe(
  program,
  Effect.catchAll((e) =>
    Effect.sync(() => {
      logHookBoth("PostToolUse", "Write|Edit", "ERROR", e instanceof Error ? e.message : String(e));
    }),
  ),
  Effect.runPromise,
);
