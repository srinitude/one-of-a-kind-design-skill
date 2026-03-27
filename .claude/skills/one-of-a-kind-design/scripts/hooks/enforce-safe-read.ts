/**
 * enforce-safe-read.ts — PreToolUse hook for Read tool.
 * Blocks reading .env files to prevent credential exposure.
 * Defense-in-depth alongside sandbox denyRead setting.
 */
import { Effect, pipe } from "effect";
import { logHook } from "./hook-logger";

const ENV_FILE_PATTERN = /(\/.env$|\/.env\.)|(^\.env$)|(^\.env\.)/;

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
  if (!filePath) {
    logHook("PreToolUse", "Read", "SKIP", "empty path");
    return;
  }

  if (ENV_FILE_PATTERN.test(filePath)) {
    logHook("PreToolUse", "Read", "DENY", `blocked .env read: ${filePath.split("/").pop() ?? ""}`);
    yield* Effect.sync(() => {
      console.log(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason:
              "Blocked: reading .env files. Use Bun.env or check-api-keys.ts instead.",
          },
        }),
      );
    });
    return;
  }

  logHook("PreToolUse", "Read", "PASS", filePath.split("/").pop() ?? "");
});

pipe(
  program,
  Effect.catchAll((e) =>
    Effect.sync(() => {
      logHook("PreToolUse", "Read", "ERROR", e instanceof Error ? e.message : String(e));
    }),
  ),
  Effect.runPromise,
);
