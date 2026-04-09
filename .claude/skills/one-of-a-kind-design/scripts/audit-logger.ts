/**
 * audit-logger.ts — Append-only structured log for API calls and sandbox operations.
 * Every fal.ai call, E2B session, quality score, and style resolution is logged.
 */
import { Effect } from "effect";

interface AuditEntry {
  readonly timestamp: string;
  readonly operation: "fal-generate" | "e2b-sandbox" | "quality-score" | "style-resolve";
  readonly promptHash: string;
  readonly endpoint: string;
  readonly seed: number | null;
  readonly resultUrl: string | null;
  readonly alignmentScore: number | null;
  readonly qualityScore: number | null;
  readonly durationMs: number;
  readonly success: boolean;
  readonly error: string | null;
}

const AUDIT_LOG_PATH = new URL("../../audit.log", import.meta.url).pathname;

function hashPrompt(input: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(input);
  return hasher.digest("hex");
}

function logAuditEntry(entry: AuditEntry): Effect.Effect<void, Error> {
  return Effect.tryPromise({
    try: async () => {
      const line = `${JSON.stringify(entry)}\n`;
      const file = Bun.file(AUDIT_LOG_PATH);
      const existing = (await file.exists()) ? await file.text() : "";
      await Bun.write(AUDIT_LOG_PATH, existing + line);
    },
    catch: (e) => new Error(`Failed to write audit log: ${e}`),
  });
}

function parseLogLines(text: string): AuditEntry[] {
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => Effect.runSync(Effect.try(() => JSON.parse(line) as AuditEntry)));
}

function readAuditLog(): Effect.Effect<AuditEntry[], Error> {
  return Effect.tryPromise({
    try: async () => {
      const file = Bun.file(AUDIT_LOG_PATH);
      if (!(await file.exists())) return [];
      return parseLogLines(await file.text());
    },
    catch: (e) => new Error(`Failed to read audit log: ${e}`),
  });
}

function buildAuditEntry(
  operation: AuditEntry["operation"],
  endpoint: string,
  prompt: string,
  durationMs: number,
  result: {
    seed?: number | null;
    url?: string | null;
    alignment?: number | null;
    quality?: number | null;
    error?: string | null;
  },
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    operation,
    promptHash: hashPrompt(prompt),
    endpoint,
    seed: result.seed ?? null,
    resultUrl: result.url ?? null,
    alignmentScore: result.alignment ?? null,
    qualityScore: result.quality ?? null,
    durationMs,
    success: result.error == null,
    error: result.error ?? null,
  };
}

export type { AuditEntry };
export { AUDIT_LOG_PATH, buildAuditEntry, hashPrompt, logAuditEntry, readAuditLog };
