/**
 * user-invocations.ts — Full-pipeline test harness for 20+ user requests.
 * Runs: enhance → resolve → select → distill → generate → score → composite.
 * Output: JSONL to /home/user/workspace/test-results.jsonl + stdout summary.
 *
 * Run: bun run tests/user-invocations.ts
 */
import { Console, Effect, pipe } from "effect";
import { parse as parseYaml } from "yaml";
import {
  extractDimensions,
  computeSpecificity,
} from "../.claude/skills/one-of-a-kind-design/scripts/enhance-user-message";
import { resolveStyle } from "../.claude/skills/one-of-a-kind-design/scripts/resolve-style";
import { selectModel } from "../.claude/skills/one-of-a-kind-design/scripts/select-fal-models";
import { buildCrafterContext } from "../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { runFalGeneration } from "../.claude/skills/one-of-a-kind-design/scripts/run-fal-generation";
import { computeComposite } from "../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";
import { computeRealScores, computeFallbackScores } from "../examples/lib/real-scoring";
import { distillPrompt, distillNegative } from "../examples/lib/distill-prompt";

// --- Types ---

interface TestCase {
  readonly id: number;
  readonly prompt: string;
  readonly outputType: "website" | "web-app" | "mobile-app" | "image" | "svg" | "video";
}

interface TestResult {
  readonly test_id: number;
  readonly user_prompt: string;
  readonly resolved_style: string;
  readonly model_used: string;
  readonly distilled_prompt: string;
  readonly fal_url: string;
  readonly scores: Record<string, number | null>;
  readonly composite: number;
  readonly passed: boolean;
  readonly timing_ms: number;
  readonly error: string | null;
}

// --- Test Cases ---

const TEST_CASES: TestCase[] = [
  // Websites (5)
  { id: 1, prompt: "Design a portfolio site for an architecture firm that only builds with reclaimed materials", outputType: "website" },
  { id: 2, prompt: "I need a landing page for a cryptocurrency exchange that targets institutional investors", outputType: "website" },
  { id: 3, prompt: "Build a website for a children's bookstore in Portland. Whimsical but not childish.", outputType: "website" },
  { id: 4, prompt: "Create a site for a funeral home that doesn't feel depressing. Modern, dignified.", outputType: "website" },
  { id: 5, prompt: "Design a restaurant website for a molecular gastronomy place in Copenhagen", outputType: "website" },
  // Web Apps (3)
  { id: 6, prompt: "Dashboard for a wind farm monitoring system. Real-time turbine data.", outputType: "web-app" },
  { id: 7, prompt: "Admin panel for a veterinary clinic chain. Clean, fast, no clutter.", outputType: "web-app" },
  { id: 8, prompt: "Project management tool for a film production company. Timeline-heavy.", outputType: "web-app" },
  // Images (5)
  { id: 9, prompt: "Album cover for a jazz trio's debut record. Smoky, intimate, blue.", outputType: "image" },
  { id: 10, prompt: "Event poster for a warehouse techno party in Berlin", outputType: "image" },
  { id: 11, prompt: "Book cover for a literary fiction novel about memory and dementia", outputType: "image" },
  { id: 12, prompt: "Product shot of a handmade ceramic tea set, editorial style", outputType: "image" },
  { id: 13, prompt: "Infographic about ocean plastic pollution for a nonprofit annual report", outputType: "image" },
  // SVG (3)
  { id: 14, prompt: "Logo for a sustainable fashion brand called 'Thread'", outputType: "svg" },
  { id: 15, prompt: "Icon set for a meditation app. 12 icons. Calm, minimal.", outputType: "svg" },
  { id: 16, prompt: "Decorative pattern for a luxury soap packaging. Art nouveau inspired.", outputType: "svg" },
  // Video (2)
  { id: 17, prompt: "5-second logo reveal animation for a tech startup called 'Prism'", outputType: "video" },
  { id: 18, prompt: "Product video for a smartwatch showing it in different environments", outputType: "video" },
  // Mobile App (2)
  { id: 19, prompt: "Onboarding screens for a language learning app targeting adults", outputType: "mobile-app" },
  { id: 20, prompt: "Settings page for a privacy-focused email client", outputType: "mobile-app" },
];

// --- Taxonomy loader ---

const loadTaxonomy = Effect.tryPromise({
  try: async () => {
    const path = `${import.meta.dir}/../.claude/skills/one-of-a-kind-design/references/TAXONOMY.yaml`;
    const content = await Bun.file(path).text();
    return parseYaml(content) as Record<string, unknown>;
  },
  catch: (e) => new Error(`Failed to load taxonomy: ${e}`),
});

