/**
 * hook-logger.ts — Universal multi-color hook logger.
 * Dual-stream output: stderr (always) + stdout (for non-PreToolUse hooks).
 * Zero file I/O, zero network, pure string formatting.
 *
 * Usage from TypeScript hooks:
 *   import { logHook, logHookBoth } from "./hook-logger";
 *   logHook("PreToolUse", "Bash", "PASS", "no violations");
 *
 * Usage from inline hooks (CLI):
 *   bun run .../hooks/hook-logger.ts SessionStart startup INFO "rules loaded"
 */
import { Effect } from "effect";

const EVENT_COLORS: Record<string, string> = {
  SessionStart: "\x1b[96m",
  InstructionsLoaded: "\x1b[36m",
  UserPromptSubmit: "\x1b[94m",
  PreToolUse: "\x1b[33m",
  PostToolUse: "\x1b[32m",
  PostToolUseFailure: "\x1b[31m",
  Notification: "\x1b[95m",
  SubagentStart: "\x1b[35m",
  SubagentStop: "\x1b[2;35m",
  Stop: "\x1b[1;37m",
  StopFailure: "\x1b[1;31m",
  ConfigChange: "\x1b[93m",
  CwdChanged: "\x1b[92m",
  FileChanged: "\x1b[93m",
  PreCompact: "\x1b[2m",
  PostCompact: "\x1b[2m",
  SessionEnd: "\x1b[2;96m",
};

const STATUS_COLORS: Record<string, string> = {
  PASS: "\x1b[32m",
  DENY: "\x1b[31m",
  ERROR: "\x1b[91m",
  INFO: "\x1b[36m",
  SKIP: "\x1b[2m",
};

const R = "\x1b[0m";
const D = "\x1b[2m";

export type HookStatus = "PASS" | "DENY" | "ERROR" | "INFO" | "SKIP";

function formatLine(
  event: string,
  matcher: string,
  status: HookStatus,
  detail?: string,
): string {
  const ec = EVENT_COLORS[event] ?? "\x1b[37m";
  const sc = STATUS_COLORS[status] ?? "\x1b[37m";
  const ts = new Date().toISOString().slice(11, 19);
  const det = detail ? ` ${D}${detail}${R}` : "";
  return `${D}${ts}${R} ${ec}[ookd:${event}::${matcher}]${R} ${sc}${status}${R}${det}`;
}

/** Log to stderr only. Use for PreToolUse hooks that output JSON to stdout. */
export function logHook(
  event: string,
  matcher: string,
  status: HookStatus,
  detail?: string,
): void {
  const line = formatLine(event, matcher, status, detail);
  Effect.runSync(Effect.sync(() => {
    console.error(line);
  }));
}

/** Log to both stderr and stdout. Use for all non-PreToolUse hooks. */
export function logHookBoth(
  event: string,
  matcher: string,
  status: HookStatus,
  detail?: string,
): void {
  const line = formatLine(event, matcher, status, detail);
  Effect.runSync(Effect.sync(() => {
    console.error(line);
    console.log(line);
  }));
}

if (import.meta.main) {
  const [event = "Unknown", matcher = "*", status = "INFO", ...rest] =
    Bun.argv.slice(2);
  const detail = rest.join(" ") || undefined;
  logHookBoth(event, matcher, status as HookStatus, detail);
}
