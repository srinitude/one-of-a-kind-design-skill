/**
 * check-model-availability.ts — Probe all fal.ai model endpoints for availability.
 * Reads MODEL-REGISTRY-FAL.md and PIPELINE-MODELS.md, extracts endpoints,
 * sends lightweight probes, reports live/dead status.
 *
 * L6 fix: Model availability changes frequently; this script detects 404s.
 *
 * Run: bun run .claude/skills/one-of-a-kind-design/scripts/check-model-availability.ts
 */

import { Console, Effect, pipe } from "effect";

// --- Types ---

interface EndpointStatus {
  readonly endpoint: string;
  readonly status: "alive" | "dead" | "error";
  readonly httpStatus: number;
  readonly source: string;
  readonly checkedAt: string;
}

interface AvailabilityReport {
  readonly total: number;
  readonly alive: number;
  readonly dead: number;
  readonly errors: number;
  readonly deadEndpoints: readonly string[];
  readonly errorEndpoints: readonly string[];
  readonly checkedAt: string;
}

// --- Endpoint extraction from markdown ---

function extractEndpoints(
  markdown: string,
  source: string,
): { endpoint: string; source: string }[] {
  const results: { endpoint: string; source: string }[] = [];
  const pattern = /`(fal-ai\/[^`]+|bria\/[^`]+)`/g;
  let match: RegExpExecArray | null = pattern.exec(markdown);
  const seen = new Set<string>();

  while (match !== null) {
    const ep = match[1];
    if (!seen.has(ep)) {
      seen.add(ep);
      results.push({ endpoint: ep, source });
    }
    match = pattern.exec(markdown);
  }

  return results;
}

// --- Probe a single endpoint ---

function probeEndpoint(
  endpoint: string,
  source: string,
  apiKey: string,
): Effect.Effect<EndpointStatus, never> {
  return pipe(
    Effect.tryPromise({
      try: async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`https://queue.fal.run/${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Key ${apiKey}`,
          },
          body: JSON.stringify({}),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const alive = response.status !== 404;
        return {
          endpoint,
          status: alive ? "alive" : "dead",
          httpStatus: response.status,
          source,
          checkedAt: new Date().toISOString(),
        } as EndpointStatus;
      },
      catch: () => ({
        endpoint,
        status: "error" as const,
        httpStatus: 0,
        source,
        checkedAt: new Date().toISOString(),
      }),
    }),
    Effect.catchAll((e) => Effect.succeed(e as unknown as EndpointStatus)),
  );
}

// --- Batch probe with concurrency control ---

function probeAll(
  endpoints: { endpoint: string; source: string }[],
  apiKey: string,
): Effect.Effect<EndpointStatus[], never> {
  const batchSize = 10;
  const batches: { endpoint: string; source: string }[][] = [];

  for (let i = 0; i < endpoints.length; i += batchSize) {
    batches.push(endpoints.slice(i, i + batchSize));
  }

  return Effect.gen(function* () {
    const allResults: EndpointStatus[] = [];

    for (const batch of batches) {
      const batchEffects = batch.map((ep) => probeEndpoint(ep.endpoint, ep.source, apiKey));
      const batchResults = yield* Effect.all(batchEffects, {
        concurrency: batchSize,
      });
      allResults.push(...batchResults);
    }

    return allResults;
  });
}

// --- Build report ---

function buildReport(statuses: EndpointStatus[]): AvailabilityReport {
  const dead = statuses.filter((s) => s.status === "dead");
  const errors = statuses.filter((s) => s.status === "error");
  const alive = statuses.filter((s) => s.status === "alive");

  return {
    total: statuses.length,
    alive: alive.length,
    dead: dead.length,
    errors: errors.length,
    deadEndpoints: dead.map((s) => s.endpoint),
    errorEndpoints: errors.map((s) => s.endpoint),
    checkedAt: new Date().toISOString(),
  };
}

// --- Format report as string ---

function formatReport(report: AvailabilityReport): string {
  const lines: string[] = [
    "\n═══ MODEL AVAILABILITY REPORT ═══",
    `Total endpoints:  ${report.total}`,
    `Alive:            ${report.alive}`,
    `Dead (404):       ${report.dead}`,
    `Errors:           ${report.errors}`,
    `Checked at:       ${report.checkedAt}`,
  ];

  if (report.deadEndpoints.length > 0) {
    lines.push("\n--- Dead Endpoints (404) ---");
    for (const ep of report.deadEndpoints) {
      lines.push(`  x ${ep}`);
    }
  }

  if (report.errorEndpoints.length > 0) {
    lines.push("\n--- Error Endpoints (timeout/network) ---");
    for (const ep of report.errorEndpoints) {
      lines.push(`  ? ${ep}`);
    }
  }

  return lines.join("\n");
}

// --- CLI Entry ---

const SKILL_DIR = ".claude/skills/one-of-a-kind-design";

const program = Effect.gen(function* () {
  const apiKey = Bun.env.FAL_KEY;
  if (!apiKey) {
    return yield* Effect.fail(new Error("FAL_KEY environment variable is required"));
  }

  yield* Console.log("Reading model registries...");

  const registryContent = yield* Effect.tryPromise({
    try: () => Bun.file(`${SKILL_DIR}/references/MODEL-REGISTRY-FAL.md`).text(),
    catch: () => new Error("Failed to read MODEL-REGISTRY-FAL.md"),
  });

  const pipelineContent = yield* Effect.tryPromise({
    try: () => Bun.file(`${SKILL_DIR}/references/PIPELINE-MODELS.md`).text(),
    catch: () => new Error("Failed to read PIPELINE-MODELS.md"),
  });

  const registryEndpoints = extractEndpoints(registryContent, "MODEL-REGISTRY-FAL");
  const pipelineEndpoints = extractEndpoints(pipelineContent, "PIPELINE-MODELS");

  const allEndpoints = [...registryEndpoints, ...pipelineEndpoints];
  const uniqueEndpoints = allEndpoints.filter(
    (ep, idx, arr) => arr.findIndex((e) => e.endpoint === ep.endpoint) === idx,
  );

  yield* Console.log(
    `Found ${uniqueEndpoints.length} unique endpoints (${registryEndpoints.length} registry + ${pipelineEndpoints.length} pipeline, deduplicated)`,
  );
  yield* Console.log("Probing endpoints (batch size 10, 10s timeout)...");

  const statuses = yield* probeAll(uniqueEndpoints, apiKey);
  const report = buildReport(statuses);

  yield* Console.log(formatReport(report));
  yield* Console.log(`\n${JSON.stringify(report, null, 2)}`);
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Model availability check failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