// --- Map output types to generation types ---

function toGenType(ot: string): "image" | "video" {
  return ot === "video" ? "video" : "image";
}

function toJobType(ot: string): "image-gen" | "video-gen" | "svg-gen" {
  if (ot === "video") return "video-gen";
  if (ot === "svg") return "svg-gen";
  return "image-gen";
}

// --- Run single test ---

function runSingleTest(
  tc: TestCase,
  taxonomy: Record<string, unknown>,
): Effect.Effect<TestResult, never> {
  const start = Date.now();
  return pipe(
    Effect.gen(function* () {
      // Step 1: Enhance message
      const dims = extractDimensions(tc.prompt);
      const specificity = computeSpecificity(dims);
      yield* Console.log(`  [${tc.id}] Specificity: ${specificity}/7 | Type: ${dims.outputType}`);

      // Step 2: Resolve style
      const resolved = yield* resolveStyle(taxonomy, {
        styleId: dims.explicitStyle ?? undefined,
        industry: dims.industry ?? undefined,
        mood: dims.moodAestheticTags.length > 0 ? dims.moodAestheticTags : undefined,
        audience: dims.audienceSegment ?? undefined,
      });
      yield* Console.log(`  [${tc.id}] Style: ${resolved.id} (${resolved.name})`);

      // Step 3: Select model
      const genType = toGenType(tc.outputType);
      const selection = selectModel(resolved.id, genType, "pro");
      yield* Console.log(`  [${tc.id}] Model: ${selection.primary.name}`);

      // Step 4: Build context + distill prompt
      const context = buildCrafterContext(toJobType(tc.outputType), resolved, tc.prompt);
      const distilled = distillPrompt(resolved, tc.prompt);
      const negative = distillNegative(resolved);
      yield* Console.log(`  [${tc.id}] Distilled: ${distilled.slice(0, 80)}...`);

      // Step 5: Generate via fal.ai
      const genResult = yield* runFalGeneration({
        endpoint: selection.primary.endpoint,
        prompt: distilled,
        params: {
          image_size: "landscape_16_9",
          negative_prompt: negative,
          num_inference_steps: 28,
          guidance_scale: 3.5,
        },
      });
      yield* Console.log(`  [${tc.id}] Generated: ${genResult.url.slice(0, 60)}...`);

      // Step 6: Estimate file size from URL
      const fileSizeBytes = yield* Effect.tryPromise({
        try: async () => {
          const resp = await fetch(genResult.url, { method: "HEAD" });
          return Number(resp.headers.get("content-length") ?? "50000");
        },
        catch: () => new Error("HEAD request failed"),
      });

      // Step 7: Score with LLaVA 13B
      const scores = yield* pipe(
        computeRealScores({
          artifactUrl: genResult.url,
          prompt: distilled,
          styleId: resolved.id,
          jobType: toJobType(tc.outputType),
          fileSizeBytes,
          conventionBreakApplied: resolved.conventionBreak.applied,
        }),
        Effect.catchAll(() =>
          Effect.succeed(
            computeFallbackScores(
              fileSizeBytes,
              toJobType(tc.outputType),
              resolved.conventionBreak.applied,
            ),
          ),
        ),
      );

      // Step 8: Compute composite
      const report = computeComposite(scores);
      const timing = Date.now() - start;

      yield* Console.log(
        `  [${tc.id}] Composite: ${report.composite}/10 ${report.passed ? "PASS" : "FAIL"} (${timing}ms)`,
      );

      return {
        test_id: tc.id,
        user_prompt: tc.prompt,
        resolved_style: resolved.id,
        model_used: selection.primary.name,
        distilled_prompt: distilled,
        fal_url: genResult.url,
        scores: scores as unknown as Record<string, number | null>,
        composite: report.composite,
        passed: report.passed,
        timing_ms: timing,
        error: null,
      } satisfies TestResult;
    }),
    Effect.catchAll((err) =>
      Effect.succeed({
        test_id: tc.id,
        user_prompt: tc.prompt,
        resolved_style: "unknown",
        model_used: "unknown",
        distilled_prompt: "",
        fal_url: "",
        scores: {},
        composite: 0,
        passed: false,
        timing_ms: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      } satisfies TestResult),
    ),
  );
}

// --- Batch runner with delays ---

function runBatch(
  batch: TestCase[],
  taxonomy: Record<string, unknown>,
): Effect.Effect<TestResult[], never> {
  return Effect.all(
    batch.map((tc) => runSingleTest(tc, taxonomy)),
    { concurrency: 4 },
  );
}

