/**
 * enforce-bash-safety.ts — PreToolUse hook for Bash commands.
 * Comprehensive safety gate: runtime enforcement + destructive commands +
 * dangerous git operations + code injection patterns.
 * Replaces enforce-bun-only-bash.ts with full deny-list coverage.
 */
import { Effect, pipe } from "effect";
import { logHook } from "./hook-logger";

interface SafetyPattern {
  readonly regex: RegExp;
  readonly name: string;
  readonly reason: string;
}

// Category A: Runtime enforcement (Bun-only project)
const RUNTIME_PATTERNS: readonly SafetyPattern[] = [
  { regex: /\bnode\s+/, name: "node", reason: "Use bun instead." },
  { regex: /\bnpm\s+(install|run|test|exec|start|build|ci)\b/, name: "npm", reason: "Use bun instead." },
  { regex: /\bnpx\s+/, name: "npx", reason: "Use bunx instead." },
  { regex: /\byarn\s+/, name: "yarn", reason: "Use bun instead." },
  { regex: /\bpnpm\s+/, name: "pnpm", reason: "Use bun instead." },
  { regex: /\bdeno\s+/, name: "deno", reason: "Use bun instead." },
  { regex: /\btsx\s+/, name: "tsx", reason: "Use bun instead." },
  { regex: /\bts-node\s+/, name: "ts-node", reason: "Use bun instead." },
];

// Category B: Destructive system commands
const DESTRUCTIVE_PATTERNS: readonly SafetyPattern[] = [
  { regex: /\bsudo\s/, name: "sudo", reason: "Elevated privileges not allowed." },
  { regex: /\bsu\s+-/, name: "su -", reason: "User switching not allowed." },
  { regex: /\brm\b[^|]*-[^\s]*[rR][^\s]*\s+\/(\s|$|\*)/, name: "rm -r /", reason: "Recursive delete of root blocked." },
  { regex: /\brm\b[^|]*-[^\s]*[rR][^\s]*\s+\.(\s|$|[;&|])/, name: "rm -r .", reason: "Recursive delete of cwd blocked." },
  { regex: /\brm\b[^|]*-[^\s]*[rR][^\s]*\s+~(\s|$|[;&|]|\/\*)/, name: "rm -r ~", reason: "Recursive delete of home blocked." },
  { regex: /\bchmod\s+777/, name: "chmod 777", reason: "World-writable permissions not allowed." },
  { regex: /\bchown\s/, name: "chown", reason: "Ownership changes not allowed." },
];

// Category C: Dangerous git operations
const GIT_DANGER_PATTERNS: readonly SafetyPattern[] = [
  { regex: /\bgit\s+push\s+(-[^\s]*f|--force)/, name: "git push --force", reason: "Force push blocked. Use --force-with-lease." },
  { regex: /\bgit\s+reset\s+--hard/, name: "git reset --hard", reason: "Hard reset blocked. Use git stash or soft reset." },
  { regex: /\bgit\s+clean\s+-[^\s]*f[^\s]*d/, name: "git clean -fd", reason: "Forced clean blocked. Review untracked files first." },
  { regex: /\bgit\s+branch\s+-D/, name: "git branch -D", reason: "Force branch delete blocked. Use -d for safe delete." },
];

// Category D: Code injection / remote execution
const INJECTION_PATTERNS: readonly SafetyPattern[] = [
  { regex: /\b(curl|wget)\s+.*\|\s*(bash|sh)\b/, name: "pipe to shell", reason: "Remote code execution blocked." },
  { regex: /\beval\s+["'`$]/, name: "eval", reason: "Dynamic code evaluation blocked." },
];

const ALL_PATTERNS: readonly SafetyPattern[] = [
  ...RUNTIME_PATTERNS,
  ...DESTRUCTIVE_PATTERNS,
  ...GIT_DANGER_PATTERNS,
  ...INJECTION_PATTERNS,
];

const denyOutput = (pattern: SafetyPattern) => ({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: `Blocked: "${pattern.name}" detected. ${pattern.reason}`,
  },
});

const program = Effect.gen(function* () {
  const input = yield* Effect.tryPromise({
    try: async () => Bun.stdin.text(),
    catch: () => new Error("Failed to read stdin"),
  });

  const parsed = yield* Effect.try({
    try: () => JSON.parse(input) as { tool_input?: { command?: string } },
    catch: () => new Error("Failed to parse stdin"),
  });

  const command = parsed?.tool_input?.command ?? "";
  if (!command) {
    logHook("PreToolUse", "Bash", "SKIP", "empty command");
    return;
  }

  logHook("PreToolUse", "Bash", "INFO", `checking: ${command.slice(0, 60)}`);

  for (const pattern of ALL_PATTERNS) {
    if (pattern.regex.test(command)) {
      logHook("PreToolUse", "Bash", "DENY", `${pattern.name}: ${pattern.reason}`);
      yield* Effect.sync(() => {
        console.log(JSON.stringify(denyOutput(pattern)));
      });
      return;
    }
  }

  logHook("PreToolUse", "Bash", "PASS");
});

pipe(
  program,
  Effect.catchAll((e) => Effect.sync(() => {
    logHook("PreToolUse", "Bash", "ERROR", e instanceof Error ? e.message : String(e));
  })),
  Effect.runPromise,
);
