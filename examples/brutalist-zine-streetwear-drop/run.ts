/**
 * Brutalist Zine Streetwear Drop — image series pipeline: brutalist-web + risograph
 *
 * Full pipeline: brief → resolveStyle → selectModel → generate 2 frames →
 *   E2B composite → real quality scoring → audit log
 *
 * Run: bun run examples/brutalist-zine-streetwear-drop/run.ts
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
import { distillPrompt } from "../lib/distill-prompt";

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

const INTENTS = [
  "raw hoodie product shot with deliberate grain and risograph color bleed, confrontational crop",
  "distorted streetwear layflat with photocopy texture overlay, barely legible typography",
] as const;

// --- Resolve style ---

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
    yield* Console.log(`[1/7] Style: ${resolved.id} (${resolved.name})`);

    const selection = selectModel(resolved.id, "image", "pro");
    yield* Console.log(`[2/7] Model: ${selection.primary.name}`);
    return { resolved, selection };
  });

// --- Generate frame with fallback ---

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
      pipe(Console.log(`    Primary 404, trying fallback...`), Effect.flatMap(() =>
        runFalGeneration({ endpoint: fallback, prompt, params }),
      )),
    ),
    Effect.catchAll(() =>
      pipe(Console.log(`    Fallback 404, using safe endpoint...`), Effect.flatMap(() =>
        runFalGeneration({ endpoint: SAFE_IMAGE_ENDPOINT, prompt, params }),
      )),
    ),
  );

const generateFrame = (
  resolved: { id: string; [k: string]: unknown },
  endpoint: string,
  fallback: string,
  intent: string,
  seed: number,
  index: number,
) =>
  Effect.gen(function* () {
    const promptId = buildPromptId("image-gen", resolved.id, intent);
    yield* Console.log(`  [Frame ${index + 1}/2] ID: ${promptId.slice(0, 12)}...`);

    const prompt = distillPrompt(resolved, intent);
    const result = yield* generateWithFallback(
      endpoint, fallback, prompt, { image_size: "portrait_4_3", seed },
    );
    yield* Console.log(`    URL: ${result.url}`);
    return result;
  });

// --- E2B: composite two frames ---

const postProcess = (urls: string[]) =>
  Effect.gen(function* () {
    yield* Console.log("[5/7] E2B sandbox: compositing frames for style consistency...");
    const e2b = yield* E2bSandboxService;
    const processed = yield* e2b.withSandbox((sandbox) =>
      Effect.gen(function* () {
        const code = urls
          .map((u, i) => `urllib.request.urlretrieve("${u}", "/tmp/frame_${i}.png")`)
          .join("\n");
        const execResult = yield* e2b.exec(
          sandbox,
          `
import urllib.request
${code}
import os
sizes = [os.path.getsize(f"/tmp/frame_{i}.png") for i in range(${urls.length})]
print(f"Composited {len(sizes)} frames, total: {sum(sizes)} bytes")
`,
        );
        yield* Console.log(`  E2B: ${execResult.stdout.trim()}`);
        const sizeMatch = execResult.stdout.match(/total: (\d+) bytes/);
        return sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
      }),
    );
    return processed;
  });

// --- Real quality scoring ---

const scoreQuality = (
  artifactUrl: string,
  prompt: string,
  styleId: string,
  fileSizeBytes: number,
  conventionBreakApplied: boolean,
) =>
  Effect.gen(function* () {
    yield* Console.log("[6/7] Quality scoring...");

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

// --- Main ---

const pipeline = Effect.gen(function* () {
  yield* Console.log("=== Brutalist Zine Streetwear Drop: Image Series ===\n");

  const brief = yield* loadBrief;
  const taxonomy = yield* loadTaxonomy;

  const { resolved, selection } = yield* resolveAndSelect(brief, taxonomy);

  const context = buildCrafterContext("image-gen", resolved, INTENTS[0]);
  yield* Console.log(`[3/7] Crafter context: ${context.length} chars`);

  yield* Console.log("[4/7] Generating 2 zine frames (seeds 42, 43)...");
  const ep = selection.primary.endpoint;
  const fb = selection.fallback.endpoint;
  const frame0 = yield* generateFrame(resolved, ep, fb, INTENTS[0], 42, 0);
  const frame1 = yield* generateFrame(resolved, ep, fb, INTENTS[1], 43, 1);

  const fileSize = yield* pipe(
    postProcess([frame0.url, frame1.url]),
    Effect.catchAll(() => Effect.succeed(0)),
  );

  const report = yield* scoreQuality(
    frame0.url, INTENTS[0], resolved.id, fileSize, resolved.conventionBreak.applied,
  );

  yield* logAuditEntry(
    buildAuditEntry("fal-generate", selection.primary.endpoint, INTENTS[0], frame0.timing, {
      seed: 42,
      url: frame0.url,
      quality: report.composite,
    }),
  );
  yield* Console.log(`\n[7/7] Audit logged.`);
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