function delay(ms: number): Effect.Effect<void, never> {
  return Effect.tryPromise({
    try: () => new Promise<void>((resolve) => setTimeout(resolve, ms)),
    catch: () => new Error("delay failed"),
  }).pipe(Effect.catchAll(() => Effect.void));
}

// --- Main program ---

const program = Effect.gen(function* () {
  yield* Console.log("=== User Invocation Test Harness ===");
  yield* Console.log(`Tests: ${TEST_CASES.length} | Batch size: 4 | Delay: 5s\n`);

  const taxonomy = yield* loadTaxonomy;
  yield* Console.log("Taxonomy loaded.\n");

  const allResults: TestResult[] = [];
  const batchSize = 4;

  for (let i = 0; i < TEST_CASES.length; i += batchSize) {
    const batch = TEST_CASES.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(TEST_CASES.length / batchSize);
    yield* Console.log(`--- Batch ${batchNum}/${totalBatches} (tests ${batch[0].id}-${batch[batch.length - 1].id}) ---`);

    const results = yield* runBatch(batch, taxonomy);
    allResults.push(...results);

    if (i + batchSize < TEST_CASES.length) {
      yield* Console.log("  Waiting 5s before next batch...\n");
      yield* delay(5000);
    }
  }

  // Write JSONL results
  const jsonlPath = "/home/user/workspace/test-results.jsonl";
  const jsonlContent = allResults.map((r) => JSON.stringify(r)).join("\n");
  yield* Effect.tryPromise({
    try: async () => Bun.write(jsonlPath, jsonlContent),
    catch: (e) => new Error(`Failed to write JSONL: ${e}`),
  });
  yield* Console.log(`\nResults written to ${jsonlPath}\n`);

  // Summary
  const passed = allResults.filter((r) => r.passed);
  const failed = allResults.filter((r) => !r.passed);
  const errored = allResults.filter((r) => r.error !== null);
  const composites = allResults.filter((r) => r.composite > 0).map((r) => r.composite);
  const avgComposite = composites.length > 0
    ? composites.reduce((a, b) => a + b, 0) / composites.length
    : 0;
  const alignScores = allResults
    .filter((r) => (r.scores as Record<string, number | null>).promptArtifactAlign != null)
    .map((r) => (r.scores as Record<string, number | null>).promptArtifactAlign as number);
  const avgAlign = alignScores.length > 0
    ? alignScores.reduce((a, b) => a + b, 0) / alignScores.length
    : 0;

  yield* Console.log("╔══════════════════════════════════════╗");
  yield* Console.log("║         TEST SUMMARY                 ║");
  yield* Console.log("╠══════════════════════════════════════╣");
  yield* Console.log(`║ Total:     ${String(allResults.length).padStart(3)}                        ║`);
  yield* Console.log(`║ Passed:    ${String(passed.length).padStart(3)} (${((passed.length / allResults.length) * 100).toFixed(0)}%)                    ║`);
  yield* Console.log(`║ Failed:    ${String(failed.length).padStart(3)}                        ║`);
  yield* Console.log(`║ Errors:    ${String(errored.length).padStart(3)}                        ║`);
  yield* Console.log(`║ Avg Score: ${avgComposite.toFixed(2).padStart(5)}                      ║`);
  yield* Console.log(`║ Avg Align: ${avgAlign.toFixed(2).padStart(5)}                      ║`);
  yield* Console.log("╚══════════════════════════════════════╝");

  // Per output type breakdown
  const types = ["website", "web-app", "image", "svg", "video", "mobile-app"];
  yield* Console.log("\nPer Output Type:");
  for (const t of types) {
    const ofType = allResults.filter((r) => {
      const tc = TEST_CASES.find((c) => c.id === r.test_id);
      return tc?.outputType === t;
    });
    if (ofType.length === 0) continue;
    const typePass = ofType.filter((r) => r.passed).length;
    const typeAvg = ofType.filter((r) => r.composite > 0).map((r) => r.composite);
    const avg = typeAvg.length > 0 ? typeAvg.reduce((a, b) => a + b, 0) / typeAvg.length : 0;
    yield* Console.log(`  ${t.padEnd(12)} ${typePass}/${ofType.length} pass  avg=${avg.toFixed(2)}`);
  }

  // Failed test details
  if (failed.length > 0) {
    yield* Console.log("\nFailed Tests:");
    for (const f of failed) {
      yield* Console.log(`  #${f.test_id}: ${f.user_prompt.slice(0, 50)}... → ${f.composite.toFixed(2)} ${f.error ? `(ERROR: ${f.error.slice(0, 60)})` : ""}`);
    }
  }
});

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`Test harness failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
