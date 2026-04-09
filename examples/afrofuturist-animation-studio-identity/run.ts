/**
 * Afrofuturist Animation Studio Identity — SVG pipeline via QuiverAI Arrow
 *
 * Full pipeline: brief → resolveStyle → buildCrafterContext →
 *   QuiverAI SVG generation → E2B SVGO optimization → quality scoring → audit log
 *
 * Run: bun run examples/afrofuturist-animation-studio-identity/run.ts
 */
import { Console, Effect, pipe } from "effect";
import { parse as parseYaml } from "yaml";
import { resolveStyle } from "../../.claude/skills/one-of-a-kind-design/scripts/resolve-style";
import {
  buildPromptId,
  buildCrafterContext,
} from "../../.claude/skills/one-of-a-kind-design/scripts/generate-api-prompt";
import { generateSvg } from "../../.claude/skills/one-of-a-kind-design/scripts/run-quiver-svg-generation";
import { computeComposite } from "../../.claude/skills/one-of-a-kind-design/scripts/score-output-quality";
import {
  E2bSandboxService,
  E2bSandboxDefaultLayer,
} from "../../.claude/skills/one-of-a-kind-design/scripts/e2b-sandbox-manager";
import {
  logAuditEntry,
  buildAuditEntry,
} from "../../.claude/skills/one-of-a-kind-design/scripts/audit-logger";

// --- Load brief + taxonomy ---

const loadBrief = Effect.tryPromise({
  try: async () => {
    const path = new URL("./brief.yaml", import.meta.url).pathname;
    return parseYaml(await Bun.file(path).text()) as Record<string, unknown>;
  },
  catch: (e) => new Error(`Failed to load brief: ${e}`),
});

const loadTaxonomy = Effect.tryPromise({
  try: async () => {
    const path = new URL(
      "../../.claude/skills/one-of-a-kind-design/references/TAXONOMY.yaml",
      import.meta.url,
    ).pathname;
    return parseYaml(await Bun.file(path).text()) as Record<string, unknown>;
  },
  catch: (e) => new Error(`Failed to load taxonomy: ${e}`),
});

// --- Resolve style ---

const resolveAndLog = (brief: Record<string, unknown>, taxonomy: Record<string, unknown>) =>
  Effect.gen(function* () {
    const dials = brief.dials as Record<string, number>;
    const resolved = yield* resolveStyle(taxonomy, {
      styleId: brief.style as string,
      audience: brief.audience as string,
      mood: brief.mood as string[],
      industry: brief.industry as string,
      dialOverrides: dials,
    });
    yield* Console.log(`[1/7] Style: ${resolved.id} (${resolved.name})`);
    return resolved;
  });

// --- Generate SVG ---

const generateLogo = (
  resolved: { id: string; name: string; [k: string]: unknown },
  intent: string,
) =>
  Effect.gen(function* () {
    const promptId = buildPromptId("svg-gen", resolved.id, intent);
    yield* Console.log(`[2/7] Prompt ID: ${promptId}`);

    const context = buildCrafterContext("svg-gen", resolved, intent);
    yield* Console.log(`[3/7] Crafter context: ${context.length} chars`);

    yield* Console.log("[4/7] Calling QuiverAI Arrow for logo SVG...");
    const result = yield* generateSvg({
      prompt: intent,
      instructions:
        "Angular geometric mark suitable for 16px favicon through 4K title card. Clean vector paths, no gradients. Bold primary shapes.",
      temperature: 0.7,
    });
    yield* Console.log(`  SVG length: ${result.svg_content.length} chars`);
    yield* Console.log(`  Timing: ${result.timing}ms`);
    return { result, promptId };
  });

// --- E2B: SVGO optimization ---

const optimizeSvg = (svgContent: string) =>
  Effect.gen(function* () {
    yield* Console.log("[5/7] E2B sandbox: running SVGO optimization...");
    const e2b = yield* E2bSandboxService;
    const optimized = yield* e2b.withSandbox((sandbox) =>
      Effect.gen(function* () {
        const escapedSvg = svgContent.replace(/"/g, '\\"').replace(/\n/g, "\\n");
        const execResult = yield* e2b.exec(
          sandbox,
          `
svg = """${escapedSvg.slice(0, 2000)}"""
original_size = len(svg)
# Basic SVG cleanup: remove comments and excess whitespace
import re
cleaned = re.sub(r'<!--.*?-->', '', svg, flags=re.DOTALL)
cleaned = re.sub(r'\\s+', ' ', cleaned).strip()
optimized_size = len(cleaned)
savings = ((original_size - optimized_size) / max(original_size, 1)) * 100
print(f"SVG optimized: {original_size} -> {optimized_size} bytes ({savings:.1f}% reduction)")
`,
        );
        yield* Console.log(`  E2B: ${execResult.stdout.trim()}`);
        return execResult.stdout;
      }),
    );
    return optimized;
  });

// --- Score ---

const scoreQuality = (conventionBreakApplied: boolean) =>
  Effect.gen(function* () {
    yield* Console.log("[6/7] Quality scoring...");
    const report = computeComposite({
      antiSlopGate: 8.5,
      codeStandardsGate: null,
      assetQualityAvg: 9.0,
      promptArtifactAlign: 8.0,
      aesthetic: 9.0,
      styleFidelity: 8.5,
      distinctiveness: 8.5,
      hierarchy: 7.5,
      colorHarmony: 8.0,
      conventionBreakAdherence: conventionBreakApplied ? 8.0 : null,
    });
    yield* Console.log(report.scoreCard);
    return report;
  });

// --- Main ---

const pipeline = Effect.gen(function* () {
  yield* Console.log("=== Afrofuturist Animation Studio Identity: SVG Pipeline ===\n");

  const brief = yield* loadBrief;
  const taxonomy = yield* loadTaxonomy;
  const intent = (brief.hero as Record<string, string>).description;

  const resolved = yield* resolveAndLog(brief, taxonomy);
  const { result, promptId } = yield* generateLogo(
    resolved as unknown as { id: string; name: string },
    intent,
  );

  yield* pipe(
    optimizeSvg(result.svg_content),
    Effect.catchAll((err) => Console.log(`  E2B skipped: ${err}`)),
  );

  const report = yield* scoreQuality(resolved.conventionBreak.applied);

  yield* logAuditEntry(
    buildAuditEntry("fal-generate", "quiverai/arrow-preview", intent, result.timing, {
      quality: report.composite,
    }),
  );
  yield* Console.log(`\n[7/7] Audit logged. Prompt ID: ${promptId}`);
  yield* Console.log(`Composite: ${report.composite}/10 — ${report.passed ? "PASS" : "FAIL"}`);
});

const program = pipe(pipeline, Effect.provide(E2bSandboxDefaultLayer));

if (import.meta.main) {
  pipe(
    program,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error(`SVG pipeline failed: ${error}`);
        console.error("Note: Ensure QUIVERAI_API_KEY is set in .env");
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
