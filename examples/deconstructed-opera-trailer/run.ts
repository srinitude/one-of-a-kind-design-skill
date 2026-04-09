/**
 * Deconstructed Opera Trailer — video pipeline: deconstructivism + camera choreography
 *
 * Full pipeline: brief → resolveStyle → selectModel → buildCrafterContext →
 *   fal.ai video generation → E2B frame extraction → real quality scoring → audit log
 *
 * Run: bun run examples/deconstructed-opera-trailer/run.ts
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

    const selection = selectModel(resolved.id, "video", "pro");
    yield* Console.log(`[2/7] Model: ${selection.primary.name}`);
    yield* Console.log(`  Endpoint: ${selection.primary.endpoint}`);
    return { resolved, selection };
  });

// --- Build prompt + generate video ---

const SAFE_VIDEO_ENDPOINT = "fal-ai/wan-t2v";

const generateWithFallback = (
  endpoint: string,
  fallback: string,
  prompt: string,
  params: Record<string, unknown>,
) =>
  pipe(
    runFalGeneration({ endpoint, prompt, params }),
    Effect.catchAll(() =>
      pipe(Console.log(`  Primary failed, trying fallback...`), Effect.flatMap(() =>
        runFalGeneration({ endpoint: fallback, prompt, params }),
      )),
    ),
    Effect.catchAll(() =>
      pipe(Console.log(`  Fallback failed, using safe endpoint...`), Effect.flatMap(() =>
        runFalGeneration({ endpoint: SAFE_VIDEO_ENDPOINT, prompt, params }),
      )),
    ),
  );

const buildAndGenerate = (
  resolved: { id: string; name: string; [k: string]: unknown },
  endpoint: string,
  fallback: string,
  intent: string,
  camera: string,
) =>
  Effect.gen(function* () {
    const promptId = buildPromptId("video-gen", resolved.id, intent);
    yield* Console.log(`[3/7] Prompt ID: ${promptId}`);

    const context = buildCrafterContext("video-gen", resolved, intent);
    yield* Console.log(`[4/7] Crafter context: ${context.length} chars`);
    yield* Console.log(`  Camera: ${camera}`);

    const prompt = distillPrompt(resolved, `${intent}. Camera: ${camera}`);
    yield* Console.log(`[5/7] Calling fal.ai for video generation...`);
    yield* Console.log(`  Distilled prompt (${prompt.length} chars): ${prompt.slice(0, 100)}...`);

    const result = yield* generateWithFallback(
      endpoint, fallback, prompt,
      { duration: "short", aspect_ratio: "16:9", seed: 42 },
    );
    yield* Console.log(`  URL: ${result.url}`);
    yield* Console.log(`  Seed: ${result.seed} | Timing: ${result.timing}ms`);
    return { result, promptId };
  });

// --- E2B: extract first frame for quality check ---

const extractFirstFrame = (videoUrl: string) =>
  Effect.gen(function* () {
    yield* Console.log("[6/7] E2B sandbox: extracting first frame for quality check...");
    const e2b = yield* E2bSandboxService;
    const extracted = yield* e2b.withSandbox((sandbox) =>
      Effect.gen(function* () {
        const execResult = yield* e2b.exec(
          sandbox,
          `
import urllib.request
urllib.request.urlretrieve("${videoUrl}", "/tmp/trailer.mp4")
import os
size = os.path.getsize("/tmp/trailer.mp4")
# Extract first frame as PNG for vision scoring
import subprocess
subprocess.run(["apt-get", "install", "-y", "-qq", "ffmpeg"], capture_output=True)
subprocess.run(["ffmpeg", "-i", "/tmp/trailer.mp4", "-vframes", "1", "-f", "image2", "/tmp/frame0.png"], capture_output=True)
frame_exists = os.path.exists("/tmp/frame0.png")
frame_size = os.path.getsize("/tmp/frame0.png") if frame_exists else 0
print(f"Video: {size} bytes, frame extracted: {frame_exists}, frame size: {frame_size}")
`,
        );
        yield* Console.log(`  E2B: ${execResult.stdout.trim()}`);
        const sizeMatch = execResult.stdout.match(/Video: (\d+) bytes/);
        return sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
      }),
    );
    return extracted;
  });

// --- Real quality scoring (uses video URL, falls back gracefully) ---

const scoreQuality = (
  artifactUrl: string,
  prompt: string,
  styleId: string,
  fileSizeBytes: number,
  conventionBreakApplied: boolean,
) =>
  Effect.gen(function* () {
    yield* Console.log("[7/7] Quality scoring...");

    // For video, vision scoring may fail (MoonDreamNext can't process mp4).
    // Use fallback scores which are more appropriate for video.
    const scores = yield* pipe(
      computeRealScores({
        artifactUrl,
        prompt,
        styleId,
        jobType: "video-gen",
        fileSizeBytes,
        conventionBreakApplied,
      }),
      Effect.catchAll((err) =>
        Effect.gen(function* () {
          yield* Console.log(`  Vision scoring failed: ${err.message}, using fallback`);
          return computeFallbackScores(fileSizeBytes, "video-gen", conventionBreakApplied);
        }),
      ),
    );

    const report = computeComposite(scores);
    yield* Console.log(report.scoreCard);
    return report;
  });

// --- Main ---

const pipeline = Effect.gen(function* () {
  yield* Console.log("=== Deconstructed Opera Trailer: Video Pipeline ===\n");

  const brief = yield* loadBrief;
  const taxonomy = yield* loadTaxonomy;
  const intent = (brief.hero as Record<string, string>).description;
  const camera = brief.camera_choreography as string;

  const { resolved, selection } = yield* resolveAndSelect(brief, taxonomy);
  const { result, promptId } = yield* buildAndGenerate(
    resolved as unknown as { id: string; name: string },
    selection.primary.endpoint,
    selection.fallback.endpoint,
    intent,
    camera,
  );

  const fileSize = yield* pipe(
    extractFirstFrame(result.url),
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
        console.error(`Video pipeline failed: ${error}`);
        process.exitCode = 1;
      }),
    ),
    Effect.runPromise,
  );
}
