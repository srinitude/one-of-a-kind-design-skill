/**
 * statusline.ts — Multi-color status line for one-of-a-kind-design skill.
 * Reads session JSON from stdin + workflow state from temp file.
 * Outputs ANSI-colored line with "|" separators. Model always shown.
 *
 * Idle:   Opus | ████░░░░ 42% | 3m 21s | ⎇ main
 * Active: Opus | ◈ Crafting Prompt | glassmorphism | Q:7.2 | ████░░░░ 42% | 3m 21s | ⎇ main
 */
import { Effect, pipe } from "effect";

const STATE_FILE = "/tmp/ookd-statusline-state.json";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightBlue: "\x1b[94m",
  brightYellow: "\x1b[93m",
  brightGreen: "\x1b[92m",
  brightRed: "\x1b[91m",
  dimWhite: "\x1b[2;37m",
};

interface SessionData {
  model?: { id?: string; display_name?: string };
  context_window?: {
    used_percentage?: number;
    remaining_percentage?: number;
    context_window_size?: number;
  };
  cost?: {
    total_cost_usd?: number;
    total_duration_ms?: number;
    total_api_duration_ms?: number;
  };
  rate_limits?: {
    five_hour?: { used_percentage?: number };
    seven_day?: { used_percentage?: number };
  };
  workspace?: { current_dir?: string; project_dir?: string };
  version?: string;
}

interface WorkflowState {
  step?: string;
  icon?: string;
  quality?: number;
  style?: string;
}

function contextBar(pct: number): string {
  const width = 8;
  const filled = Math.round((pct / 100) * width);
  const empty = width - filled;
  const color =
    pct >= 90
      ? C.red
      : pct >= 70
        ? C.brightYellow
        : pct >= 50
          ? C.yellow
          : C.green;
  return `${color}${"█".repeat(filled)}${C.dim}${"░".repeat(empty)}${C.reset} ${color}${pct}%${C.reset}`;
}

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const sep = `${C.dimWhite} | ${C.reset}`;

function buildLine(
  data: SessionData,
  state: WorkflowState,
  branch: string,
): string {
  const pct = Math.floor(data.context_window?.used_percentage ?? 0);
  const durationMs = data.cost?.total_duration_ms ?? 0;
  const ratePct = data.rate_limits?.five_hour?.used_percentage;
  const isSkillActive = !!state.step && state.step !== "Ready";
  const model = data.model?.display_name ?? "Claude";

  const parts: string[] = [];

  parts.push(`${C.bold}${C.cyan}${model}${C.reset}`);

  if (isSkillActive) {
    const icon = state.icon ?? "◈";
    parts.push(`${C.brightMagenta}${icon} ${state.step}${C.reset}`);
    if (state.style) {
      parts.push(`${C.brightCyan}${state.style}${C.reset}`);
    }
    if (state.quality !== undefined && state.quality !== null) {
      const qColor = state.quality >= 7.0 ? C.brightGreen : C.brightRed;
      parts.push(`${qColor}Q:${state.quality.toFixed(1)}${C.reset}`);
    }
  }

  parts.push(contextBar(pct));
  parts.push(`${C.dim}${formatDuration(durationMs)}${C.reset}`);

  if (branch) {
    parts.push(`${C.brightBlue}⎇ ${branch}${C.reset}`);
  }

  if (ratePct !== undefined && ratePct !== null && ratePct > 50) {
    const rColor = ratePct >= 80 ? C.red : C.yellow;
    parts.push(`${rColor}rate ${Math.round(ratePct)}%${C.reset}`);
  }

  return parts.join(sep);
}

const readState = (): Effect.Effect<WorkflowState, never, never> =>
  pipe(
    Effect.tryPromise({
      try: async () => {
        const file = Bun.file(STATE_FILE);
        if (!(await file.exists())) return "{}";
        const text = await file.text();
        return text.trim() || "{}";
      },
      catch: () => new Error("state file"),
    }),
    Effect.flatMap((text) =>
      Effect.try({
        try: () => JSON.parse(text) as WorkflowState,
        catch: () => new Error("state parse"),
      }),
    ),
    Effect.catchAll(() => Effect.succeed({} as WorkflowState)),
  );

const getGitBranch = (): Effect.Effect<string, never, never> =>
  pipe(
    Effect.try({
      try: () => {
        const proc = Bun.spawnSync(["git", "branch", "--show-current"], {
          stdout: "pipe",
          stderr: "ignore",
        });
        return proc.stdout.toString().trim();
      },
      catch: () => new Error("git branch"),
    }),
    Effect.catchAll(() => Effect.succeed("")),
  );

const program = Effect.gen(function* () {
  const input = yield* Effect.tryPromise({
    try: async () => Bun.stdin.text(),
    catch: () => new Error("stdin"),
  });

  const data = yield* Effect.try({
    try: () => JSON.parse(input) as SessionData,
    catch: () => new Error("parse"),
  });

  const state = yield* readState();
  const branch = yield* getGitBranch();
  const line = buildLine(data, state, branch);

  yield* Effect.sync(() => {
    console.log(line);
  });
});

pipe(
  program,
  Effect.catchAll(() => Effect.void),
  Effect.runPromise,
);
