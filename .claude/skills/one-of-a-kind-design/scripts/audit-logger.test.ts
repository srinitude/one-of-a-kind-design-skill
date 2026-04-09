/**
 * audit-logger.test.ts — Tests for append-only audit logging.
 * TDD: RED -> GREEN -> REFACTOR
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Effect } from "effect";
import type { AuditEntry } from "./audit-logger";
import {
  AUDIT_LOG_PATH,
  buildAuditEntry,
  hashPrompt,
  logAuditEntry,
  readAuditLog,
} from "./audit-logger";

const TEST_LOG = AUDIT_LOG_PATH;

const sampleEntry: AuditEntry = {
  timestamp: "2026-04-09T12:00:00.000Z",
  operation: "fal-generate",
  promptHash: hashPrompt("test prompt"),
  endpoint: "fal-ai/flux-pro/v1.1-ultra",
  seed: 42,
  resultUrl: "https://fal.ai/result/abc123",
  alignmentScore: 8.5,
  qualityScore: 8.0,
  durationMs: 1500,
  success: true,
  error: null,
};

async function cleanLog() {
  const file = Bun.file(TEST_LOG);
  if (await file.exists()) {
    await Bun.write(TEST_LOG, "");
  }
}

describe("audit-logger", () => {
  beforeEach(async () => {
    await cleanLog();
  });

  afterEach(async () => {
    await cleanLog();
  });

  it("logAuditEntry writes a valid JSON line", async () => {
    await Effect.runPromise(logAuditEntry(sampleEntry));

    const raw = await Bun.file(TEST_LOG).text();
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);
    expect(lines.length).toBe(1);

    const parsed = JSON.parse(lines[0]) as AuditEntry;
    expect(parsed.operation).toBe("fal-generate");
    expect(parsed.endpoint).toBe("fal-ai/flux-pro/v1.1-ultra");
    expect(parsed.seed).toBe(42);
    expect(parsed.success).toBe(true);
  });

  it("readAuditLog round-trips entries correctly", async () => {
    await Effect.runPromise(logAuditEntry(sampleEntry));

    const secondEntry = { ...sampleEntry, operation: "e2b-sandbox" as const, seed: null };
    await Effect.runPromise(logAuditEntry(secondEntry));

    const entries = await Effect.runPromise(readAuditLog());
    expect(entries.length).toBe(2);
    expect(entries[0].operation).toBe("fal-generate");
    expect(entries[1].operation).toBe("e2b-sandbox");
    expect(entries[1].seed).toBeNull();
  });

  it("buildAuditEntry constructs valid entry", () => {
    const entry = buildAuditEntry("quality-score", "internal/scorer", "test prompt", 500, {
      quality: 8.0,
    });
    expect(entry.operation).toBe("quality-score");
    expect(entry.promptHash).toBe(hashPrompt("test prompt"));
    expect(entry.durationMs).toBe(500);
    expect(entry.success).toBe(true);
    expect(entry.error).toBeNull();
  });

  it("hashPrompt is deterministic", () => {
    const h1 = hashPrompt("same input");
    const h2 = hashPrompt("same input");
    expect(h1).toBe(h2);
    expect(h1.length).toBe(64);
  });

  it("readAuditLog returns empty array when no log file", async () => {
    await cleanLog();
    const entries = await Effect.runPromise(readAuditLog());
    expect(entries.length).toBe(0);
  });
});
