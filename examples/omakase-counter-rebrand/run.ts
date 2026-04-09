/**
 * Omakase Counter Rebrand — website pipeline: wabi-sabi style
 *
 * Full pipeline: brief → resolveStyle → selectModel → buildCrafterContext →
 *   fal.ai generation → E2B post-processing (WebP convert) → real quality scoring → audit log
 *
 * Run: bun run examples/omakase-counter-rebrand/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { parse as parseYaml } from "yaml";
import { resolveStyle } from "../../.claude/skills/one-of-a-kind-design/scripts/resolve-style";
import { selectModel } from "../../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";
import {
  E2bSandboxService,
  E2bSandboxDefaultLayer,
} from "../../.claude/skills/one-of-a-kind-design/scripts/e2b-sandbox-manager";
import {
  logAuditEntry,
  buildAuditEntry,
} from "../../.claude/skills/one-of-a-kind-design/scripts/audit-logger";
import { computeRealScores, computeFallbackScores } from "../lib/real-scoring";

// --- Step 1: Load brief ---

const loadBrief = Effect.tryPromise({
  try: async () => {
    const path = new URL("./brief.yaml", import.meta.url).pathname;
    const text = await Bun.file(path).text();
    return parseYaml(text) as Record<string, unknown>;
  },
  catch: (e) => new Error(`Failed to load brief: ${e}`),
});

// --- Step 2: Load taxonomy ---

const loadTaxonomy = Effect.tryPromise({
  try: async () => {
    const path = new URL(
      "../../.claude/skills/one-of-a-kind-design/references/TAXONOMY.yaml",
      import.meta.url,
    ).pathname;
    const text = await Bun.file(path).text();
    return parseYaml(text) as Record<string, unknown>;
  },
  catch: (e) => new Error(`Failed to load taxonomy: ${e}`),
});

// --- Step 3: Resolve style + select model ---

const resolveAndSelect = (brief: Record<string, unknown>, taxonomy: Record<string, unknown>) =>
  Effect.gen(function* () {
    const dials = brief.dials as Record<string, number>;
    const resolved = yield* resolveStyle(taxonomy, {
      styleId: brief.style as string,
      audience: brief.audience as string,
      mood: brief.mood as string[],
      industry: brief.industry as string,
      dialOverrides: dials,
    });
    yield* Console.log(`[1/7] Style resolved: ${resolved.id} (${resolved.name})`);

    const selection = selectModel(resolved.id, "image", "pro");
    yield* Console.log(`[2/7] Model: ${selection.primary.name}`);
    return { resolved, selection };
  });

// --- Step 4: Build prompt + generate ---

const SAFE_IMAGE_ENDPOINT = "fal-ai/flux-pro/v1.1-ultra";

const generateWithFallback = (
  endpoint: string,
  fallback: string,
  prompt: string,
  params: Record<string, unknown>,
) =>
  pipe(
    runFalGeneration({ endpoint, prompt, params }),
    Effect.catchAll(() =>
      pipe(Console.log(`  Primary 404, trying fallback...`), Effect.flatMap(() =>
        runFalGeneration({ endpoint: fallback, prompt, params }),
      )),
    ),
    Effect.catchAll(() =>
      pipe(Console.log(`  Fallback 404, using safe endpoint...`), Effect.flatMap(() =>
        runFalGeneration({ endpoint: SAFE_IMAGE_ENDPOINT, prompt, params }),
      )),
    ),
  );

const buildAndGenerate = (
  resolved: { id: string; name: string; [k: string]: unknown },
  endpoint: string,
  fallback: string,
  intent: string,
) =>
  Effect.gen(function* () {
    const promptId = buildPromptId("image-gen", resolved.id, intent);
    yield* Console.log(`[3/7] Prompt ID: ${promptId}`);

    const context = buildCrafterContext("image-gen", resolved, intent);
    yield* Console.log(`[4/7] Crafter context: ${context.length} chars`);

    yield* Console.log("[5/7] Calling fal.ai for hero asset...");
    const result = yield* generateWithFallback(
      endpoint, fallback, intent, { image_size: "portrait_4_3", seed: 42 },
    );
    yield* Console.log(`  URL: ${result.url}`);
    yield* Console.log(`  Seed: ${result.seed} | Timing: ${result.timing}ms`);
    return { result, promptId };
  });

// --- Step 5: E2B post-processing ---

const postProcess = (imageUrl: string) =>
  Effect.gen(function* () {
    yield* Console.log("[6/7] E2B sandbox: downloading + converting to WebP...");
    const e2b = yield* E2bSandboxService;
    const processed = yield* e2b.withSandbox((sandbox) =>
      Effect.gen(function* () {
        const execResult = yield* e2b.exec(
          sandbox,
          `
import urllib.request
urllib.request.urlretrieve("${imageUrl}", "/tmp/hero.png")
import os
size = os.path.getsize("/tmp/hero.png")
print(f"Downloaded: {size} bytes")
`,
        );
        yield* Console.log(`  E2B: ${execResult.stdout.trim()}`);
        const sizeMatch = execResult.stdout.match(/(\d+) bytes/);
        return sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
      }),
    );
    return processed;
  });

// --- Step 6: Real quality scoring ---

const scoreQuality = (
  artifactUrl: string,
  prompt: string,
  styleId: string,
  fileSizeBytes: number,
  conventionBreakApplied: boolean,
) =>
  Effect.gen(function* () {
    yield* Console.log("[7/7] Quality scoring...");

    const scores = yield* pipe(
      computeRealScores({
        artifactUrl,
        prompt,
        styleId,
        jobType: "image-gen",
        fileSizeBytes,
        conventionBreakApplied,
      }),
      Effect.catchAll((err) =>
        Effect.gen(function* () {
          yield* Console.log(`  Vision scoring failed: ${err.message}, using fallback`);
          return computeFallbackScores(fileSizeBytes, "image-gen", conventionBreakApplied);
        }),
      ),
    );

    const report = computeComposite(scores);
    yield* Console.log(report.scoreCard);
    return report;
  });

// --- Main pipeline ---

const pipeline = Effect.gen(function* () {
  yield* Console.log("=== Omakase Counter Rebrand: Website Pipeline ===\n");

  const brief = yield* loadBrief;
  const taxonomy = yield* loadTaxonomy;
  const intent = (brief.hero as Record<string, string>).description;

  const { resolved, selection } = yield* resolveAndSelect(brief, taxonomy);
  const { result, promptId } = yield* buildAndGenerate(
    resolved as unknown as { id: string; name: string },
    selection.primary.endpoint,
    selection.fallback.endpoint,
    intent,
  );

  const fileSize = yield* pipe(
    postProcess(result.url),
    Effect.catchAll(() => Effect.succeed(0)),
  );

  const report = yield* scoreQuality(
    result.url, intent, resolved.id, fileSize, resolved.conventionBreak.applied,
  );

  yield* logAuditEntry(
    buildAuditEntry("fal-generate", selection.primary.endpoint, intent, result.timing, {
      seed: result.seed,
      url: result.url,
      quality: report.composite,
    }),
  );
  yield* Console.log(`\nAudit logged. Prompt ID: ${promptId}`);
  yield* Console.log(`Composite: ${report.composite}/10 — ${report.passed ? "PASS" : "FAIL"}`);
});

const program = pipe(pipeline, Effect.provide(E2bSandboxDefaultLayer));

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Pipeline failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
